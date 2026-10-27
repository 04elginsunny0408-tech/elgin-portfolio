'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  Globe,
  Award,
  Code2,
  User,
  Mail,
  Compass,
  RotateCcw,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  X,
  Volume2,
  VolumeX,
  Briefcase,
  Home,
  BookOpen,
  Rocket,
  Shield,
} from 'lucide-react';

interface ProjectData {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description?: string;
  tech_stack: string;
  cover_image?: string;
  demo_url?: string;
  repo_url?: string;
  verified_dates?: string;
}

interface CertificateData {
  id: string;
  title: string;
  issuer: string;
  issue_date?: string;
  credential_id?: string;
  skills_verified?: string;
}

interface SkillData {
  name: string;
  category: string;
  proficiency: number;
}

interface SpaceSolarSystemProps {
  onSelectCategory: (category: string) => void;
  activeCategory: string | null;
  bharatYatraProject?: ProjectData;
  projects?: ProjectData[];
  certificates?: CertificateData[];
  skills?: SkillData[];
  ownerName?: string;
  currentTheme?: 'space' | 'professional' | 'study';
  onThemeChange?: (theme: 'space' | 'professional' | 'study') => void;
}

interface PlanetScreenLabel {
  id: string;
  title: string;
  badge: string;
  color: string;
  x: number;
  y: number;
  visible: boolean;
}

interface CelestialTarget {
  id: string;
  title: string;
  type: string;
  subtitle: string;
  color: string;
  description: string;
  project?: ProjectData;
  certificate?: CertificateData;
  skill?: SkillData;
}

// Procedural round star texture with natural radial falloff and soft glow
function createRoundStarTexture(size = 64): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture(null as any);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.18, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.42, 'rgba(224, 242, 254, 0.55)');
  gradient.addColorStop(0.72, 'rgba(186, 230, 253, 0.15)');
  gradient.addColorStop(1, 'rgba(186, 230, 253, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(center, center, center, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Procedural prominent hero star texture with soft corona & 4-point diffraction spike
function createHeroStarTexture(size = 128): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture(null as any);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const center = size / 2;

  // Soft atmospheric radial halo
  const haloGrad = ctx.createRadialGradient(center, center, 0, center, center, center);
  haloGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  haloGrad.addColorStop(0.2, 'rgba(199, 235, 254, 0.75)');
  haloGrad.addColorStop(0.5, 'rgba(147, 197, 253, 0.25)');
  haloGrad.addColorStop(1, 'rgba(147, 197, 253, 0)');
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(center, center, center, 0, Math.PI * 2);
  ctx.fill();

  // Subtle horizontal & vertical diffraction spikes
  const spikeGradH = ctx.createLinearGradient(0, center, size, center);
  spikeGradH.addColorStop(0, 'rgba(255, 255, 255, 0)');
  spikeGradH.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)');
  spikeGradH.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = spikeGradH;
  ctx.fillRect(0, center - 1, size, 2);

  const spikeGradV = ctx.createLinearGradient(center, 0, center, size);
  spikeGradV.addColorStop(0, 'rgba(255, 255, 255, 0)');
  spikeGradV.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)');
  spikeGradV.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = spikeGradV;
  ctx.fillRect(center - 1, 0, 2, size);

  // Intense central nucleus
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(center, center, 4, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Procedural dynamic solar surface texture with plasma granulation and convective flares
function createSunSurfaceTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture(null as any);
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Fiery golden radiant base
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 256);
  bgGrad.addColorStop(0, '#f59e0b');
  bgGrad.addColorStop(0.4, '#fbbf24');
  bgGrad.addColorStop(0.7, '#ea580c');
  bgGrad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 256);

  // Convective solar plasma granulation cells
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = Math.random() * 32 + 10;
    const cellGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    cellGrad.addColorStop(0, 'rgba(255, 251, 235, 0.85)');
    cellGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.5)');
    cellGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
    ctx.fillStyle = cellGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Radiant solar flare streaks
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.random() * 50 + 20, Math.random() * 8 + 3, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Procedural concentric planetary ring texture with Cassini-style division bands
function createPlanetaryRingTexture(colorType: 'gold' | 'cyan'): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture(null as any);
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const baseHue = colorType === 'gold' ? 38 : 190;
  ctx.clearRect(0, 0, 512, 64);

  // Multi-banded concentric rings with Cassini division gap
  for (let x = 0; x < 512; x++) {
    const norm = x / 512;
    // Cassini division gap near 60%
    if (norm > 0.58 && norm < 0.64) {
      continue;
    }
    // Outer edge falloff
    let edgeAlpha = 1;
    if (norm < 0.08) edgeAlpha = norm / 0.08;
    if (norm > 0.92) edgeAlpha = (1 - norm) / 0.08;

    const bandNoise = Math.sin(norm * 85) * 0.25 + Math.sin(norm * 220) * 0.15;
    const alpha = Math.max(0, Math.min(0.85, (0.45 + bandNoise) * edgeAlpha));
    const light = 55 + Math.sin(norm * 60) * 20;

    ctx.fillStyle = `hsla(${baseHue}, 85%, ${light}%, ${alpha})`;
    ctx.fillRect(x, 0, 1, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Procedural soft cosmic nebula cloud texture for deep space layers
function createNebulaCloudTexture(colorHex1: string, colorHex2: string): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture(null as any);
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const center = 128;
  const grad = ctx.createRadialGradient(center, center, 0, center, center, 128);
  grad.addColorStop(0, colorHex1);
  grad.addColorStop(0.45, colorHex2);
  grad.addColorStop(0.8, 'rgba(10, 15, 45, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Ethereal turbulent stardust wisps
  for (let i = 0; i < 24; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = Math.random() * 55 + 15;
    const wispGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    wispGrad.addColorStop(0, colorHex1);
    wispGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = wispGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Procedural texture generator for authentic Solar System planetary surfaces
export type PlanetTextureType =
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'moon';

function createPlanetTexture(type: PlanetTextureType): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture(null as any);
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  if (type === 'mercury') {
    // 1. MERCURY: Small, grey, rocky, heavily cratered hermean surface with zero atmosphere
    // Slate & basalt grey base
    const baseGrad = ctx.createLinearGradient(0, 0, 0, 512);
    baseGrad.addColorStop(0, '#374151');
    baseGrad.addColorStop(0.5, '#4b5563');
    baseGrad.addColorStop(1, '#374151');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Mottled rocky highlands and basaltic plains
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const r = Math.random() * 60 + 15;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, Math.random() > 0.5 ? 'rgba(75, 85, 99, 0.45)' : 'rgba(31, 41, 55, 0.55)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 110+ Impact Craters with illuminated rims, shadowed interiors & central peaks
    for (let i = 0; i < 110; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const r = Math.random() * 22 + 4;

      // Crater floor
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Sunlit rim crescent
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = Math.max(1.5, r * 0.16);
      ctx.beginPath();
      ctx.arc(x, y, r, Math.PI * 0.75, Math.PI * 1.85);
      ctx.stroke();

      // Shadowed rim interior
      ctx.strokeStyle = '#030712';
      ctx.lineWidth = Math.max(1.5, r * 0.16);
      ctx.beginPath();
      ctx.arc(x, y, r, -Math.PI * 0.25, Math.PI * 0.75);
      ctx.stroke();

      // Bright rayed ejecta filaments on larger craters
      if (r > 16) {
        ctx.strokeStyle = 'rgba(241, 245, 249, 0.35)';
        ctx.lineWidth = 1;
        for (let ray = 0; ray < 8; ray++) {
          const angle = (ray / 8) * Math.PI * 2 + Math.random() * 0.2;
          const rayLen = r * (2.5 + Math.random() * 2);
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
          ctx.lineTo(x + Math.cos(angle) * rayLen, y + Math.sin(angle) * rayLen);
          ctx.stroke();
        }
      }
    }
  } else if (type === 'venus') {
    // 2. VENUS: Pale yellowish cream with thick, cloudy atmospheric layers & chevron zonal currents
    const baseGrad = ctx.createLinearGradient(0, 0, 0, 512);
    baseGrad.addColorStop(0, '#fef3c7');
    baseGrad.addColorStop(0.3, '#fde68a');
    baseGrad.addColorStop(0.6, '#fef9c3');
    baseGrad.addColorStop(0.85, '#fcd34d');
    baseGrad.addColorStop(1, '#fef3c7');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Thick swirling sulfuric acid cloud decks with chevron-shaped equatorial flows
    for (let y = 0; y < 512; y += 4) {
      const normY = y / 512;
      const wave = Math.sin(normY * 24) * 0.18 + Math.cos(normY * 12) * 0.12;
      const hue = 44 + wave * 6;
      const sat = 78 + Math.sin(normY * 36) * 12;
      const lum = 78 + Math.cos(normY * 20) * 14;

      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lum}%)`;
      ctx.fillRect(0, y, 1024, 4);
    }

    // Large planetary scale swirling cloud streamers
    for (let i = 0; i < 48; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const rx = Math.random() * 220 + 80;
      const ry = Math.random() * 28 + 8;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, rx);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      grad.addColorStop(0.6, 'rgba(254, 240, 138, 0.22)');
      grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, (Math.random() - 0.5) * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'earth') {
    // 3. EARTH: Azure oceans, continental landmasses (forest green/brown) and swirling white clouds
    // Deep royal to azure oceans
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
    oceanGrad.addColorStop(0, '#031738');
    oceanGrad.addColorStop(0.2, '#03346e');
    oceanGrad.addColorStop(0.5, '#02458a');
    oceanGrad.addColorStop(0.8, '#03346e');
    oceanGrad.addColorStop(1, '#031738');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Continental landmasses in forest green, olive savanna, and desert plateaus
    ctx.fillStyle = '#15803d';
    for (let i = 0; i < 55; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 400 + 56;
      const r = Math.random() * 95 + 25;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Coastal shelves & savanna greens
    ctx.fillStyle = '#16a34a';
    for (let i = 0; i < 42; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 380 + 66;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 65 + 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mountain ridges, arid plateaus & desert sands
    ctx.fillStyle = '#ca8a04';
    for (let i = 0; i < 36; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 360 + 76;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 45 + 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Polar ice caps (North & South arctic glaciers)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 42);
    ctx.fillRect(0, 470, 1024, 42);
    for (let x = 0; x < 1024; x += 32) {
      ctx.beginPath();
      ctx.arc(x, 42, Math.random() * 18 + 6, 0, Math.PI);
      ctx.arc(x, 470, Math.random() * 18 + 6, Math.PI, 0);
      ctx.fill();
    }

    // Swirling white cirrus clouds, storm spirals, and equatorial cloud streams
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    for (let i = 0; i < 48; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      ctx.beginPath();
      ctx.ellipse(x, y, Math.random() * 180 + 50, Math.random() * 26 + 8, (Math.random() - 0.5) * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'mars') {
    // 4. MARS: Rusty red and orange ferric surface with darker basaltic volcanic regions
    const marsGrad = ctx.createLinearGradient(0, 0, 0, 512);
    marsGrad.addColorStop(0, '#9a3412');
    marsGrad.addColorStop(0.3, '#c2410c');
    marsGrad.addColorStop(0.5, '#ea580c');
    marsGrad.addColorStop(0.7, '#c2410c');
    marsGrad.addColorStop(1, '#9a3412');
    ctx.fillStyle = marsGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Large dark basaltic volcanic regions (Syrtis Major & Acidalia Planitia)
    ctx.fillStyle = 'rgba(67, 20, 7, 0.85)';
    for (let i = 0; i < 28; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 380 + 66;
      ctx.beginPath();
      ctx.ellipse(x, y, Math.random() * 130 + 40, Math.random() * 70 + 25, (Math.random() - 0.5) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Charcoal/umber canyon and crag relief (Valles Marineris chasms)
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 3;
    for (let i = 0; i < 18; i++) {
      let cx = Math.random() * 1024;
      let cy = Math.random() * 360 + 76;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      for (let s = 0; s < 6; s++) {
        cx += (Math.random() - 0.3) * 60;
        cy += (Math.random() - 0.5) * 25;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    // Brilliant white CO2 polar ice caps (North & South)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 1024, 34);
    ctx.fillRect(0, 478, 1024, 34);
    for (let x = 0; x < 1024; x += 40) {
      ctx.beginPath();
      ctx.arc(x, 34, Math.random() * 14 + 4, 0, Math.PI);
      ctx.arc(x, 478, Math.random() * 14 + 4, Math.PI, 0);
      ctx.fill();
    }
  } else if (type === 'jupiter') {
    // 5. JUPITER: Large planet with beige, cream, and brown atmospheric bands, including subtle Great Red Spot
    // Alternating turbulent zonal belts and zones
    for (let y = 0; y < 512; y += 3) {
      const normY = y / 512;
      // High-frequency shear-flow ripples between jet streams
      const turbulence = Math.sin(normY * 42) * 0.25 + Math.cos(normY * 18) * 0.15;
      const hue = 32 + turbulence * 12;
      const sat = 70 + Math.sin(normY * 50) * 20;
      const lum = 46 + Math.cos(normY * 34) * 28;

      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lum}%)`;
      ctx.fillRect(0, y, 1024, 3);
    }

    // Turbulent shear eddies between counter-rotating jet streams
    for (let i = 0; i < 55; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 251, 235, 0.45)' : 'rgba(120, 53, 15, 0.4)';
      ctx.beginPath();
      ctx.ellipse(x, y, Math.random() * 110 + 35, Math.random() * 14 + 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Great Red Spot (Southern tropical oval storm vortex)
    const grsX = 420;
    const grsY = 320;
    const grsGrad = ctx.createRadialGradient(grsX, grsY, 5, grsX, grsY, 55);
    grsGrad.addColorStop(0, '#991b1b');
    grsGrad.addColorStop(0.4, '#dc2626');
    grsGrad.addColorStop(0.8, '#ea580c');
    grsGrad.addColorStop(1, 'rgba(254, 215, 170, 0.1)');
    ctx.fillStyle = grsGrad;
    ctx.beginPath();
    ctx.ellipse(grsX, grsY, 68, 36, -0.08, 0, Math.PI * 2);
    ctx.fill();

    // Pale cream collar around Great Red Spot
    ctx.strokeStyle = 'rgba(255, 251, 235, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(grsX, grsY, 74, 40, -0.08, 0, Math.PI * 2);
    ctx.stroke();
  } else if (type === 'saturn') {
    // 6. SATURN: Pale golden colour with smooth, elegant butterscotch atmospheric bands
    for (let y = 0; y < 512; y += 3) {
      const normY = y / 512;
      const hue = 40 + Math.sin(normY * 16) * 6;
      const sat = 75 + Math.sin(normY * 26) * 12;
      const lum = 62 + Math.cos(normY * 22) * 16;
      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lum}%)`;
      ctx.fillRect(0, y, 1024, 3);
    }

    // Soft golden haze and delicate ammonia cirrus wisps
    for (let i = 0; i < 35; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
      ctx.beginPath();
      ctx.ellipse(x, y, Math.random() * 160 + 60, Math.random() * 16 + 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'uranus') {
    // 7. URANUS: Pale cyan-blue with smooth, subtle, pristine atmospheric appearance
    const baseGrad = ctx.createLinearGradient(0, 0, 0, 512);
    baseGrad.addColorStop(0, '#a5f3fc');
    baseGrad.addColorStop(0.3, '#67e8f9');
    baseGrad.addColorStop(0.5, '#38bdf8');
    baseGrad.addColorStop(0.7, '#67e8f9');
    baseGrad.addColorStop(1, '#a5f3fc');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle soft latitudinal variations with delicate polar brightening
    for (let y = 0; y < 512; y += 8) {
      const normY = y / 512;
      const alpha = 0.08 + Math.sin(normY * 14) * 0.05;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(0, y, 1024, 8);
    }
  } else if (type === 'neptune') {
    // 8. NEPTUNE: Deep blue with realistic atmospheric shading and bright cirrus streaks
    const nepGrad = ctx.createLinearGradient(0, 0, 0, 512);
    nepGrad.addColorStop(0, '#1e3a8a');
    nepGrad.addColorStop(0.3, '#1d4ed8');
    nepGrad.addColorStop(0.5, '#2563eb');
    nepGrad.addColorStop(0.8, '#1d4ed8');
    nepGrad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = nepGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Fast dynamic white/cyan cirrus cloud streaks of frozen methane
    ctx.fillStyle = 'rgba(224, 242, 254, 0.78)';
    for (let i = 0; i < 38; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      ctx.beginPath();
      ctx.ellipse(x, y, Math.random() * 140 + 40, Math.random() * 8 + 2, (Math.random() - 0.5) * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Great Dark Spot (Subtle indigo oval vortex)
    const gdsGrad = ctx.createRadialGradient(620, 240, 0, 620, 240, 50);
    gdsGrad.addColorStop(0, '#0f172a');
    gdsGrad.addColorStop(0.6, '#1e1b4b');
    gdsGrad.addColorStop(1, 'rgba(30, 58, 138, 0)');
    ctx.fillStyle = gdsGrad;
    ctx.beginPath();
    ctx.ellipse(620, 240, 65, 30, 0.05, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // 9. MOON / AIRLESS ROCKY WORLD: Photorealistic cratered lunar world with dark basalt maria & rayed craters
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 1024, 512);

    // Dark lunar maria basalt plains
    ctx.fillStyle = '#334155';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const r = Math.random() * 140 + 40;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Impact craters with highlighted rims & shadowed interiors
    for (let i = 0; i < 75; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const r = Math.random() * 26 + 5;

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y, r, Math.PI * 0.8, Math.PI * 1.8);
      ctx.stroke();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y, r, -Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Procedural ambient cosmic sound synthesizer (Web Audio API)
class CosmicAudioSynth {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private oscs: OscillatorNode[] = [];
  public isPlaying = false;

  toggle(onStateChange?: (playing: boolean) => void) {
    if (!this.isPlaying) {
      this.start();
      onStateChange?.(true);
    } else {
      this.stop();
      onStateChange?.(false);
    }
  }

  start() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.ctx) this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 2.0);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      masterGain.connect(this.ctx.destination);
      filter.connect(masterGain);

      // Warm ambient cosmic chord: D2, A2, D3, F#3
      const freqs = [73.4, 110.0, 146.8, 185.0];
      this.oscs = freqs.map((freq) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
        osc.connect(filter);
        osc.start();
        return osc;
      });

      this.gain = masterGain;
      this.isPlaying = true;
    } catch {
      this.isPlaying = false;
    }
  }

  stop() {
    if (this.gain && this.ctx) {
      try {
        this.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
        setTimeout(() => {
          this.oscs.forEach((o) => {
            try {
              o.stop();
              o.disconnect();
            } catch {}
          });
          this.oscs = [];
          this.isPlaying = false;
        }, 900);
      } catch {
        this.isPlaying = false;
      }
    } else {
      this.isPlaying = false;
    }
  }
}

export default function SpaceSolarSystem({
  onSelectCategory,
  activeCategory,
  bharatYatraProject,
  projects = [],
  certificates = [],
  skills = [],
  ownerName = 'Elgin',
  currentTheme = 'space',
  onThemeChange,
}: SpaceSolarSystemProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelsContainerRef = useRef<HTMLDivElement>(null);
  const [selectedDestination, setSelectedDestination] = useState<CelestialTarget | null>(null);
  const [hoveredBodyName, setHoveredBodyName] = useState<string | null>(null);
  const [isTraveling, setIsTraveling] = useState(false);
  const [registeredLabels, setRegisteredLabels] = useState<PlanetScreenLabel[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioSynthRef = useRef<CosmicAudioSynth | null>(null);

  // Authentic Iris Mascot Interaction States
  const [isIrisBlinking, setIsIrisBlinking] = useState(false);
  const [isIrisHovered, setIsIrisHovered] = useState(false);
  const [isIrisBouncing, setIsIrisBouncing] = useState(false);
  const [irisLookOffset, setIrisLookOffset] = useState({ x: 0, y: 0 });
  const [irisSpeechIndex, setIrisSpeechIndex] = useState(0);
  const [irisSparkleKey, setIrisSparkleKey] = useState(0);
  const irisMascotRef = useRef<HTMLDivElement>(null);

  // References for camera transitions
  const triggerCameraReturnRef = useRef<(() => void) | null>(null);
  const triggerFlightToPlanetRef = useRef<((id: string) => void) | null>(null);

  // Natural occasional blinking at realistic intervals (every 3.6s to 5.2s)
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    let openTimeout: NodeJS.Timeout;

    const scheduleNextBlink = () => {
      const delay = 3500 + Math.random() * 2000;
      blinkTimeout = setTimeout(() => {
        setIsIrisBlinking(true);
        openTimeout = setTimeout(() => {
          setIsIrisBlinking(false);
          scheduleNextBlink();
        }, 160);
      }, delay);
    };

    scheduleNextBlink();
    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(openTimeout);
    };
  }, []);

  // Subtle mouse tracking for natural glance
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      if (!irisMascotRef.current) return;
      const rect = irisMascotRef.current.getBoundingClientRect();
      const irisCenterX = rect.left + rect.width / 2;
      const irisCenterY = rect.top + rect.height / 2;
      const dx = (e.clientX - irisCenterX) / window.innerWidth;
      const dy = (e.clientY - irisCenterY) / window.innerHeight;
      setIrisLookOffset({
        x: Math.max(-6, Math.min(6, dx * 14)),
        y: Math.max(-4, Math.min(4, dy * 10)),
      });
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, []);

  // Pleasant cosmic chime on click
  const playIrisChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.06, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.42);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } catch {}
  };

  const handleIrisClick = () => {
    setIsIrisBouncing(true);
    playIrisChime();
    setIrisSparkleKey((k) => k + 1);
    setIrisSpeechIndex((prev) => (prev + 1) % 5);
    setTimeout(() => setIsIrisBouncing(false), 700);
  };

  const irisSpeeches = [
    `Click on any planet to explore ${ownerName}'s projects, certificates and more! ✨`,
    `Notice Earth? That's Bharat Yatra, built for Smart India Hackathon! 🌍`,
    `Check out golden Saturn for Elgin's verified Python credentials! 🪐`,
    `Notice Mars? That represents Elgin's Smart India Hackathon achievement! 🔴`,
    `Ask me anything about Elgin! Click my speech bubble to open AI chat! 💬`,
  ];

  // Initialize Audio Synth
  useEffect(() => {
    audioSynthRef.current = new CosmicAudioSynth();
    return () => {
      audioSynthRef.current?.stop();
    };
  }, []);

  const handleToggleSound = () => {
    audioSynthRef.current?.toggle((playing) => setIsAudioPlaying(playing));
  };

  // Open Iris chat on click
  const handleOpenIrisChat = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-iris-chat'));
    }
  };

  // Smooth scroll to section
  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. SCENE & CAMERA (Exact reference angled perspective)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const defaultCameraPos = new THREE.Vector3(0, 18, 30);
    const defaultLookAt = new THREE.Vector3(0, -0.5, 0);

    camera.position.copy(defaultCameraPos);
    camera.lookAt(defaultLookAt);

    const cameraTarget = {
      pos: defaultCameraPos.clone(),
      lookAt: defaultLookAt.clone(),
    };

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Central Sun point light
    const sunLight = new THREE.PointLight(0xffedd5, 7.5, 150, 0.45);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Cosmic rim lights matching reference cyan and magenta nebulae
    const cosmicRim1 = new THREE.DirectionalLight(0x00f0ff, 0.75);
    cosmicRim1.position.set(18, 24, 20);
    scene.add(cosmicRim1);

    const cosmicRim2 = new THREE.DirectionalLight(0xa855f7, 0.55);
    cosmicRim2.position.set(-20, -12, -18);
    scene.add(cosmicRim2);

    // 4. NATURAL ROUND STARS & CINEMATIC DEPTH
    const roundStarTexture = createRoundStarTexture(64);
    const heroStarTexture = createHeroStarTexture(128);

    // Layer A: Natural Round Background Stars (~750 stars with varied depths and colors)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 750;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xf0fdf4),
      new THREE.Color(0xe0f2fe),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xfef3c7),
      new THREE.Color(0xf3e8ff),
      new THREE.Color(0x00f0ff),
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 55 + Math.random() * 110;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.65;
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      map: roundStarTexture,
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Layer B: Prominent Brighter Stars for Cinematic Depth (24 hero stars)
    const heroStarGeo = new THREE.BufferGeometry();
    const heroStarCount = 24;
    const heroStarPositions = new Float32Array(heroStarCount * 3);
    const heroStarColors = new Float32Array(heroStarCount * 3);

    for (let i = 0; i < heroStarCount; i++) {
      const r = 60 + Math.random() * 85;
      const theta = (i / heroStarCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const phi = Math.acos(Math.random() * 1.6 - 0.8);

      heroStarPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      heroStarPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55;
      heroStarPositions[i * 3 + 2] = r * Math.cos(phi);

      const color = Math.random() > 0.4 ? new THREE.Color(0xffffff) : new THREE.Color(0x7dd3fc);
      heroStarColors[i * 3] = color.r;
      heroStarColors[i * 3 + 1] = color.g;
      heroStarColors[i * 3 + 2] = color.b;
    }

    heroStarGeo.setAttribute('position', new THREE.BufferAttribute(heroStarPositions, 3));
    heroStarGeo.setAttribute('color', new THREE.BufferAttribute(heroStarColors, 3));

    const heroStarMat = new THREE.PointsMaterial({
      map: heroStarTexture,
      size: 3.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const heroStarPoints = new THREE.Points(heroStarGeo, heroStarMat);
    scene.add(heroStarPoints);

    // 4B. 3D IRREGULAR ROCK ASTEROIDS ALONG COHERENT ELLIPTICAL BELT (InstancedMesh - Single Draw Call)
    // Upgraded with 440 faceted asteroids across 3 distinct size tiers (fragments, crags, and large boulders)
    const asteroidCount = 440;
    const asteroidGeo = new THREE.DodecahedronGeometry(0.13, 0);

    // Perturb vertices with varied displacements along positions to produce sharp, faceted craggy rock geometry
    const posAttr = asteroidGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const jitter = 0.76 + Math.random() * 0.48;
      posAttr.setXYZ(i, posAttr.getX(i) * jitter, posAttr.getY(i) * jitter, posAttr.getZ(i) * jitter);
    }
    asteroidGeo.computeVertexNormals();

    const asteroidMat = new THREE.MeshStandardMaterial({
      color: 0x78716c,
      roughness: 0.88,
      metalness: 0.12,
      flatShading: true,
    });
    const asteroidBelt = new THREE.InstancedMesh(asteroidGeo, asteroidMat, asteroidCount);

    const dummyMatrix = new THREE.Matrix4();
    const dummyPos = new THREE.Vector3();
    const dummyRot = new THREE.Euler();
    const dummyScale = new THREE.Vector3();
    const dummyColor = new THREE.Color();

    for (let i = 0; i < asteroidCount; i++) {
      const angle = (i / asteroidCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
      const dist = 15.6 + (Math.random() - 0.5) * 1.85;

      dummyPos.x = Math.cos(angle) * dist;
      dummyPos.y = (Math.random() - 0.5) * 0.52;
      dummyPos.z = Math.sin(angle) * (dist * 0.94);

      dummyRot.x = Math.random() * Math.PI * 2;
      dummyRot.y = Math.random() * Math.PI * 2;
      dummyRot.z = Math.random() * Math.PI * 2;

      // 3 distinct size tiers: 60% small gravel fragments, 30% medium rocks, 10% large craggy boulders
      let s: number;
      const tierRoll = Math.random();
      if (tierRoll < 0.6) {
        s = 0.35 + Math.random() * 0.35; // Small fragments
      } else if (tierRoll < 0.9) {
        s = 0.75 + Math.random() * 0.45; // Medium asteroids
      } else {
        s = 1.35 + Math.random() * 0.55; // Large boulders
      }

      dummyScale.set(
        s * (0.75 + Math.random() * 0.5),
        s * (0.75 + Math.random() * 0.5),
        s * (0.75 + Math.random() * 0.5)
      );

      dummyMatrix.makeRotationFromEuler(dummyRot);
      dummyMatrix.scale(dummyScale);
      dummyMatrix.setPosition(dummyPos);
      asteroidBelt.setMatrixAt(i, dummyMatrix);

      // Realistic mineral rock color shades: slate grey, dark basalt, charcoal, warm stone, and chondrite
      const rockShades = [0x57534e, 0x78716c, 0xa8a29e, 0x64748b, 0x475569, 0x334155];
      dummyColor.setHex(rockShades[Math.floor(Math.random() * rockShades.length)]);
      asteroidBelt.setColorAt(i, dummyColor);
    }

    asteroidBelt.instanceMatrix.needsUpdate = true;
    if (asteroidBelt.instanceColor) asteroidBelt.instanceColor.needsUpdate = true;
    scene.add(asteroidBelt);

    // 4C. 3D DEEP-SPACE NEBULA CLOUD PLANES (PARALLAX LAYERS IN THREE.JS SCENE)
    const nebulaGroup = new THREE.Group();
    scene.add(nebulaGroup);

    // Nebula 1: Top-Left Azure / Cyan Cosmic Gas Cloud matching reference
    const cyanNebulaTex = createNebulaCloudTexture('rgba(56, 189, 248, 0.42)', 'rgba(2, 132, 199, 0.22)');
    const cyanNebulaMat = new THREE.MeshBasicMaterial({
      map: cyanNebulaTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const cyanNebulaMesh = new THREE.Mesh(new THREE.PlaneGeometry(72, 58), cyanNebulaMat);
    cyanNebulaMesh.position.set(-36, 18, -48);
    cyanNebulaMesh.rotation.z = 0.25;
    nebulaGroup.add(cyanNebulaMesh);

    // Nebula 2: Bottom-Right Magenta / Violet Cosmic Stardust Belt matching reference
    const magNebulaTex = createNebulaCloudTexture('rgba(217, 70, 239, 0.45)', 'rgba(168, 85, 247, 0.26)');
    const magNebulaMat = new THREE.MeshBasicMaterial({
      map: magNebulaTex,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const magNebulaMesh = new THREE.Mesh(new THREE.PlaneGeometry(78, 62), magNebulaMat);
    magNebulaMesh.position.set(38, -16, -42);
    magNebulaMesh.rotation.z = -0.32;
    nebulaGroup.add(magNebulaMesh);

    // Nebula 3: Bottom-Left Fiery Amber / Radiant Orange Cosmic Filament matching reference
    const amberNebulaTex = createNebulaCloudTexture('rgba(249, 115, 22, 0.38)', 'rgba(236, 72, 153, 0.22)');
    const amberNebulaMat = new THREE.MeshBasicMaterial({
      map: amberNebulaTex,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const amberNebulaMesh = new THREE.Mesh(new THREE.PlaneGeometry(62, 52), amberNebulaMat);
    amberNebulaMesh.position.set(-26, -18, -45);
    amberNebulaMesh.rotation.z = 0.15;
    nebulaGroup.add(amberNebulaMesh);

    // Nebula 4: Distant Royal Violet / Deep Indigo Veil at Upper Right
    const violetNebulaTex = createNebulaCloudTexture('rgba(147, 51, 234, 0.32)', 'rgba(79, 70, 229, 0.18)');
    const violetNebulaMat = new THREE.MeshBasicMaterial({
      map: violetNebulaTex,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const violetNebulaMesh = new THREE.Mesh(new THREE.PlaneGeometry(64, 52), violetNebulaMat);
    violetNebulaMesh.position.set(36, 20, -55);
    violetNebulaMesh.rotation.z = -0.18;
    nebulaGroup.add(violetNebulaMesh);

    // 4D. DISTANT GLOWING STAR CLUSTERS (Concentrated Round Star Clusters)
    const clusterStarCount = 135;
    const clusterGeo = new THREE.BufferGeometry();
    const clusterPositions = new Float32Array(clusterStarCount * 3);
    const clusterColors = new Float32Array(clusterStarCount * 3);

    const clusterCenters = [
      new THREE.Vector3(-32, 22, -45), // Top-left cyan Pleiades cluster
      new THREE.Vector3(34, -14, -40),  // Bottom-right magenta cluster
      new THREE.Vector3(-22, -16, -42), // Bottom-left golden cluster
    ];

    for (let i = 0; i < clusterStarCount; i++) {
      const center = clusterCenters[i % clusterCenters.length];
      const spread = 7.5;
      clusterPositions[i * 3] = center.x + (Math.random() - 0.5) * spread;
      clusterPositions[i * 3 + 1] = center.y + (Math.random() - 0.5) * spread * 0.7;
      clusterPositions[i * 3 + 2] = center.z + (Math.random() - 0.5) * spread * 0.5;

      const clusterColor =
        i % 3 === 0
          ? new THREE.Color(0x38bdf8)
          : i % 3 === 1
          ? new THREE.Color(0xf472b6)
          : new THREE.Color(0xfef08a);

      clusterColors[i * 3] = clusterColor.r;
      clusterColors[i * 3 + 1] = clusterColor.g;
      clusterColors[i * 3 + 2] = clusterColor.b;
    }

    clusterGeo.setAttribute('position', new THREE.BufferAttribute(clusterPositions, 3));
    clusterGeo.setAttribute('color', new THREE.BufferAttribute(clusterColors, 3));

    const clusterMat = new THREE.PointsMaterial({
      map: roundStarTexture,
      size: 2.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const clusterPoints = new THREE.Points(clusterGeo, clusterMat);
    scene.add(clusterPoints);

    // 5. CENTRAL REALISTIC 3D LUMINOUS SUN: "MY JOURNEY" (Explore • Learn • Build)
    const sunGroup = new THREE.Group();
    scene.add(sunGroup);

    const sunTexture = createSunSurfaceTexture();
    // Reduced Sun sphere radius slightly from 2.5 to 2.1 to balance central focus without crowding planets
    const sunGeo = new THREE.SphereGeometry(2.1, 64, 64);
    const sunMat = new THREE.MeshStandardMaterial({
      map: sunTexture,
      emissive: 0xfbbf24,
      emissiveMap: sunTexture,
      emissiveIntensity: 1.15,
      roughness: 0.38,
      metalness: 0.08,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.userData = {
      id: 'journey',
      title: 'My Journey',
      subtitle: 'Explore • Learn • Build',
      badge: 'Core Sun',
      type: 'Core Star',
      color: '#fbbf24',
      description:
        'The foundational core guiding Elgin’s engineering journey: from foundational algorithms and competitive hackathons to full-stack web platforms and applied machine learning.',
    };
    sunGroup.add(sunMesh);

    // Inner fiery corona flare sphere (reduced proportionally)
    const coronaGeo = new THREE.SphereGeometry(2.45, 40, 40);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.42,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    sunGroup.add(coronaMesh);

    // Luminous volumetric outer atmospheric glow (reduced proportionally)
    const outerCoronaGeo = new THREE.SphereGeometry(2.85, 36, 36);
    const outerCoronaMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const outerCoronaMesh = new THREE.Mesh(outerCoronaGeo, outerCoronaMat);
    sunGroup.add(outerCoronaMesh);

    // Radiant Solar Flare Disk with radiating golden light rays matching reference
    const solarRaysGeo = new THREE.RingGeometry(2.1, 3.6, 64);
    const solarRaysMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const solarRaysMesh = new THREE.Mesh(solarRaysGeo, solarRaysMat);
    solarRaysMesh.rotation.x = Math.PI * 0.45;
    sunGroup.add(solarRaysMesh);

    // 6. VERIFIED DYNAMIC PLANETS MAPPED TO AUTHENTIC SOLAR SYSTEM PLANETS
    const verifiedProjects = projects.length > 0 ? projects : [
      {
        id: 'proj_bharat_yatra',
        title: 'Bharat Yatra',
        slug: 'bharat-yatra',
        summary: 'A tourism website associated with my Smart India Hackathon journey.',
        description: 'Bharat Yatra is a tourism web platform developed during the Smart India Hackathon journey, designed to facilitate travel exploration and showcase cultural destinations with a modern digital interface.',
        tech_stack: 'HTML, CSS, JavaScript, Node.js',
        verified_dates: 'SIH Journey',
      },
      {
        id: 'proj_recircuit',
        title: 'ReCircuit',
        slug: 'recircuit',
        summary: 'E-waste management & circular economy platform (Currently Building / In Development).',
        description: 'ReCircuit is an active in-development sustainability platform addressing electronic waste collection, safe data wiping workflows, and device recycling logistics. Conceptualized and actively being built.',
        tech_stack: 'Python, Machine Learning, Web, Node.js',
        verified_dates: 'Currently Building / In Development',
      },
      {
        id: 'proj_ai_chat',
        title: 'AI Chat Assistant',
        slug: 'ai-chat-assistant',
        summary: 'Personal conversational AI assistant built with LLM integrations and domain memory.',
        description: 'A sophisticated personal conversational agent featuring specialized dual-personality modes, domain memory retrieval, and real-time interactive assistance.',
        tech_stack: 'Python, LLMs, Web, Next.js',
        verified_dates: 'Production AI',
      },
    ];

    const dynamicPlanets: any[] = [];

    // Planet 1: Bharat Yatra (Earth: blue oceans, continental landmasses, swirling clouds)
    const byProj = verifiedProjects.find((p) => p.slug === 'bharat-yatra') || verifiedProjects[0];
    dynamicPlanets.push({
      id: byProj.id || 'bharat-yatra',
      slug: byProj.slug,
      title: byProj.title,
      badge: 'Project',
      subtitle: 'Earth • SIH Tourism Platform',
      type: 'Verified Project',
      color: 0x38bdf8,
      hexColor: '#38bdf8',
      radius: 1.4,
      orbitRadius: 7.4,
      speed: 0.0068,
      angle: 0.8,
      textureType: 'earth' as PlanetTextureType,
      hasRings: false,
      roughness: 0.30,
      metalness: 0.15,
      project: byProj,
      description: byProj.description || byProj.summary,
    });

    // Planet 2: ReCircuit (Venus: pale yellowish cream with thick cloudy atmospheric layers)
    const rcProj = verifiedProjects.find((p) => p.slug === 'recircuit') || verifiedProjects[1] || verifiedProjects[0];
    dynamicPlanets.push({
      id: rcProj.id || 'recircuit',
      slug: rcProj.slug,
      title: rcProj.title,
      badge: 'Currently Building',
      subtitle: 'Venus • AI E-Waste Recovery',
      type: 'Currently Building / In Development',
      color: 0xfde68a,
      hexColor: '#fde68a',
      radius: 1.3,
      orbitRadius: 10.8,
      speed: 0.0052,
      angle: 2.3,
      textureType: 'venus' as PlanetTextureType,
      hasRings: false,
      roughness: 0.45,
      metalness: 0.05,
      project: rcProj,
      description: rcProj.description || rcProj.summary,
    });

    // Planet 3: AI Chat Assistant (Jupiter: large planet with beige, cream, and brown atmospheric bands, subtle Great Red Spot)
    const aiProj = verifiedProjects.find((p) => p.slug === 'ai-chat-assistant') || verifiedProjects[2] || verifiedProjects[0];
    dynamicPlanets.push({
      id: aiProj.id || 'ai-chat-assistant',
      slug: aiProj.slug,
      title: aiProj.title,
      badge: 'Project',
      subtitle: 'Jupiter • Conversational AI Agent',
      type: 'Verified Project',
      color: 0xd97706,
      hexColor: '#d97706',
      radius: 1.78, // Jupiter is largest Solar System planet!
      orbitRadius: 14.8,
      speed: 0.0038,
      angle: 3.7,
      textureType: 'jupiter' as PlanetTextureType,
      hasRings: false, // Distinct from Saturn's rings
      roughness: 0.40,
      metalness: 0.08,
      project: aiProj,
      description: aiProj.description || aiProj.summary,
    });

    // Planet 4: Python Programming (Saturn: pale golden colour with recognisable, elegant rings)
    const pyCert = certificates.find((c) => c.title.toLowerCase().includes('python')) || {
      id: 'cert_python',
      title: 'Python Programming',
      issuer: 'Verified Competency Provider',
      issue_date: 'Nov 2024',
      skills_verified: 'Python, Algorithms, Data Structures',
    };
    dynamicPlanets.push({
      id: pyCert.id,
      title: pyCert.title,
      badge: 'Certificate',
      subtitle: `Saturn • ${pyCert.issuer} • ${pyCert.issue_date || 'Verified'}`,
      type: 'Verified Certificate',
      color: 0xf59e0b,
      hexColor: '#f59e0b',
      radius: 1.45,
      orbitRadius: 18.8,
      speed: 0.0030,
      angle: 5.1,
      textureType: 'saturn' as PlanetTextureType,
      hasRings: true, // Distinct, elegant rings with Cassini division gap
      roughness: 0.38,
      metalness: 0.12,
      certificate: pyCert,
      description: `Verified competency credential in ${pyCert.skills_verified || 'Python, data structures, and algorithmic engineering'}.`,
    });

    // Planet 5: Smart India Hackathon Finalist (Mars: rusty red and orange surface with darker regions)
    const sihCert = certificates.find((c) => c.title.toLowerCase().includes('hackathon')) || {
      id: 'cert_sih',
      title: 'Smart India Hackathon',
      issuer: 'Government of India / AICTE',
      issue_date: '2024',
      skills_verified: 'Web Engineering, Hackathon Innovation',
    };
    dynamicPlanets.push({
      id: sihCert.id,
      title: 'Smart India Hackathon',
      badge: 'Certificate',
      subtitle: `Mars • ${sihCert.issuer} • ${sihCert.issue_date || '2024'}`,
      type: 'Verified Certificate',
      color: 0xef4444,
      hexColor: '#ef4444',
      radius: 1.2,
      orbitRadius: 22.4,
      speed: 0.0024,
      angle: 1.5,
      textureType: 'mars' as PlanetTextureType,
      hasRings: false,
      roughness: 0.85,
      metalness: 0.08,
      certificate: sihCert,
      description: `Smart India Hackathon national finalist credential for the Bharat Yatra cultural tourism platform.`,
    });

    // Planet 6: React / Next.js (Uranus: pale cyan-blue with smooth, subtle atmospheric appearance)
    dynamicPlanets.push({
      id: 'skill_react',
      title: 'React / Next.js',
      badge: 'Skill',
      subtitle: 'Uranus • 80% Proficiency • Fullstack Architecture',
      type: 'Verified Skill',
      color: 0x06b6d4,
      hexColor: '#06b6d4',
      radius: 1.25,
      orbitRadius: 26.0,
      speed: 0.0020,
      angle: 3.1,
      textureType: 'uranus' as PlanetTextureType,
      hasRings: false,
      roughness: 0.40,
      metalness: 0.08,
      description: 'Component architecture, SSR/SSG rendering pipelines, Next.js 15 App Router, and dynamic state management.',
    });

    // Planet 7: Core Web Dev (Neptune: deep blue with realistic atmospheric shading and white cirrus streaks)
    dynamicPlanets.push({
      id: 'skill_core_web',
      title: 'Core Web Dev',
      badge: 'Skill',
      subtitle: 'Neptune • JavaScript, TypeScript, HTML5 & CSS3',
      type: 'Verified Skill',
      color: 0x2563eb,
      hexColor: '#2563eb',
      radius: 1.22,
      orbitRadius: 29.4,
      speed: 0.0016,
      angle: 4.5,
      textureType: 'neptune' as PlanetTextureType,
      hasRings: false,
      roughness: 0.38,
      metalness: 0.10,
      description: 'Foundational web standards, TypeScript typing discipline, responsive layouts, and performance optimization.',
    });

    // Planet 8: Node.js Backend (Mercury: small, grey, rocky, heavily cratered hermean surface)
    dynamicPlanets.push({
      id: 'skill_nodejs',
      title: 'Node.js Backend',
      badge: 'Skill',
      subtitle: 'Mercury • 75% Proficiency • REST APIs & Services',
      type: 'Verified Skill',
      color: 0x94a3b8,
      hexColor: '#94a3b8',
      radius: 1.02,
      orbitRadius: 32.6,
      speed: 0.0013,
      angle: 0.2,
      textureType: 'mercury' as PlanetTextureType,
      hasRings: false,
      roughness: 0.92,
      metalness: 0.05,
      description: 'Server-side runtime, asynchronous event loops, SQLite data handling, and secure RESTful endpoint design.',
    });

    // Planet 9: Git & Developer Tools (Moon: cratered lunar world with dark basalt maria)
    dynamicPlanets.push({
      id: 'skill_git',
      title: 'Git & GitHub',
      badge: 'Skill',
      subtitle: 'Moon • 85% Proficiency • Version Control & Workflows',
      type: 'Verified Skill',
      color: 0xcbd5e1,
      hexColor: '#cbd5e1',
      radius: 0.96,
      orbitRadius: 35.8,
      speed: 0.0011,
      angle: 1.9,
      textureType: 'moon' as PlanetTextureType,
      hasRings: false,
      roughness: 0.90,
      metalness: 0.05,
      description: 'Branching strategies, collaborative pull requests, release tagging, and automated continuous deployment workflows.',
    });

    const initialLabels: PlanetScreenLabel[] = [
      {
        id: 'journey',
        title: 'My Journey',
        badge: 'Explore • Learn • Build',
        color: '#fbbf24',
        x: 0,
        y: 0,
        visible: true,
      },
      ...dynamicPlanets.map((p) => ({
        id: p.id,
        title: p.title,
        badge: p.badge,
        color: p.hexColor,
        x: 0,
        y: 0,
        visible: true,
      })),
    ];
    setRegisteredLabels(initialLabels);

    const interactiveMeshes: THREE.Mesh[] = [sunMesh];
    const planetObjects: any[] = [];

    dynamicPlanets.forEach((def) => {
      // 3D Elliptical Orbit Track with tilted perspective
      const orbitCurve = new THREE.EllipseCurve(0, 0, def.orbitRadius, def.orbitRadius * 0.94, 0, 2 * Math.PI, false, 0);
      const points = orbitCurve.getPoints(120);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(p.x, 0, p.y)));
      const orbitMat = new THREE.LineBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0.28,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      scene.add(orbitLine);

      // Planet Sphere Mesh with Genuine 3D Geometry and Procedural Surface Map
      // Realistic day/night lighting from central Sun with subtle emissive fill
      const texture = createPlanetTexture(def.textureType);
      const geo = new THREE.SphereGeometry(def.radius, 48, 48);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: def.roughness,
        metalness: def.metalness,
        emissive: def.color,
        emissiveIntensity: 0.06, // Creates dramatic realistic 3D day/night shading from central Sun
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = {
        id: def.id,
        title: def.title,
        badge: def.badge,
        subtitle: def.subtitle,
        type: def.type,
        color: def.hexColor,
        description: def.description,
        project: def.project,
        certificate: def.certificate,
      };
      scene.add(mesh);
      interactiveMeshes.push(mesh);

      // Atmospheric Rim for planets with atmospheres (omit for airless Mercury & Moon)
      if (def.textureType !== 'mercury' && def.textureType !== 'moon') {
        const atmosGeo = new THREE.SphereGeometry(def.radius * 1.10, 32, 32);
        const atmosMat = new THREE.MeshBasicMaterial({
          color: def.color,
          side: THREE.BackSide,
          transparent: true,
          opacity: def.textureType === 'venus' ? 0.38 : 0.24,
          blending: THREE.AdditiveBlending,
        });
        const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
        mesh.add(atmosMesh);
      }

      // Distinct, elegant concentric planetary rings with Cassini division (Saturn only)
      if (def.hasRings) {
        const ringTexture = createPlanetaryRingTexture('gold');
        const innerR = def.radius * 1.5;
        const outerR = def.radius * 2.8;
        const ringGeo = new THREE.RingGeometry(innerR, outerR, 96);

        // Adjust UV mapping so texture bands repeat radially around ring circumference
        const pos = ringGeo.attributes.position;
        const uvs = ringGeo.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vy = pos.getY(i);
          const r = Math.sqrt(vx * vx + vy * vy);
          const normR = (r - innerR) / (outerR - innerR);
          uvs.setXY(i, normR, 0.5);
        }
        uvs.needsUpdate = true;

        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTexture,
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.94,
          roughness: 0.35,
          metalness: 0.15,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI * 0.44;
        ringMesh.rotation.y = Math.PI * 0.10;
        mesh.add(ringMesh);
      }

      planetObjects.push({
        mesh,
        def,
        angle: def.angle,
        speed: def.speed,
        orbitRadius: def.orbitRadius,
      });
    });

    // 7. INTERACTION: RAYCASTER FOR 3D CAMERA TRAVEL & HOVER
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const flyToTarget = (targetMesh: THREE.Mesh) => {
      const targetWorldPos = new THREE.Vector3();
      targetMesh.getWorldPosition(targetWorldPos);

      setIsTraveling(true);

      const offset =
        targetMesh.userData.id === 'journey'
          ? new THREE.Vector3(0, 1.2, 5.8)
          : new THREE.Vector3(1.3, 0.9, 3.6);

      cameraTarget.pos.copy(targetWorldPos).add(offset);
      cameraTarget.lookAt.copy(targetWorldPos);

      setTimeout(() => {
        setSelectedDestination({
          id: targetMesh.userData.id,
          title: targetMesh.userData.title,
          subtitle: targetMesh.userData.subtitle,
          type: targetMesh.userData.type,
          color: targetMesh.userData.color,
          description: targetMesh.userData.description,
          project: targetMesh.userData.project,
          certificate: targetMesh.userData.certificate,
        });
        setIsTraveling(false);
      }, 720);
    };

    triggerFlightToPlanetRef.current = (id: string) => {
      const mesh = interactiveMeshes.find((m) => m.userData.id === id);
      if (mesh) flyToTarget(mesh);
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);
      if (intersects.length > 0) {
        const target = intersects[0].object as THREE.Mesh;
        setHoveredBodyName(target.userData.title || null);
        if (!document.body.classList.contains('cursor-active')) {
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredBodyName(null);
        if (!document.body.classList.contains('cursor-active')) {
          container.style.cursor = 'default';
        }
      }
    };

    const onPointerClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);
      if (intersects.length > 0) {
        const target = intersects[0].object as THREE.Mesh;
        flyToTarget(target);
      }
    };

    container.addEventListener('mousemove', onPointerMove, { passive: true });
    container.addEventListener('click', onPointerClick);

    // Return to Solar System camera function
    triggerCameraReturnRef.current = () => {
      setSelectedDestination(null);
      setIsTraveling(true);
      cameraTarget.pos.copy(defaultCameraPos);
      cameraTarget.lookAt.copy(defaultLookAt);

      setTimeout(() => {
        setIsTraveling(false);
      }, 650);
    };

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 8. CONTINUOUS ORBITAL MOTION & SCREEN LABEL TRACKING
    let animationFrameId: number;
    const clock = new THREE.Clock();
    const currentLookAt = defaultLookAt.clone();
    let frameCounter = 0;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      frameCounter++;

      // Active Natural Round Starfield drift & gentle twinkling
      starPoints.rotation.y = elapsedTime * 0.008;
      starPoints.rotation.x = Math.sin(elapsedTime * 0.005) * 0.02;
      heroStarPoints.rotation.y = elapsedTime * 0.005;

      // Subtle natural twinkling for field stars and distant clusters
      starMat.opacity = 0.82 + Math.sin(elapsedTime * 1.6) * 0.12;
      heroStarMat.opacity = 0.78 + Math.cos(elapsedTime * 2.1) * 0.16;
      clusterMat.opacity = 0.76 + Math.sin(elapsedTime * 1.8) * 0.14;

      // Gentle deep-space parallax drift for 3D nebula clouds
      nebulaGroup.rotation.z = Math.sin(elapsedTime * 0.04) * 0.02;

      // Realistic tumbling and rotation of asteroid belt
      asteroidBelt.rotation.y = elapsedTime * 0.006;

      // CONTINUOUS PLANET ORBITS: NEVER HALTS ON POINTER HOVER
      planetObjects.forEach((p) => {
        p.angle += p.speed;
        const x = Math.cos(p.angle) * p.orbitRadius;
        const z = Math.sin(p.angle) * (p.orbitRadius * 0.94);
        p.mesh.position.set(x, 0, z);
        p.mesh.rotation.y += 0.016;
      });

      // Sun pulse & solar flare corona flares
      sunMesh.rotation.y += 0.005;
      const coronaScale = 1.0 + Math.sin(elapsedTime * 2.4) * 0.06;
      coronaMesh.scale.set(coronaScale, coronaScale, coronaScale);

      const outerCoronaScale = 1.0 + Math.sin(elapsedTime * 1.8 + 0.8) * 0.07;
      outerCoronaMesh.scale.set(outerCoronaScale, outerCoronaScale, outerCoronaScale);

      solarRaysMesh.rotation.z = elapsedTime * 0.008;

      // Smooth 3D Camera Travel Animation (Lerp)
      camera.position.lerp(cameraTarget.pos, 0.082);
      currentLookAt.lerp(cameraTarget.lookAt, 0.088);
      camera.lookAt(currentLookAt);

      // Real-time Screen Coordinates for Planet Labels via direct hardware-accelerated DOM transforms
      const sunLabelEl = document.getElementById('celestial-label-journey');
      if (sunLabelEl) {
        const sunWorldPos = new THREE.Vector3();
        sunMesh.getWorldPosition(sunWorldPos);
        const sunScreenPos = sunWorldPos.clone().project(camera);
        if (sunScreenPos.z < 1) {
          const sx = (sunScreenPos.x * 0.5 + 0.5) * width;
          const sy = (-sunScreenPos.y * 0.5 + 0.5) * height;
          sunLabelEl.style.transform = `translate3d(${Math.round(sx)}px, ${Math.round(sy)}px, 0) translate(-50%, -50%)`;
          sunLabelEl.style.opacity = '1';
          sunLabelEl.style.pointerEvents = 'auto';
        } else {
          sunLabelEl.style.opacity = '0';
          sunLabelEl.style.pointerEvents = 'none';
        }
      }

      planetObjects.forEach((p) => {
        const labelEl = document.getElementById(`celestial-label-${p.def.id}`);
        if (labelEl) {
          const worldPos = new THREE.Vector3();
          p.mesh.getWorldPosition(worldPos);
          const screenPos = worldPos.clone().project(camera);

          if (screenPos.z < 1 && screenPos.x >= -1.15 && screenPos.x <= 1.15 && screenPos.y >= -1.15 && screenPos.y <= 1.15) {
            const lx = (screenPos.x * 0.5 + 0.5) * width;
            const ly = (-screenPos.y * 0.5 + 0.5) * height + 26;
            labelEl.style.transform = `translate3d(${Math.round(lx)}px, ${Math.round(ly)}px, 0) translate(-50%, 0)`;
            labelEl.style.opacity = '1';
            labelEl.style.pointerEvents = 'auto';
          } else {
            labelEl.style.opacity = '0';
            labelEl.style.pointerEvents = 'none';
          }
        }
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onPointerClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [projects, certificates, skills]);

  const handleReturnToOrbit = useCallback(() => {
    triggerCameraReturnRef.current?.();
  }, []);

  const handleLabelClick = (id: string) => {
    triggerFlightToPlanetRef.current?.(id);
  };

  const handleJumpToSection = (targetId: string) => {
    onSelectCategory(targetId);
    handleReturnToOrbit();
  };

  // Keyboard shortcut: ESC to return to orbit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedDestination) {
        handleReturnToOrbit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDestination, handleReturnToOrbit]);

  const navItems = [
    { label: 'Home', id: 'home', icon: Home, active: true },
    { label: 'Projects', id: 'projects', icon: Briefcase },
    { label: 'Certificates', id: 'certificates', icon: Award },
    { label: 'Skills', id: 'skills', icon: Sparkles },
    { label: 'About Me', id: 'about', icon: User },
    { label: 'Contact', id: 'contact', icon: Mail },
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '740px',
        overflow: 'hidden',
      }}
    >
      {/* ─── 1. 3D WEBGL SOLAR SYSTEM CANVAS ─── */}
      <div
        ref={mountRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
        }}
      />

      {/* ─── 2. TOP HEADER & IDENTITY (MATCHING REFERENCE UPPER SECTION) ─── */}
      <div
        style={{
          position: 'absolute',
          top: '84px',
          left: '32px',
          right: '32px',
          zIndex: 40,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        {/* Top-Left: Portfolio Identity & Planet Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            pointerEvents: 'auto',
            cursor: 'pointer',
          }}
          onClick={() => handleScrollToSection('home')}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #00f0ff, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.45)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '56px',
                height: '18px',
                border: '2px solid rgba(0, 240, 255, 0.85)',
                borderRadius: '50%',
                transform: 'rotate(-25deg)',
                pointerEvents: 'none',
              }}
            />
          </div>
          <div>
            <h1
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              My Portfolio
            </h1>
            <p
              style={{
                fontSize: '0.78rem',
                color: '#94a3b8',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              Explore My Universe
            </p>
          </div>
        </div>

        {/* Top-Center: Centered Greeting ("Hi, I'm Elgin ✦") */}
        <div
          style={{
            textAlign: 'center',
            maxWidth: '600px',
            pointerEvents: 'none',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
              color: '#ffffff',
            }}
          >
            Hi, I&apos;m{' '}
            <span
              style={{
                color: '#38bdf8',
                textShadow: '0 0 20px rgba(56, 189, 248, 0.65)',
              }}
            >
              {ownerName}
            </span>{' '}
            <span style={{ color: '#38bdf8' }}>✦</span>
          </h2>
          <p
            style={{
              fontSize: '0.92rem',
              color: '#94a3b8',
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            Welcome to my digital universe! Explore my projects, certificates and journey.
          </p>
        </div>

        {/* Top-Right: Choose Theme & Audio Control */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginRight: '4px' }}>
              Choose Theme:
            </span>

            {/* Space Theme (Active) */}
            <button
              onClick={() => onThemeChange?.('space')}
              title="Space Theme"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #00f0ff, #1e3a8a)',
                border: '2px solid #00f0ff',
                boxShadow: '0 0 16px rgba(0, 240, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Rocket size={17} />
            </button>

            {/* Professional Theme */}
            <button
              onClick={() => onThemeChange?.('professional')}
              title="Professional Theme (Clean White & Snow)"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #ffffff, #94a3b8)',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: 0.85,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
            >
              <Briefcase size={16} />
            </button>

            {/* Study Theme */}
            <button
              onClick={() => onThemeChange?.('study')}
              title="Study Theme (Warm Cream & Amber)"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #f59e0b, #78350f)',
                border: '1.5px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: 0.85,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
            >
              <BookOpen size={16} />
            </button>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={handleToggleSound}
            title={isAudioPlaying ? 'Mute Cosmic Ambient Sound' : 'Play Cosmic Ambient Sound'}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: isAudioPlaying ? 'rgba(0, 240, 255, 0.2)' : 'rgba(10, 16, 44, 0.8)',
              border: `1.5px solid ${isAudioPlaying ? '#00f0ff' : 'rgba(255, 255, 255, 0.25)'}`,
              color: isAudioPlaying ? '#00f0ff' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isAudioPlaying ? '0 0 16px rgba(0, 240, 255, 0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {isAudioPlaying ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
        </div>
      </div>

      {/* ─── 3. LEFT VERTICAL SIDEBAR DOCK (MATCHING REFERENCE) ─── */}
      <aside
        style={{
          position: 'absolute',
          top: '158px',
          left: '32px',
          zIndex: 40,
          background: 'rgba(8, 14, 38, 0.78)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(56, 189, 248, 0.22)',
          borderRadius: '18px',
          padding: '10px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          width: '160px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.55), 0 0 20px rgba(56, 189, 248, 0.1)',
        }}
        className="space-sidebar"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          return (
            <button
              key={item.id}
              onClick={() => handleScrollToSection(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: isActive
                  ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                  : 'transparent',
                color: isActive ? '#ffffff' : '#cbd5e1',
                fontSize: '0.86rem',
                fontWeight: isActive ? 700 : 600,
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
                boxShadow: isActive ? '0 4px 16px rgba(37, 99, 235, 0.5)' : 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#cbd5e1';
                }
              }}
            >
              <Icon size={16} style={{ color: isActive ? '#ffffff' : '#38bdf8' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </aside>

      {/* ─── 4. REAL-TIME 3D TRACKED PLANET LABELS (MATCHING REFERENCE BADGES) ─── */}
      {!selectedDestination && (
        <div
          ref={labelsContainerRef}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 35,
          }}
        >
          {registeredLabels.map((lbl) => {
            const isSun = lbl.id === 'journey';
            if (isSun) {
              return (
                <div
                  id="celestial-label-journey"
                  key={lbl.id}
                  onClick={() => handleLabelClick(lbl.id)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: 'translate3d(-9999px, -9999px, 0)',
                    willChange: 'transform',
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    textAlign: 'center',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    background: 'rgba(12, 8, 3, 0.40)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    border: '1px solid rgba(251, 191, 36, 0.55)',
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.35)',
                    transition: 'opacity 0.2s ease, filter 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                >
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '0.02em',
                      textShadow: '0 0 10px rgba(251, 191, 36, 0.85)',
                    }}
                  >
                    My Journey
                  </div>
                  <div
                    style={{
                      fontSize: '0.60rem',
                      fontWeight: 700,
                      color: '#fbbf24',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Explore • Learn • Build
                  </div>
                </div>
              );
            }

            return (
              <div
                id={`celestial-label-${lbl.id}`}
                key={lbl.id}
                onClick={() => handleLabelClick(lbl.id)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: 'translate3d(-9999px, -9999px, 0)',
                  willChange: 'transform',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
              >
                <div
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    color: '#f8fafc',
                    whiteSpace: 'nowrap',
                    textShadow: `0 0 10px rgba(0, 0, 0, 0.9), 0 0 16px ${lbl.color}88`,
                  }}
                >
                  {lbl.title}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: 'rgba(6, 12, 32, 0.88)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${lbl.color}88`,
                    color: lbl.color,
                    boxShadow: `0 2px 10px rgba(0, 0, 0, 0.6), 0 0 8px ${lbl.color}33`,
                  }}
                >
                  <span>{lbl.badge}</span>
                  <span style={{ fontSize: '0.72rem' }}>↗</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── 5. BOTTOM PANELS (SCROLL INDICATOR LEFT + SINGLE ANIMATED IRIS RIGHT) ─── */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '32px',
          right: '32px',
          zIndex: 40,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        {/* Bottom-Left: Scroll Indicator */}
        <div
          onClick={() => handleScrollToSection('projects')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'auto',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, opacity 0.2s ease',
            opacity: 0.9,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.opacity = '0.9';
          }}
        >
          <div
            style={{
              width: '22px',
              height: '34px',
              borderRadius: '12px',
              border: '2px solid rgba(255, 255, 255, 0.55)',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '6px',
              boxShadow: '0 0 12px rgba(255, 255, 255, 0.2)',
            }}
          >
            <div
              style={{
                width: '4px',
                height: '8px',
                borderRadius: '9999px',
                background: '#ffffff',
                animation: 'irisFloat 1.6s infinite ease-in-out',
              }}
            />
          </div>
          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#e2e8f0', letterSpacing: '0.02em' }}>
            Scroll to explore
          </span>
          <ChevronDown size={14} style={{ color: '#94a3b8', marginTop: '-4px' }} />
        </div>

        {/* Bottom-Right: Single Richly-Animated Iris + Speech Bubble */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '14px',
            pointerEvents: 'auto',
            position: 'relative',
            flexDirection: 'row-reverse',
          }}
        >
          {/* === SINGLE ANIMATED IRIS MASCOT === */}
          {/* Outer wrapper handles float + gentle sway */}
          <div
            style={{
              animation: 'irisFloatRich 4.5s ease-in-out infinite, irisBodySway 7s ease-in-out infinite',
              transformOrigin: 'bottom center',
              position: 'relative',
            }}
          >
            {/* Inner wrapper handles breathe scale + mouse-tracking */}
            <div
              ref={irisMascotRef}
              onClick={() => { handleIrisClick(); handleOpenIrisChat(); }}
              title="Click to chat with Iris!"
              style={{
                position: 'relative',
                width: '140px',
                height: '168px',
                cursor: 'pointer',
                filter: isIrisHovered
                  ? 'drop-shadow(0 0 28px rgba(0, 240, 255, 0.95)) drop-shadow(0 12px 24px rgba(0, 0, 0, 0.85))'
                  : 'drop-shadow(0 0 18px rgba(0, 240, 255, 0.6)) drop-shadow(0 8px 18px rgba(0, 0, 0, 0.75))',
                transform: `scale(${isIrisBouncing ? 1.18 : isIrisHovered ? 1.06 : 1
                  }) rotateY(${irisLookOffset.x}deg) rotateX(${-irisLookOffset.y}deg)`,
                transition: isIrisBouncing
                  ? 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease'
                  : 'transform 0.25s ease, filter 0.25s ease',
                animation: 'irisBodyBreathe 3.2s ease-in-out infinite',
              }}
              onMouseEnter={() => setIsIrisHovered(true)}
              onMouseLeave={() => setIsIrisHovered(false)}
            >
              {/* Eyes-open layer */}
              <Image
                src="/assets/mascot/iris_space_open.png"
                alt="Iris AI Companion"
                fill
                style={{
                  objectFit: 'contain',
                  opacity: isIrisBlinking ? 0 : 1,
                  transition: 'opacity 0.06s ease',
                }}
                priority
              />
              {/* Eyes-closed blink layer */}
              <Image
                src="/assets/mascot/iris_space_blink.png"
                alt="Iris AI Companion (Blink)"
                fill
                style={{
                  objectFit: 'contain',
                  opacity: isIrisBlinking ? 1 : 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.06s ease',
                }}
                priority
              />
              {/* Sparkle burst on click */}
              {isIrisBouncing && (
                <div
                  key={irisSparkleKey}
                  style={{
                    position: 'absolute',
                    inset: '-20px',
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{ position: 'absolute', top: '0px', left: '12px', color: '#00f0ff', fontSize: '1.3rem', animation: 'irisSparkleFade 0.7s ease forwards' }}>✦</span>
                  <span style={{ position: 'absolute', top: '10px', right: '8px', color: '#fde047', fontSize: '1.5rem', animation: 'irisSparkleFade 0.75s 0.05s ease forwards' }}>✨</span>
                  <span style={{ position: 'absolute', bottom: '30px', left: '2px', color: '#a855f7', fontSize: '1.1rem', animation: 'irisSparkleFade 0.65s 0.1s ease forwards' }}>💫</span>
                  <span style={{ position: 'absolute', top: '-5px', right: '20px', color: '#f472b6', fontSize: '1rem', animation: 'irisSparkleFade 0.6s 0.15s ease forwards' }}>⭐</span>
                </div>
              )}
            </div>
          </div>

          {/* Speech bubble (left of Iris) */}
          <div
            onClick={handleOpenIrisChat}
            style={{
              background: 'rgba(8, 14, 38, 0.88)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(56, 189, 248, 0.38)',
              borderRadius: '16px',
              borderBottomRightRadius: '4px',
              padding: '12px 16px',
              maxWidth: '240px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.65), 0 0 18px rgba(56, 189, 248, 0.2)',
              transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
              marginBottom: '24px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00f0ff';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.65), 0 0 28px rgba(0,240,255,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.38)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.65), 0 0 18px rgba(56,189,248,0.2)';
            }}
            title="Click to chat with Iris!"
          >
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Hi! I&apos;m Iris</span>
              <span style={{ color: '#00f0ff' }}>✦</span>
              <span
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: 'rgba(0, 240, 255, 0.15)',
                  color: '#38bdf8',
                  letterSpacing: '0.05em',
                }}
              >
                AI CHAT
              </span>
            </div>
            <p style={{ fontSize: '0.77rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              {irisSpeeches[irisSpeechIndex]}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 6. DEDICATED 3D CELESTIAL SHOWCASE MODAL ─── */}
      {selectedDestination && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedDestination.title}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(4, 7, 20, 0.92)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '820px',
              borderRadius: '24px',
              background: 'linear-gradient(145deg, rgba(13, 20, 52, 0.96), rgba(8, 12, 34, 0.98))',
              border: `1.5px solid ${selectedDestination.color || '#00f0ff'}88`,
              boxShadow: `0 20px 50px -10px rgba(0, 0, 0, 0.85), 0 0 40px ${selectedDestination.color || '#00f0ff'}33`,
              padding: 'clamp(20px, 4vw, 36px)',
              overflow: 'hidden',
              animation: 'heroEntrance 0.38s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            {/* Header: Celestial Destination Reached & Return to Orbit Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: selectedDestination.color || '#00f0ff',
                    boxShadow: `0 0 12px ${selectedDestination.color || '#00f0ff'}`,
                  }}
                />
                <span
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: selectedDestination.color || '#00f0ff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  3D Planet Travel Reached • {selectedDestination.type}
                </span>
              </div>

              {/* Return to Solar System Orbit Button */}
              <button
                onClick={handleReturnToOrbit}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                  e.currentTarget.style.borderColor = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                }}
              >
                <RotateCcw size={15} />
                <span>Return to Orbit View (Esc)</span>
              </button>
            </div>

            {/* Destination Content */}
            <div>
              <h2
                style={{
                  fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)',
                  fontWeight: 800,
                  color: '#f8fafc',
                  marginBottom: '8px',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {selectedDestination.title}
              </h2>

              <p
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: selectedDestination.color || '#38bdf8',
                  marginBottom: '16px',
                }}
              >
                {selectedDestination.subtitle}
              </p>

              <p
                style={{
                  fontSize: '0.98rem',
                  color: '#cbd5e1',
                  lineHeight: 1.75,
                  marginBottom: '22px',
                }}
              >
                {selectedDestination.description}
              </p>

              {/* VERIFIED PROJECT DETAILS SHOWCASE */}
              {selectedDestination.project && (
                <div
                  style={{
                    background: 'rgba(6, 12, 32, 0.85)',
                    borderRadius: '16px',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    padding: '22px',
                    marginBottom: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={18} style={{ color: selectedDestination.color || '#38bdf8' }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e0f2fe' }}>
                        {selectedDestination.project.verified_dates || 'Verified Platform Project'}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        background:
                          selectedDestination.id === 'recircuit' || selectedDestination.id === 'proj_recircuit'
                            ? 'rgba(16, 185, 129, 0.22)'
                            : 'rgba(0, 240, 255, 0.15)',
                        color:
                          selectedDestination.id === 'recircuit' || selectedDestination.id === 'proj_recircuit'
                            ? '#34d399'
                            : '#00f0ff',
                        border:
                          selectedDestination.id === 'recircuit' || selectedDestination.id === 'proj_recircuit'
                            ? '1px solid rgba(52, 211, 153, 0.65)'
                            : '1px solid rgba(0, 240, 255, 0.3)',
                        fontWeight: 700,
                      }}
                    >
                      {selectedDestination.id === 'recircuit' || selectedDestination.id === 'proj_recircuit'
                        ? '🟢 Currently Building / In Development'
                        : 'Verified Project'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.94rem', color: '#cbd5e1', lineHeight: 1.65 }}>
                    {selectedDestination.project.description || selectedDestination.project.summary}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8' }}>
                      Tech Stack:
                    </span>
                    {(selectedDestination.project.tech_stack || 'JavaScript, Python')
                      .split(',')
                      .map((tech, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            background: `${selectedDestination.color || '#38bdf8'}22`,
                            border: `1px solid ${selectedDestination.color || '#38bdf8'}55`,
                            color: selectedDestination.color || '#38bdf8',
                          }}
                        >
                          {tech.trim()}
                        </span>
                      ))}
                  </div>

                  {/* External Project Links if available */}
                  {(selectedDestination.project.demo_url || selectedDestination.project.repo_url) && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                      {selectedDestination.project.demo_url && (
                        <a
                          href={selectedDestination.project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        >
                          <ExternalLink size={14} />
                          <span>Live Demo</span>
                        </a>
                      )}
                      {selectedDestination.project.repo_url && (
                        <a
                          href={selectedDestination.project.repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        >
                          <Code2 size={14} />
                          <span>View Repository</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '20px',
                }}
              >
                <button
                  onClick={handleReturnToOrbit}
                  className="btn-primary"
                  style={{
                    background: `linear-gradient(135deg, ${selectedDestination.color || '#00f0ff'}, #a855f7)`,
                  }}
                >
                  <RotateCcw size={16} />
                  <span>Return to Solar System</span>
                </button>

                <button
                  onClick={() => handleJumpToSection(selectedDestination.project ? 'projects' : 'skills')}
                  className="btn-secondary"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                  }}
                >
                  <span>Scroll to Section Details</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .space-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
