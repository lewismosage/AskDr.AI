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
import logging

stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', os.getenv('STRIPE_SECRET_KEY'))
logger = logging.getLogger(__name__)

@api_view(['POST'])
@login_required
def create_subscription(request):
    plan = request.data.get("plan")
    billing_cycle = request.data.get("billing_cycle", "monthly")
    
    price_ids = {
        "plus": {
            "monthly": "price_1RkOtiCWhrsZxJu1aLcxFSHu",
            "annual": "price_1RmDPQCWhrsZxJu1QHrmtwWY"
        },
        "pro": {
            "monthly": "price_1RkOpPCWhrsZxJu18WV1Zj8S",
            "annual": "price_1RlrBUCWhrsZxJu1RvByWTEH"
        }
    }
    
    if plan not in price_ids or billing_cycle not in ['monthly', 'annual']:
        return Response({"error": "Invalid plan or billing cycle"}, status=400)
    
    try:
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        
        if not profile.stripe_customer_id:
            customer = stripe.Customer.create(
                email=request.user.email,
                name=request.user.get_full_name(),
                metadata={
                    "user_id": request.user.id,
                    "plan": plan,
                    "billing_cycle": billing_cycle
                }
            )
            profile.stripe_customer_id = customer.id
            profile.save()
        
        try:
            price = stripe.Price.retrieve(price_ids[plan][billing_cycle])
            if not price.active:
                return Response({"error": "The selected plan is not currently available"}, status=400)
        except stripe.error.InvalidRequestError:
            return Response({"error": "Invalid price ID for the selected plan"}, status=400)
        
        session = stripe.checkout.Session.create(
            customer=profile.stripe_customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': price_ids[plan][billing_cycle],
                'quantity': 1,
            }],
            mode='subscription',
            subscription_data={
                'metadata': {
                    'user_id': str(request.user.id),
                    'plan': plan,
                    'billing_cycle': billing_cycle
                }
            },
            success_url=f"{settings.FRONTEND_URL}/thank-you?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/pricing",
        )
        
        return Response({"sessionId": session.id})
    except Exception as e:
        logger.error(f"Subscription creation error for user {request.user.id}: {str(e)}", exc_info=True)
        return Response({"error": "An error occurred while processing your request"}, status=500)

@require_POST
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        logger.info(f"Processing webhook: {event['type']}")
    except ValueError as e:
        logger.error(f"Webhook ValueError: {str(e)}")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Webhook signature error: {str(e)}")
        return HttpResponse(status=400)

    try:
        if event['type'] == 'customer.subscription.created':
            subscription = event['data']['object']
            customer_id = subscription.customer
            try:
                profile = UserProfile.objects.get(stripe_customer_id=customer_id)
                plan = subscription.metadata.get('plan', 'plus')
                profile.plan = plan
                profile.stripe_subscription_id = subscription.id
                profile.save()
                logger.info(f"Updated user {profile.user.id} to {plan} plan")
            except UserProfile.DoesNotExist:
                logger.error(f"No profile found for customer {customer_id}")

        elif event['type'] == 'customer.subscription.updated':
            subscription = event['data']['object']
            try:
                profile = UserProfile.objects.get(stripe_subscription_id=subscription.id)
                metadata = subscription.get('metadata', {})
                profile.plan = metadata.get('plan', 'free') if subscription['status'] in ['active', 'trialing'] else 'free'
                profile.save()
            except UserProfile.DoesNotExist:
                pass

        elif event['type'] == 'invoice.payment_succeeded':
            invoice = event['data']['object']
            if subscription_id := invoice.get('subscription'):
                try:
                    UserProfile.objects.get(stripe_subscription_id=subscription_id)
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
        logger.error(f"Webhook processing error: {str(e)}", exc_info=True)
        return HttpResponse(status=200)

    return HttpResponse(status=200)

@api_view(['GET'])
@login_required
def get_subscription_status(request):
    try:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        subscription_data = {
            'plan': profile.plan,
            'status': 'none',
            'current_period_end': None,
            'cancel_at_period_end': False
        }

        if profile.stripe_subscription_id:
            try:
                subscription = stripe.Subscription.retrieve(profile.stripe_subscription_id)
                subscription_data.update({
                    'status': subscription.status,
                    'current_period_end': subscription.current_period_end,
                    'cancel_at_period_end': subscription.cancel_at_period_end
                })
            except stripe.error.InvalidRequestError:
                profile.stripe_subscription_id = None
                profile.save()
            except Exception as e:
                logger.warning(f"Stripe subscription retrieval error: {str(e)}")

        return Response(subscription_data)
        
    except Exception as e:
        logger.error(f"Subscription status error: {str(e)}", exc_info=True)
        return Response({'error': 'Could not retrieve subscription status'}, status=500)

@api_view(['POST'])
@login_required
def cancel_subscription(request):
    try:
        profile = request.user.profile
        if profile.cancel_subscription():
            return Response({'success': True})
        return Response({'error': 'No active subscription to cancel'}, status=400)
    except Exception as e:
        logger.error(f"Subscription cancellation error: {str(e)}", exc_info=True)
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
        logger.error(f"Payment method update error: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=400)