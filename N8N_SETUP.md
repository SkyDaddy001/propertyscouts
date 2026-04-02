# n8n Workflow Setup for Property Scouts

This guide walks you through setting up the n8n automation workflow to capture form leads, send WhatsApp confirmations, and store data in Google Sheets.

## Prerequisites

- n8n instance (cloud or self-hosted)
- Google Sheets API credentials
- WhatsApp Business Account with phone number
- GitHub Personal Access Token (optional, for status updates)

---

## Step 1: Create n8n Webhook

1. In n8n, create a new workflow: **Lead Capture & Price Sync**
2. Add a **Webhook** node:
   - Method: `POST`
   - Path: `/leads`
   - Authentication: Header Auth (Create secret: `n8n_webhook_secret` = any secure string)
   - Copy the **Webhook URL** — this goes in your GitHub secret `FORM_WEBHOOK_URL`

**Example Webhook URL:**
```
https://your-n8n-instance.com/webhook/uuid-here/leads
```

---

## Step 2: Add Google Sheets Integration

### Get Google Sheets Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "Property Scouts"
3. Enable API: **Google Sheets API**
4. Create credentials: **Service Account**
5. Download JSON key file
6. Create a Google Sheet named "Property Scouts Leads"
7. Share the sheet with the service account email

### Connect n8n to Google Sheets

1. In n8n, add a **Google Sheets** node
2. Click "Create New Credential"
3. Paste the JSON key file contents
4. Select your spreadsheet
5. Add two nodes:
   - **Save Form Lead** (for form-lead type)
   - **Save Chat Lead** (for chat-lead type)

**Columns to create in Google Sheet:**
```
Timestamp | Name | Phone | Email | Property | Persona | Unit Type | WhatsApp Opted | Newsletter | Source | Lead Type | Status
```

---

## Step 3: Add WhatsApp Messaging

### Get WhatsApp Business Credentials

1. Set up [WhatsApp Business Account](https://developers.facebook.com/docs/whatsapp/)
2. Get your **Business Phone Number ID** and **Access Token**
3. In n8n, create a WhatsApp credential with these values

### Configure WhatsApp Node

1. Add a **WhatsApp** node after the Google Sheets node
2. Map fields:
   - **To Phone:** `{{ $node.webhook_receive_leads.json.phone }}`
   - **Message:** Template message below

**Message Template:**
```
Hi {{ $node.webhook_receive_leads.json.name.split(' ')[0] }}! 👋

Thanks for your interest in {{ $node.webhook_receive_leads.json.property || 'our properties' }}!

Our team will call you within 24 hours at {{ $node.webhook_receive_leads.json.phone }}.

📍 In the meantime, visit propertyscouts.in to explore more details.

Best regards,
Property Scouts Team
```

---

## Step 4: (Optional) GitHub Dispatch Notification

To notify GitHub when a lead is captured:

1. Add **HTTP Request** node
2. Method: `POST`
3. URL: `https://api.github.com/repos/SkyDaddy001/propertyscouts/dispatches`
4. Headers:
   - `Accept: application/vnd.github+json`
   - `Authorization: token <YOUR_GITHUB_PAT>`
5. Body:
```json
{
  "event_type": "lead-captured",
  "client_payload": {
    "name": "{{ $node.webhook_receive_leads.json.name }}",
    "phone": "{{ $node.webhook_receive_leads.json.phone }}"
  }
}
```

---

## Step 5: Test the Workflow

1. **Activate** the workflow in n8n
2. Copy the Webhook URL
3. Add to GitHub secret `FORM_WEBHOOK_URL`
4. On propertyscouts.in, fill out a form or use the chat
5. Check Google Sheets — the lead should appear
6. Check WhatsApp — confirmation should be sent

---

## Step 6: (Optional) Price Sync from Google Sheets

To sync prices from Google Sheets back to the site:

1. Create another workflow: **Sync Prices to GitHub**
2. Trigger: **Schedule** (daily at 6 AM UTC)
3. Nodes:
   - **Google Sheets** — Read prices sheet
   - **JavaScript** — Format as `prices.json`
   - **GitHub** — Commit to `data/prices.json`
   - **GitHub Dispatch** — Trigger `prices-updated` event

This rebuilds the site with latest prices.

---

## Data Flow

```
Form Submission (propertyscouts.in)
  ↓
Webhook POST to n8n
  ↓
├─→ Google Sheets (Lead stored)
├─→ WhatsApp (Confirmation sent)
├─→ Email (Optional)
└─→ GitHub Dispatch (Status update)
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook not receiving data | Check `FORM_WEBHOOK_URL` secret is set correctly in GitHub |
| Google Sheets not updating | Verify service account has sheet edit permissions |
| WhatsApp not sending | Verify access token is valid and phone number is correct format |
| Data not flowing | Enable n8n workflow execution logs and check error messages |

---

## Testing Webhook Locally

Use curl to test the webhook:

```bash
curl -X POST https://your-n8n-webhook.com/leads \
  -H "Content-Type: application/json" \
  -d '{
    "type": "form-lead",
    "name": "Test User",
    "phone": "+918668126015",
    "email": "test@example.com",
    "property": "skylivng",
    "persona": "investor",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "source": "https://propertyscouts.in/skylivng/investors/"
  }'
```

Expected response: `200 OK`

---

## Next Steps

1. ✅ Set up n8n instance
2. ✅ Create Google Sheets CRM
3. ✅ Configure WhatsApp Business
4. ✅ Test form submissions
5. ✅ Set `FORM_WEBHOOK_URL` secret in GitHub
6. ✅ Monitor Google Sheet for incoming leads
7. ✅ (Optional) Set up price sync workflow
