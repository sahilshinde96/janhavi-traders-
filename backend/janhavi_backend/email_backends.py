from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings
import urllib.request
import urllib.error
import json
import logging

logger = logging.getLogger(__name__)

class HTTPSEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        if not email_messages:
            return 0

        # Check for keys in Django settings
        resend_api_key = getattr(settings, 'RESEND_API_KEY', None)
        brevo_api_key = getattr(settings, 'BREVO_API_KEY', None)

        if not resend_api_key and not brevo_api_key:
            # Fallback to printing warnings if no keys are found
            logger.warning("Neither RESEND_API_KEY nor BREVO_API_KEY is configured. Email cannot be sent via HTTPS.")
            return 0

        num_sent = 0
        for message in email_messages:
            sent = False
            recipients = list(message.to)
            if not recipients:
                continue

            from_email = message.from_email or settings.DEFAULT_FROM_EMAIL
            text_content = message.body
            html_content = ""

            # Check if there is an HTML alternative
            if hasattr(message, 'alternatives'):
                for content, mimetype in message.alternatives:
                    if mimetype == 'text/html':
                        html_content = content
                        break

            # Fallback if no HTML alternative
            if not html_content:
                html_content = f"<html><body><p>{text_content.replace(chr(10), '<br>')}</p></body></html>"

            # 1. Use Resend if RESEND_API_KEY is configured
            if resend_api_key:
                try:
                    url = "https://api.resend.com/emails"
                    headers = {
                        "Authorization": f"Bearer {resend_api_key}",
                        "Content-Type": "application/json",
                        "User-Agent": "JanhaviTraders/1.0"
                    }
                    payload = {
                        "from": from_email,
                        "to": recipients,
                        "subject": message.subject,
                        "html": html_content,
                        "text": text_content
                    }
                    
                    req = urllib.request.Request(
                        url,
                        data=json.dumps(payload).encode('utf-8'),
                        headers=headers,
                        method='POST'
                    )
                    with urllib.request.urlopen(req, timeout=10) as response:
                        res_body = response.read().decode('utf-8')
                        res_data = json.loads(res_body)
                        if response.status in (200, 201):
                            sent = True
                            print(f"[EMAIL] [Resend] Sent successfully. ID: {res_data.get('id')}")
                except urllib.error.HTTPError as e:
                    err_msg = e.read().decode('utf-8')
                    logger.error(f"Resend HTTPError {e.code}: {err_msg}")
                    print(f"[EMAIL] [Resend] Failed: {err_msg}")
                except Exception as e:
                    logger.error(f"Resend Exception: {e}")
                    print(f"[EMAIL] [Resend] Exception: {e}")

            # 2. Else use Brevo if BREVO_API_KEY is configured
            elif brevo_api_key:
                try:
                    url = "https://api.brevo.com/v3/smtp/email"
                    headers = {
                        "accept": "application/json",
                        "api-key": brevo_api_key,
                        "content-type": "application/json"
                    }
                    
                    # Parse name and email from from_email (e.g. "Name <email@domain.com>")
                    sender_name = "Janhavi Traders"
                    sender_email = "noreply@janhavitraders.com"
                    if "<" in from_email and ">" in from_email:
                        parts = from_email.split("<")
                        sender_name = parts[0].strip()
                        sender_email = parts[1].replace(">", "").strip()
                    else:
                        sender_email = from_email.strip()

                    payload = {
                        "sender": {"name": sender_name, "email": sender_email},
                        "to": [{"email": r} for r in recipients],
                        "subject": message.subject,
                        "htmlContent": html_content,
                        "textContent": text_content
                    }

                    req = urllib.request.Request(
                        url,
                        data=json.dumps(payload).encode('utf-8'),
                        headers=headers,
                        method='POST'
                    )
                    with urllib.request.urlopen(req, timeout=10) as response:
                        res_body = response.read().decode('utf-8')
                        res_data = json.loads(res_body)
                        if response.status in (200, 201):
                            sent = True
                            print(f"[EMAIL] [Brevo] Sent successfully. ID: {res_data.get('messageId')}")
                except urllib.error.HTTPError as e:
                    err_msg = e.read().decode('utf-8')
                    logger.error(f"Brevo HTTPError {e.code}: {err_msg}")
                    print(f"[EMAIL] [Brevo] Failed: {err_msg}")
                except Exception as e:
                    logger.error(f"Brevo Exception: {e}")
                    print(f"[EMAIL] [Brevo] Exception: {e}")

            if sent:
                num_sent += 1
            else:
                if not self.fail_silently:
                    raise RuntimeError("Failed to send email through all configured HTTPS providers.")

        return num_sent
