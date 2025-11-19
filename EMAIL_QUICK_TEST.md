# Quick Email Test - 5 Minute Setup

## For Gmail Users (Most Common)

### 1. Get Your App Password (2 minutes)

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to your Google account
3. Select "Mail" and your device name
4. Click "Generate"
5. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### 2. Configure in App (1 minute)

1. Open your payroll app
2. Click **Settings** in sidebar → **Email** tab
3. Fill in:
   ```
   SMTP Host:     smtp.gmail.com
   Port:          587
   Use SSL/TLS:   OFF (toggle should be off)
   Username:      your-email@gmail.com
   Password:      [Paste the 16-char App Password]
   From Email:    your-email@gmail.com
   ```
4. Click **"Save Configuration"**

### 3. Test It (1 minute)

1. In "Test Email Address" field, enter your email
2. Click **"Send Test Email"**
3. Check your inbox (and spam folder)
4. You should receive a test email within 1-2 minutes

### 4. Watch the Terminal

Look for these messages in your terminal:

```
✓ Email service initialized successfully
✓ Test email sent successfully
```

---

## For Outlook Users

### Configuration:

```
SMTP Host:     smtp.office365.com
Port:          587
Use SSL/TLS:   OFF
Username:      your-email@outlook.com
Password:      [Your regular Outlook password]
From Email:    your-email@outlook.com
```

Then follow steps 2-4 above.

---

## Troubleshooting (If It Doesn't Work)

### Error: "Cannot resolve SMTP host"

- **Fix:** Check for typos in SMTP host
- Gmail: `smtp.gmail.com` (not `smtp.gmial.com`)

### Error: "Authentication failed"

- **Gmail:** Make sure you're using App Password, not regular password
- **Outlook:** Verify your password is correct

### Error: "Connection timeout"

- **Fix:** Check your firewall/antivirus
- Try from a different network
- Contact IT if on corporate network

### No Error But No Email

- Check spam/junk folder
- Wait 5 minutes (email can be delayed)
- Try sending to a different email address

---

## Quick Verification Checklist

Before clicking "Save Configuration":

- [ ] SMTP host is correct (no typos)
- [ ] Port is 587
- [ ] SSL/TLS toggle is OFF
- [ ] Username is your full email address
- [ ] Password is App Password (for Gmail)
- [ ] From Email is a valid email

---

## What Success Looks Like

### In the App:

- Toast notification: "Email Configured"
- Status badge turns green: "✓ Configured"
- Toast notification: "Test Email Sent"

### In Terminal:

```
Initializing email service with config: { host: 'smtp.gmail.com', ... }
Verifying SMTP connection...
✓ Email service initialized successfully
Sending test email to your-email@gmail.com...
✓ Test email sent successfully
Message ID: <...@gmail.com>
```

### In Your Inbox:

Subject: **Test Email - Payroll System**
Content: Confirmation that email is working with your config details

---

## Next: Send Real Payslips

Once test email works:

1. Go to **Payroll** → **History**
2. Select a payroll period
3. Click **"Email Payslips"** dropdown
4. Select **"Send to All Employees"**
5. Watch terminal for progress
6. Check for success notification

---

## Need More Help?

- **Detailed Guide:** See `EMAIL_TESTING_GUIDE.md`
- **Setup Instructions:** See `EMAIL_SETUP.md`
- **Troubleshooting:** See `TROUBLESHOOTING_EMAIL.md`
- **Settings Guide:** See `SETTINGS_USAGE_GUIDE.md`
