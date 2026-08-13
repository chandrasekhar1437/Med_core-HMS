import random
import string
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

conf = ConnectionConfig(
    MAIL_USERNAME="your_system_email@gmail.com",
    MAIL_PASSWORD="your_app_password",
    MAIL_FROM="your_system_email@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

def generate_otp(length=6) -> str:
    return ''.join(random.choices(string.digits, k=length))

async def send_otp_email(email_to: str, otp: str):
    message = MessageSchema(
        subject="MedCore HMS - Email Verification OTP",
        recipients=[email_to],
        body=f"Your verification OTP code is: {otp}. This code is valid for 10 minutes.",
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    await fm.send_message(message)

async def send_admin_notification(admin_email: str, user_email: str, action: str):
    message = MessageSchema(
        subject=f"MedCore HMS Alert: {action}",
        recipients=[admin_email],
        body=f"User profile change detected for account: {user_email}.\nAction: {action}",
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    await fm.send_message(message)