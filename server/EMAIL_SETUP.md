# Email Setup Guide

## Required Environment Variables

Add these to your `.env` file:

```bash
# Email Configuration (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

## Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "EventApp" as the name
   - Copy the generated 16-character password
3. **Use the app password** in your `.env` file (not your regular Gmail password)

## Testing

- **Local Testing**: Use your Gmail credentials
- **Production**: Consider using a service like SendGrid or AWS SES for better deliverability

## Security Notes

- Never commit your `.env` file to version control
- The app password is more secure than your regular password
- Emails are sent asynchronously and won't block payment processing
