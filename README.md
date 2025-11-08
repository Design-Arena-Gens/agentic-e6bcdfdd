## WhatsApp Order & Inventory Assistant

This project provides a WhatsApp chatbot that reads live order and inventory data from Google Sheets. Customers can text your WhatsApp number (via Twilio) to receive instant updates.

### Features

- `/api/whatsapp` webhook compatible with Twilio WhatsApp sandbox or business accounts
- Order status lookup (`order <id>`) with customer name, status, and last update
- Inventory lookup (`inventory <sku or name>`) with quantity and restock threshold
- Configurable Google Sheets tab names and access through service account credentials
- Marketing-ready landing page describing the workflow

### Prerequisites

1. **Google Cloud**
   - Create a service account with Sheets API access.
   - Share your Google Sheet with the service account email.
   - Note the spreadsheet ID and tab names.
2. **Twilio**
   - Configure a WhatsApp sandbox or approved business number.
   - Set the webhook URL to `https://<your-domain>/api/whatsapp`.

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL="service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_ID="1abcDEFghiJKLmnoPQRstuVWXYZ"
GOOGLE_SHEETS_ORDER_TAB="Orders"          # optional override
GOOGLE_SHEETS_INVENTORY_TAB="Inventory"   # optional override
```

Ensure the private key keeps literal `\n` line breaks or add real line breaks when using local `.env` files.

### Local Development

```bash
npm install
npm run dev
```

The site is available at [http://localhost:3000](http://localhost:3000).

### Testing Webhook Locally

Use a tunneling tool (e.g., ngrok) and point Twilio to `https://<tunnel-host>/api/whatsapp`. Send WhatsApp messages to validate responses.

### Deployment

Deploy to Vercel. Add the environment variables in the Vercel dashboard and redeploy. Update the Twilio webhook to the production URL `https://agentic-e6bcdfdd.vercel.app/api/whatsapp`.
