# n8n Quick Start - Property Scouts Lead Capture

**Copy-paste setup in 5 minutes.**

## Step 1: Import Workflow

1. Open your n8n dashboard
2. Click **+ New**
3. Select **Import from file**
4. Upload `n8n.json` from this repo
5. Click **Import**

## Step 2: Configure Credentials

### Webhook Secret
1. Click the **Webhook** node
2. Under "Header Auth", create a new secret:
   - Name: `n8n_webhook_secret`
   - Value: Any secure string (e.g., `ps_webhook_v1_abc123xyz`)
3. Save

### Google Sheets
1. Click the **Google Sheets** nodes (both)
2. Click "Create New Credential"
3. Authenticate with your Google account
4. Select your spreadsheet: **Property Scouts Leads**
5. The sheet must have these columns:
   ```
   Timestamp | Name | Phone | Email | Property | Persona | Unit Type | WhatsApp | Newsletter | Source | Lead Type | Status
   ```

### WhatsApp (Optional but Recommended)
1. Click **Send WhatsApp Confirmation** node
2. Create credential with your WhatsApp Business Account:
   - Business Phone Number ID
   - Access Token
3. Save

## Step 3: Get Webhook URL

1. Click **Webhook** node
2. Copy the **Webhook URL** shown
3. Example: `https://your-n8n.com/webhook/abc123/leads`

## Step 4: Add to GitHub

1. Go to: https://github.com/SkyDaddy001/propertyscouts
2. Settings → Secrets and variables → Actions
3. Create new secret:
   - Name: `FORM_WEBHOOK_URL`
   - Value: Paste the webhook URL from Step 3
4. Save

## Step 5: Test

1. In n8n, click **Activate** (top right)
2. Go to https://propertyscouts.in/skylivng/
3. Fill out the form
4. Check Google Sheets — the lead appears in seconds
5. Check WhatsApp — confirmation arrives

---

## What Happens on Form Submit

```
User submits form on propertyscouts.in
    ↓
Form data POSTs to n8n webhook
    ↓
n8n routes by type (form-lead vs chat-lead)
    ↓
├→ Saves to Google Sheets (CRM)
├→ Sends WhatsApp confirmation
└→ Returns 200 OK to website
```

---

## Google Sheet Template

Create a sheet with these columns (row 1):

| Timestamp | Name | Phone | Email | Property | Persona | Unit Type | WhatsApp | Newsletter | Source | Lead Type | Status |
|-----------|------|-------|-------|----------|---------|-----------|----------|-----------|--------|-----------|--------|
| 2026-04-02T10:30:00Z | Rajesh Kumar | 9876543210 | rajesh@email.com | skylivng | investor | 2bhk | Yes | Yes | propertyscouts.in/skylivng/investors | Form | New |

---

## Webhook Data Format

The webhook receives JSON like this:

```json
{
  "type": "form-lead",
  "timestamp": "2026-04-02T10:30:00.000Z",
  "name": "Rajesh Kumar",
  "phone": "9876543210",
  "email": "rajesh@example.com",
  "property": "skylivng",
  "persona": "investor",
  "units": "2bhk",
  "whatsapp": "on",
  "newsletter": "on",
  "source": "https://propertyscouts.in/skylivng/investors/",
  "userAgent": "Mozilla/5.0...",
  "property": "skylivng",
  "persona": "investor"
}
```

or for chat:

```json
{
  "type": "chat-lead",
  "timestamp": "2026-04-02T10:30:00.000Z",
  "name": "Priya Singh",
  "phone": "9876543210",
  "source": "https://propertyscouts.in/",
  "userAgent": "Mozilla/5.0..."
}
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Webhook not active | Click **Activate** button (must be green) |
| 404 on form submit | Check `FORM_WEBHOOK_URL` secret matches exactly |
| Google Sheets credential fails | Re-authenticate with Google account |
| WhatsApp not sending | Verify Business Phone Number ID & Access Token valid |
| No data in sheet | Check column names match exactly (case-sensitive) |

---

## Advanced: Auto-trigger GitHub Rebuild

To automatically rebuild the site when a lead arrives:

1. Add **HTTP Request** node after WhatsApp
2. Settings:
   - Method: `POST`
   - URL: `https://api.github.com/repos/SkyDaddy001/propertyscouts/dispatches`
   - Headers:
     - `Authorization: token <YOUR_GITHUB_PAT>`
     - `Accept: application/vnd.github+json`
   - Body (JSON):
     ```json
     {
       "event_type": "lead-captured",
       "client_payload": {
         "name": "{{$node["Webhook"].json["name"]}}",
         "property": "{{$node["Webhook"].json["property"]}}"
       }
     }
     ```

This will log the lead to a GitHub Actions workflow.

---

## Files in This Repo

- **n8n.json** — Complete workflow, ready to import
- **N8N_SETUP.md** — Detailed configuration guide
- **N8N_QUICK_START.md** — This file (fastest path)

---

## Live Dashboard

Track leads in real-time:

1. Google Sheet: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/
2. n8n Executions: Dashboard → Executions tab (shows each webhook call)

Done! Your lead capture is live. 🎉
