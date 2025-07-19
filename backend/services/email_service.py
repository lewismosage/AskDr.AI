import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from datetime import datetime

logger = logging.getLogger(__name__)

def send_payment_confirmation(user, invoice_data):
    try:
        logger.info(f"Starting payment confirmation for: {user.email}")
        logger.info(f"Full user object: {user.__dict__}")

        transaction_details = {
            'plan_name': invoice_data.get('plan_name', 'Premium Plan'),
            'amount_paid': f"${invoice_data['amount_paid']/100:.2f}",
            'payment_date': datetime.fromtimestamp(invoice_data['created']).strftime('%B %d, %Y'),
            'transaction_id': invoice_data['id'],
            'COMPANY_NAME': settings.COMPANY_NAME,
            'dashboard_url': settings.FRONTEND_DASHBOARD_URL,
            'user': user
        }

        subject = f"Your Payment Confirmation - {settings.COMPANY_NAME}"

        try:
            html_content = render_to_string('emails/payment_confirmation.html', transaction_details)
        except Exception as e:
            logger.error(f"Template rendering error: {str(e)}", exc_info=True)
            print(f"[EMAIL ERROR] Template rendering error: {str(e)}")
            return False

        text_content = strip_tags(html_content)

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
            reply_to=[settings.SUPPORT_EMAIL]
        )
        email.attach_alternative(html_content, "text/html")

        logger.info(f"SMTP Config - Host: {settings.EMAIL_HOST}, Port: {settings.EMAIL_PORT}")
        logger.info(f"Using From: {settings.DEFAULT_FROM_EMAIL}")
        logger.info(f"Email subject: {subject}, to: {user.email}")
        print(f"[EMAIL DEBUG] Attempting to send email to: {user.email}")

        try:
            result = email.send(fail_silently=False)
            logger.info(f"Email queued for sending to {user.email}")
            print(f"[EMAIL DEBUG] Email send() result: {result} (1 means success)")
            if result == 1:
                print(f"[EMAIL SUCCESS] Payment confirmation email sent to: {user.email}")
            else:
                print(f"[EMAIL FAILURE] Email send() returned {result} for: {user.email}")
            return True
        except Exception as e:
            logger.error(f"CRITICAL EMAIL FAILURE: {str(e)}", exc_info=True)
            logger.error(f"SMTP Status: {settings.EMAIL_HOST_USER}@{settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
            print(f"[EMAIL ERROR] Failed to send email to {user.email}: {str(e)}")
            return False
    except Exception as e:
        logger.error(f"CRITICAL EMAIL FAILURE: {str(e)}", exc_info=True)
        logger.error(f"SMTP Status: {settings.EMAIL_HOST_USER}@{settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        print(f"[EMAIL ERROR] General failure for {user.email}: {str(e)}")
        return False