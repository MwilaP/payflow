# Custom Email Server - Quick Troubleshooting Checklist

## Before You Start

Get this information from your email administrator:

- [ ] SMTP server address (hostname or IP)
- [ ] SMTP port number
- [ ] Security type (SSL/TLS, STARTTLS, or none)
- [ ] Username format (email@domain.com or just username)
- [ ] Password
- [ ] Network requirements (VPN, IP whitelist, etc.)

---

## Configuration Steps

### 1. Enter Your Settings

In Settings → Email tab:

```
SMTP Host:     [Your server: mail.yourdomain.com or 192.168.1.100]
Port:          [Usually 587, 465, or 25]
Use SSL/TLS:   [OFF for port 587, ON for port 465]
Username:      [Your username or email]
Password:      [Your password]
From Email:    [noreply@yourdomain.com]
```

### 2. Click "Save Configuration"

### 3. Watch Terminal for Results

---

## What You'll See in Terminal

### ✅ SUCCESS - Everything Working:

```
Initializing email service with config: {
  host: 'mail.yourdomain.com',
  port: 587,
  secure: false,
  user: 'your-email@yourdomain.com',
  from: 'noreply@yourdomain.com'
}
Verifying SMTP connection...
✓ Email service initialized successfully
```

**Action:** Proceed to send test email!

---

### ❌ ERROR 1: Cannot Resolve Host

```
✗ Failed to initialize email service: Error: getaddrinfo ENOTFOUND mail.yourdomain.com
Cannot resolve SMTP host "mail.yourdomain.com". Please check the hostname.
```

**What it means:** Your computer can't find the server

**Quick Fixes:**
1. Check for typos in SMTP host
2. Try using IP address instead: `192.168.1.100`
3. Check if you need to be on VPN
4. Verify DNS is working: `ping mail.yourdomain.com`
5. Ask admin: "Is the server accessible from my network?"

---

### ❌ ERROR 2: Connection Refused

```
✗ Failed to initialize email service: Error: connect ECONNREFUSED 192.168.1.100:587
Connection refused to mail.yourdomain.com:587. Check host and port.
```

**What it means:** Server is found but not accepting connections on that port

**Quick Fixes:**
1. Try different port:
   - If using 587, try 465 (and toggle SSL/TLS ON)
   - If using 465, try 587 (and toggle SSL/TLS OFF)
   - Try 25 or 2525
2. Ask admin: "What port should I use for SMTP?"
3. Check if firewall is blocking the port
4. Verify SMTP service is running on server

---

### ❌ ERROR 3: Connection Timeout

```
✗ Failed to initialize email service: Error: Connection timeout
Connection timeout to mail.yourdomain.com:587. Check firewall/network.
```

**What it means:** Connection attempt is timing out

**Quick Fixes:**
1. Check your firewall settings
2. Try from different network (mobile hotspot)
3. Connect to VPN if required
4. Ask admin: "Are there IP restrictions?"
5. Check Windows Firewall:
   ```powershell
   Test-NetConnection -ComputerName mail.yourdomain.com -Port 587
   ```

---

### ❌ ERROR 4: Authentication Failed

```
✗ Failed to initialize email service: Error: Invalid login: 535 Authentication failed
Authentication failed. Check username and password.
```

**What it means:** Server rejected your credentials

**Quick Fixes:**
1. Try different username formats:
   - `username@domain.com`
   - `username`
   - `DOMAIN\username`
2. Verify password (copy-paste to avoid typos)
3. Check if account is locked
4. Ask admin: "What format should the username be?"
5. Test credentials in Outlook/Thunderbird first

---

### ❌ ERROR 5: SSL/TLS Error

```
✗ Failed to initialize email service: Error: self signed certificate
```

**What it means:** Server has SSL certificate issue

**Quick Fixes:**
1. If using port 465, toggle SSL/TLS to OFF and try port 587
2. If using port 587, toggle SSL/TLS to ON and try port 465
3. Ask admin: "Does the server use self-signed certificates?"
4. May need developer to disable certificate validation

---

## Testing Workflow

```
1. Get server info from admin
   ↓
2. Enter settings in app
   ↓
3. Click "Save Configuration"
   ↓
4. Watch terminal for errors
   ↓
5. If error, check list above
   ↓
6. Fix and try again
   ↓
7. Success? Send test email
   ↓
8. Check inbox
   ↓
9. ✓ Done!
```

---

## Common Server Types & Settings

### cPanel/WHM
```
Host: mail.yourdomain.com
Port: 587
SSL/TLS: OFF
Username: email@yourdomain.com
```

### Plesk
```
Host: smtp.yourdomain.com
Port: 587
SSL/TLS: OFF
Username: email@yourdomain.com
```

### Exchange Server
```
Host: exchange.company.local
Port: 587
SSL/TLS: OFF
Username: DOMAIN\username
```

### Postfix (Linux)
```
Host: mail.server.local or IP
Port: 25 or 587
SSL/TLS: Varies
Username: May not be required
```

---

## Quick Diagnostic Commands

### Test if server is reachable:
```bash
ping mail.yourdomain.com
```

### Test if port is open:
```bash
# Windows PowerShell
Test-NetConnection -ComputerName mail.yourdomain.com -Port 587

# Linux/Mac
telnet mail.yourdomain.com 587
# or
nc -zv mail.yourdomain.com 587
```

### Check DNS resolution:
```bash
nslookup mail.yourdomain.com
```

---

## Questions to Ask Your Admin

If you're stuck, ask your email administrator:

1. **"What is the exact SMTP server address?"**
   - Hostname or IP address

2. **"Which port should I use?"**
   - 587, 465, 25, or other?

3. **"What security protocol?"**
   - SSL/TLS, STARTTLS, or none?

4. **"What format for username?"**
   - email@domain.com, username, or DOMAIN\username?

5. **"Are there network restrictions?"**
   - VPN required?
   - IP whitelist?
   - Only accessible from certain networks?

6. **"Can you test the credentials?"**
   - Verify they work on the server

7. **"Is SMTP service running?"**
   - Check server status

---

## Still Not Working?

### Try These:

1. **Test in Email Client First**
   - Configure Outlook or Thunderbird with same settings
   - If it works there, settings are correct
   - If it fails, settings need adjustment

2. **Use IP Address Instead of Hostname**
   - Instead of `mail.yourdomain.com`
   - Try `192.168.1.100` (get from admin)

3. **Try All Port Combinations**
   - Port 587 with SSL/TLS OFF
   - Port 465 with SSL/TLS ON
   - Port 25 with SSL/TLS OFF
   - Port 2525 with SSL/TLS OFF

4. **Check from Different Location**
   - Try from home network
   - Try from office network
   - Try with VPN connected
   - Try with mobile hotspot

5. **Review Terminal Logs Carefully**
   - Error codes tell you exactly what's wrong
   - Share logs with your admin

---

## Success Indicators

### You know it's working when:

✓ Terminal shows: "✓ Email service initialized successfully"
✓ No errors in terminal
✓ Status badge turns green: "Configured"
✓ Test email sends successfully
✓ Test email arrives in inbox

---

## Next Steps After Success

1. Send test email to verify
2. Check test email arrives
3. Try sending real payslips
4. Monitor for any issues

---

## Need More Help?

- **Detailed Guide:** `CUSTOM_EMAIL_SERVER_SETUP.md`
- **Testing Guide:** `EMAIL_TESTING_GUIDE.md`
- **General Troubleshooting:** `TROUBLESHOOTING_EMAIL.md`
- **Contact your email administrator with terminal error messages**
