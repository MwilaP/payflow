# Company Settings Feature

## Overview
Allows users to configure company information that appears on all generated payslips (both printed and emailed).

## Features

### Company Information Fields
- **Company Name** (Required) - Appears at the top of payslips
- **Company Address** (Required) - Full address displayed on payslips
- **Company Phone** (Optional) - Contact phone number
- **Company Email** (Optional) - Contact email address
- **Tax ID / Registration Number** (Optional) - Company tax identification

## How to Configure

1. Navigate to **Settings** page
2. Click on the **"Company"** tab (first tab)
3. Fill in the company information:
   - Company Name (required)
   - Company Address (required)
   - Additional optional fields
4. Click **"Save Settings"** button

## Storage

- Settings are stored in **localStorage** with key: `company_settings`
- Persists across application restarts
- Can be updated at any time

## Integration

### Payslip Generation
Company settings are automatically used when:
- **Emailing payslips**: Company name and address appear on PDF attachments
- **Printing payslips**: Company name and address appear on printed PDFs
- **PDF generation**: All PDF payslips include company information

### Default Values
If no settings are configured:
- Company Name: "Your Company Name"
- Company Address: "Company Address"

## Technical Implementation

### Files Created
- `src/renderer/src/components/company-settings.tsx` - Settings component

### Files Modified
- `src/renderer/src/pages/SettingsPage.tsx` - Added Company tab
- `src/renderer/src/pages/PayrollHistoryDetailPage.tsx` - Uses company settings for PDF generation

### Helper Function
```typescript
import { getCompanySettings } from '@/components/company-settings'

const settings = getCompanySettings()
// Returns: { companyName, companyAddress, companyPhone?, companyEmail?, companyTaxId? }
```

### Usage Example
```typescript
// Get company settings
const companySettings = getCompanySettings()

// Use in PDF data
const pdfData: PayslipPDFData = {
  companyName: companySettings.companyName,
  companyAddress: companySettings.companyAddress,
  // ... other fields
}
```

## Validation

- **Company Name**: Required, cannot be empty
- **Company Address**: Required, cannot be empty
- **Other fields**: Optional

## User Experience

### Settings Page
- Clean, intuitive form layout
- Clear field labels with required indicators (*)
- Save button with loading state
- Success/error toast notifications

### Payslip Display
Company information appears at the top of every payslip:
```
[Company Name]
[Company Address]

PAYSLIP
Employee: John Doe
Period: November 2025
...
```

## Benefits

✅ **Professional appearance**: Company branding on all payslips
✅ **Easy configuration**: Simple form in settings
✅ **Automatic application**: Works for both email and print
✅ **Persistent storage**: Settings saved locally
✅ **No restart required**: Changes apply immediately

## Future Enhancements

- [ ] Company logo upload
- [ ] Multiple company profiles
- [ ] Export/import settings
- [ ] Cloud sync for settings
- [ ] Company-specific email templates
