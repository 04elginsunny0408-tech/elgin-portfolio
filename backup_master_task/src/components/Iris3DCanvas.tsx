'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Iris3DCanvasProps {
  theme: 'space' | 'professional' | 'study';
  isSpeaking?: boolean;
  isBouncing?: boolean;
  onClick?: () => void;
  size?: number;
}

export default function Iris3DCanvas({
  theme,
  isSpeaking = false,
  isBouncing = false,
  onClick,
  size = 110,
}: Iris3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    const width = size;
    const height = size;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 4.4);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting Setup (Soft Studio Lighting for Cartoon Character)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(3.2, 4.5, 4.0);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfff6ec, 1.1);
    fillLight.position.set(-3.0, 1.2, 3.2);
    scene.add(fillLight);

    const rimColor = theme === 'space' ? 0x00f0ff : theme === 'professional' ? 0x0284c7 : 0xf59e0b;
    const rimLight = new THREE.PointLight(rimColor, 3.5, 12);
    rimLight.position.set(-2.8, 2.5, -2.0);
    scene.add(rimLight);

    // 4. Character Root Group
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);

    // ================= PBR MATERIALS =================
    // Glossy white porcelain body
    const whiteBodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.14,
      metalness: 0.05,
    });

    // Obsidian satin black for 5-pointed crown, gloves, and boots
    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x121418,
      roughness: 0.28,
      metalness: 0.35,
    });

    // Golden yellow material for graduation tassel
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.25,
      metalness: 0.85,
    });

    // Glowing cyan emissive material for diamond and technology accents
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.4,
      roughness: 0.1,
    });

    // Pixar Eye Materials
    const eyeScleraMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.08,
      metalness: 0.02,
    });

    const eyeIrisMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.75,
      roughness: 0.12,
      metalness: 0.1,
    });

    const pupilMat = new THREE.MeshStandardMaterial({
      color: 0x07090e,
      roughness: 0.05,
      metalness: 0.1,
    });

    const specularMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const mouthInteriorMat = new THREE.MeshStandardMaterial({
      color: 0x881337,
      roughness: 0.22,
    });

    const tongueMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      roughness: 0.25,
    });

    const teethMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
    });

    const blushMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.5,
      transparent: true,
      opacity: 0.45,
    });

    // ================= 1. UNIFIED EGG BODY (Faithful to Original Iris Master Reference) =================
    // Iris is a continuous cute rounded egg/capsule body, NOT two separated spheres!
    const bodyGeo = new THREE.SphereGeometry(0.78, 48, 40);
    bodyGeo.scale(1.0, 1.28, 0.96); // Egg proportions
    const bodyMesh = new THREE.Mesh(bodyGeo, whiteBodyMat);
    bodyMesh.position.set(0, 0.05, 0);
    characterGroup.add(bodyMesh);

    // Subtle technological circuitry glow lines on body flanks
    const circuitCurveL = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.55, 0.25, 0.2),
      new THREE.Vector3(-0.62, -0.15, 0.25),
      new THREE.Vector3(-0.48, -0.45, 0.2)
    );
    const circuitGeoL = new THREE.TubeGeometry(circuitCurveL, 16, 0.012, 6, false);
    const circuitMeshL = new THREE.Mesh(circuitGeoL, cyanGlowMat);
    bodyMesh.add(circuitMeshL);

    const circuitCurveR = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.55, 0.25, 0.2),
      new THREE.Vector3(0.62, -0.15, 0.25),
      new THREE.Vector3(0.48, -0.45, 0.2)
    );
    const circuitGeoR = new THREE.TubeGeometry(circuitCurveR, 16, 0.012, 6, false);
    const circuitMeshR = new THREE.Mesh(circuitGeoR, cyanGlowMat);
    bodyMesh.add(circuitMeshR);

    // ================= 2. EXPRESSIVE PIXAR FACE (Eyes, Eyebrows, Blush, Mouth) =================
    const faceGroup = new THREE.Group();
    faceGroup.position.set(0, 0.18, 0.72);
    characterGroup.add(faceGroup);

    // Left & Right Pixar Eyes
    let leftEyeGroup: THREE.Group;
    let rightEyeGroup: THREE.Group;

    function buildEye(isRight: boolean) {
      const eyeGroup = new THREE.Group();
      const sign = isRight ? 1 : -1;
      eyeGroup.position.set(sign * 0.25, 0.14, 0);
      eyeGroup.rotation.y = sign * 0.15;

      // Sclera Base (Curved white oval capsule)
      const scleraGeo = new THREE.SphereGeometry(0.20, 24, 20);
      scleraGeo.scale(0.96, 1.28, 0.22);
      const scleraMesh = new THREE.Mesh(scleraGeo, eyeScleraMat);
      eyeGroup.add(scleraMesh);

      // Blue Iris Disc
      const irisGeo = new THREE.CircleGeometry(0.165, 28);
      const irisMesh = new THREE.Mesh(irisGeo, eyeIrisMat);
      irisMesh.position.set(0, -0.01, 0.05);
      eyeGroup.add(irisMesh);

      // Inner Light Blue Gradient Rim
      const innerRimGeo = new THREE.RingGeometry(0.12, 0.155, 24);
      const innerRimMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
      const innerRimMesh = new THREE.Mesh(innerRimGeo, innerRimMat);
      innerRimMesh.position.set(0, -0.01, 0.052);
      eyeGroup.add(innerRimMesh);

      // Deep Black Pupil
      const pupilGeo = new THREE.CircleGeometry(0.10, 24);
      const pupilMesh = new THREE.Mesh(pupilGeo, pupilMat);
      pupilMesh.position.set(0, -0.01, 0.055);
      eyeGroup.add(pupilMesh);

      // Primary Specular Catchlight (Upper right shine)
      const spec1Geo = new THREE.CircleGeometry(0.045, 16);
      const spec1Mesh = new THREE.Mesh(spec1Geo, specularMat);
      spec1Mesh.position.set(0.04, 0.048, 0.06);
      eyeGroup.add(spec1Mesh);

      // Secondary Catchlight (Lower left soft dot)
      const spec2Geo = new THREE.CircleGeometry(0.02, 14);
      const spec2Mesh = new THREE.Mesh(spec2Geo, specularMat);
      spec2Mesh.position.set(-0.042, -0.052, 0.06);
      eyeGroup.add(spec2Mesh);

      return eyeGroup;
    }

    leftEyeGroup = buildEye(false);
    rightEyeGroup = buildEye(true);
    faceGroup.add(leftEyeGroup);
    faceGroup.add(rightEyeGroup);

    // Arched Black Eyebrows
    function buildEyebrow(isRight: boolean) {
      const sign = isRight ? 1 : -1;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.08 * sign, -0.02, 0),
        new THREE.Vector3(0, 0.035, 0.01),
        new THREE.Vector3(0.09 * sign, 0.01, 0)
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.016, 8, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, blackMat);
      tubeMesh.position.set(sign * 0.25, 0.44, -0.02);
      tubeMesh.rotation.z = sign * -0.08;
      return tubeMesh;
    }
    faceGroup.add(buildEyebrow(false));
    faceGroup.add(buildEyebrow(true));

    // Rosy Cheeks Blush
    const blushGeo = new THREE.CircleGeometry(0.095, 20);
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.44, -0.04, -0.1);
    leftBlush.rotation.y = -0.45;
    faceGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.44, -0.04, -0.1);
    rightBlush.rotation.y = 0.45;
    faceGroup.add(rightBlush);

    // Joyful Open Smile with Upper Teeth & Pink Tongue
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.15, 0.02);

    const mouthBackGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 24, 1, false, 0, Math.PI);
    mouthBackGeo.rotateX(Math.PI / 2);
    mouthBackGeo.rotateZ(Math.PI);
    mouthBackGeo.scale(1.22, 0.68, 0.4);
    const mouthBackMesh = new THREE.Mesh(mouthBackGeo, mouthInteriorMat);
    mouthGroup.add(mouthBackMesh);

    const teethGeo = new THREE.BoxGeometry(0.34, 0.045, 0.02);
    const teethMesh = new THREE.Mesh(teethGeo, teethMat);
    teethMesh.position.set(0, 0.032, 0.012);
    mouthGroup.add(teethMesh);

    const tongueGeo = new THREE.SphereGeometry(0.11, 16, 12);
    tongueGeo.scale(1.25, 0.65, 0.3);
    const tongueMesh = new THREE.Mesh(tongueGeo, tongueMat);
    tongueMesh.position.set(0, -0.05, 0.012);
    mouthGroup.add(tongueMesh);

    faceGroup.add(mouthGroup);

    // ================= 3. ICONIC 5-POINT OBSIDIAN CROWN WITH CYAN DIAMOND =================
    const crownGroup = new THREE.Group();
    const crownY = theme === 'space' ? 1.25 : 1.0;
    crownGroup.position.set(0, crownY, -0.04);
    crownGroup.rotation.x = -0.06;

    // Crown Base Ring
    const crownBaseGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.10, 24);
    const crownBase = new THREE.Mesh(crownBaseGeo, blackMat);
    crownGroup.add(crownBase);

    // Center Tall Peak
    const centerPeakGeo = new THREE.ConeGeometry(0.14, 0.44, 4);
    const centerPeak = new THREE.Mesh(centerPeakGeo, blackMat);
    centerPeak.position.set(0, 0.23, 0.32);
    centerPeak.rotation.y = Math.PI / 4;
    crownGroup.add(centerPeak);

    // Diamond Emblem on Center Peak
    const diamondGeo = new THREE.OctahedronGeometry(0.07, 0);
    diamondGeo.scale(0.85, 1.45, 0.35);
    const diamondMesh = new THREE.Mesh(diamondGeo, cyanGlowMat);
    diamondMesh.position.set(0, 0.20, 0.40);
    crownGroup.add(diamondMesh);

    // Left & Right Front Peaks
    const sidePeakGeo = new THREE.ConeGeometry(0.11, 0.34, 4);

    const leftPeak = new THREE.Mesh(sidePeakGeo, blackMat);
    leftPeak.position.set(-0.26, 0.17, 0.25);
    leftPeak.rotation.y = Math.PI / 4;
    leftPeak.rotation.z = 0.16;
    crownGroup.add(leftPeak);

    const rightPeak = new THREE.Mesh(sidePeakGeo, blackMat);
    rightPeak.position.set(0.26, 0.17, 0.25);
    rightPeak.rotation.y = Math.PI / 4;
    rightPeak.rotation.z = -0.16;
    crownGroup.add(rightPeak);

    // Rear Peaks
    const rearPeakGeo = new THREE.ConeGeometry(0.10, 0.28, 4);
    const rearPeakL = new THREE.Mesh(rearPeakGeo, blackMat);
    rearPeakL.position.set(-0.23, 0.13, -0.23);
    rearPeakL.rotation.y = Math.PI / 4;
    crownGroup.add(rearPeakL);

    const rearPeakR = new THREE.Mesh(rearPeakGeo, blackMat);
    rearPeakR.position.set(0.23, 0.13, -0.23);
    rearPeakR.rotation.y = Math.PI / 4;
    crownGroup.add(rearPeakR);

    characterGroup.add(crownGroup);

    // ================= 4. ARMS & BLACK CARTOON GLOVES =================
    const armGeo = new THREE.CapsuleGeometry(0.09, 0.36, 12, 12);
    const cuffGeo = new THREE.TorusGeometry(0.12, 0.03, 12, 24);
    const gloveGeo = new THREE.SphereGeometry(0.155, 20, 16);
    gloveGeo.scale(1.0, 1.15, 0.85);

    // Left Arm & Glove
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.64, -0.15, 0.05);

    const leftArm = new THREE.Mesh(armGeo, whiteBodyMat);
    leftArm.rotation.z = 0.42;
    leftArmGroup.add(leftArm);

    const leftCuff = new THREE.Mesh(cuffGeo, blackMat);
    leftCuff.position.set(-0.16, -0.23, 0.08);
    leftCuff.rotation.x = Math.PI / 2;
    leftArmGroup.add(leftCuff);

    const leftGlove = new THREE.Mesh(gloveGeo, blackMat);
    leftGlove.position.set(-0.20, -0.31, 0.10);
    leftArmGroup.add(leftGlove);
    characterGroup.add(leftArmGroup);

    // Right Arm & Glove (Friendly waving / gesturing posture)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.64, -0.15, 0.05);

    const rightArm = new THREE.Mesh(armGeo, whiteBodyMat);
    rightArm.rotation.z = -0.48;
    rightArmGroup.add(rightArm);

    const rightCuff = new THREE.Mesh(cuffGeo, blackMat);
    rightCuff.position.set(0.18, -0.21, 0.08);
    rightCuff.rotation.x = Math.PI / 2;
    rightArmGroup.add(rightCuff);

    const rightGlove = new THREE.Mesh(gloveGeo, blackMat);
    rightGlove.position.set(0.22, -0.29, 0.10);
    rightArmGroup.add(rightGlove);
    characterGroup.add(rightArmGroup);

    // ================= 5. SHORT BLACK LEGS & CHUNKY CARTOON SHOES =================
    const legGeo = new THREE.CylinderGeometry(0.085, 0.095, 0.32, 16);
    const bootGeo = new THREE.CapsuleGeometry(0.15, 0.28, 16, 16);
    bootGeo.rotateX(Math.PI / 2);
    bootGeo.scale(1.0, 0.85, 1.25);

    const soleGeo = new THREE.BoxGeometry(0.32, 0.05, 0.48);

    // Left Leg & Shoe
    const leftLeg = new THREE.Mesh(legGeo, blackMat);
    leftLeg.position.set(-0.26, -0.85, 0.02);
    characterGroup.add(leftLeg);

    const leftBoot = new THREE.Mesh(bootGeo, blackMat);
    leftBoot.position.set(-0.26, -1.04, 0.08);
    characterGroup.add(leftBoot);

    const leftSole = new THREE.Mesh(soleGeo, blackMat);
    leftSole.position.set(-0.26, -1.12, 0.08);
    characterGroup.add(leftSole);

    // Right Leg & Shoe
    const rightLeg = new THREE.Mesh(legGeo, blackMat);
    rightLeg.position.set(0.26, -0.85, 0.02);
    characterGroup.add(rightLeg);

    const rightBoot = new THREE.Mesh(bootGeo, blackMat);
    rightBoot.position.set(0.26, -1.04, 0.08);
    characterGroup.add(rightBoot);

    const rightSole = new THREE.Mesh(soleGeo, blackMat);
    rightSole.position.set(0.26, -1.12, 0.08);
    characterGroup.add(rightSole);

    // ================= 6. THEME-SPECIFIC ACCESSORIES =================
    let holoCluster: THREE.Mesh | null = null;

    if (theme === 'space') {
      // 1. Transparent Astronaut Helmet Bubble
      const helmetGeo = new THREE.SphereGeometry(1.08, 36, 30);
      const helmetMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.05,
        transmission: 0.92,
        thickness: 0.4,
        transparent: true,
        opacity: 0.32,
      });
      const helmetMesh = new THREE.Mesh(helmetGeo, helmetMat);
      helmetMesh.position.set(0, 0.22, 0);
      characterGroup.add(helmetMesh);

      // White Helmet Collar Ring
      const collarGeo = new THREE.TorusGeometry(0.96, 0.065, 16, 48);
      const collarMesh = new THREE.Mesh(collarGeo, whiteBodyMat);
      collarMesh.rotation.x = Math.PI / 2;
      collarMesh.position.set(0, -0.32, 0);
      characterGroup.add(collarMesh);

      const collarLight = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.018, 12, 48), cyanGlowMat);
      collarLight.rotation.x = Math.PI / 2;
      collarLight.position.set(0, -0.32, 0);
      characterGroup.add(collarLight);

      // Side Communication Headset Ear Cups
      const earPodGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.10, 24);
      earPodGeo.rotateZ(Math.PI / 2);

      const leftEar = new THREE.Mesh(earPodGeo, whiteBodyMat);
      leftEar.position.set(-1.06, 0.22, 0);
      characterGroup.add(leftEar);

      const rightEar = new THREE.Mesh(earPodGeo, whiteBodyMat);
      rightEar.position.set(1.06, 0.22, 0);
      characterGroup.add(rightEar);

      // Floating Holographic Star-Lattice Cluster in front of Hand
      const holoIcoGeo = new THREE.IcosahedronGeometry(0.25, 1);
      const holoWireMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 2.6,
        wireframe: true,
      });
      holoCluster = new THREE.Mesh(holoIcoGeo, holoWireMat);
      holoCluster.position.set(0.55, -0.05, 0.58);
      characterGroup.add(holoCluster);
    } else if (theme === 'professional') {
      // 1. Executive Navy/Cyan Necktie
      const tieMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.35,
        metalness: 0.2,
      });

      const knotMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.09, 16), tieMat);
      knotMesh.position.set(0, -0.16, 0.74);
      characterGroup.add(knotMesh);

      const tieShape = new THREE.Shape();
      tieShape.moveTo(-0.06, 0);
      tieShape.lineTo(0.06, 0);
      tieShape.lineTo(0.09, -0.44);
      tieShape.lineTo(0, -0.58);
      tieShape.lineTo(-0.09, -0.44);
      tieShape.closePath();

      const tieMesh = new THREE.Mesh(new THREE.ShapeGeometry(tieShape), tieMat);
      tieMesh.position.set(0, -0.20, 0.75);
      characterGroup.add(tieMesh);

      // 2. Futuristic Holographic Glass Tablet in Hand
      const tabletGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0x0284c7,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
      });
      const tabletMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.62, 0.03), tabletGlassMat);
      tabletMesh.position.set(0.48, -0.12, 0.54);
      tabletMesh.rotation.y = -0.35;
      tabletMesh.rotation.x = 0.22;
      characterGroup.add(tabletMesh);

      const frameMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.50, 0.64, 0.018),
        new THREE.MeshStandardMaterial({
          color: 0x00f0ff,
          emissive: 0x00f0ff,
          emissiveIntensity: 2.0,
          wireframe: true,
        })
      );
      tabletMesh.add(frameMesh);
    } else if (theme === 'study') {
      // 1. Academic Graduation Mortarboard Cap
      const capGroup = new THREE.Group();
      capGroup.position.set(0, 1.15, 0.05);
      capGroup.rotation.x = -0.12;

      const capMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
      const capSkull = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.18, 24), capMat);
      capGroup.add(capSkull);

      const plateMesh = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.04, 1.02), capMat);
      plateMesh.position.set(0, 0.10, 0);
      plateMesh.rotation.y = Math.PI / 4;
      capGroup.add(plateMesh);

      const buttonMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16), goldMat);
      buttonMesh.position.set(0, 0.13, 0);
      capGroup.add(buttonMesh);

      const tasselCordCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0.13, 0),
        new THREE.Vector3(0.42, 0.10, 0.2),
        new THREE.Vector3(0.48, -0.22, 0.22)
      );
      const tasselCord = new THREE.Mesh(new THREE.TubeGeometry(tasselCordCurve, 16, 0.014, 8, false), goldMat);
      capGroup.add(tasselCord);

      const tasselBrush = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.18, 12), goldMat);
      tasselBrush.position.set(0.48, -0.30, 0.22);
      capGroup.add(tasselBrush);

      characterGroup.add(capGroup);

      // 2. Open Holographic Study Book in front of Hands
      const bookPagesMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 1.6,
      });

      const bookGroup = new THREE.Group();
      bookGroup.position.set(0, -0.25, 0.64);
      bookGroup.rotation.x = 0.55;

      const leftPage = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.02), bookPagesMat);
      leftPage.position.set(-0.13, 0, 0);
      leftPage.rotation.y = 0.25;
      bookGroup.add(leftPage);

      const rightPage = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.02), bookPagesMat);
      rightPage.position.set(0.13, 0, 0);
      rightPage.rotation.y = -0.25;
      bookGroup.add(rightPage);

      characterGroup.add(bookGroup);
    }

    // ================= INTERACTIVE ANIMATION LOOP =================
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Natural Eye Blinking Schedule
    let isBlinking = false;
    let blinkTimer: NodeJS.Timeout;
    const scheduleBlink = () => {
      blinkTimer = setTimeout(() => {
        isBlinking = true;
        setTimeout(() => {
          isBlinking = false;
          scheduleBlink();
        }, 130);
      }, Math.random() * 3200 + 1800);
    };
    scheduleBlink();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // 1. Idle Breathing & Organic Floating
        const breathFloat = Math.sin(elapsedTime * 2.2) * 0.05;
        characterGroup.position.y = breathFloat;

        // 2. Smooth Head & Eye Tracking towards Cursor
        targetRotY = THREE.MathUtils.clamp(mouseX * 0.38, -0.42, 0.42);
        targetRotX = THREE.MathUtils.clamp(-mouseY * 0.20, -0.22, 0.22);

        faceGroup.rotation.y = THREE.MathUtils.lerp(faceGroup.rotation.y, targetRotY, 0.08);
        faceGroup.rotation.x = THREE.MathUtils.lerp(faceGroup.rotation.x, targetRotX, 0.08);

        // 3. Smooth Eye Blinking
        const targetEyeScaleY = isBlinking ? 0.06 : 1.0;
        leftEyeGroup.scale.y = THREE.MathUtils.lerp(leftEyeGroup.scale.y, targetEyeScaleY, 0.4);
        rightEyeGroup.scale.y = THREE.MathUtils.lerp(rightEyeGroup.scale.y, targetEyeScaleY, 0.4);

        // 4. Conversational AI Reactions (Speaking / Thinking Pulse)
        if (isSpeaking) {
          const pulse = 2.4 + Math.sin(elapsedTime * 8) * 1.3;
          cyanGlowMat.emissiveIntensity = pulse;
          diamondMesh.scale.setScalar(1.0 + Math.sin(elapsedTime * 8) * 0.12);
          mouthGroup.scale.y = 1.0 + Math.sin(elapsedTime * 10) * 0.35; // Speaking mouth movement
          characterGroup.position.y = breathFloat + Math.sin(elapsedTime * 6) * 0.04;
        } else {
          cyanGlowMat.emissiveIntensity = 2.2 + Math.sin(elapsedTime * 1.5) * 0.35;
          diamondMesh.scale.setScalar(1.0);
          mouthGroup.scale.y = THREE.MathUtils.lerp(mouthGroup.scale.y, 1.0, 0.1);
        }

        // 5. Gentle Arm Sway & Prop Rotation
        rightArmGroup.rotation.z = Math.sin(elapsedTime * 2.5) * 0.06 - 0.48;
        leftArmGroup.rotation.z = -Math.sin(elapsedTime * 2.5) * 0.05 + 0.42;

        if (holoCluster) {
          holoCluster.rotation.y = elapsedTime * 0.8;
          holoCluster.rotation.x = elapsedTime * 0.4;
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(blinkTimer);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [theme, size, isSpeaking]);

  if (!webGLSupported) {
    const fallbackSrc =
      theme === 'professional'
        ? '/assets/mascot/iris_professional_avatar.webp'
        : theme === 'study'
        ? '/assets/mascot/iris_study_avatar.webp'
        : '/assets/mascot/iris_space_avatar.webp';

    return (
      <div
        onClick={onClick}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <img
          src={fallbackSrc}
          alt="Iris AI Mascot"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Iris 3D Interactive Mascot"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: isBouncing ? 'translateY(-14px) scale(1.12)' : 'none',
        transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        filter: isSpeaking ? 'drop-shadow(0 0 14px rgba(0, 240, 255, 0.65))' : 'none',
      }}
    />
  );
}
