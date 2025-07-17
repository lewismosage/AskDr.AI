# billing/urls.py
from django.urls import path
from .views import (create_subscription, stripe_webhook, 
                   get_subscription_status, cancel_subscription,
                   update_payment_method)

urlpatterns = [
    path('create-subscription/', create_subscription, name='create-subscription'),
    path('webhook/', stripe_webhook, name='stripe-webhook'),
    path('subscription-status/', get_subscription_status, name='subscription-status'),
    path('cancel-subscription/', cancel_subscription, name='cancel-subscription'),
    path('update-payment-method/', update_payment_method, name='update-payment-method'),
]