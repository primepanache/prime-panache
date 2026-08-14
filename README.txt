PRIME PANACHE V8 — STABLE DEPLOYMENT

This version fixes the blank-page problem in V7 by restoring the complete storefront
from the last stable V5 build and adding the Vercel email API separately.

Repository root MUST contain:
index.html
api/send-order-email.js
README.txt

Vercel environment variables:
RESEND_API_KEY
ORDER_NOTIFICATION_EMAIL

Do not put the Resend API key in GitHub.

IMPORTANT:
The current storefront is the stable V5 UI/features. The email API is deployed and ready,
but the checkout should only call it after successful payment verification.

The current sender is onboarding@resend.dev for testing. For production customer
confirmation emails, verify a Prime Panache domain in Resend and change the FROM address.
