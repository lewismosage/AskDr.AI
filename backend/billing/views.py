# billing/views.py
import stripe
import os
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework.decorators import api_view
from rest_framework.response import Response
from users.models import UserProfile
from django.contrib.auth.decorators import login_required
import json
from django.http import HttpResponse

stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', os.getenv('STRIPE_SECRET_KEY'))

@api_view(['POST'])
@login_required
def create_subscription(request):
    plan = request.data.get("plan")
    billing_cycle = request.data.get("billing_cycle", "monthly")
    
    price_ids = {
        "plus": {
            "monthly": "price_1RkOtiCWhrsZxJu1aLcxFSHu",
            "annual": "price_1RkOq8CWhrsZxJu14eqxePRl"
        },
        "pro": {
            "monthly": "price_1RkOpPCWhrsZxJu18WV1Zj8S",
            "annual": "price_1RlrBUCWhrsZxJu1RvByWTEH"
        }
    }
    
    if plan not in price_ids or billing_cycle not in ['monthly', 'annual']:
        return Response({"error": "Invalid plan or billing cycle"}, status=400)
    
    try:
        customer = stripe.Customer.create(
            email=request.user.email,
            name=request.user.get_full_name(),
            metadata={
                "user_id": request.user.id
            }
        )
        
        session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=['card'],
            subscription_data={
                'metadata': {
                    'user_id': request.user.id,
                    'plan': plan
                }
            },
            line_items=[{
                'price': price_ids[plan][billing_cycle],
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{settings.FRONTEND_URL}/thank-you?type=subscription",
            cancel_url=f"{settings.FRONTEND_URL}/pricing",
        )
        
        # Update user profile with Stripe customer ID
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.stripe_customer_id = customer.id
        profile.save()
        
        return Response({"sessionId": session.id})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@require_POST
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=400)

    try:
        # Handle subscription events
        if event['type'] == 'customer.subscription.created':
            subscription = event['data']['object']
            metadata = subscription.get('metadata', {})
            user_id = metadata.get('user_id')
            plan = metadata.get('plan')
            
            if user_id and plan:
                try:
                    profile = UserProfile.objects.get(user__id=user_id)
                    profile.plan = plan
                    profile.stripe_subscription_id = subscription.id
                    profile.save()
                except UserProfile.DoesNotExist:
                    pass

        elif event['type'] == 'customer.subscription.updated':
            subscription = event['data']['object']
            try:
                profile = UserProfile.objects.get(stripe_subscription_id=subscription.id)
                metadata = subscription.get('metadata', {})
                if subscription['status'] in ['active', 'trialing']:
                    profile.plan = metadata.get('plan', 'free')
                else:
                    profile.plan = 'free'
                profile.save()
            except UserProfile.DoesNotExist:
                pass

        elif event['type'] == 'invoice.payment_succeeded':
            invoice = event['data']['object']
            subscription_id = invoice.get('subscription')
            if subscription_id:
                try:
                    profile = UserProfile.objects.get(stripe_subscription_id=subscription_id)
                    profile.save()  # Update any necessary fields
                except UserProfile.DoesNotExist:
                    pass

        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            try:
                profile = UserProfile.objects.get(stripe_subscription_id=subscription.id)
                profile.plan = 'free'
                profile.stripe_subscription_id = None
                profile.save()
            except UserProfile.DoesNotExist:
                pass

    except Exception as e:
        # Log the error but still return 200 to Stripe
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Webhook error: {str(e)}", exc_info=True)
        return HttpResponse(status=200)

    return HttpResponse(status=200)

@api_view(['GET'])
@login_required
def get_subscription_status(request):
    try:
        profile = request.user.profile
        subscription = None
        
        if profile.stripe_subscription_id:
            subscription = stripe.Subscription.retrieve(profile.stripe_subscription_id)
        
        return Response({
            'plan': profile.plan,
            'status': subscription.status if subscription else 'none',
            'current_period_end': subscription.current_period_end if subscription else None,
            'cancel_at_period_end': subscription.cancel_at_period_end if subscription else False,
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
@login_required
def cancel_subscription(request):
    try:
        profile = request.user.profile
        if profile.cancel_subscription():
            return Response({'success': True})
        return Response({'error': 'No active subscription to cancel'}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
@login_required
def update_payment_method(request):
    payment_method_id = request.data.get('payment_method_id')
    if not payment_method_id:
        return Response({'error': 'Payment method ID required'}, status=400)
    
    try:
        profile = request.user.profile
        if profile.update_payment_method(payment_method_id):
            return Response({'success': True})
        return Response({'error': 'Failed to update payment method'}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=400)