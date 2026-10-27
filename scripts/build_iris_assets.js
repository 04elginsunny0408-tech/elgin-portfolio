const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const texturesDir = path.join(__dirname, '../public/assets/mascot/textures');
if (!fs.existsSync(texturesDir)) {
  fs.mkdirSync(texturesDir, { recursive: true });
}

async function generateTextures() {
  console.log('Generating Iris textures from reference...');

  // 1. EYE TEXTURE (Left & Right)
  // Matching the reference image: Rich royal-to-cyan blue gradient, deep black pupil, dual bright specular catchlights
  const eyeSvg = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="irisGrad" cx="50%" cy="45%" r="52%">
        <stop offset="0%" stop-color="#7dd3fc" />
        <stop offset="25%" stop-color="#38bdf8" />
        <stop offset="55%" stop-color="#0284c7" />
        <stop offset="85%" stop-color="#0369a1" />
        <stop offset="100%" stop-color="#082f49" />
      </radialGradient>
      <radialGradient id="pupilGrad" cx="45%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#090d16" />
      </radialGradient>
      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Transparent background so it maps cleanly onto 3D eye mesh -->
    <rect width="512" height="512" fill="none" />

    <!-- Pure White Sclera with soft rim shading -->
    <ellipse cx="256" cy="256" rx="246" ry="246" fill="#ffffff" />
    <ellipse cx="256" cy="256" rx="246" ry="246" fill="none" stroke="#e2e8f0" stroke-width="6" />

    <!-- Iris Circle -->
    <ellipse cx="256" cy="256" rx="192" ry="192" fill="url(#irisGrad)" filter="url(#softGlow)" />
    <ellipse cx="256" cy="256" rx="192" ry="192" fill="none" stroke="#00f0ff" stroke-width="4" opacity="0.65" />

    <!-- Deep Black Pupil -->
    <ellipse cx="256" cy="256" rx="105" ry="105" fill="url(#pupilGrad)" />

    <!-- Primary Catchlight (Upper right highlight) -->
    <ellipse cx="196" cy="180" rx="46" ry="56" fill="#ffffff" opacity="0.95" transform="rotate(-18 196 180)" />

    <!-- Secondary Catchlight (Lower left soft dot) -->
    <circle cx="316" cy="326" r="22" fill="#ffffff" opacity="0.9" />
    <circle cx="230" cy="336" r="14" fill="#67e8f9" opacity="0.75" />
  </svg>
  `;

  await sharp(Buffer.from(eyeSvg)).png().toFile(path.join(texturesDir, 'iris_eye.png'));

  // 2. MOUTH TEXTURE
  // Adorable open cartoon smile matching Iris's warm expression
  const mouthSvg = `
  <svg width="512" height="256" viewBox="0 0 512 256" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mouthInterior" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#881337" />
        <stop offset="60%" stop-color="#9f1239" />
        <stop offset="100%" stop-color="#e11d48" />
      </linearGradient>
    </defs>
    <rect width="512" height="256" fill="none" />
    
    <!-- Mouth Cavity -->
    <path d="M 60,70 Q 256,60 452,70 Q 440,210 256,220 Q 72,210 60,70 Z" fill="url(#mouthInterior)" stroke="#1e293b" stroke-width="12" stroke-linejoin="round" />
    
    <!-- White Upper Teeth -->
    <path d="M 78,74 Q 256,65 434,74 Q 390,118 256,120 Q 122,118 78,74 Z" fill="#ffffff" />
    
    <!-- Pink Curved Tongue -->
    <path d="M 140,165 Q 256,120 372,165 Q 340,212 256,215 Q 172,212 140,165 Z" fill="#fb7185" />
  </svg>
  `;
  await sharp(Buffer.from(mouthSvg)).png().toFile(path.join(texturesDir, 'iris_mouth.png'));

  // 3. BLUSH CHEEK TEXTURE
  const blushSvg = `
  <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fb7185" stop-opacity="0.65" />
        <stop offset="40%" stop-color="#f43f5e" stop-opacity="0.38" />
        <stop offset="80%" stop-color="#fda4af" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="256" height="256" fill="none" />
    <circle cx="128" cy="128" r="110" fill="url(#blushGrad)" />
  </svg>
  `;
  await sharp(Buffer.from(blushSvg)).png().toFile(path.join(texturesDir, 'iris_blush.png'));

  // 4. EYEBROW TEXTURE
  const eyebrowSvg = `
  <svg width="256" height="128" viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="128" fill="none" />
    <path d="M 30,95 Q 128,25 226,75 Q 128,45 30,95 Z" fill="#0f172a" />
  </svg>
  `;
  await sharp(Buffer.from(eyebrowSvg)).png().toFile(path.join(texturesDir, 'iris_eyebrow.png'));

  // 5. CROWN DIAMOND EMBLEM
  // White diamond emblem with cyan light rim on front face of black crown
  const diamondSvg = `
  <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="50%" stop-color="#e0f2fe" />
        <stop offset="100%" stop-color="#bae6fd" />
      </linearGradient>
    </defs>
    <rect width="256" height="256" fill="none" />
    <polygon points="128,20 220,128 128,236 36,128" fill="url(#diamondGrad)" stroke="#00f0ff" stroke-width="8" stroke-linejoin="round" />
    <polygon points="128,45 195,128 128,211 61,128" fill="#ffffff" opacity="0.8" />
  </svg>
  `;
  await sharp(Buffer.from(diamondSvg)).png().toFile(path.join(texturesDir, 'iris_crown_diamond.png'));

  // 6. PROFESSIONAL TABLET HOLOGRAPHIC DISPLAY
  const tabletSvg = `
  <svg width="512" height="384" viewBox="0 0 512 384" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0369a1" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#0284c7" stop-opacity="0.15" />
      </linearGradient>
    </defs>
    <rect width="512" height="384" rx="16" fill="url(#bgGrad)" stroke="#00f0ff" stroke-width="6" />
    <text x="256" y="55" font-family="sans-serif" font-size="22" font-weight="bold" fill="#00f0ff" text-anchor="middle" letter-spacing="2">GLOBAL INNOVATION NETWORK</text>
    <line x1="40" y1="75" x2="472" y2="75" stroke="#00f0ff" stroke-width="2" opacity="0.6" />
    
    <!-- Network Graph Nodes -->
    <circle cx="256" cy="200" r="28" fill="#00f0ff" opacity="0.4" />
    <circle cx="256" cy="200" r="16" fill="#ffffff" />
    
    <circle cx="140" cy="140" r="12" fill="#38bdf8" />
    <circle cx="370" cy="140" r="12" fill="#38bdf8" />
    <circle cx="160" cy="270" r="12" fill="#38bdf8" />
    <circle cx="350" cy="270" r="12" fill="#38bdf8" />
    <circle cx="256" cy="320" r="10" fill="#38bdf8" />
    
    <!-- Network Edges -->
    <line x1="256" y1="200" x2="140" y2="140" stroke="#00f0ff" stroke-width="3" opacity="0.8" />
    <line x1="256" y1="200" x2="370" y2="140" stroke="#00f0ff" stroke-width="3" opacity="0.8" />
    <line x1="256" y1="200" x2="160" y2="270" stroke="#00f0ff" stroke-width="3" opacity="0.8" />
    <line x1="256" y1="200" x2="350" y2="270" stroke="#00f0ff" stroke-width="3" opacity="0.8" />
    <line x1="256" y1="200" x2="256" y2="320" stroke="#00f0ff" stroke-width="3" opacity="0.8" />
    <line x1="140" y1="140" x2="370" y2="140" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6" />
  </svg>
  `;
  await sharp(Buffer.from(tabletSvg)).png().toFile(path.join(texturesDir, 'iris_tablet_holo.png'));

  console.log('All Iris textures generated successfully in:', texturesDir);
}

generateTextures().catch(console.error);
