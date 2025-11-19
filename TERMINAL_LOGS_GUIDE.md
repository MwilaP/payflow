# Terminal Logs Guide - What You'll See

## Overview

When testing email configuration, the terminal will show detailed logs of everything happening. This guide explains what each log means.

---

## When You Click "Save Configuration"

### ✅ Successful Configuration

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
DEBUG Creating transport: nodemailer (6.9.7; +https://nodemailer.com/; SMTP/6.9.7[client:6.9.7])
DEBUG Sending mail using SMTP/6.9.7[client:6.9.7]
DEBUG [connection] Connecting to mail.yourdomain.com:587
DEBUG [connection] Connection established
DEBUG [connection] < 220 mail.yourdomain.com ESMTP Postfix
DEBUG [connection] > EHLO [127.0.0.1]
DEBUG [connection] < 250-mail.yourdomain.com
DEBUG [connection] < 250-STARTTLS
DEBUG [connection] < 250 AUTH PLAIN LOGIN
DEBUG [connection] > STARTTLS
DEBUG [connection] < 220 2.0.0 Ready to start TLS
DEBUG Upgraded to TLS
DEBUG [connection] > EHLO [127.0.0.1]
DEBUG [connection] < 250-mail.yourdomain.com
DEBUG [connection] < 250 AUTH PLAIN LOGIN
DEBUG [connection] > AUTH PLAIN [credentials]
DEBUG [connection] < 235 2.7.0 Authentication successful
DEBUG [connection] > QUIT
DEBUG [connection] < 221 2.0.0 Bye
✓ Email service initialized successfully
========================================
```

**What this means:**
- ✓ Connected to SMTP server
- ✓ Upgraded to secure connection (TLS)
- ✓ Authentication successful
- ✓ Ready to send emails

---

### ❌ Failed Configuration - Cannot Resolve Host

```
========================================
📧 EMAIL CONFIGURATION REQUEST
========================================
Initializing email service with config: {
  host: 'mail.wrongdomain.com',
  port: 587,
  secure: false,
  user: 'your-email@wrongdomain.com',
  from: 'noreply@wrongdomain.com'
}
Verifying SMTP connection...
✗ Failed to initialize email service: Error: getaddrinfo ENOTFOUND mail.wrongdomain.com
Cannot resolve SMTP host "mail.wrongdomain.com". Please check the hostname.
========================================
```

**What this means:**
- ✗ Server hostname cannot be found
- **Fix:** Check spelling, try IP address, check DNS

---

### ❌ Failed Configuration - Connection Refused

```
========================================
📧 EMAIL CONFIGURATION REQUEST
========================================
Initializing email service with config: {
  host: 'mail.yourdomain.com',
  port: 999,
  secure: false,
  user: 'your-email@yourdomain.com',
  from: 'noreply@yourdomain.com'
}
Verifying SMTP connection...
DEBUG Creating transport: nodemailer (6.9.7; +https://nodemailer.com/; SMTP/6.9.7[client:6.9.7])
DEBUG Sending mail using SMTP/6.9.7[client:6.9.7]
DEBUG [connection] Connecting to mail.yourdomain.com:999
✗ Failed to initialize email service: Error: connect ECONNREFUSED 192.168.1.100:999
Connection refused to mail.yourdomain.com:999. Check host and port.
========================================
```

**What this means:**
- ✗ Server found but not accepting connections on that port
- **Fix:** Try port 587 or 465, check firewall

---

### ❌ Failed Configuration - Authentication Failed

```
========================================
📧 EMAIL CONFIGURATION REQUEST
========================================
Initializing email service with config: {
  host: 'mail.yourdomain.com',
  port: 587,
  secure: false,
  user: 'wrong-user@yourdomain.com',
  from: 'noreply@yourdomain.com'
}
Verifying SMTP connection...
DEBUG Creating transport: nodemailer (6.9.7; +https://nodemailer.com/; SMTP/6.9.7[client:6.9.7])
DEBUG Sending mail using SMTP/6.9.7[client:6.9.7]
DEBUG [connection] Connecting to mail.yourdomain.com:587
DEBUG [connection] Connection established
DEBUG [connection] < 220 mail.yourdomain.com ESMTP
DEBUG [connection] > EHLO [127.0.0.1]
DEBUG [connection] < 250-mail.yourdomain.com
DEBUG [connection] < 250-STARTTLS
DEBUG [connection] > STARTTLS
DEBUG [connection] < 220 Ready to start TLS
DEBUG Upgraded to TLS
DEBUG [connection] > AUTH PLAIN [credentials]
DEBUG [connection] < 535 5.7.8 Authentication failed
✗ Failed to initialize email service: Error: Invalid login: 535 5.7.8 Authentication failed
Authentication failed. Check username and password.
========================================
```

**What this means:**
- ✓ Connected to server
- ✓ TLS upgrade successful
- ✗ Username or password incorrect
- **Fix:** Verify credentials, try different username format

---

## When You Click "Send Test Email"

### ✅ Successful Test Email

```
========================================
📧 SENDING TEST EMAIL
Recipient: test@example.com
========================================
Sending test email to test@example.com...
DEBUG Creating transport: nodemailer (6.9.7; +https://nodemailer.com/; SMTP/6.9.7[client:6.9.7])
DEBUG Sending mail using SMTP/6.9.7[client:6.9.7]
DEBUG [connection] Connecting to mail.yourdomain.com:587
DEBUG [connection] Connection established
DEBUG [connection] < 220 mail.yourdomain.com ESMTP
DEBUG [connection] > EHLO [127.0.0.1]
DEBUG [connection] < 250-mail.yourdomain.com
DEBUG [connection] < 250-STARTTLS
DEBUG [connection] > STARTTLS
DEBUG [connection] < 220 Ready to start TLS
DEBUG Upgraded to TLS
DEBUG [connection] > AUTH PLAIN [credentials]
DEBUG [connection] < 235 Authentication successful
DEBUG [connection] > MAIL FROM:<noreply@yourdomain.com>
DEBUG [connection] < 250 2.1.0 Ok
DEBUG [connection] > RCPT TO:<test@example.com>
DEBUG [connection] < 250 2.1.5 Ok
DEBUG [connection] > DATA
DEBUG [connection] < 354 End data with <CR><LF>.<CR><LF>
DEBUG [connection] > [message content]
DEBUG [connection] < 250 2.0.0 Ok: queued as ABC123DEF456
DEBUG [connection] > QUIT
DEBUG [connection] < 221 2.0.0 Bye
✓ Test email sent successfully
Message ID: <abc123def456@yourdomain.com>
Response: 250 2.0.0 Ok: queued as ABC123DEF456
========================================
```

**What this means:**
- ✓ Connected to server
- ✓ Authenticated successfully
- ✓ Email accepted by server
- ✓ Email queued for delivery
- **Message ID:** Unique identifier for tracking
- **Queue ID:** Server's internal tracking number

---

### ❌ Failed Test Email - Not Configured

```
========================================
📧 SENDING TEST EMAIL
Recipient: test@example.com
========================================
Sending test email to test@example.com...
✗ Failed to send test email: Error: Email service not configured
Email service not configured
========================================
```

**What this means:**
- ✗ Email service hasn't been configured yet
- **Fix:** Configure email settings first (Save Configuration)

---

### ❌ Failed Test Email - Connection Error

```
========================================
📧 SENDING TEST EMAIL
Recipient: test@example.com
========================================
Sending test email to test@example.com...
DEBUG Creating transport: nodemailer (6.9.7; +https://nodemailer.com/; SMTP/6.9.7[client:6.9.7])
DEBUG Sending mail using SMTP/6.9.7[client:6.9.7]
DEBUG [connection] Connecting to mail.yourdomain.com:587
✗ Failed to send test email: Error: Connection timeout
Connection timeout. Check your network and firewall settings.
========================================
```

**What this means:**
- ✗ Cannot connect to server
- **Fix:** Check network, firewall, VPN

---

## When Checking Configuration Status

```
📧 Email configured status: true
```

**What this means:**
- Email service is configured and ready

or

```
📧 Email configured status: false
```

**What this means:**
- Email service needs to be configured

---

## When Getting Configuration

```
📧 Getting email configuration: Config found
```

**What this means:**
- Saved configuration exists

or

```
📧 Getting email configuration: No config
```

**What this means:**
- No saved configuration found

---

## When Sending Payslip Emails

### Single Payslip

```
========================================
📧 SENDING PAYSLIP EMAIL
To: employee@example.com (John Doe)
========================================
Sending payslip email to employee@example.com...
✓ Payslip email sent successfully to employee@example.com
Message ID: <xyz789@yourdomain.com>
========================================
```

### Bulk Payslips

```
========================================
📧 SENDING BULK PAYSLIP EMAILS
Total recipients: 25
========================================
Sending bulk payslips to 25 employees...
✓ Sent payslip to employee1@example.com (Employee 1)
✓ Sent payslip to employee2@example.com (Employee 2)
✓ Sent payslip to employee3@example.com (Employee 3)
...
✓ Bulk email sending completed
Sent: 23, Failed: 2
========================================
```

---

## Understanding DEBUG Messages

### Connection Messages

```
DEBUG [connection] Connecting to mail.yourdomain.com:587
```
- Attempting to connect to SMTP server

```
DEBUG [connection] Connection established
```
- TCP connection successful

```
DEBUG [connection] < 220 mail.yourdomain.com ESMTP
```
- Server greeting received (< means from server)

```
DEBUG [connection] > EHLO [127.0.0.1]
```
- Client introducing itself (> means to server)

### TLS/Security Messages

```
DEBUG [connection] < 250-STARTTLS
```
- Server supports STARTTLS (upgrade to secure connection)

```
DEBUG [connection] > STARTTLS
```
- Client requesting TLS upgrade

```
DEBUG Upgraded to TLS
```
- Connection now encrypted

### Authentication Messages

```
DEBUG [connection] > AUTH PLAIN [credentials]
```
- Sending authentication credentials

```
DEBUG [connection] < 235 Authentication successful
```
- Server accepted credentials

```
DEBUG [connection] < 535 Authentication failed
```
- Server rejected credentials

### Email Sending Messages

```
DEBUG [connection] > MAIL FROM:<sender@domain.com>
```
- Specifying sender address

```
DEBUG [connection] > RCPT TO:<recipient@domain.com>
```
- Specifying recipient address

```
DEBUG [connection] > DATA
```
- Starting to send email content

```
DEBUG [connection] < 250 2.0.0 Ok: queued as ABC123
```
- Email accepted and queued for delivery

---

## Common Response Codes

| Code | Meaning |
|------|---------|
| 220 | Service ready |
| 235 | Authentication successful |
| 250 | Requested action completed |
| 354 | Start mail input |
| 535 | Authentication failed |
| 550 | Mailbox unavailable |
| 554 | Transaction failed |

---

## What to Look For

### ✅ Good Signs:
- "Connection established"
- "Upgraded to TLS"
- "Authentication successful"
- "✓ Email service initialized successfully"
- "✓ Test email sent successfully"
- "Message ID: <...>"
- "250 2.0.0 Ok: queued"

### ❌ Problem Signs:
- "ENOTFOUND"
- "ECONNREFUSED"
- "ETIMEDOUT"
- "Authentication failed"
- "535" (auth error)
- "550" (mailbox error)
- "✗ Failed to..."

---

## Tips for Reading Logs

1. **Look for the ✓ or ✗ symbols**
   - ✓ = Success
   - ✗ = Error

2. **Read error messages carefully**
   - They tell you exactly what's wrong
   - Often include the fix

3. **Check DEBUG lines for details**
   - Shows the actual SMTP conversation
   - Helps diagnose where it fails

4. **Note the Message ID**
   - Unique identifier for each email
   - Use for tracking with email admin

5. **Watch for response codes**
   - 2xx = Success
   - 4xx = Temporary error
   - 5xx = Permanent error

---

## Saving Logs for Support

If you need to share logs with support:

1. **Copy from terminal**
   - Select all text between the `========` lines
   - Right-click → Copy

2. **Save to file**
   - Paste into a text file
   - Name it: `email-logs-YYYY-MM-DD.txt`

3. **Share with admin**
   - Include the full log output
   - Especially the error messages
   - Include configuration (hide password!)

---

## Example: Full Successful Flow

```
========================================
📧 EMAIL CONFIGURATION REQUEST
========================================
Initializing email service with config: { ... }
Verifying SMTP connection...
DEBUG [connection] Connecting to mail.yourdomain.com:587
DEBUG [connection] Connection established
DEBUG Upgraded to TLS
DEBUG [connection] < 235 Authentication successful
✓ Email service initialized successfully
========================================

========================================
📧 SENDING TEST EMAIL
Recipient: test@example.com
========================================
Sending test email to test@example.com...
DEBUG [connection] Connecting to mail.yourdomain.com:587
DEBUG [connection] < 250 2.0.0 Ok: queued as ABC123
✓ Test email sent successfully
Message ID: <abc123@yourdomain.com>
Response: 250 2.0.0 Ok: queued as ABC123
========================================
```

**This is what success looks like!** 🎉
