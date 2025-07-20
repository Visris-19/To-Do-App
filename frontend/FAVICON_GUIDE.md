# Favicon Generation Guide

This project uses a custom SVG favicon. For maximum browser compatibility, you may want to generate PNG versions.

## Current Favicon Setup
- ✅ `favicon.svg` - Custom TaskFlow branding (working in modern browsers)
- ✅ `site.webmanifest` - PWA configuration with app icons
- ✅ `index.html` - Comprehensive favicon links

## Optional: Generate PNG Favicons

To generate PNG versions from the SVG:

### Method 1: Using Online Tools
1. Go to https://realfavicongenerator.net/
2. Upload `public/favicon.svg`
3. Download the generated package
4. Replace the files in the `public` folder

### Method 2: Using ImageMagick (if installed)
```bash
# Install ImageMagick first, then run:
convert public/favicon.svg -resize 16x16 public/favicon-16x16.png
convert public/favicon.svg -resize 32x32 public/favicon-32x32.png
convert public/favicon.svg -resize 180x180 public/apple-touch-icon.png
convert public/favicon.svg -resize 192x192 public/android-chrome-192x192.png
convert public/favicon.svg -resize 512x512 public/android-chrome-512x512.png
```

### Method 3: Using Node.js Script
```bash
npm install sharp
node scripts/generate-favicons.js
```

## Current Browser Support
- ✅ Chrome/Edge/Firefox/Safari (SVG support)
- ✅ Mobile browsers (via manifest icons)
- ⚠️ IE11 and older (would need PNG fallback)

## Files Structure
```
public/
├── favicon.svg          # Main favicon (current)
├── site.webmanifest     # PWA manifest (current)
├── favicon.ico          # Optional: for IE compatibility
├── favicon-16x16.png    # Optional: 16x16 PNG
├── favicon-32x32.png    # Optional: 32x32 PNG
└── apple-touch-icon.png # Optional: 180x180 for iOS
```

The current SVG implementation provides excellent quality and modern browser support. PNG generation is optional for legacy browser compatibility.
