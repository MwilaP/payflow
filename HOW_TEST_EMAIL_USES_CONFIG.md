# How Test Email Uses Your Configuration

## ✅ Confirmation: Test Email IS Using Your Username & Password

The test email functionality **already uses** the configured username and password. Here's exactly how it works:

---

## Step-by-Step Flow

### **Step 1: You Configure Email Settings**

When you fill out the form in Settings → Email and click "Save Configuration":

```typescript
// Your configuration from the UI
{
  host: 'mail.yourdomain.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@yourdomain.com',  // ← Your username
    pass: 'your-password'                // ← Your password
  },
  from: 'noreply@yourdomain.com'
}
```

### **Step 2: Configuration Initializes the Transporter**

The `initialize` method creates a nodemailer transporter with **your credentials**:

```typescript
async initialize(config: EmailConfig): Promise<void> {
  this.config = config  // ← Stores your config

  this.transporter = nodemailer.createTransport({
    host: config.host,              // ← Your SMTP host
    port: config.port,              // ← Your port
    secure: config.secure,          // ← Your SSL/TLS setting
    auth: {
      user: config.auth.user,       // ← YOUR USERNAME (stored here!)
      pass: config.auth.pass        // ← YOUR PASSWORD (stored here!)
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    debug: true,
    logger: true
  })

  // Verifies connection using YOUR credentials
  await this.transporter.verify()
}
```

### **Step 3: Test Email Uses the Configured Transporter**

When you click "Send Test Email", it uses the **same transporter** that was initialized with your credentials:

```typescript
async sendTestEmail(testEmail: string): Promise<void> {
  if (!this.transporter || !this.config) {
    throw new Error('Email service not configured')
  }

  try {
    const mailOptions = {
      from: this.config.from,  // ← Uses your configured "from" address
      to: testEmail,
      subject: 'Test Email - Payroll System',
      html: generateTestEmailHtml(this.config),
      text: generateTestEmailText(this.config)
    }

    // Sends using this.transporter which has YOUR credentials
    const info = await this.transporter.sendMail(mailOptions)

    console.log('✓ Test email sent successfully')
    console.log('Message ID:', info.messageId)
  } catch (error: any) {
    const errorMessage = getTestEmailErrorMessage(error)
    throw new Error(errorMessage)
  }
}
```

---

## How Nodemailer Uses Your Credentials

When `this.transporter.sendMail()` is called, nodemailer:

1. **Connects** to your SMTP server (`mail.yourdomain.com:587`)
2. **Authenticates** using your username and password
3. **Sends** the email from your configured "from" address
4. **Returns** the result

### Terminal Output Shows Authentication:

```
========================================
📧 SENDING TEST EMAIL
Recipient: test@example.com
========================================
Sending test email to test@example.com...
DEBUG [connection] Connecting to mail.yourdomain.com:587
DEBUG [connection] Connection established
DEBUG [connection] < 220 mail.yourdomain.com ESMTP
DEBUG [connection] > EHLO [127.0.0.1]
DEBUG [connection] < 250-STARTTLS
DEBUG [connection] > STARTTLS
DEBUG Upgraded to TLS
DEBUG [connection] > AUTH PLAIN [credentials]  ← YOUR USERNAME/PASSWORD SENT HERE
DEBUG [connection] < 235 Authentication successful  ← SERVER ACCEPTED YOUR CREDENTIALS
DEBUG [connection] > MAIL FROM:<noreply@yourdomain.com>  ← YOUR "FROM" ADDRESS
DEBUG [connection] < 250 2.1.0 Ok
DEBUG [connection] > RCPT TO:<test@example.com>
DEBUG [connection] < 250 2.1.5 Ok
DEBUG [connection] > DATA
DEBUG [connection] < 354 End data with <CR><LF>.<CR><LF>
DEBUG [connection] < 250 2.0.0 Ok: queued as ABC123
✓ Test email sent successfully
Message ID: <abc123@yourdomain.com>
========================================
```

**See the line:** `DEBUG [connection] > AUTH PLAIN [credentials]`

- This is where your username and password are sent to the server
- The next line shows: `< 235 Authentication successful`
- This confirms your credentials were accepted

---

## What Gets Used from Your Configuration

| Configuration Field | Used For                        | When                 |
| ------------------- | ------------------------------- | -------------------- |
| `host`              | SMTP server address             | Connection           |
| `port`              | SMTP server port                | Connection           |
| `secure`            | SSL/TLS encryption              | Connection           |
| `auth.user`         | **Username for authentication** | **Every email send** |
| `auth.pass`         | **Password for authentication** | **Every email send** |
| `from`              | Sender email address            | Email header         |

---

## Proof: Same Transporter for All Emails

The email service uses **one transporter instance** for all operations:

```typescript
class EmailService {
  private transporter: Transporter | null = null // ← Single instance
  private config: EmailConfig | null = null // ← Single config

  // Initialize ONCE with your credentials
  async initialize(config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      auth: {
        user: config.auth.user, // ← YOUR credentials stored here
        pass: config.auth.pass
      }
    })
  }

  // Test email uses THE SAME transporter
  async sendTestEmail(testEmail: string) {
    await this.transporter.sendMail(mailOptions) // ← Uses YOUR credentials
  }

  // Payslip emails use THE SAME transporter
  async sendPayslipEmail(data: EmailPayslipData) {
    await this.transporter.sendMail(mailOptions) // ← Uses YOUR credentials
  }

  // Bulk emails use THE SAME transporter
  async sendBulkPayslips(payslips: EmailPayslipData[]) {
    // All emails use YOUR credentials
  }
}
```

---

## Common Misconceptions

### ❌ "Test email uses a different account"

**FALSE** - Test email uses the exact same transporter with your configured credentials.

### ❌ "I need to configure credentials separately for test emails"

**FALSE** - Once you configure email settings, ALL email operations use those credentials.

### ❌ "Test email doesn't authenticate"

**FALSE** - Every email (test or real) authenticates with your username and password.

---

## How to Verify Your Credentials Are Being Used

### **Method 1: Check Terminal Logs**

When you send a test email, look for:

```
DEBUG [connection] > AUTH PLAIN [credentials]
DEBUG [connection] < 235 Authentication successful
```

If you see "Authentication successful", your credentials worked!

### **Method 2: Check Email Server Logs**

Your email server logs will show:

- Connection from your IP
- Authentication attempt with your username
- Email sent from your configured "from" address

### **Method 3: Check Received Email**

The test email you receive will show:

- **From:** Your configured "from" address
- **Server:** Your SMTP server in email headers
- **Authentication:** Email headers show it was authenticated

### **Method 4: Try Wrong Credentials**

If you configure with wrong credentials:

```
✗ Failed to initialize email service: Error: Invalid login: 535 Authentication failed
Authentication failed. Check username and password.
```

This proves the system IS using your credentials!

---

## Example: Complete Flow

### Your Configuration:

```json
{
  "host": "mail.company.com",
  "port": 587,
  "secure": false,
  "auth": {
    "user": "john@company.com",
    "pass": "SecurePassword123"
  },
  "from": "payroll@company.com"
}
```

### What Happens:

1. **Save Configuration** → Creates transporter with `john@company.com` / `SecurePassword123`
2. **Verify Connection** → Tests authentication with your credentials
3. **Send Test Email** →
   - Connects to `mail.company.com:587`
   - Authenticates as `john@company.com` with `SecurePassword123`
   - Sends email from `payroll@company.com`
   - Delivers to test recipient

4. **Send Payslip** →
   - Uses **same** transporter
   - Uses **same** credentials
   - Sends from **same** "from" address

---

## Security Note

Your password is:

- ✅ Stored in memory only (not saved to disk in this implementation)
- ✅ Used for SMTP authentication
- ✅ Sent over encrypted connection (TLS/SSL)
- ✅ Never logged to console (only `[credentials]` placeholder shown)
- ❌ Not persisted between app restarts (you need to reconfigure)

---

## Summary

### ✅ **YES, test email uses your configured username and password!**

**How it works:**

1. You configure email settings with your username and password
2. System creates ONE transporter with your credentials
3. Test email uses that SAME transporter
4. Payslip emails use that SAME transporter
5. All emails authenticate with YOUR credentials

**Proof:**

- Terminal shows `AUTH PLAIN [credentials]` and `Authentication successful`
- Same transporter instance used for all operations
- Wrong credentials = authentication failure
- Email headers show your server and "from" address

**There is no separate configuration for test emails!**

Everything uses the credentials you configured in Settings → Email.
