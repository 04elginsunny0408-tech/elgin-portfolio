const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function extractMascots() {
  const input = path.join(__dirname, '../public/assets/mascot/iris_master_reference.jpg');
  const outDir = path.join(__dirname, '../public/assets/mascot');

  // Hero crops:
  // Image is 1024 x 682
  // Top 3 columns:
  // Professional: left 0 to 340, top 70 to 460
  // Space: left 341 to 682, top 70 to 460
  // Study: left 683 to 1024, top 70 to 460

  await sharp(input)
    .extract({ left: 30, top: 80, width: 285, height: 380 })
    .webp({ quality: 95 })
    .toFile(path.join(outDir, 'iris_professional.webp'));

  await sharp(input)
    .extract({ left: 365, top: 80, width: 295, height: 380 })
    .webp({ quality: 95 })
    .toFile(path.join(outDir, 'iris_space.webp'));

  await sharp(input)
    .extract({ left: 700, top: 80, width: 295, height: 380 })
    .webp({ quality: 95 })
    .toFile(path.join(outDir, 'iris_study.webp'));

  // Also avatar/head crops for chat bubbles & floating mascot pill:
  await sharp(input)
    .extract({ left: 80, top: 120, width: 185, height: 185 })
    .webp({ quality: 95 })
    .toFile(path.join(outDir, 'iris_professional_avatar.webp'));

  await sharp(input)
    .extract({ left: 420, top: 120, width: 185, height: 185 })
    .webp({ quality: 95 })
    .toFile(path.join(outDir, 'iris_space_avatar.webp'));

  await sharp(input)
    .extract({ left: 755, top: 120, width: 185, height: 185 })
    .webp({ quality: 95 })
    .toFile(path.join(outDir, 'iris_study_avatar.webp'));

  console.log('Mascot assets extracted successfully!');
}

extractMascots().catch(console.error);
