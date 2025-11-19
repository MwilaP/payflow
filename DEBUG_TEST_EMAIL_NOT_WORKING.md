# Debug: Test Email Not Working

## Let's Find Out Why Your Test Email Isn't Working

Follow these steps in order to diagnose the issue:

---

## Step 1: Check What Error You're Seeing

### Where to Look:

1. **Terminal/Console** (where you run `pnpm run dev`)
2. **App UI** (toast notification)
3. **Browser DevTools** (if renderer process error)

### Common Error Patterns:

#### ❌ Error 1: "Email service not configured"
```
✗ Failed to send test email: Error: Email service not configured
```

**Cause:** You haven't saved the configuration yet, or it failed to save.

**Fix:**
1. Fill in ALL fields in Settings → Email
2. Click "Save Configuration" FIRST
3. Wait for "Email Configured" toast
4. THEN try "Send Test Email"

---

#### ❌ Error 2: "getaddrinfo ENOTFOUND"
```
✗ Failed to initialize email service: Error: getaddrinfo ENOTFOUND mail.yourdomain.com
Cannot resolve SMTP host "mail.yourdomain.com". Please check the hostname.
```

**Cause:** Can't find your SMTP server

**Fix:**
1. Check SMTP host spelling
2. Try using IP address instead: `192.168.1.100`
3. Check if you need VPN
4. Test with: `ping mail.yourdomain.com`

---

#### ❌ Error 3: "Connection refused"
```
✗ Failed to initialize email service: Error: connect ECONNREFUSED 192.168.1.100:587
Connection refused to mail.yourdomain.com:587. Check host and port.
```

**Cause:** Wrong port or server not accepting connections

**Fix:**
1. Try port 465 with SSL/TLS ON
2. Try port 587 with SSL/TLS OFF
3. Try port 25 with SSL/TLS OFF
4. Ask admin: "What port should I use?"

---

#### ❌ Error 4: "Authentication failed"
```
✗ Failed to send test email: Error: Invalid login: 535 Authentication failed
Authentication failed. Check username and password.
```

**Cause:** Wrong username or password

**Fix:**
1. Verify username format:
   - Try `email@domain.com`
   - Try `username`
   - Try `DOMAIN\username`
2. Check password (copy-paste to avoid typos)
3. Reconfigure and save again
4. Check if account is locked

---

#### ❌ Error 5: "Connection timeout"
```
✗ Failed to initialize email service: Error: Connection timeout
Connection timeout to mail.yourdomain.com:587. Check firewall/network.
```

**Cause:** Firewall blocking or network issue

**Fix:**
1. Check Windows Firewall
2. Try different network (mobile hotspot)
3. Connect to VPN if required
4. Test port: `Test-NetConnection -ComputerName mail.yourdomain.com -Port 587`

---

## Step 2: Verify Configuration Workflow

### Correct Order:

```
1. Fill in email settings
   ↓
2. Click "Save Configuration"
   ↓
3. Watch terminal for initialization logs
   ↓
4. Wait for "Email Configured" toast
   ↓
5. Enter test email address
   ↓
6. Click "Send Test Email"
   ↓
7. Watch terminal for sending logs
   ↓
8. Check for success/error
```

### ⚠️ Common Mistake:

**DON'T DO THIS:**
```
1. Fill in settings
2. Click "Send Test Email" immediately ← WRONG! Config not saved yet
```

**DO THIS:**
```
1. Fill in settings
2. Click "Save Configuration" ← FIRST!
3. Wait for success
4. THEN click "Send Test Email" ← SECOND!
```

---

## Step 3: Check Terminal Logs

### What to Look For:

#### ✅ Successful Configuration:
```
========================================
📧 EMAIL CONFIGURATION REQUEST
========================================
Initializing email service with config: {
  host: 'mail.yourdomain.com',
  port: 587,
  secure: false,
  user: 'your-email@yourdomain.com',
  from: 'noreply@yourdomain.com'
}
Verifying SMTP connection...
DEBUG [connection] Connecting to mail.yourdomain.com:587
DEBUG [connection] Connection established
DEBUG Upgraded to TLS
DEBUG [connection] < 235 Authentication successful
✓ Email service initialized successfully
========================================
```

**If you see this** → Configuration worked! Proceed to test email.

#### ❌ Failed Configuration:
```
========================================
📧 EMAIL CONFIGURATION REQUEST
========================================
Initializing email service with config: { ... }
Verifying SMTP connection...
✗ Failed to initialize email service: Error: [specific error]
[Error message with fix suggestion]
========================================
```

**If you see this** → Fix the error before trying test email.

---

## Step 4: Diagnostic Checklist

Run through this checklist:

### Configuration Phase:

- [ ] All fields filled in (host, port, username, password, from)
- [ ] Clicked "Save Configuration" button
- [ ] Saw "Email Configured" toast notification
- [ ] Terminal shows "✓ Email service initialized successfully"
- [ ] Status badge shows "Configured" (green)

### Test Email Phase:

- [ ] Configuration saved successfully (see above)
- [ ] Entered test email address
- [ ] Clicked "Send Test Email" button
- [ ] Terminal shows "📧 SENDING TEST EMAIL"
- [ ] Terminal shows SMTP conversation (DEBUG lines)
- [ ] Terminal shows "✓ Test email sent successfully" OR error message

---

## Step 5: Common Issues & Solutions

### Issue: "Nothing happens when I click Send Test Email"

**Possible Causes:**
1. Email not configured yet
2. JavaScript error in console
3. IPC communication broken

**Debug Steps:**
1. Open DevTools (F12)
2. Check Console tab for errors
3. Try saving configuration again
4. Restart the app

---

### Issue: "Configuration saves but test email fails"

**Possible Causes:**
1. Server accepts connection but rejects email sending
2. Different authentication for sending vs connecting
3. Rate limiting or spam protection

**Debug Steps:**
1. Check terminal for specific error
2. Look for "Authentication successful" during config
3. Look for error during test email send
4. Try sending to different email address

---

### Issue: "Works in Outlook/Thunderbird but not in app"

**Possible Causes:**
1. Different authentication method
2. App-specific passwords required
3. OAuth vs basic auth

**Debug Steps:**
1. Check if server requires app-specific password
2. Verify you're using same settings as Outlook
3. Check if OAuth is required (not supported yet)

---

## Step 6: Enable Maximum Debugging

The app already has debug mode enabled. Here's what you should see:

### During Configuration:
```
========================================
📧 EMAIL CONFIGURATION REQUEST
========================================
Initializing email service with config: { ... }
Verifying SMTP connection...
DEBUG Creating transport: nodemailer (6.9.7; ...)
DEBUG Sending mail using SMTP/6.9.7[client:6.9.7]
DEBUG [connection] Connecting to mail.yourdomain.com:587
DEBUG [connection] Connection established
DEBUG [connection] < 220 mail.yourdomain.com ESMTP Postfix
DEBUG [connection] > EHLO [127.0.0.1]
DEBUG [connection] < 250-mail.yourdomain.com
DEBUG [connection] < 250-STARTTLS
DEBUG [connection] > STARTTLS
DEBUG [connection] < 220 2.0.0 Ready to start TLS
DEBUG Upgraded to TLS
DEBUG [connection] > AUTH PLAIN [credentials]
DEBUG [connection] < 235 2.7.0 Authentication successful
✓ Email service initialized successfully
========================================
```

### During Test Email:
```
========================================
📧 SENDING TEST EMAIL
Recipient: test@example.com
========================================
Sending test email to test@example.com...
DEBUG Creating transport: nodemailer (6.9.7; ...)
DEBUG [connection] Connecting to mail.yourdomain.com:587
DEBUG [connection] Connection established
DEBUG [connection] < 220 mail.yourdomain.com ESMTP
DEBUG [connection] > EHLO [127.0.0.1]
DEBUG Upgraded to TLS
DEBUG [connection] > AUTH PLAIN [credentials]
DEBUG [connection] < 235 Authentication successful
DEBUG [connection] > MAIL FROM:<noreply@yourdomain.com>
DEBUG [connection] < 250 2.1.0 Ok
DEBUG [connection] > RCPT TO:<test@example.com>
DEBUG [connection] < 250 2.1.5 Ok
DEBUG [connection] > DATA
DEBUG [connection] < 354 End data with <CR><LF>.<CR><LF>
DEBUG [connection] < 250 2.0.0 Ok: queued as ABC123DEF456
✓ Test email sent successfully
Message ID: <abc123@yourdomain.com>
Response: 250 2.0.0 Ok: queued as ABC123DEF456
========================================
```

**If you DON'T see these DEBUG lines**, something is wrong with the setup.

---

## Step 7: Specific Troubleshooting by Error

### "Email service not configured"

**What it means:** The transporter wasn't initialized

**Steps:**
1. Go to Settings → Email
2. Fill in ALL fields
3. Click "Save Configuration"
4. Wait for success message
5. Try test email again

---

### "Cannot resolve SMTP host"

**What it means:** DNS can't find your server

**Steps:**
1. Open Command Prompt
2. Run: `ping mail.yourdomain.com`
3. If it fails, try IP address instead
4. Check if VPN is required
5. Verify hostname with admin

---

### "Connection refused"

**What it means:** Server found but port closed

**Steps:**
1. Test port connectivity:
   ```powershell
   Test-NetConnection -ComputerName mail.yourdomain.com -Port 587
   ```
2. If fails, try different ports:
   - Port 465 with SSL/TLS ON
   - Port 587 with SSL/TLS OFF
   - Port 25 with SSL/TLS OFF

---

### "Authentication failed"

**What it means:** Server rejected your credentials

**Steps:**
1. Verify username format with admin
2. Try different formats:
   - `email@domain.com`
   - `username`
   - `DOMAIN\username`
3. Copy-paste password to avoid typos
4. Check if account is active
5. Check if app-specific password needed

---

### "Connection timeout"

**What it means:** Can't reach server (firewall/network)

**Steps:**
1. Check Windows Firewall
2. Try from different network
3. Connect to VPN if internal server
4. Check with IT if port is blocked

---

## Step 8: What to Share for Help

If you need help, provide:

### 1. Terminal Output
Copy everything between the `========` lines:
```
========================================
📧 EMAIL CONFIGURATION REQUEST
========================================
[All the logs here]
========================================
```

### 2. Configuration (Hide Password!)
```json
{
  "host": "mail.yourdomain.com",
  "port": 587,
  "secure": false,
  "user": "your-email@yourdomain.com",
  "from": "noreply@yourdomain.com"
}
```

### 3. Error Message
The exact error from terminal or toast notification

### 4. What You Tried
- Steps you followed
- What worked / didn't work

---

## Quick Diagnostic Commands

### Test DNS Resolution:
```bash
nslookup mail.yourdomain.com
```

### Test Port Connectivity:
```powershell
Test-NetConnection -ComputerName mail.yourdomain.com -Port 587
```

### Test with Telnet (if available):
```bash
telnet mail.yourdomain.com 587
```

---

## Most Common Root Causes

Based on typical issues:

1. **Configuration not saved** (40% of cases)
   - Solution: Click "Save Configuration" first!

2. **Wrong port** (25% of cases)
   - Solution: Try 587 (STARTTLS) or 465 (SSL)

3. **Wrong credentials** (20% of cases)
   - Solution: Verify username format and password

4. **Network/Firewall** (10% of cases)
   - Solution: Check connectivity, VPN, firewall

5. **Server not accessible** (5% of cases)
   - Solution: Verify server address, use IP

---

## Next Steps

1. **Check terminal** - What error do you see?
2. **Share the error** - Copy the exact error message
3. **Follow the fix** - Use the troubleshooting steps above
4. **Test again** - Try sending test email

**What specific error are you seeing in the terminal?**
