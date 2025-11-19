# Settings Page - User Guide

## Accessing the Settings Page

### Method 1: Via Sidebar
1. Click on the **"Settings"** menu item in the left sidebar
2. The Settings page will open

### Method 2: Via Email Configuration
1. Go to any Payroll History detail page
2. Click the **"Email Payslips"** dropdown button
3. Select **"Email Settings"**
4. This opens the email configuration dialog (quick access)

### Method 3: Direct URL
- Navigate to `/settings` in your browser

## Settings Page Layout

The Settings page has two main tabs:

### 📊 Payroll Tab
Contains general payroll configuration options:
- Payroll cycle (Monthly, Bi-weekly, Weekly)
- Payment date preferences
- Default currency settings
- Automatic processing options
- Notification preferences

### 📧 Email Tab
Contains comprehensive email configuration:

---

## Email Configuration Guide

### Step 1: Check Configuration Status

At the top of the Email tab, you'll see a status card:

```
┌─────────────────────────────────────────────────┐
│ Email Service Status              [✓ Configured]│
│                                                  │
│ Email service is configured and ready to send   │
│ payslips to employees.                          │
└─────────────────────────────────────────────────┘
```

**Status Indicators:**
- 🟢 **Configured** (Green badge with checkmark) - Email is ready to use
- 🔴 **Not Configured** (Gray badge with X) - Email needs setup

---

### Step 2: SMTP Configuration

Fill in your email server details:

#### Required Fields (marked with *)

**SMTP Host***
```
Example: smtp.gmail.com
Your email provider's SMTP server address
```

**Port***
```
Common ports:
- 587 (TLS) - Most common
- 465 (SSL)
- 25 (Unsecured - not recommended)
```

**Use SSL/TLS**
```
Toggle switch:
- ON for port 465
- OFF for port 587 (uses STARTTLS)
```

**Username***
```
Example: your-email@example.com
Your email account username
```

**Password***
```
Enter your email password or app-specific password
For Gmail: Use an App Password (not your regular password)
```

**From Email***
```
Example: noreply@company.com
Email address that appears as sender
```

---

### Step 3: Test Your Configuration

Before saving, test your settings:

1. Enter a test email address
2. Click **"Send Test Email"** button
3. Check the inbox of the test email
4. Verify you received the test message

**Test Email Format:**
```
Subject: Test Email - Payroll System
Body: Your email configuration is working correctly!
```

---

### Step 4: Save Configuration

1. Review all entered information
2. Click **"Save Configuration"** button
3. Wait for confirmation toast
4. Status will update to "Configured"

**Action Buttons:**
- **Reset**: Reload saved configuration (discards unsaved changes)
- **Save Configuration**: Save and apply settings

---

## Common Email Provider Setup

### 📧 Gmail Configuration

```
SMTP Host:     smtp.gmail.com
Port:          587
Use SSL/TLS:   No (uses STARTTLS)
Username:      your-email@gmail.com
Password:      [App Password - see note below]
From Email:    your-email@gmail.com
```

**Important for Gmail:**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Generate password for "Mail"
   - Use this 16-character password (not your regular password)

**Quick Link:** [Create Gmail App Password](https://support.google.com/accounts/answer/185833)

---

### 📧 Outlook / Office 365 Configuration

```
SMTP Host:     smtp.office365.com
Port:          587
Use SSL/TLS:   No (uses STARTTLS)
Username:      your-email@outlook.com
Password:      [Your Outlook password]
From Email:    your-email@outlook.com
```

---

### 📧 Custom SMTP Server

For other email providers:
1. Contact your IT department or email provider
2. Request SMTP server details
3. Common information needed:
   - SMTP server address
   - Port number
   - Security protocol (SSL/TLS/STARTTLS)
   - Authentication credentials

---

## Using Email After Configuration

Once configured, you can:

### 1. Send Payslips from Payroll History
- Navigate to any payroll history detail page
- Click **"Email Payslips"** dropdown
- Select **"Send to All Employees"**
- System sends emails to all employees automatically

### 2. Monitor Email Status
- Success notifications show number of emails sent
- Partial failure notifications show sent/failed counts
- Check console for detailed error logs

### 3. Update Configuration
- Return to Settings → Email tab anytime
- Modify settings as needed
- Save to apply changes

---

## Troubleshooting

### ❌ "Email Not Configured" Error
**Solution:** Go to Settings → Email tab and complete configuration

### ❌ Authentication Failed
**Possible causes:**
- Incorrect username or password
- For Gmail: Not using App Password
- 2FA not enabled (Gmail)

**Solution:**
1. Verify credentials are correct
2. For Gmail, generate and use App Password
3. Test configuration before saving

### ❌ Connection Timeout
**Possible causes:**
- Incorrect SMTP host or port
- Firewall blocking SMTP connections
- Network issues

**Solution:**
1. Verify SMTP host and port are correct
2. Check firewall settings
3. Try alternative port (587 vs 465)

### ❌ Test Email Not Received
**Possible causes:**
- Email in spam/junk folder
- Incorrect test email address
- Configuration not saved

**Solution:**
1. Check spam/junk folder
2. Verify test email address is correct
3. Save configuration before testing
4. Try sending to a different email address

### ⚠️ Partial Email Failures
**What it means:**
Some emails sent successfully, others failed

**Solution:**
1. Check console for specific error messages
2. Verify failed employee email addresses are correct
3. Check email sending quota with provider
4. Retry failed emails individually

---

## Security Best Practices

### ✅ Do's
- ✓ Use App-Specific Passwords (Gmail)
- ✓ Enable 2-Factor Authentication
- ✓ Use secure ports (587 or 465)
- ✓ Test configuration before production use
- ✓ Keep credentials confidential
- ✓ Update passwords regularly

### ❌ Don'ts
- ✗ Don't share email credentials
- ✗ Don't use personal email for production
- ✗ Don't disable security features
- ✗ Don't use port 25 (unsecured)
- ✗ Don't ignore authentication errors

---

## Support

If you encounter issues:

1. **Check Configuration**: Verify all settings are correct
2. **Test Email**: Use test function to diagnose issues
3. **Review Logs**: Check browser console for detailed errors
4. **Provider Documentation**: Consult your email provider's SMTP documentation
5. **IT Support**: Contact your IT department for server-specific issues

---

## Quick Reference Card

```
┌────────────────────────────────────────────┐
│         EMAIL SETTINGS QUICK REF           │
├────────────────────────────────────────────┤
│ Gmail:                                     │
│   Host: smtp.gmail.com                     │
│   Port: 587                                │
│   Note: Use App Password                   │
├────────────────────────────────────────────┤
│ Outlook:                                   │
│   Host: smtp.office365.com                 │
│   Port: 587                                │
├────────────────────────────────────────────┤
│ Common Ports:                              │
│   587 - TLS (Recommended)                  │
│   465 - SSL                                │
│   25  - Unsecured (Not recommended)        │
└────────────────────────────────────────────┘
```
