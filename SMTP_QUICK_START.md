# SMTP Configuration Persistence - Quick Start

## What's New?

Your SMTP email configuration is now **automatically saved** and **restored** when you restart the application. No more re-entering your email settings every time!

## How to Use

### First Time Setup

1. **Open Email Settings**
   - Navigate to Settings → Email Configuration
   - Or click the email icon in the navigation

2. **Enter Your SMTP Details**
   ```
   SMTP Host: smtp.gmail.com
   Port: 587
   Secure: Off (for STARTTLS) or On (for SSL/TLS)
   Username: your-email@gmail.com
   Password: your-app-password
   From Email: your-email@gmail.com
   ```

3. **Save Configuration**
   - Click "Save Configuration"
   - Wait for the success message
   - Your settings are now saved!

4. **Test It**
   - Enter a test email address
   - Click "Send Test Email"
   - Check your inbox

### After Restart

**That's it!** Your configuration is automatically loaded:

1. Start the application
2. Email service is ready immediately
3. No need to reconfigure

## What Gets Saved?

✅ SMTP server hostname  
✅ Port number  
✅ Security settings (SSL/TLS)  
✅ Username  
✅ Password (encrypted)  
✅ From email address  

## Where Is It Stored?

Your configuration is stored securely on your local machine:

- **Windows**: `C:\Users\<you>\AppData\Roaming\payroll\`
- **macOS**: `~/Library/Application Support/payroll/`
- **Linux**: `~/.config/payroll/`

## Security

🔒 **Your password is encrypted** - We use industry-standard encryption to protect your credentials.

🔒 **Local storage only** - Your configuration never leaves your computer.

🔒 **No cloud sync** - Everything stays on your machine.

## Common Email Providers

### Gmail

```
Host: smtp.gmail.com
Port: 587
Secure: No (STARTTLS)
Username: your-email@gmail.com
Password: [Use App Password - see below]
```

**Important**: Gmail requires an App Password:
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate an App Password
4. Use that password (not your regular password)

### Outlook/Office 365

```
Host: smtp.office365.com
Port: 587
Secure: No (STARTTLS)
Username: your-email@outlook.com
Password: your-password
```

### Custom SMTP Server

```
Host: mail.yourdomain.com
Port: 587 (or 465 for SSL)
Secure: Yes (for port 465) or No (for port 587)
Username: your-email@yourdomain.com
Password: your-password
```

## Troubleshooting

### Configuration Not Loading?

1. Check the console logs when starting the app
2. Look for: "✓ SMTP configuration loaded successfully"
3. If you see errors, try reconfiguring

### Need to Change Settings?

1. Go to Email Settings
2. Update any fields
3. Click "Save Configuration"
4. New settings will be used immediately

### Want to Start Fresh?

1. Delete the settings file from the storage location above
2. Restart the application
3. Reconfigure your email settings

## Tips

💡 **Test before sending**: Always send a test email after configuring

💡 **Use app passwords**: For Gmail, Yahoo, and similar services

💡 **Check spam folders**: Test emails might land in spam initially

💡 **Verify credentials**: Double-check username and password if connection fails

## Need Help?

Check the full documentation: `SMTP_PERSISTENCE_GUIDE.md`

## That's It!

You're all set! Your email configuration will now persist across application restarts. Configure once, use forever! 🎉
