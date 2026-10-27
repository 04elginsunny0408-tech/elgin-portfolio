const fs = require('fs');
const path = require('path');

// Polyfill FileReader for headless Node.js GLTFExporter
class PolyfillFileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onload) this.onload({ target: this });
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result =
        'data:' +
        (blob.type || 'application/octet-stream') +
        ';base64,' +
        Buffer.from(buf).toString('base64');
      if (this.onload) this.onload({ target: this });
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
}
global.FileReader = PolyfillFileReader;

async function buildIrisGLBModels() {
  const THREE = await import('three');
  const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');

  const mascotDir = path.join(__dirname, '../public/assets/mascot');

  function createIrisModel(theme) {
    const root = new THREE.Group();
    root.name = `IrisCharacter_${theme}`;

    // ================= MATERIALS =================
    // Pure glossy white pearlescent body
    const whiteBodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.05,
      name: 'Iris_WhiteBody',
    });

    // Obsidian black satin material for crown, gloves & boots
    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x111318,
      roughness: 0.3,
      metalness: 0.4,
      name: 'Iris_BlackArmor',
    });

    // Gold material for tassel & accents
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.25,
      metalness: 0.85,
      name: 'Iris_GoldAccent',
    });

    // Cyan glowing emissive material
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.2,
      roughness: 0.1,
      name: 'Iris_CyanGlow',
    });

    // Eye Sclera White
    const eyeScleraMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.05,
      name: 'Iris_EyeSclera',
    });

    // Eye Iris Blue Gradient
    const eyeIrisMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x00b4d8,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.1,
      name: 'Iris_EyeBlue',
    });

    // Eye Pupil Deep Black
    const pupilMat = new THREE.MeshStandardMaterial({
      color: 0x05070d,
      roughness: 0.05,
      metalness: 0.1,
      name: 'Iris_EyePupil',
    });

    // Eye Specular Highlight
    const specularMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      name: 'Iris_EyeSpecular',
    });

    // Mouth Interior Ruby Red
    const mouthInteriorMat = new THREE.MeshStandardMaterial({
      color: 0x881337,
      roughness: 0.2,
      metalness: 0.0,
      name: 'Iris_MouthInterior',
    });

    // Mouth Tongue Pink
    const tongueMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      roughness: 0.2,
      name: 'Iris_TonguePink',
    });

    // Mouth Teeth White
    const teethMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      name: 'Iris_TeethWhite',
    });

    // Cheeks Blush Soft Pink
    const blushMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.5,
      transparent: true,
      opacity: 0.45,
      name: 'Iris_Blush',
    });

    // ================= 1. HEAD & DETAILED PIXAR FACE =================
    const headGroup = new THREE.Group();
    headGroup.name = 'HeadGroup';
    headGroup.position.set(0, 0.52, 0);
    root.add(headGroup);

    // Pear-shaped/Egg-shaped Head
    const headGeo = new THREE.SphereGeometry(0.74, 40, 32);
    headGeo.scale(1.0, 1.12, 0.96);
    const headMesh = new THREE.Mesh(headGeo, whiteBodyMat);
    headMesh.name = 'HeadBaseMesh';
    headGroup.add(headMesh);

    // EYES BUILDER (Genuine 3D Pixar Eyes with Sclera, Blue Iris, Pupil, Catchlights)
    function create3DEye(isRight) {
      const eyeGroup = new THREE.Group();
      eyeGroup.name = isRight ? 'RightEyeGroup' : 'LeftEyeGroup';
      const sign = isRight ? 1 : -1;
      eyeGroup.position.set(sign * 0.25, 0.12, 0.65);
      eyeGroup.rotation.y = sign * 0.16;

      // Sclera Base
      const scleraGeo = new THREE.SphereGeometry(0.20, 24, 20);
      scleraGeo.scale(0.95, 1.25, 0.22);
      const scleraMesh = new THREE.Mesh(scleraGeo, eyeScleraMat);
      eyeGroup.add(scleraMesh);

      // Blue Iris Disc
      const irisGeo = new THREE.CircleGeometry(0.16, 28);
      const irisMesh = new THREE.Mesh(irisGeo, eyeIrisMat);
      irisMesh.position.set(0, -0.01, 0.048);
      eyeGroup.add(irisMesh);

      // Deep Black Pupil
      const pupilGeo = new THREE.CircleGeometry(0.09, 24);
      const pupilMesh = new THREE.Mesh(pupilGeo, pupilMat);
      pupilMesh.position.set(0, -0.01, 0.052);
      eyeGroup.add(pupilMesh);

      // Big Specular Catchlight (Upper right)
      const spec1Geo = new THREE.CircleGeometry(0.042, 16);
      const spec1Mesh = new THREE.Mesh(spec1Geo, specularMat);
      spec1Mesh.position.set(0.038, 0.045, 0.056);
      eyeGroup.add(spec1Mesh);

      // Small Specular Catchlight (Lower left)
      const spec2Geo = new THREE.CircleGeometry(0.018, 14);
      const spec2Mesh = new THREE.Mesh(spec2Geo, specularMat);
      spec2Mesh.position.set(-0.04, -0.05, 0.056);
      eyeGroup.add(spec2Mesh);

      return eyeGroup;
    }

    const leftEye = create3DEye(false);
    const rightEye = create3DEye(true);
    headGroup.add(leftEye);
    headGroup.add(rightEye);

    // EYEBROWS (Curved expressive black arches)
    function createEyebrow(isRight) {
      const sign = isRight ? 1 : -1;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.08 * sign, -0.02, 0),
        new THREE.Vector3(0, 0.03, 0.01),
        new THREE.Vector3(0.09 * sign, 0.01, 0)
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.016, 8, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, blackMat);
      tubeMesh.name = isRight ? 'RightEyebrow' : 'LeftEyebrow';
      tubeMesh.position.set(sign * 0.25, 0.42, 0.64);
      tubeMesh.rotation.z = sign * -0.08;
      return tubeMesh;
    }
    headGroup.add(createEyebrow(false));
    headGroup.add(createEyebrow(true));

    // CHEEKS (Soft rosy blush discs)
    const blushGeo = new THREE.CircleGeometry(0.09, 20);
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.43, -0.04, 0.56);
    leftBlush.rotation.y = -0.45;
    headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.43, -0.04, 0.56);
    rightBlush.rotation.y = 0.45;
    headGroup.add(rightBlush);

    // MOUTH (Joyful open smiling mouth with teeth and pink tongue)
    const mouthGroup = new THREE.Group();
    mouthGroup.name = 'MouthGroup';
    mouthGroup.position.set(0, -0.16, 0.70);

    const mouthBackGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 24, 1, false, 0, Math.PI);
    mouthBackGeo.rotateX(Math.PI / 2);
    mouthBackGeo.rotateZ(Math.PI);
    mouthBackGeo.scale(1.2, 0.65, 0.4);
    const mouthBackMesh = new THREE.Mesh(mouthBackGeo, mouthInteriorMat);
    mouthGroup.add(mouthBackMesh);

    // Teeth line
    const teethGeo = new THREE.BoxGeometry(0.32, 0.04, 0.02);
    const teethMesh = new THREE.Mesh(teethGeo, teethMat);
    teethMesh.position.set(0, 0.03, 0.012);
    mouthGroup.add(teethMesh);

    // Tongue
    const tongueGeo = new THREE.SphereGeometry(0.10, 16, 12);
    tongueGeo.scale(1.2, 0.6, 0.3);
    const tongueMesh = new THREE.Mesh(tongueGeo, tongueMat);
    tongueMesh.position.set(0, -0.05, 0.012);
    mouthGroup.add(tongueMesh);

    headGroup.add(mouthGroup);

    // ================= 2. ICONIC BLACK CROWN WITH DIAMOND =================
    const crownGroup = new THREE.Group();
    crownGroup.name = 'CrownGroup';

    // In space theme, crown sits atop helmet; in others, sits on head
    const crownY = theme === 'space' ? 1.05 : 0.80;
    crownGroup.position.set(0, crownY, -0.02);
    crownGroup.rotation.x = -0.05;

    // Crown Base Ring
    const crownBaseGeo = new THREE.CylinderGeometry(0.36, 0.40, 0.10, 24);
    const crownBase = new THREE.Mesh(crownBaseGeo, blackMat);
    crownGroup.add(crownBase);

    // Central Tall Peak with Diamond Emblem
    const centerPeakGeo = new THREE.ConeGeometry(0.14, 0.42, 4);
    const centerPeak = new THREE.Mesh(centerPeakGeo, blackMat);
    centerPeak.position.set(0, 0.22, 0.30);
    centerPeak.rotation.y = Math.PI / 4;
    crownGroup.add(centerPeak);

    // Diamond Emblem on Central Peak
    const diamondGeo = new THREE.OctahedronGeometry(0.065, 0);
    diamondGeo.scale(0.85, 1.4, 0.35);
    const diamondMesh = new THREE.Mesh(diamondGeo, cyanGlowMat);
    diamondMesh.position.set(0, 0.19, 0.38);
    crownGroup.add(diamondMesh);

    // Left Peak
    const leftPeakGeo = new THREE.ConeGeometry(0.11, 0.32, 4);
    const leftPeak = new THREE.Mesh(leftPeakGeo, blackMat);
    leftPeak.position.set(-0.25, 0.16, 0.24);
    leftPeak.rotation.y = Math.PI / 4;
    leftPeak.rotation.z = 0.15;
    crownGroup.add(leftPeak);

    // Right Peak
    const rightPeak = new THREE.Mesh(leftPeakGeo, blackMat);
    rightPeak.position.set(0.25, 0.16, 0.24);
    rightPeak.rotation.y = Math.PI / 4;
    rightPeak.rotation.z = -0.15;
    crownGroup.add(rightPeak);

    // Rear Peaks
    const rearPeakGeo = new THREE.ConeGeometry(0.10, 0.26, 4);
    const rearPeakL = new THREE.Mesh(rearPeakGeo, blackMat);
    rearPeakL.position.set(-0.22, 0.12, -0.22);
    rearPeakL.rotation.y = Math.PI / 4;
    crownGroup.add(rearPeakL);

    const rearPeakR = new THREE.Mesh(rearPeakGeo, blackMat);
    rearPeakR.position.set(0.22, 0.12, -0.22);
    rearPeakR.rotation.y = Math.PI / 4;
    crownGroup.add(rearPeakR);

    headGroup.add(crownGroup);

    // ================= 3. TORSO / BODY =================
    const torsoGeo = new THREE.SphereGeometry(0.66, 36, 28);
    torsoGeo.scale(0.92, 1.08, 0.88);
    const torsoMesh = new THREE.Mesh(torsoGeo, whiteBodyMat);
    torsoMesh.name = 'TorsoMesh';
    torsoMesh.position.set(0, -0.45, 0);
    root.add(torsoMesh);

    // Cyan Circuit Accent line on body flanks
    const circuitCurveL = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.48, 0.1, 0.2),
      new THREE.Vector3(-0.54, -0.2, 0.25),
      new THREE.Vector3(-0.42, -0.5, 0.2)
    );
    const circuitGeoL = new THREE.TubeGeometry(circuitCurveL, 16, 0.012, 6, false);
    const circuitMeshL = new THREE.Mesh(circuitGeoL, cyanGlowMat);
    torsoMesh.add(circuitMeshL);

    const circuitCurveR = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.48, 0.1, 0.2),
      new THREE.Vector3(0.54, -0.2, 0.25),
      new THREE.Vector3(0.42, -0.5, 0.2)
    );
    const circuitGeoR = new THREE.TubeGeometry(circuitCurveR, 16, 0.012, 6, false);
    const circuitMeshR = new THREE.Mesh(circuitGeoR, cyanGlowMat);
    torsoMesh.add(circuitMeshR);

    // ================= 4. ARMS & BLACK CARTOON GLOVES =================
    const armGeo = new THREE.CapsuleGeometry(0.09, 0.38, 12, 12);
    const cuffGeo = new THREE.TorusGeometry(0.12, 0.028, 12, 24);
    const gloveGeo = new THREE.SphereGeometry(0.15, 20, 16);
    gloveGeo.scale(1.0, 1.15, 0.85);

    // Left Arm & Glove
    const leftArmGroup = new THREE.Group();
    leftArmGroup.name = 'LeftArmGroup';
    leftArmGroup.position.set(-0.62, -0.36, 0.05);

    const leftArm = new THREE.Mesh(armGeo, whiteBodyMat);
    leftArm.rotation.z = 0.42;
    leftArmGroup.add(leftArm);

    const leftCuff = new THREE.Mesh(cuffGeo, blackMat);
    leftCuff.position.set(-0.16, -0.24, 0.08);
    leftCuff.rotation.x = Math.PI / 2;
    leftArmGroup.add(leftCuff);

    const leftGlove = new THREE.Mesh(gloveGeo, blackMat);
    leftGlove.position.set(-0.20, -0.32, 0.10);
    leftArmGroup.add(leftGlove);

    root.add(leftArmGroup);

    // Right Arm & Glove (Friendly waving / gesturing posture)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.name = 'RightArmGroup';
    rightArmGroup.position.set(0.62, -0.36, 0.05);

    const rightArm = new THREE.Mesh(armGeo, whiteBodyMat);
    rightArm.rotation.z = -0.48;
    rightArmGroup.add(rightArm);

    const rightCuff = new THREE.Mesh(cuffGeo, blackMat);
    rightCuff.position.set(0.18, -0.22, 0.08);
    rightCuff.rotation.x = Math.PI / 2;
    rightArmGroup.add(rightCuff);

    const rightGlove = new THREE.Mesh(gloveGeo, blackMat);
    rightGlove.position.set(0.22, -0.30, 0.10);
    rightArmGroup.add(rightGlove);

    root.add(rightArmGroup);

    // ================= 5. LEGS & CHUNKY BLACK SHOES =================
    const legGeo = new THREE.CylinderGeometry(0.09, 0.10, 0.32, 16);
    const bootGeo = new THREE.CapsuleGeometry(0.15, 0.28, 16, 16);
    bootGeo.rotateX(Math.PI / 2);
    bootGeo.scale(1.0, 0.85, 1.25);

    const soleGeo = new THREE.BoxGeometry(0.32, 0.05, 0.48);

    // Left Leg & Boot
    const leftLeg = new THREE.Mesh(legGeo, whiteBodyMat);
    leftLeg.position.set(-0.25, -0.96, 0.02);
    root.add(leftLeg);

    const leftBoot = new THREE.Mesh(bootGeo, blackMat);
    leftBoot.position.set(-0.25, -1.14, 0.08);
    root.add(leftBoot);

    const leftSole = new THREE.Mesh(soleGeo, blackMat);
    leftSole.position.set(-0.25, -1.22, 0.08);
    root.add(leftSole);

    // Right Leg & Boot
    const rightLeg = new THREE.Mesh(legGeo, whiteBodyMat);
    rightLeg.position.set(0.25, -0.96, 0.02);
    root.add(rightLeg);

    const rightBoot = new THREE.Mesh(bootGeo, blackMat);
    rightBoot.position.set(0.25, -1.14, 0.08);
    root.add(rightBoot);

    const rightSole = new THREE.Mesh(soleGeo, blackMat);
    rightSole.position.set(0.25, -1.22, 0.08);
    root.add(rightSole);

    // ================= 6. THEME-SPECIFIC ACCESSORIES =================
    if (theme === 'space') {
      // 1. Transparent Astronaut Helmet Bubble
      const helmetGeo = new THREE.SphereGeometry(0.98, 36, 30);
      const helmetMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.35,
        name: 'SpaceHelmetGlass',
      });
      const helmetMesh = new THREE.Mesh(helmetGeo, helmetMat);
      helmetMesh.position.set(0, 0.04, 0);
      headGroup.add(helmetMesh);

      // 2. White Helmet Collar Ring with Cyan Accent
      const collarGeo = new THREE.TorusGeometry(0.92, 0.06, 16, 48);
      const collarMesh = new THREE.Mesh(collarGeo, whiteBodyMat);
      collarMesh.rotation.x = Math.PI / 2;
      collarMesh.position.set(0, -0.40, 0);
      headGroup.add(collarMesh);

      const collarLightGeo = new THREE.TorusGeometry(0.94, 0.018, 12, 48);
      const collarLightMesh = new THREE.Mesh(collarLightGeo, cyanGlowMat);
      collarLightMesh.rotation.x = Math.PI / 2;
      collarLightMesh.position.set(0, -0.40, 0);
      headGroup.add(collarLightMesh);

      // 3. Side Communication Ear Pucks
      const earPodGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.10, 24);
      earPodGeo.rotateZ(Math.PI / 2);

      const leftEar = new THREE.Mesh(earPodGeo, whiteBodyMat);
      leftEar.position.set(-0.96, 0.04, 0);
      headGroup.add(leftEar);

      const leftEarLight = new THREE.Mesh(
        new THREE.RingGeometry(0.08, 0.14, 20),
        cyanGlowMat
      );
      leftEarLight.rotation.y = -Math.PI / 2;
      leftEarLight.position.set(-1.02, 0.04, 0);
      headGroup.add(leftEarLight);

      const rightEar = new THREE.Mesh(earPodGeo, whiteBodyMat);
      rightEar.position.set(0.96, 0.04, 0);
      headGroup.add(rightEar);

      const rightEarLight = new THREE.Mesh(
        new THREE.RingGeometry(0.08, 0.14, 20),
        cyanGlowMat
      );
      rightEarLight.rotation.y = Math.PI / 2;
      rightEarLight.position.set(1.02, 0.04, 0);
      headGroup.add(rightEarLight);

      // 4. Floating Holographic Star-Lattice Cluster in front of Hand
      const holoIcoGeo = new THREE.IcosahedronGeometry(0.26, 1);
      const holoWireMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 2.5,
        wireframe: true,
      });
      const holoMesh = new THREE.Mesh(holoIcoGeo, holoWireMat);
      holoMesh.position.set(0.55, -0.15, 0.55);
      root.add(holoMesh);

    } else if (theme === 'professional') {
      // 1. Executive Navy/Cyan Necktie with Knot
      const knotGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.09, 16);
      const tieMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.35,
        metalness: 0.2,
      });
      const knotMesh = new THREE.Mesh(knotGeo, tieMat);
      knotMesh.position.set(0, -0.12, 0.58);
      root.add(knotMesh);

      // Tie Body
      const tieShape = new THREE.Shape();
      tieShape.moveTo(-0.06, 0);
      tieShape.lineTo(0.06, 0);
      tieShape.lineTo(0.09, -0.42);
      tieShape.lineTo(0, -0.56);
      tieShape.lineTo(-0.09, -0.42);
      tieShape.closePath();

      const tieGeo = new THREE.ShapeGeometry(tieShape);
      const tieMesh = new THREE.Mesh(tieGeo, tieMat);
      tieMesh.position.set(0, -0.16, 0.59);
      root.add(tieMesh);

      // 2. ID Badge Lanyard
      const lanyardGeo = new THREE.BoxGeometry(0.12, 0.16, 0.015);
      const badgeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
      });
      const badgeMesh = new THREE.Mesh(lanyardGeo, badgeMat);
      badgeMesh.position.set(0.24, -0.42, 0.55);
      badgeMesh.rotation.z = -0.12;
      root.add(badgeMesh);

      // Badge photo chip
      const chipMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.02), cyanGlowMat);
      chipMesh.position.set(0.24, -0.39, 0.552);
      badgeMesh.add(chipMesh);

      // 3. Futuristic Holographic Glass Tablet in Hand
      const tabletGlassMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
      });
      const tabletGeo = new THREE.BoxGeometry(0.48, 0.62, 0.03);
      const tabletMesh = new THREE.Mesh(tabletGeo, tabletGlassMat);
      tabletMesh.position.set(0.48, -0.22, 0.52);
      tabletMesh.rotation.y = -0.35;
      tabletMesh.rotation.x = 0.22;
      root.add(tabletMesh);

      // Glowing Tablet Frame
      const frameGeo = new THREE.BoxGeometry(0.50, 0.64, 0.018);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 1.8,
        wireframe: true,
      });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      tabletMesh.add(frameMesh);

    } else if (theme === 'study') {
      // 1. Academic Graduation Mortarboard Cap
      const capGroup = new THREE.Group();
      capGroup.position.set(0, 0.95, 0.05);
      capGroup.rotation.x = -0.12;

      // Mortarboard skull base
      const capSkullGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.18, 24);
      const capMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.6,
      });
      const capSkull = new THREE.Mesh(capSkullGeo, capMat);
      capGroup.add(capSkull);

      // Flat square mortarboard plate
      const plateGeo = new THREE.BoxGeometry(1.02, 0.04, 1.02);
      const plateMesh = new THREE.Mesh(plateGeo, capMat);
      plateMesh.position.set(0, 0.10, 0);
      plateMesh.rotation.y = Math.PI / 4;
      capGroup.add(plateMesh);

      // Center gold button
      const buttonGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16);
      const buttonMesh = new THREE.Mesh(buttonGeo, goldMat);
      buttonMesh.position.set(0, 0.13, 0);
      capGroup.add(buttonMesh);

      // Golden tassel cord & drape
      const tasselCordCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0.13, 0),
        new THREE.Vector3(0.42, 0.10, 0.2),
        new THREE.Vector3(0.48, -0.22, 0.22)
      );
      const tasselCordGeo = new THREE.TubeGeometry(tasselCordCurve, 16, 0.014, 8, false);
      const tasselCord = new THREE.Mesh(tasselCordGeo, goldMat);
      capGroup.add(tasselCord);

      // Golden tassel brush
      const tasselBrushGeo = new THREE.ConeGeometry(0.045, 0.18, 12);
      const tasselBrush = new THREE.Mesh(tasselBrushGeo, goldMat);
      tasselBrush.position.set(0.48, -0.30, 0.22);
      capGroup.add(tasselBrush);

      headGroup.add(capGroup);

      // 2. Open Holographic Study Book in front of Hands
      const bookCoverMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.3,
      });
      const bookPagesMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 1.6,
      });

      const bookGroup = new THREE.Group();
      bookGroup.position.set(0, -0.32, 0.62);
      bookGroup.rotation.x = 0.55;

      const leftPage = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.02), bookPagesMat);
      leftPage.position.set(-0.13, 0, 0);
      leftPage.rotation.y = 0.25;
      bookGroup.add(leftPage);

      const rightPage = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.02), bookPagesMat);
      rightPage.position.set(0.13, 0, 0);
      rightPage.rotation.y = -0.25;
      bookGroup.add(rightPage);

      root.add(bookGroup);
    }

    return root;
  }

  const themes = ['space', 'professional', 'study'];
  const exporter = new GLTFExporter();

  for (const theme of themes) {
    const scene = new THREE.Scene();
    const character = createIrisModel(theme);
    scene.add(character);

    console.log(`Exporting genuine 3D GLB for Iris (${theme} theme)...`);
    const glbBuffer = await exporter.parseAsync(scene, { binary: true });
    const targetFile = path.join(mascotDir, `iris_${theme}.glb`);
    fs.writeFileSync(targetFile, Buffer.from(glbBuffer));
    console.log(`=> Successfully wrote ${targetFile} (${glbBuffer.byteLength} bytes)`);

    // Also write iris_master.glb for master fallback
    if (theme === 'professional') {
      const masterFile = path.join(mascotDir, 'iris_mascot.glb');
      fs.writeFileSync(masterFile, Buffer.from(glbBuffer));
      console.log(`=> Successfully wrote master model ${masterFile}`);
    }
  }

  console.log('All genuine 3D Iris GLB models built successfully!');
}

buildIrisGLBModels().catch(console.error);
