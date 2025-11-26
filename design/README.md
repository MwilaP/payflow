# Payroll App Icon Design

This folder contains the icon design assets and generation tools for the Payroll Desktop Application.

## 🎨 Design Concept

The icon features:
- **Blue gradient background** (#1e40af to #2563eb) - Professional, trustworthy color scheme
- **White document/payslip** - Represents payroll documents
- **Green checkmark badge** (#10b981) - Symbolizes approval, completion, and accuracy
- **Modern, clean design** - Suitable for professional desktop application

The checkmark represents the core value proposition: accurate, verified, and completed payroll processing.

## 📁 Files

- `icon-design.svg` - Source SVG design (512×512)
- `generate-icons.html` - Browser-based icon generator (no dependencies required)
- `generate-icons.py` - Python script for batch generation (requires Inkscape)

## 🚀 Quick Start (Recommended)

### Option 1: Browser-Based Generator (Easiest)

1. Open `generate-icons.html` in your web browser
2. Click "📥 Download All Icons"
3. Replace the downloaded icons in:
   - `build/icon.png`
   - `resources/icon.png`
4. Rebuild your app: `npm run build:win` or `npm run build:mac`

### Option 2: Python Script (Batch Generation)

**Requirements:** Inkscape must be installed

**Windows:**
```bash
# Download and install Inkscape from https://inkscape.org/release/
python design/generate-icons.py
```

**macOS:**
```bash
brew install inkscape
python3 design/generate-icons.py
```

**Linux:**
```bash
sudo apt-get install inkscape
python3 design/generate-icons.py
```

## 📦 Generated Icon Sizes

The generators create the following sizes:

- **512×512** - Main application icon (build/icon.png, resources/icon.png)
- **256×256** - Windows taskbar
- **128×128** - Windows explorer
- **64×64** - Windows small icons
- **32×32** - Windows system tray
- **16×16** - Windows smallest size

## 🔧 Platform-Specific Formats

### Windows (.ico)
Electron Builder automatically generates `icon.ico` from `build/icon.png` during the build process.

### macOS (.icns)
Electron Builder automatically generates `icon.icns` from `build/icon.icns` or `build/icon.png` during the build process.

### Linux
Uses PNG files directly from the build folder.

## 🎯 Customization

To modify the icon design:

1. Edit `icon-design.svg` in a vector editor (Inkscape, Adobe Illustrator, Figma)
2. Regenerate icons using either method above
3. Test the new icons by rebuilding the app

### Design Guidelines

- Keep the design simple and recognizable at small sizes (16×16)
- Maintain high contrast for visibility
- Use rounded corners (115px radius for 512×512)
- Ensure the icon works on both light and dark backgrounds

## 🔍 Testing Icons

After generating new icons:

1. **Development:** Run `npm run dev` and check the app window icon
2. **Production:** Build the app and check:
   - Windows: Taskbar, system tray, .exe file icon
   - macOS: Dock, Finder, .app bundle icon
   - Linux: Application menu, window manager

## 📝 Notes

- The HTML generator works in any modern browser (Chrome, Firefox, Edge, Safari)
- Generated PNGs are high-quality and suitable for production use
- The SVG source can be scaled to any size without quality loss
- Electron Builder handles platform-specific icon conversion automatically
