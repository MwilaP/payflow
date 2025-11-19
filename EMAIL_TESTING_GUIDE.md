# Email Configuration Testing Guide

## How to Test Email Configuration

Follow these steps to test and verify your email configuration is working correctly.

---

## Step 1: Check the Terminal/Console Logs

The email service now provides detailed logging. Watch the terminal where you ran `pnpm run dev` for messages.

### What to Look For:

#### ✅ Successful Configuration:

```
Initializing email service with config: {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: 'your-email@gmail.com',
  from: 'your-email@gmail.com'
}
Verifying SMTP connection...
✓ Email service initialized successfully
```

#### ❌ Failed Configuration - Common Errors:

**1. ENOTFOUND / EAI_AGAIN (DNS Resolution Error)**

```
✗ Failed to initialize email service: Error: getaddrinfo ENOTFOUND smtp.gmial.com
Cannot resolve SMTP host "smtp.gmial.com". Please check the hostname.
```

**Solution:** Fix the SMTP host typo (e.g., `smtp.gmial.com` → `smtp.gmail.com`)

**2. ECONNREFUSED (Connection Refused)**

```
✗ Failed to initialize email service: Error: connect ECONNREFUSED 127.0.0.1:587
Connection refused to smtp.gmail.com:587. Check host and port.
```

**Solution:**

- Check if the port is correct
- Verify firewall isn't blocking the connection
- Try port 465 with `secure: true` instead

**3. ETIMEDOUT (Connection Timeout)**

```
✗ Failed to initialize email service: Error: Connection timeout
Connection timeout to smtp.gmail.com:587. Check firewall/network.
```

**Solution:**

- Check your internet connection
- Verify firewall/antivirus isn't blocking SMTP
- Try from a different network
- Contact your IT department if on corporate network

**4. Authentication Failed**

```
✗ Failed to initialize email service: Error: Invalid login: 535-5.7.8 Username and Password not accepted
Authentication failed. Check username and password.
```

**Solution:**

- For Gmail: Use an App Password, not your regular password
- Verify username is correct
- Check password for typos

---

## Step 2: Test Using the UI

### Method 1: Settings Page Test Email

1. **Navigate to Settings**
   - Click "Settings" in the sidebar
   - Click the "Email" tab

2. **Fill in Configuration**

   ```
   SMTP Host: smtp.gmail.com
   Port: 587
   Use SSL/TLS: OFF (for port 587)
   Username: your-email@gmail.com
   Password: [Your App Password]
   From Email: your-email@gmail.com
   ```

3. **Send Test Email**
   - Enter your email in "Test Email Address"
   - Click "Send Test Email"
   - Watch the terminal for logs

4. **Check Results**
   - **Success:** You'll see a toast notification and receive an email
   - **Failure:** Error message will show what went wrong

### Method 2: Browser Console Test

1. **Open Developer Tools**
   - Press `F12` or `Ctrl+Shift+I`
   - Go to Console tab

2. **Check if Email API is Available**

   ```javascript
   window.api.email
   ```

   Should show:

   ```javascript
   {
     configure: ƒ,
     isConfigured: ƒ,
     getConfig: ƒ,
     sendPayslip: ƒ,
     sendBulkPayslips: ƒ,
     sendTest: ƒ
   }
   ```

3. **Test Configuration Programmatically**

   ```javascript
   // Configure email
   await window.api.email.configure({
     host: 'smtp.gmail.com',
     port: 587,
     secure: false,
     auth: {
       user: 'your-email@gmail.com',
       pass: 'your-app-password'
     },
     from: 'your-email@gmail.com'
   })
   ```

4. **Check if Configured**

   ```javascript
   await window.api.email.isConfigured()
   // Should return: true
   ```

5. **Send Test Email**
   ```javascript
   await window.api.email.sendTest('test@example.com')
   ```

---

## Step 3: Verify Test Email Received

### What the Test Email Looks Like:

**Subject:** Test Email - Payroll System

**Content:**

- ✓ Test Email Successful header
- Confirmation that configuration is working
- Your SMTP configuration details
- Confirmation you can send payslips

### If You Don't Receive the Email:

1. **Check Spam/Junk Folder**
   - Test emails often go to spam initially

2. **Wait a Few Minutes**
   - Email delivery can take 1-5 minutes

3. **Check Terminal Logs**
   - Look for "✓ Test email sent successfully"
   - Check for Message ID and Response

4. **Try Different Email Address**
   - Use a different email provider to test

---

## Common Configuration Examples

### Gmail Configuration

```
SMTP Host: smtp.gmail.com
Port: 587
Use SSL/TLS: OFF
Username: your-email@gmail.com
Password: [16-character App Password]
From Email: your-email@gmail.com
```

**Important for Gmail:**

1. Enable 2-Factor Authentication
2. Generate App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
   - Use this instead of your regular password

### Outlook / Office 365

```
SMTP Host: smtp.office365.com
Port: 587
Use SSL/TLS: OFF
Username: your-email@outlook.com
Password: [Your Outlook password]
From Email: your-email@outlook.com
```

### Custom SMTP Server

```
SMTP Host: mail.yourdomain.com
Port: 587 or 465
Use SSL/TLS: ON (for 465), OFF (for 587)
Username: [Provided by IT]
Password: [Provided by IT]
From Email: noreply@yourdomain.com
```

---

## Troubleshooting Checklist

### Before Testing:

- [ ] Application has been restarted after adding email feature
- [ ] Internet connection is active
- [ ] SMTP host is spelled correctly
- [ ] Port number is correct (587 or 465)
- [ ] SSL/TLS setting matches port (OFF for 587, ON for 465)
- [ ] Username is correct (usually full email address)
- [ ] Password is correct (App Password for Gmail)
- [ ] From email is a valid email address

### During Testing:

- [ ] Terminal is open and visible for logs
- [ ] Browser console is open (F12) for errors
- [ ] Test email address is valid
- [ ] Watching for toast notifications in UI

### After Testing:

- [ ] Check terminal for success/error messages
- [ ] Check email inbox (and spam folder)
- [ ] Review any error messages
- [ ] Try alternative configuration if needed

---

## Error Messages Reference

| Error Code   | Meaning                 | Solution                   |
| ------------ | ----------------------- | -------------------------- |
| ENOTFOUND    | Cannot resolve hostname | Check SMTP host spelling   |
| ECONNREFUSED | Connection refused      | Check port, try 465 or 587 |
| ETIMEDOUT    | Connection timeout      | Check firewall/network     |
| EAUTH        | Authentication failed   | Check username/password    |
| 535          | Invalid credentials     | Use App Password (Gmail)   |
| ESOCKET      | Socket error            | Network/firewall issue     |

---

## Testing Workflow

```
1. Configure Email Settings
   ↓
2. Watch Terminal Logs
   ↓
3. Click "Save Configuration"
   ↓
4. Check for Success Message
   ↓
5. Enter Test Email Address
   ↓
6. Click "Send Test Email"
   ↓
7. Watch Terminal for Logs
   ↓
8. Check Email Inbox
   ↓
9. Verify Test Email Received
   ↓
10. ✓ Configuration Complete!
```

---

## Advanced Debugging

### Enable Verbose Logging

The email service now has debug mode enabled by default. You'll see detailed SMTP conversation in the terminal:

```
DEBUG Creating transport: nodemailer (6.9.7; +https://nodemailer.com/; SMTP/6.9.7[client:6.9.7])
DEBUG Sending mail using SMTP/6.9.7[client:6.9.7]
DEBUG [connection] Connecting to smtp.gmail.com:587
DEBUG [connection] Connection established
DEBUG [connection] < 220 smtp.gmail.com ESMTP
DEBUG [connection] > EHLO [127.0.0.1]
...
```

### Check Configuration Persistence

```javascript
// In browser console
const config = await window.api.email.getConfig()
console.log(config)
```

Should show your saved configuration (without password).

### Manual SMTP Test (Outside App)

Use a tool like `telnet` or `openssl` to test SMTP connection:

```bash
# Test connection to Gmail
telnet smtp.gmail.com 587

# Or with SSL
openssl s_client -connect smtp.gmail.com:465 -crlf
```

---

## Success Indicators

### ✓ Configuration Successful:

- Terminal shows: "✓ Email service initialized successfully"
- Toast notification: "Email Configured"
- Status badge changes to "Configured" (green)

### ✓ Test Email Successful:

- Terminal shows: "✓ Test email sent successfully"
- Terminal shows: "Message ID: <...>"
- Toast notification: "Test Email Sent"
- Email received in inbox within 5 minutes

### ✓ Ready for Production:

- Test email received successfully
- Configuration persists after app restart
- No errors in terminal logs
- Status shows "Configured"

---

## Next Steps After Successful Test

Once your email configuration is working:

1. **Send Payslips**
   - Go to Payroll → History
   - Select a payroll period
   - Click "Email Payslips" → "Send to All Employees"

2. **Monitor Sending**
   - Watch terminal for progress
   - Check for success/failure notifications
   - Review any errors for specific employees

3. **Verify Delivery**
   - Ask employees to check their email
   - Check spam folders if needed
   - Verify payslip PDF attachments open correctly

---

## Support

If you continue to have issues:

1. Review terminal logs carefully
2. Check `TROUBLESHOOTING_EMAIL.md`
3. Verify with your email provider's documentation
4. Test with a different email provider
5. Contact your IT department for corporate email servers
