#!/usr/bin/env python3
"""
Icon Generator for Payroll Desktop App
Converts SVG to PNG in multiple sizes for different platforms
"""

from pathlib import Path
import subprocess
import sys

def check_dependencies():
    """Check if required tools are installed"""
    try:
        subprocess.run(['inkscape', '--version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Inkscape not found. Please install Inkscape:")
        print("   - Windows: Download from https://inkscape.org/release/")
        print("   - macOS: brew install inkscape")
        print("   - Linux: sudo apt-get install inkscape")
        return False

def generate_icon(svg_path, output_path, size):
    """Generate PNG icon from SVG at specified size"""
    try:
        subprocess.run([
            'inkscape',
            str(svg_path),
            '--export-filename', str(output_path),
            '--export-width', str(size),
            '--export-height', str(size)
        ], check=True, capture_output=True)
        print(f"✅ Generated {output_path.name} ({size}x{size})")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to generate {output_path.name}: {e}")
        return False

def main():
    # Paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    svg_file = script_dir / 'icon-design.svg'
    
    if not svg_file.exists():
        print(f"❌ SVG file not found: {svg_file}")
        sys.exit(1)
    
    if not check_dependencies():
        sys.exit(1)
    
    # Icon sizes and destinations
    icons = [
        # Main build icons
        (512, project_root / 'build' / 'icon.png'),
        (512, project_root / 'resources' / 'icon.png'),
        
        # Additional sizes for Windows
        (256, project_root / 'build' / 'icon-256.png'),
        (128, project_root / 'build' / 'icon-128.png'),
        (64, project_root / 'build' / 'icon-64.png'),
        (32, project_root / 'build' / 'icon-32.png'),
        (16, project_root / 'build' / 'icon-16.png'),
    ]
    
    print("\n🎨 Generating payroll app icons...\n")
    
    success_count = 0
    for size, output_path in icons:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        if generate_icon(svg_file, output_path, size):
            success_count += 1
    
    print(f"\n✨ Generated {success_count}/{len(icons)} icons successfully!")
    
    if success_count == len(icons):
        print("\n📝 Next steps:")
        print("   1. Review the generated icons in build/ and resources/")
        print("   2. For .ico (Windows) and .icns (macOS), use electron-builder")
        print("   3. Run: npm run build:win or npm run build:mac")

if __name__ == '__main__':
    main()
