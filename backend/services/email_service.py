import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from datetime import datetime

logger = logging.getLogger(__name__)

def send_payment_confirmation(user, invoice_data):
    """
    Send payment confirmation email to user
    Args:
        user: User object
        invoice_data: Dictionary with Stripe invoice data
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Prepare transaction details
        transaction_details = {
            'plan_name': invoice_data.get('plan_name', 'Premium Plan'),
            'amount_paid': f"${invoice_data['amount_paid']/100:.2f}",
            'date': datetime.fromtimestamp(invoice_data['created']).strftime('%B %d, %Y'),
            'id': invoice_data['id'],
            'COMPANY_NAME': settings.COMPANY_NAME,
            'dashboard_url': settings.FRONTEND_DASHBOARD_URL
        }

        subject = f"Your Payment Confirmation - {settings.COMPANY_NAME}"
        
        # Render HTML content
        html_content = render_to_string('emails/payment_confirmation.html', {
            'user': user,
            **transaction_details
        })
        
        # Create plain text version
        text_content = strip_tags(html_content)
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
            reply_to=[settings.SUPPORT_EMAIL]
        )
        email.attach_alternative(html_content, "text/html")
        
        email.send()
        logger.info(f"Payment confirmation email sent to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send payment confirmation email to {user.email}: {str(e)}", exc_info=True)
        return False