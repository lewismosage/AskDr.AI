import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from datetime import datetime

logger = logging.getLogger(__name__)

def send_payment_confirmation(user, invoice_data):
    """
    Send payment confirmation email to user with robust error handling
    """
    try:
        # Validate inputs
        if not user or not hasattr(user, 'email'):
            print(f"[EMAIL ERROR] Invalid user object provided")
            logger.error("Invalid user object provided")
            return False
            
        if not user.email:
            print(f"[EMAIL ERROR] User has no email address")
            logger.error("User has no email address")
            return False
            
        if not invoice_data:
            print(f"[EMAIL ERROR] No invoice data provided")
            logger.error("No invoice data provided")
            return False

        print(f"[EMAIL] Starting payment confirmation for: {user.email}")
        logger.info(f"Starting payment confirmation for: {user.email}")
        
        # Validate invoice data with fallbacks
        validated_invoice_data = {
            'plan_name': invoice_data.get('plan_name', 'Premium Plan'),
            'amount_paid': invoice_data.get('amount_paid', 0),
            'created': invoice_data.get('created', int(datetime.now().timestamp())),
            'id': invoice_data.get('id', 'Unknown')
        }
        
        print(f"[EMAIL] Validated invoice data: {validated_invoice_data}")
        
        # Prepare transaction details
        transaction_details = {
            'plan_name': validated_invoice_data['plan_name'],
            'amount_paid': f"${validated_invoice_data['amount_paid']/100:.2f}",
            'payment_date': datetime.fromtimestamp(validated_invoice_data['created']).strftime('%B %d, %Y'),
            'transaction_id': validated_invoice_data['id'],
            'COMPANY_NAME': getattr(settings, 'COMPANY_NAME', 'AskDr.AI'),
            'dashboard_url': getattr(settings, 'FRONTEND_DASHBOARD_URL', 'http://localhost:5173/dashboard'),
            'user': user
        }
        
        print(f"[EMAIL] Transaction details prepared: {transaction_details}")
        
        # Validate email settings
        if not getattr(settings, 'EMAIL_HOST', None):
            print(f"[EMAIL ERROR] EMAIL_HOST not configured")
            logger.error("EMAIL_HOST not configured")
            return False
            
        if not getattr(settings, 'DEFAULT_FROM_EMAIL', None):
            print(f"[EMAIL ERROR] DEFAULT_FROM_EMAIL not configured")
            logger.error("DEFAULT_FROM_EMAIL not configured")
            return False

        subject = f"Your Payment Confirmation - {transaction_details['COMPANY_NAME']}"
        print(f"[EMAIL] Subject: {subject}")
        
        # Render HTML content with error handling
        try:
            html_content = render_to_string('emails/payment_confirmation.html', transaction_details)
            print(f"[EMAIL] HTML template rendered successfully ({len(html_content)} characters)")
        except Exception as template_error:
            print(f"[EMAIL ERROR] Template rendering failed: {str(template_error)}")
            logger.error(f"Template rendering error: {str(template_error)}", exc_info=True)
            return False

        # Create plain text version
        try:
            text_content = strip_tags(html_content)
            print(f"[EMAIL] Plain text version created ({len(text_content)} characters)")
        except Exception as strip_error:
            print(f"[EMAIL ERROR] Failed to create plain text: {str(strip_error)}")
            text_content = f"Payment confirmation for {transaction_details['plan_name']} - {transaction_details['amount_paid']}"
        
        # Create email object
        try:
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
                reply_to=[getattr(settings, 'SUPPORT_EMAIL', 'support@askdrai.com')]
            )
            email.attach_alternative(html_content, "text/html")
            print(f"[EMAIL] Email object created successfully")
        except Exception as email_create_error:
            print(f"[EMAIL ERROR] Failed to create email object: {str(email_create_error)}")
            logger.error(f"Email object creation error: {str(email_create_error)}", exc_info=True)
            return False
        
        # Log SMTP configuration
        print(f"[EMAIL] SMTP Config - Host: {getattr(settings, 'EMAIL_HOST', 'Not set')}")
        print(f"[EMAIL] SMTP Config - Port: {getattr(settings, 'EMAIL_PORT', 'Not set')}")
        print(f"[EMAIL] SMTP Config - TLS: {getattr(settings, 'EMAIL_USE_TLS', 'Not set')}")
        print(f"[EMAIL] SMTP Config - Username: {getattr(settings, 'EMAIL_HOST_USER', 'Not set')}")
        print(f"[EMAIL] From: {settings.DEFAULT_FROM_EMAIL}")
        print(f"[EMAIL] To: {user.email}")
        
        # Validate SMTP credentials
        if not getattr(settings, 'EMAIL_HOST_USER', None):
            print(f"[EMAIL ERROR] EMAIL_HOST_USER not configured")
            logger.error("EMAIL_HOST_USER not configured")
            return False
            
        if not getattr(settings, 'EMAIL_HOST_PASSWORD', None):
            print(f"[EMAIL ERROR] EMAIL_HOST_PASSWORD not configured")
            logger.error("EMAIL_HOST_PASSWORD not configured")
            return False
        
        # Send email with retry logic
        max_retries = 2
        for attempt in range(max_retries):
            try:
                print(f"[EMAIL] Attempting to send email (attempt {attempt + 1}/{max_retries})")
                result = email.send(fail_silently=False)
                
                if result == 1:
                    print(f"[EMAIL SUCCESS] Email sent successfully to {user.email}")
                    logger.info(f"Payment confirmation email sent successfully to {user.email}")
                    return True
                else:
                    print(f"[EMAIL WARNING] Email send() returned {result} for {user.email}")
                    logger.warning(f"Email send() returned {result} for {user.email}")
                    
            except Exception as send_error:
                error_msg = str(send_error)
                print(f"[EMAIL ERROR] Send attempt {attempt + 1} failed: {error_msg}")
                logger.error(f"Email send error (attempt {attempt + 1}): {error_msg}", exc_info=True)
                
                # Provide specific guidance for common SMTP errors
                if "Authentication failed" in error_msg:
                    print(f"[EMAIL ERROR] SMTP Authentication failed. Please check your Brevo credentials.")
                    print(f"[EMAIL ERROR] Make sure EMAIL_HOST_USER and EMAIL_HOST_PASSWORD are correct in your .env file")
                elif "Please authenticate first" in error_msg:
                    print(f"[EMAIL ERROR] SMTP requires authentication. Check your credentials.")
                elif "Connection refused" in error_msg:
                    print(f"[EMAIL ERROR] SMTP connection refused. Check EMAIL_HOST and EMAIL_PORT.")
                
                if attempt < max_retries - 1:
                    print(f"[EMAIL] Retrying in 2 seconds...")
                    import time
                    time.sleep(2)
                else:
                    print(f"[EMAIL ERROR] All send attempts failed for {user.email}")
                    logger.error(f"All email send attempts failed for {user.email}")
                    return False
        
        return False
        
    except Exception as e:
        print(f"[EMAIL ERROR] Critical email failure: {str(e)}")
        logger.error(f"CRITICAL EMAIL FAILURE: {str(e)}", exc_info=True)
        return False

def test_email_system():
    """
    Test function to verify email system is working
    """
    try:
        from django.contrib.auth.models import User
        
        # Create a test user
        test_user, created = User.objects.get_or_create(
            email='test@example.com',
            defaults={
                'username': 'testuser',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        
        # Test invoice data
        test_invoice_data = {
            'id': 'test_invoice_123',
            'amount_paid': 2999,  # $29.99
            'created': int(datetime.now().timestamp()),
            'plan_name': 'Plus Plan'
        }
        
        print(f"[TEST] Testing email system with user: {test_user.email}")
        result = send_payment_confirmation(test_user, test_invoice_data)
        
        if result:
            print(f"[TEST SUCCESS] Email test passed!")
        else:
            print(f"[TEST FAILURE] Email test failed!")
            
        return result
        
    except Exception as e:
        print(f"[TEST ERROR] Email test error: {str(e)}")
        return False

def test_smtp_connection():
    """
    Test SMTP connection and authentication
    """
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        print(f"[SMTP TEST] Testing connection to {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        print(f"[SMTP TEST] Username: {settings.EMAIL_HOST_USER}")
        print(f"[SMTP TEST] TLS: {settings.EMAIL_USE_TLS}")
        
        # Create test message
        msg = MIMEMultipart()
        msg['From'] = settings.DEFAULT_FROM_EMAIL
        msg['To'] = settings.DEFAULT_FROM_EMAIL  # Send to yourself for testing
        msg['Subject'] = "SMTP Test - AskDr.AI"
        
        body = "This is a test email to verify SMTP configuration."
        msg.attach(MIMEText(body, 'plain'))
        
        # Connect to SMTP server
        if settings.EMAIL_USE_TLS:
            server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
            server.starttls()
        else:
            server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        
        # Login
        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        print(f"[SMTP TEST] Authentication successful!")
        
        # Send test email
        text = msg.as_string()
        server.sendmail(settings.DEFAULT_FROM_EMAIL, settings.DEFAULT_FROM_EMAIL, text)
        print(f"[SMTP TEST] Test email sent successfully!")
        
        server.quit()
        return True
        
    except Exception as e:
        print(f"[SMTP TEST] Error: {str(e)}")
        return False