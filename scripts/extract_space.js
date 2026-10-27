const sharp = require('sharp');
const path = require('path');

async function extractSpaceAssets() {
  const input = path.join(__dirname, '../public/assets/reference/space_solar_system.jpg');
  const outDir = path.join(__dirname, '../public/assets/projects');

  // Bharat Yatra planet crop
  await sharp(input)
    .extract({ left: 180, top: 195, width: 120, height: 130 })
    .webp({ quality: 95 })
    .toFile(path.join(outDir, 'bharat_yatra_planet.webp'));

  // Central Sun
  await sharp(input)
    .extract({ left: 420, top: 340, width: 184, height: 184 })
    .webp({ quality: 95 })
    .toFile(path.join(outDir, 'central_sun.webp'));

  console.log('Space assets extracted successfully!');
}

extractSpaceAssets().catch(console.error);
