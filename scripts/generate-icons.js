const fs = require('fs');
const path = require('path');

// Generate minimal valid PNG files for PWA icons
// Uses pure Node.js with no dependencies

function createPNG(size, bgColor, fgColor) {
  const sharp = (() => { try { return require('sharp'); } catch { return null; } })();
  if (sharp) {
    return sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: bgColor,
      }
    })
    .png()
    .toBuffer();
  }
  return null;
}

async function generate() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  fs.mkdirSync(iconsDir, { recursive: true });

  const sharp = (() => { try { return require('sharp'); } catch { return null; } })();
  if (!sharp) {
    console.log('sharp not available, skipping icon generation');
    return;
  }

  for (const size of [192, 512]) {
    const outPath = path.join(iconsDir, `icon-${size}.png`);
    if (fs.existsSync(outPath)) {
      console.log(`icon-${size}.png already exists, skipping`);
      continue;
    }
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 147, g: 51, b: 234, alpha: 1 },
      }
    })
    .png()
    .toFile(outPath);
    console.log(`Generated icon-${size}.png`);
  }
}

generate().catch(console.error);
