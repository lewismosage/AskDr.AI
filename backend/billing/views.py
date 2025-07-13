# billing/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
import stripe
import os
from django.conf import settings

STRIPE_SECRET_KEY = getattr(settings, 'STRIPE_SECRET_KEY', None) or os.getenv('STRIPE_SECRET_KEY')

@api_view(['POST'])
def create_checkout_session(request):
    plan = request.data.get("plan")

    price_ids = {
        "free": "prod_SfkOPKWrFCLAn2",
        "plus": "prod_SfkKOjkRxYakbL", 
        "pro": "prod_SfkKm5o7aVrKZe",
    }

    price_id = price_ids.get(plan.lower()) if plan else None
    if not price_id:
        return Response({"error": "Invalid plan selected."}, status=400)

    stripe.api_key = STRIPE_SECRET_KEY

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            mode='subscription',
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            success_url='http://localhost:3000/thank-you',
            cancel_url='http://localhost:3000/cancel',
        )
        return Response({"url": session.url})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
