const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processIcons() {
  const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
  const image = sharp(logoPath);
  const metadata = await image.metadata();

  console.log(`Input image: ${metadata.width}x${metadata.height}`);

  // The emblem is situated in the upper portion (approx y: 50 to 430, x: 280 to 740)
  // Let's crop a square region centered around x=512, y=240 with width=460, height=460
  // Or extract exact bounding box.
  // Center of emblem is roughly x=512, y=240.
  // Let's extract { left: 272, top: 40, width: 480, height: 400 } and extend to square 512x512
  const emblemCrop = await sharp(logoPath)
    .extract({ left: 260, top: 35, width: 500, height: 405 })
    .toBuffer();

  // Make a square 512x512 with the original background color #FEFCF4 (rgb: 254, 252, 244)
  const square512 = await sharp(emblemCrop)
    .resize(460, 460, {
      fit: 'contain',
      background: { r: 254, g: 252, b: 244, alpha: 1 },
    })
    .extend({
      top: 26,
      bottom: 26,
      left: 26,
      right: 26,
      background: { r: 254, g: 252, b: 244, alpha: 1 },
    })
    .png()
    .toBuffer();

  // 1. Save src/app/icon.png (Next.js automatically uses this as <link rel="icon">)
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'icon.png'), square512);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'icon.png'), square512);

  // 2. Save apple touch icon (180x180)
  const appleIcon = await sharp(square512).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'apple-icon.png'), appleIcon);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'apple-touch-icon.png'), appleIcon);

  // 3. Save 32x32 and 48x48 favicons
  const favicon32 = await sharp(square512).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), favicon32);
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'favicon.ico'), favicon32);

  console.log('Successfully generated all favicons and site icons!');
}

processIcons().catch(console.error);
