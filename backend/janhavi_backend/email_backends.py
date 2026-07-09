from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings
import urllib.request
import urllib.error
import json
import logging

logger = logging.getLogger(__name__)

def _send_post_request(url, headers, payload):
    """Helper to perform JSON POST requests using built-in urllib."""
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode('utf-8')
            return response.status, json.loads(res_body)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        logger.error(f"HTTP HTTPS email API error {e.code}: {err_body}")
        return e.code, {"error": err_body}
    except Exception as e:
        logger.error(f"HTTPS email API connection exception: {e}")
        return 500, {"error": str(e)}


class HTTPSEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        if not email_messages:
            return 0

        resend_api_key = getattr(settings, 'RESEND_API_KEY', None)
        brevo_api_key = getattr(settings, 'BREVO_API_KEY', None)

        if not resend_api_key and not brevo_api_key:
            logger.warning("Neither RESEND_API_KEY nor BREVO_API_KEY is configured. Email cannot be sent.")
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

            # Check for html alternative
            if hasattr(message, 'alternatives'):
                for content, mimetype in message.alternatives:
                    if mimetype == 'text/html':
                        html_content = content
                        break

            if not html_content:
                html_content = f"<html><body><p>{text_content.replace(chr(10), '<br>')}</p></body></html>"

            # 1. Resend implementation
            if resend_api_key:
                status, data = _send_post_request(
                    url="https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {resend_api_key}",
                        "Content-Type": "application/json",
                        "User-Agent": "BLUSHH/1.0"
                    },
                    payload={
                        "from": from_email,
                        "to": recipients,
                        "subject": message.subject,
                        "html": html_content,
                        "text": text_content
                    }
                )
                if status in (200, 201):
                    sent = True
                    print(f"[EMAIL] [Resend] Sent successfully. ID: {data.get('id')}")
                else:
                    print(f"[EMAIL] [Resend] Failed: {data.get('error')}")

            # 2. Brevo implementation
            elif brevo_api_key:
                # Extract sender name and email from "Name <email@domain.com>"
                sender_name = "BLUSHH"
                sender_email = "noreply@blushh.online"
                if "<" in from_email and ">" in from_email:
                    parts = from_email.split("<")
                    sender_name = parts[0].strip()
                    sender_email = parts[1].replace(">", "").strip()
                else:
                    sender_email = from_email.strip()

                status, data = _send_post_request(
                    url="https://api.brevo.com/v3/smtp/email",
                    headers={
                        "accept": "application/json",
                        "api-key": brevo_api_key,
                        "content-type": "application/json"
                    },
                    payload={
                        "sender": {"name": sender_name, "email": sender_email},
                        "to": [{"email": r} for r in recipients],
                        "subject": message.subject,
                        "htmlContent": html_content,
                        "textContent": text_content
                    }
                )
                if status in (200, 201):
                    sent = True
                    print(f"[EMAIL] [Brevo] Sent successfully. ID: {data.get('messageId')}")
                else:
                    print(f"[EMAIL] [Brevo] Failed: {data.get('error')}")

            if sent:
                num_sent += 1
            else:
                if not self.fail_silently:
                    raise RuntimeError("Failed to send email through HTTPS API providers.")

        return num_sent
