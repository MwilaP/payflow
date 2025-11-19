# Email Configuration Guide

This guide explains how to configure and use the email functionality to send payslips to employees.

## Features

- **Bulk Email Sending**: Send payslips to all employees in a payroll period with one click
- **Email Configuration**: Configure SMTP settings through an intuitive dialog
- **Test Email**: Test your email configuration before sending to employees
- **Error Handling**: Detailed error reporting for failed emails
- **Email Templates**: Professional HTML email templates with company branding

## Setup Instructions

### 1. Access Email Settings

1. Navigate to a payroll history detail page
2. Click on the "Email Payslips" dropdown button
3. Select "Email Settings"

### 2. Configure SMTP Settings

You'll need to provide the following information:

- **SMTP Host**: Your email server address (e.g., `smtp.gmail.com`)
- **Port**: SMTP port number (typically 587 for TLS, 465 for SSL)
- **Use SSL/TLS**: Enable if your server requires secure connection
- **Username**: Your email account username
- **Password**: Your email account password or app-specific password
- **From Email**: The email address that will appear as sender

### 3. Common SMTP Configurations

#### Gmail
- **Host**: `smtp.gmail.com`
- **Port**: `587`
- **Secure**: `false` (uses STARTTLS)
- **Note**: You'll need to use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password

#### Outlook/Office 365
- **Host**: `smtp.office365.com`
- **Port**: `587`
- **Secure**: `false` (uses STARTTLS)

#### Custom SMTP Server
- Contact your IT department or email provider for the correct settings

### 4. Test Your Configuration

1. After entering your SMTP settings, enter a test email address
2. Click the "Test" button
3. Check the test email inbox to verify the configuration works

### 5. Send Payslips

Once configured:

1. Go to any payroll history detail page
2. Click "Email Payslips" dropdown
3. Select "Send to All Employees"
4. The system will:
   - Generate payslips for all employees
   - Send individual emails to each employee's registered email address
   - Show a success/failure summary

## Email Template

Employees will receive an email with:

- **Subject**: "Payslip for [Period]"
- **Content**: 
  - Personalized greeting
  - Pay period information
  - Net salary amount
  - Professional formatting
- **Attachment**: PDF payslip (if generated)

## Troubleshooting

### Authentication Failed
- Verify your username and password are correct
- For Gmail, ensure you're using an App Password
- Check if "Less secure app access" needs to be enabled (not recommended)

### Connection Timeout
- Verify the SMTP host and port are correct
- Check your firewall settings
- Ensure your network allows SMTP connections

### Emails Not Received
- Check spam/junk folders
- Verify employee email addresses are correct in the system
- Test with a known working email address first

### Partial Failures
- The system will report which emails failed
- Check the console for detailed error messages
- Failed emails can be resent individually

## Security Best Practices

1. **Use App-Specific Passwords**: Never use your main email password
2. **Enable 2FA**: Use two-factor authentication on your email account
3. **Secure Storage**: Email credentials are stored securely in the application
4. **Regular Updates**: Keep your email password updated regularly
5. **Monitor Activity**: Check your email account's activity log regularly

## Requirements

- Valid SMTP server credentials
- Employees must have valid email addresses in the system
- Network access to the SMTP server
- Sufficient email sending quota (check with your email provider)

## Support

If you encounter issues:

1. Check the application console for detailed error messages
2. Verify all email addresses in the employee database are valid
3. Test with a single email before sending to all employees
4. Contact your IT department for SMTP server issues
