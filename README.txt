PRIME PANACHE V7 — EMAIL BACKEND

Deploy this package to the existing Vercel project.

Environment variables already added:
RESEND_API_KEY
ORDER_NOTIFICATION_EMAIL

The server endpoint is:
POST /api/send-order-email

It sends an owner new-order notification and a customer confirmation.

IMPORTANT:
The current sender is onboarding@resend.dev for testing. For production customer emails to arbitrary buyer addresses, verify a Prime Panache domain in Resend and change the FROM address in api/send-order-email.js.

Do not put RESEND_API_KEY into index.html.
