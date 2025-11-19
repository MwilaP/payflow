# Custom Email Server Configuration Guide

## Setting Up Your Own Email Server

If you're using your own email server (not Gmail/Outlook), follow this guide.

---

## Step 1: Gather Your SMTP Server Information

You'll need the following information from your email server administrator or hosting provider:

### Required Information:

1. **SMTP Server Address (Host)**
   - Example: `mail.yourdomain.com` or `smtp.yourdomain.com`
   - Could also be an IP address: `192.168.1.100`

2. **SMTP Port**
   - Common ports:
     - **587** - STARTTLS (recommended, most common)
     - **465** - SSL/TLS (secure from start)
     - **25** - Unencrypted (not recommended, often blocked)
     - **2525** - Alternative port (some providers)

3. **Security Protocol**
   - **STARTTLS** (port 587) - Use SSL/TLS toggle: **OFF**
   - **SSL/TLS** (port 465) - Use SSL/TLS toggle: **ON**
   - **None** (port 25) - Use SSL/TLS toggle: **OFF** (not recommended)

4. **Authentication Credentials**
   - **Username**: Could be full email address or just username
   - **Password**: Your email account password

5. **From Email Address**
   - The email address that will appear as sender
   - Example: `noreply@yourdomain.com` or `payroll@yourdomain.com`

---

## Step 2: Common Custom Server Configurations

### cPanel/WHM Servers
```
SMTP Host:     mail.yourdomain.com
Port:          587
Use SSL/TLS:   OFF (uses STARTTLS)
Username:      your-email@yourdomain.com
Password:      [Your email password]
From Email:    your-email@yourdomain.com
```

### Plesk Servers
```
SMTP Host:     smtp.yourdomain.com
Port:          587 or 465
Use SSL/TLS:   OFF (for 587), ON (for 465)
Username:      your-email@yourdomain.com
Password:      [Your email password]
From Email:    your-email@yourdomain.com
```

### Microsoft Exchange Server
```
SMTP Host:     mail.yourdomain.com
Port:          587
Use SSL/TLS:   OFF
Username:      DOMAIN\username or username@domain.com
Password:      [Your domain password]
From Email:    your-email@yourdomain.com
```

### Postfix/Sendmail (Linux Servers)
```
SMTP Host:     localhost or mail.yourdomain.com
Port:          587 or 25
Use SSL/TLS:   Depends on configuration
Username:      [May not be required for localhost]
Password:      [May not be required for localhost]
From Email:    noreply@yourdomain.com
```

### Amazon SES
```
SMTP Host:     email-smtp.us-east-1.amazonaws.com
Port:          587
Use SSL/TLS:   OFF
Username:      [Your SMTP username from AWS]
Password:      [Your SMTP password from AWS]
From Email:    verified-email@yourdomain.com
```

### SendGrid
```
SMTP Host:     smtp.sendgrid.net
Port:          587
Use SSL/TLS:   OFF
Username:      apikey
Password:      [Your SendGrid API key]
From Email:    verified-email@yourdomain.com
```

### Mailgun
```
SMTP Host:     smtp.mailgun.org
Port:          587
Use SSL/TLS:   OFF
Username:      postmaster@yourdomain.mailgun.org
Password:      [Your Mailgun SMTP password]
From Email:    noreply@yourdomain.com
```

---

## Step 3: Configure in the Application

1. **Open the Application**
   - Navigate to **Settings** → **Email** tab

2. **Enter Your Server Details**
   ```
   SMTP Host:     [Your server address]
   Port:          [Your server port]
   Use SSL/TLS:   [ON for 465, OFF for 587]
   Username:      [Your username]
   Password:      [Your password]
   From Email:    [Your from address]
   ```

3. **Click "Save Configuration"**

4. **Watch the Terminal** for connection status

---

## Step 4: Test Your Configuration

### Watch Terminal Logs

When you click "Save Configuration", watch the terminal for detailed logs:

#### ✅ Successful Connection:
```
Initializing email service with config: {
  host: 'mail.yourdomain.com',
  port: 587,
  secure: false,
  user: 'your-email@yourdomain.com',
  from: 'your-email@yourdomain.com'
}
Verifying SMTP connection...
✓ Email service initialized successfully
```

#### ❌ Common Errors:

**1. Cannot Resolve Host**
```
✗ Failed to initialize email service: Error: getaddrinfo ENOTFOUND mail.yourdomain.com
Cannot resolve SMTP host "mail.yourdomain.com". Please check the hostname.
```
**Solutions:**
- Verify the SMTP host address is correct
- Try using IP address instead of hostname
- Check DNS settings
- Ensure you're on the correct network (VPN if required)

**2. Connection Refused**
```
✗ Failed to initialize email service: Error: connect ECONNREFUSED 192.168.1.100:587
Connection refused to mail.yourdomain.com:587. Check host and port.
```
**Solutions:**
- Verify the port number is correct
- Check if SMTP service is running on the server
- Try alternative port (465 instead of 587)
- Check firewall rules on the email server

**3. Connection Timeout**
```
✗ Failed to initialize email service: Error: Connection timeout
Connection timeout to mail.yourdomain.com:587. Check firewall/network.
```
**Solutions:**
- Check your local firewall settings
- Verify network connectivity to the server
- Check if VPN is required
- Contact your network administrator
- Try from a different network

**4. Authentication Failed**
```
✗ Failed to initialize email service: Error: Invalid login: 535 Authentication failed
Authentication failed. Check username and password.
```
**Solutions:**
- Verify username is correct (try with and without @domain.com)
- Check password for typos
- Verify account is not locked
- Check if authentication is required
- Try different authentication method

**5. TLS/SSL Error**
```
✗ Failed to initialize email service: Error: self signed certificate
```
**Solutions:**
- If using self-signed certificate, you may need to disable certificate validation
- Contact server administrator to install proper SSL certificate
- Try with SSL/TLS toggle in different position

---

## Step 5: Send Test Email

1. **Enter Test Email Address**
   - Use your own email or a test account

2. **Click "Send Test Email"**

3. **Watch Terminal**:
   ```
   Sending test email to test@example.com...
   ✓ Test email sent successfully
   Message ID: <abc123@yourdomain.com>
   Response: 250 2.0.0 OK
   ```

4. **Check Inbox**
   - Check the recipient's inbox (and spam folder)
   - Test email should arrive within 1-5 minutes

---

## Troubleshooting Your Custom Server

### Issue: "Cannot resolve SMTP host"

**Diagnostic Steps:**
1. Ping the server:
   ```bash
   ping mail.yourdomain.com
   ```

2. Check DNS resolution:
   ```bash
   nslookup mail.yourdomain.com
   ```

3. Try using IP address instead of hostname

**Common Causes:**
- Typo in hostname
- DNS not configured
- Need to be on VPN
- Internal server only accessible from specific network

---

### Issue: "Connection refused"

**Diagnostic Steps:**
1. Check if port is open:
   ```bash
   telnet mail.yourdomain.com 587
   ```
   Or:
   ```bash
   nc -zv mail.yourdomain.com 587
   ```

2. Try different ports (587, 465, 25, 2525)

**Common Causes:**
- SMTP service not running
- Firewall blocking the port
- Wrong port number
- Server only accepts connections from specific IPs

---

### Issue: "Authentication failed"

**Diagnostic Steps:**
1. Try username variations:
   - `username@domain.com`
   - `username`
   - `DOMAIN\username`

2. Verify password works in email client (Outlook, Thunderbird)

3. Check if account requires special authentication

**Common Causes:**
- Wrong username format
- Incorrect password
- Account locked or disabled
- Special authentication required (OAuth, etc.)
- IP not whitelisted

---

### Issue: "Connection timeout"

**Diagnostic Steps:**
1. Check firewall on your computer:
   ```bash
   # Windows
   netsh advfirewall show allprofiles
   
   # Check if port is blocked
   Test-NetConnection -ComputerName mail.yourdomain.com -Port 587
   ```

2. Try from different network (mobile hotspot)

3. Check if VPN is required

**Common Causes:**
- Local firewall blocking SMTP
- Corporate network blocking SMTP
- Need to be on VPN
- Server firewall blocking your IP
- ISP blocking SMTP ports

---

## Advanced Configuration

### Self-Signed Certificates

If your server uses self-signed SSL certificates, you may need to modify the email service to accept them. Contact your developer to add:

```typescript
{
  tls: {
    rejectUnauthorized: false
  }
}
```

**Warning:** Only use this for internal servers you trust!

### No Authentication Required

Some internal servers don't require authentication. If your server doesn't need username/password:

- Still fill in the fields (use dummy values)
- The connection will work even if auth fails
- Or contact your developer to make auth optional

### Custom Ports

If your server uses non-standard ports:
- Enter the exact port number in the Port field
- Adjust SSL/TLS toggle based on server configuration
- Common custom ports: 2525, 8025, 8587

---

## Testing Checklist for Custom Servers

Before configuring:
- [ ] I have the correct SMTP host address
- [ ] I know which port to use (587, 465, or other)
- [ ] I know if SSL/TLS is required
- [ ] I have valid username and password
- [ ] I can access the server from this network
- [ ] VPN is connected (if required)
- [ ] Firewall allows SMTP connections

During configuration:
- [ ] Terminal is open and visible
- [ ] SMTP host is entered correctly (no typos)
- [ ] Port number is correct
- [ ] SSL/TLS toggle matches port configuration
- [ ] Username format is correct
- [ ] Password is correct

After configuration:
- [ ] Terminal shows "✓ Email service initialized successfully"
- [ ] Test email sends without errors
- [ ] Test email is received in inbox
- [ ] No errors in terminal logs

---

## Getting Help from Your Email Administrator

If you're having trouble, ask your email administrator for:

1. **Exact SMTP server address**
   - "What is the SMTP server hostname or IP?"

2. **Port and security settings**
   - "Which port should I use for SMTP?"
   - "Does it use SSL/TLS or STARTTLS?"

3. **Authentication details**
   - "What format should the username be?"
   - "Is there a special password for SMTP?"

4. **Network requirements**
   - "Do I need to be on VPN?"
   - "Are there IP restrictions?"
   - "Is there a firewall I need to configure?"

5. **Test credentials**
   - "Can you provide test credentials to verify the setup?"

---

## Example Configurations That Work

### Example 1: cPanel Server
```
SMTP Host:     mail.example.com
Port:          587
Use SSL/TLS:   OFF
Username:      noreply@example.com
Password:      MySecurePassword123
From Email:    noreply@example.com

Result: ✓ Works perfectly
```

### Example 2: Internal Exchange Server
```
SMTP Host:     exchange.company.local
Port:          587
Use SSL/TLS:   OFF
Username:      COMPANY\payroll
Password:      DomainPassword123
From Email:    payroll@company.local

Result: ✓ Works on company network/VPN
```

### Example 3: VPS with Postfix
```
SMTP Host:     192.168.1.50
Port:          25
Use SSL/TLS:   OFF
Username:      admin
Password:      ServerPassword
From Email:    system@vps.local

Result: ✓ Works from same network
```

---

## Quick Reference

| Setting | Common Values |
|---------|---------------|
| **SMTP Host** | mail.domain.com, smtp.domain.com, or IP address |
| **Port** | 587 (STARTTLS), 465 (SSL), 25 (plain) |
| **SSL/TLS** | OFF for 587, ON for 465 |
| **Username** | email@domain.com or just username |
| **From Email** | Any valid email on your domain |

---

## Need More Help?

1. Check terminal logs for specific error codes
2. Review `EMAIL_TESTING_GUIDE.md` for detailed troubleshooting
3. Contact your email server administrator
4. Test SMTP connection with email client first (Outlook, Thunderbird)
5. Use online SMTP testing tools to verify server is accessible
