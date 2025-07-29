# users/models.py
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    PLAN_CHOICES = (
        ('free', 'Free'),
        ('plus', 'Plus'),
        ('pro', 'Pro'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES, default='free')
    stripe_customer_id = models.CharField(max_length=100, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=100, blank=True, null=True)
    monthly_symptom_checks_used = models.PositiveIntegerField(default=0)
    monthly_medication_questions_used = models.PositiveIntegerField(default=0)
    monthly_chat_messages_used = models.PositiveIntegerField(default=0)
    monthly_mentalhealth_messages_used = models.PositiveIntegerField(default=0)
    last_reset_date = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.plan}"
    
    def reset_usage_if_needed(self):
        from datetime import date
        today = date.today()
        if today.month != self.last_reset_date.month or today.year != self.last_reset_date.year:
            self.monthly_symptom_checks_used = 0
            self.monthly_medication_questions_used = 0
            self.monthly_chat_messages_used = 0
            self.last_reset_date = today
            self.save()
    
    def can_use_feature(self, feature_name):
        self.reset_usage_if_needed()
        
        if feature_name == 'symptom_check':
            if self.plan == 'free':
                return self.monthly_symptom_checks_used < 5
            return True
        elif feature_name == 'medication_qa':
            if self.plan == 'free':
                return self.monthly_medication_questions_used < 10
            return True
        elif feature_name == 'advanced_ai':
            return self.plan in ['plus', 'pro']
        elif feature_name == 'medication_reminders':
            return self.plan in ['plus', 'pro']
        elif feature_name == 'family_profiles':
            return self.plan == 'pro'
        # Add more feature checks as needed
        return False
    
    def record_feature_usage(self, feature_name):
        if feature_name == 'symptom_check' and self.plan == 'free':
            self.monthly_symptom_checks_used += 1
            self.save()
        elif feature_name == 'medication_qa' and self.plan == 'free':
            self.monthly_medication_questions_used += 1
            self.save()
        elif feature_name == 'chat' and self.plan == 'free':
            self.monthly_chat_messages_used += 1
            self.save()

    def has_active_subscription(self):
        """Check if user has an active paid subscription"""
        if self.plan in ['plus', 'pro'] and self.stripe_subscription_id:
            try:
                sub = stripe.Subscription.retrieve(self.stripe_subscription_id)
                return sub.status in ['active', 'trialing']
            except stripe.error.StripeError:
                return False
        return False

    def cancel_subscription(self):
        """Cancel the user's subscription"""
        if self.stripe_subscription_id:
            try:
                stripe.Subscription.delete(self.stripe_subscription_id)
                self.plan = 'free'
                self.stripe_subscription_id = None
                self.save()
                return True
            except stripe.error.StripeError:
                return False
        return False

    def update_payment_method(self, payment_method_id):
        """Update the user's payment method"""
        if self.stripe_customer_id:
            try:
                # Attach payment method to customer
                stripe.PaymentMethod.attach(
                    payment_method_id,
                    customer=self.stripe_customer_id,
                )
                
                # Set as default payment method
                stripe.Customer.modify(
                    self.stripe_customer_id,
                    invoice_settings={
                        'default_payment_method': payment_method_id,
                    },
                )
                return True
            except stripe.error.StripeError:
                return False
        return False

    def can_use_chat_feature(self):
        self.reset_usage_if_needed()  # Reset counters if new month
        if self.plan in ['plus', 'pro']:
            return True  # Unlimited access
        # Free plan limits
        max_messages = 10 if self.plan == 'free' else 5
        return self.monthly_chat_messages_used < max_messages

    def record_chat_message(self):
        if self.plan in ['free']:
            self.monthly_chat_messages_used += 1
            self.save()

    def can_use_reminders(self):
        """Check if user can use the reminders feature"""
        return self.plan in ['plus', 'pro']