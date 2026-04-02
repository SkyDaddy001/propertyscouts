# n8n Webhook Debugging Guide

If the webhook is not triggering, follow these steps to diagnose the issue.

## Step 1: Verify GitHub Secret is Set

1. Go to: https://github.com/SkyDaddy001/propertyscouts
2. Settings → Secrets and variables → Actions
3. Look for `FORM_WEBHOOK_URL`
4. If missing or empty → **Create it** with your n8n webhook URL

The URL should look like:
```
https://your-n8n-instance.com/webhook/abc123def/leads
```

## Step 2: Check if Website is Using the Secret

1. Visit: https://propertyscouts.in (any page)
2. Open **Browser DevTools** (F12 or Ctrl+Shift+I)
3. Go to **Console** tab
4. You should see:
```
SITE_CONFIG: {geminiApiKey: "...", formWebhookUrl: "https://...", ...}
```

If `formWebhookUrl` is empty (`""`):
- ❌ GitHub secret not set correctly
- ❌ GitHub Actions hasn't rebuilt yet (wait 2-3 mins)

If `formWebhookUrl` shows your n8n URL:
- ✅ Secret is correctly injected

## Step 3: Test Form Submission and Watch Console

1. Visit: https://propertyscouts.in/skylivng/investors/
2. Open **DevTools Console** (F12)
3. Fill the form with test data
4. Click **Submit**
5. In Console, you should see:
```
Form data: {name: "Test User", phone: "9876543210", ...}
Webhook URL: https://your-n8n...
Posting to webhook...
Webhook response: 200 OK
```

### If you see these messages in Console:

| Message | Meaning |
|---------|---------|
| `Webhook URL: https://...` | ✅ Secret is set |
| `Webhook URL: ""` | ❌ Secret not injected, rebuild needed |
| `Posting to webhook...` | ✅ Form attempted POST |
| `Webhook response: 200` | ✅ n8n received it |
| `Webhook response: 404` | ❌ Wrong webhook URL |
| `Webhook response: 403` | ❌ Webhook authentication failed |
| `Webhook response: CORS error` | ❌ n8n CORS not configured |

## Step 4: Test Webhook Directly with curl

Open a terminal and run:

```bash
curl -X POST https://your-n8n-webhook-url/leads \
  -H "Content-Type: application/json" \
  -d '{
    "type": "form-lead",
    "name": "Test User",
    "phone": "9876543210",
    "email": "test@example.com",
    "property": "skylivng",
    "persona": "investor",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "source": "https://propertyscouts.in/skylivng/investors/"
  }'
```

### Expected Response:
- ✅ `200 OK` with JSON response → Webhook works
- ❌ `404 Not Found` → Wrong webhook URL
- ❌ `Connection refused` → n8n not running or wrong domain
- ❌ `CORS error` → n8n needs CORS headers

## Step 5: Check n8n Webhook Configuration

In n8n:

1. Open your workflow
2. Click the **Webhook** node
3. Verify:
   - ✅ Path is `/leads` (not `/webhook/leads`)
   - ✅ HTTP Method is `POST`
   - ✅ Response Mode is `onReceived`
   - ✅ Workflow is **Activated** (green toggle)

4. Copy the **Webhook URL** from n8n
5. Compare with `FORM_WEBHOOK_URL` in GitHub — should match exactly

## Step 6: Enable n8n Webhook Logs

1. In n8n, go to **Executions** tab
2. Set filter to **Error** or **All**
3. Submit a form from propertyscouts.in
4. Check if execution appears in list
5. Click execution to see error details

## Common Issues & Fixes

### Issue: `formWebhookUrl` is empty string

**Cause:** GitHub Actions hasn't rebuilt yet after secret was added

**Fix:**
1. Go to repo Settings → Secrets
2. Re-save the secret (just click Update)
3. Push a new commit to trigger rebuild:
   ```bash
   git commit --allow-empty -m "trigger rebuild"
   git push origin master
   ```
4. Wait 2-3 minutes for build to complete
5. Refresh website and check DevTools Console again

### Issue: Webhook returns 404

**Cause:** Wrong webhook URL format

**Fix:**
1. In n8n, copy **exact** webhook URL
2. Paste into GitHub secret (no extra spaces or `/webhook` prefix)
3. Re-save secret
4. Trigger rebuild (see above)

### Issue: CORS Error in Console

**Cause:** n8n CORS headers not set

**Fix in n8n:**
1. Open Webhook node
2. Under "Options", check "CORS"
3. Set CORS Origin to `*` (allow all)
4. Save workflow
5. Re-test form submission

### Issue: Webhook receives POST but nothing happens

**Cause:** Google Sheets credential not working, or column names don't match

**Fix:**
1. In n8n, open Google Sheets nodes
2. Click "Test" to verify connection
3. Check sheet column headers match exactly (case-sensitive):
   ```
   Timestamp, Name, Phone, Email, Property, Persona, Unit Type, WhatsApp, Newsletter, Source, Lead Type, Status
   ```
4. If columns don't exist, create them manually

## Quick Diagnostic URL

Visit this URL on your site to check the injected config:

```
javascript:alert(JSON.stringify(window.SITE_CONFIG, null, 2))
```

Paste in DevTools Console and press Enter. You'll see:
```json
{
  "geminiApiKey": "...",
  "formWebhookUrl": "https://your-n8n...",
  "gaTrackingId": "",
  "phoneNumber": "8668126015",
  "whatsappNumber": "918668126015"
}
```

## Still Not Working?

Post the following info and I can help debug:

1. **Screenshot of DevTools Console** (from Step 3)
2. **Your n8n webhook URL** (last part is OK to share)
3. **n8n error log** (if showing error in Executions)
4. **curl response** (from Step 4)

---

**TL;DR Checklist:**

- [ ] GitHub secret `FORM_WEBHOOK_URL` is set
- [ ] GitHub Actions has rebuilt (see commit/workflow)
- [ ] Website shows webhook URL in DevTools Console
- [ ] Form submission shows "Posting to webhook..." in Console
- [ ] curl test returns 200 OK
- [ ] n8n workflow is **Activated**
- [ ] n8n webhook path is `/leads` (exact match)
