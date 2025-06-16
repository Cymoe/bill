# Email Setup Instructions

## 1. Deploy the Edge Function

First, make sure you have the Supabase CLI installed and logged in:

```bash
# Install Supabase CLI if you haven't already
brew install supabase/tap/supabase

# Link to your project
supabase link --project-ref wnwatjwcjptwehagqiwf
```

Deploy the send-email function:

```bash
supabase functions deploy send-email
```

## 2. Set the Resend API Key

Set your Resend API key as a secret in Supabase:

```bash
supabase secrets set RESEND_API_KEY=re_EN6S9nvU_NUaX1U6cxVs6brd6WCXsTdnL
```

## 3. Update Email Settings

The system currently uses placeholder email addresses. You'll need to:

1. **Verify your domain with Resend**:
   - Go to https://resend.com/domains
   - Add your domain (e.g., billbreeze.com)
   - Follow their DNS verification steps

2. **Update the email addresses** in the code:
   - In `/supabase/functions/send-email/index.ts`, update line 69:
     ```typescript
     from: 'Bill Breeze <invoices@yourdomain.com>', // Update this
     ```
   - In `/src/services/EmailService.ts`, update the reply-to addresses

## 4. Test the Email Sending

1. Go to an invoice or estimate in your app
2. Click the "Send" button
3. Confirm the recipient email
4. Check if the email was sent successfully

## 5. Monitor Email Logs

You can view email logs in your database:

```sql
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10;
```

## Troubleshooting

- If emails fail to send, check the Supabase Edge Function logs:
  ```bash
  supabase functions logs send-email
  ```

- Make sure the RESEND_API_KEY is set correctly:
  ```bash
  supabase secrets list
  ```

- Verify your domain is properly configured in Resend dashboard

## Email Templates

The email templates are defined in `/src/services/EmailService.ts`:
- Invoice emails: `getInvoiceEmailTemplate()`
- Estimate emails: `getEstimateEmailTemplate()`
- Payment reminders: `getPaymentReminderEmailTemplate()`

You can customize these templates to match your branding.