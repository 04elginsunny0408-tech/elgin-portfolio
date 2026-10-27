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

// Procedural procedural texture generator for rich planet surfaces
function createPlanetTexture(
  type: 'earth' | 'tech' | 'cyber' | 'gas' | 'coral' | 'electric' | 'violet' | 'mint' | 'moon'
): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture(null as any);
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  if (type === 'earth') {
    // Azure ocean base with India/continental landmass swirls
    ctx.fillStyle = '#062038';
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = '#0284c7';
    for (let i = 0; i < 35; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const r = Math.random() * 45 + 15;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Atmospheric white & cyan cloud swirl bands
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    for (let i = 0; i < 28; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      ctx.beginPath();
      ctx.ellipse(x, y, Math.random() * 75 + 25, Math.random() * 16 + 6, Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'tech') {
    // Deep emerald cyber base with glowing matrix circuit traces
    ctx.fillStyle = '#032514';
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
    ctx.fillStyle = '#34d399';
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(Math.random() * 16) * 32;
      const y = Math.floor(Math.random() * 8) * 32;
      ctx.fillRect(x + 2, y + 2, 28, 28);
    }
  } else if (type === 'cyber') {
    // Deep cosmic violet/indigo with energetic plasma streaks
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#2e1065');
    grad.addColorStop(0.5, '#581c87');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      ctx.beginPath();
      ctx.ellipse(x, y, Math.random() * 60 + 20, Math.random() * 20 + 8, 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'gas') {
    // Golden amber horizontal banded gas giant like Saturn
    for (let y = 0; y < 256; y += 4) {
      const hue = Math.sin(y * 0.05) * 15 + 38;
      const light = 50 + Math.cos(y * 0.08) * 20;
      ctx.fillStyle = `hsl(${hue}, 88%, ${light}%)`;
      ctx.fillRect(0, y, 512, 4);
    }
  } else if (type === 'coral') {
    // Fiery ruby/crimson coral sphere for hackathon achievement
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#7f1d1d');
    grad.addColorStop(0.5, '#b91c1c');
    grad.addColorStop(1, '#ea580c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = 'rgba(251, 146, 60, 0.45)';
    for (let i = 0; i < 35; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 22 + 8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'electric') {
    // Electric blue quantum bands for React
    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, '#0c4a6e');
    grad.addColorStop(0.5, '#0284c7');
    grad.addColorStop(1, '#0369a1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 16 + 6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'violet') {
    // Violet matrix sphere for Core Web Dev
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = 'rgba(192, 132, 252, 0.5)';
    for (let y = 0; y < 256; y += 8) {
      ctx.fillRect(0, y, 512, 3);
    }
  } else if (type === 'mint') {
    // Neon mint green for Node.js
    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(0.5, '#059669');
    grad.addColorStop(1, '#047857');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = 'rgba(52, 211, 153, 0.5)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 18 + 5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Cratered silver moon for Git & Tools
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = '#64748b';
    for (let i = 0; i < 45; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 18 + 4, 0, Math.PI * 2);
      ctx.fill();
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

  // References for camera transitions
  const triggerCameraReturnRef = useRef<(() => void) | null>(null);
  const triggerFlightToPlanetRef = useRef<((id: string) => void) | null>(null);

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

    // 4. ACTIVE 3D STARFIELD (2,000 multi-colored stars with galactic flattening)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x00f0ff),
      new THREE.Color(0xa855f7),
      new THREE.Color(0xfbbf24),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xf43f5e),
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 55 + Math.random() * 95;
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
      size: 1.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Asteroid Belt Particles floating in the orbital plane
    const asteroidGeo = new THREE.BufferGeometry();
    const asteroidCount = 420;
    const asteroidPos = new Float32Array(asteroidCount * 3);
    for (let i = 0; i < asteroidCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 13.5 + (Math.random() - 0.5) * 2.2;
      asteroidPos[i * 3] = Math.cos(angle) * dist;
      asteroidPos[i * 3 + 1] = (Math.random() - 0.5) * 0.85;
      asteroidPos[i * 3 + 2] = Math.sin(angle) * (dist * 0.94);
    }
    asteroidGeo.setAttribute('position', new THREE.BufferAttribute(asteroidPos, 3));
    const asteroidMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.9, transparent: true, opacity: 0.65 });
    const asteroidBelt = new THREE.Points(asteroidGeo, asteroidMat);
    scene.add(asteroidBelt);

    // 5. CENTRAL LUMINOUS SUN: "MY JOURNEY" (Explore • Learn • Build)
    const sunGroup = new THREE.Group();
    scene.add(sunGroup);

    const sunGeo = new THREE.SphereGeometry(2.5, 48, 48);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
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

    // Corona flare loops
    const coronaGeo = new THREE.SphereGeometry(2.95, 36, 36);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xea580c,
      transparent: true,
      opacity: 0.45,
      side: THREE.BackSide,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    sunGroup.add(coronaMesh);

    // Luminous atmosphere
    const outerCoronaGeo = new THREE.SphereGeometry(3.35, 32, 32);
    const outerCoronaMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
    });
    const outerCoronaMesh = new THREE.Mesh(outerCoronaGeo, outerCoronaMat);
    sunGroup.add(outerCoronaMesh);

    // 6. VERIFIED DYNAMIC PLANETS MAPPED STRICTLY TO REAL PORTFOLIO DATA
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

    // Planet 1: Bharat Yatra (Featured Project - Azure with Rings & India Gate insignia)
    const byProj = verifiedProjects.find((p) => p.slug === 'bharat-yatra') || verifiedProjects[0];
    dynamicPlanets.push({
      id: byProj.id || 'bharat-yatra',
      slug: byProj.slug,
      title: byProj.title,
      badge: 'Project',
      subtitle: 'Smart India Hackathon Tourism Platform',
      type: 'Verified Project',
      color: 0x38bdf8,
      hexColor: '#38bdf8',
      radius: 1.45,
      orbitRadius: 7.2,
      speed: 0.0072,
      angle: 0.7,
      textureType: 'earth' as const,
      hasRings: true,
      roughness: 0.22,
      metalness: 0.35,
      project: byProj,
      description: byProj.description || byProj.summary,
    });

    // Planet 2: ReCircuit (Emerald Tech Sphere - Currently Building / In Development)
    const rcProj = verifiedProjects.find((p) => p.slug === 'recircuit') || verifiedProjects[1] || verifiedProjects[0];
    dynamicPlanets.push({
      id: rcProj.id || 'recircuit',
      slug: rcProj.slug,
      title: rcProj.title,
      badge: 'Currently Building',
      subtitle: 'Currently Building: AI E-Waste Recovery',
      type: 'Currently Building / In Development',
      color: 0x10b981,
      hexColor: '#10b981',
      radius: 1.35,
      orbitRadius: 10.2,
      speed: 0.0054,
      angle: 2.7,
      textureType: 'tech' as const,
      hasRings: false,
      roughness: 0.18,
      metalness: 0.4,
      project: rcProj,
      description: rcProj.description || rcProj.summary,
    });

    // Planet 3: AI Chat Assistant (Verified Project - Royal Purple Sphere with code/chat icon)
    const aiProj = verifiedProjects.find((p) => p.slug === 'ai-chat-assistant') || verifiedProjects[2] || verifiedProjects[0];
    dynamicPlanets.push({
      id: aiProj.id || 'ai-chat-assistant',
      slug: aiProj.slug,
      title: aiProj.title,
      badge: 'Project',
      subtitle: 'Groq LLM Conversational Agent',
      type: 'Verified Project',
      color: 0xa855f7,
      hexColor: '#a855f7',
      radius: 1.3,
      orbitRadius: 13.8,
      speed: 0.0042,
      angle: 4.5,
      textureType: 'cyber' as const,
      hasRings: true,
      roughness: 0.2,
      metalness: 0.35,
      project: aiProj,
      description: aiProj.description || aiProj.summary,
    });

    // Planet 4: Python Programming (Verified Certificate - Golden Gas Giant with Rings)
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
      subtitle: `${pyCert.issuer} • ${pyCert.issue_date || 'Verified'}`,
      type: 'Verified Certificate',
      color: 0xf59e0b,
      hexColor: '#f59e0b',
      radius: 1.3,
      orbitRadius: 17.5,
      speed: 0.0032,
      angle: 1.6,
      textureType: 'gas' as const,
      hasRings: true,
      roughness: 0.25,
      metalness: 0.2,
      certificate: pyCert,
      description: `Verified competency credential in ${pyCert.skills_verified || 'Python, data structures, and algorithmic engineering'}.`,
    });

    // Planet 5: Smart India Hackathon Finalist (Verified Certificate - Coral/Ruby Achievement Sphere)
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
      subtitle: `${sihCert.issuer} • ${sihCert.issue_date || '2024'}`,
      type: 'Verified Certificate',
      color: 0xf43f5e,
      hexColor: '#f43f5e',
      radius: 1.2,
      orbitRadius: 21.0,
      speed: 0.0026,
      angle: 3.4,
      textureType: 'coral' as const,
      hasRings: false,
      roughness: 0.24,
      metalness: 0.3,
      certificate: sihCert,
      description: `Smart India Hackathon national finalist credential for the Bharat Yatra cultural tourism platform.`,
    });

    // Planet 6: React / Next.js (Verified Skill - Electric Cyan Sphere)
    dynamicPlanets.push({
      id: 'skill_react',
      title: 'React / Next.js',
      badge: 'Skill',
      subtitle: '80% Proficiency • Modern Fullstack Architecture',
      type: 'Verified Skill',
      color: 0x06b6d4,
      hexColor: '#06b6d4',
      radius: 1.15,
      orbitRadius: 24.5,
      speed: 0.0022,
      angle: 5.2,
      textureType: 'electric' as const,
      hasRings: false,
      roughness: 0.28,
      metalness: 0.25,
      description: 'Component architecture, SSR/SSG rendering pipelines, Next.js 15 App Router, and dynamic state management.',
    });

    // Planet 7: Core Web Dev (Verified Skill - JavaScript / TypeScript / HTML / CSS)
    dynamicPlanets.push({
      id: 'skill_core_web',
      title: 'Core Web Dev',
      badge: 'Skill',
      subtitle: 'JavaScript, TypeScript, HTML5 & CSS3',
      type: 'Verified Skill',
      color: 0x8b5cf6,
      hexColor: '#8b5cf6',
      radius: 1.1,
      orbitRadius: 28.0,
      speed: 0.0018,
      angle: 0.2,
      textureType: 'violet' as const,
      hasRings: false,
      roughness: 0.25,
      metalness: 0.2,
      description: 'Foundational web standards, TypeScript typing discipline, responsive layouts, and performance optimization.',
    });

    // Planet 8: Node.js Backend (Verified Skill - Mint Sphere)
    dynamicPlanets.push({
      id: 'skill_nodejs',
      title: 'Node.js Backend',
      badge: 'Skill',
      subtitle: '75% Proficiency • REST APIs & Services',
      type: 'Verified Skill',
      color: 0x10b981,
      hexColor: '#10b981',
      radius: 1.05,
      orbitRadius: 31.5,
      speed: 0.0015,
      angle: 2.1,
      textureType: 'mint' as const,
      hasRings: false,
      roughness: 0.3,
      metalness: 0.2,
      description: 'Server-side runtime, asynchronous event loops, SQLite data handling, and secure RESTful endpoint design.',
    });

    // Planet 9: Git & Developer Tools (Verified Skill - Silver Moon)
    dynamicPlanets.push({
      id: 'skill_git',
      title: 'Git & GitHub',
      badge: 'Skill',
      subtitle: '85% Proficiency • Version Control & Workflows',
      type: 'Verified Skill',
      color: 0x94a3b8,
      hexColor: '#94a3b8',
      radius: 1.0,
      orbitRadius: 35.0,
      speed: 0.0012,
      angle: 4.1,
      textureType: 'moon' as const,
      hasRings: false,
      roughness: 0.35,
      metalness: 0.25,
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
      const texture = createPlanetTexture(def.textureType);
      const geo = new THREE.SphereGeometry(def.radius, 48, 48);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        color: def.color,
        roughness: def.roughness,
        metalness: def.metalness,
        emissive: def.color,
        emissiveIntensity: 0.28,
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

      // Orbital rings for featured planets
      if (def.hasRings) {
        const ringGeo = new THREE.RingGeometry(def.radius * 1.5, def.radius * 2.35, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          color: def.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.72,
          roughness: 0.28,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI * 0.46;
        ringMesh.rotation.y = Math.PI * 0.08;
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
        container.style.cursor = 'pointer';
      } else {
        setHoveredBodyName(null);
        container.style.cursor = 'default';
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

      // Active Twinkling Starfield drift
      starPoints.rotation.y = elapsedTime * 0.012;
      starPoints.rotation.x = Math.sin(elapsedTime * 0.006) * 0.035;
      asteroidBelt.rotation.y = elapsedTime * 0.008;

      // CONTINUOUS PLANET ORBITS: NEVER HALTS ON POINTER HOVER
      planetObjects.forEach((p) => {
        p.angle += p.speed;
        const x = Math.cos(p.angle) * p.orbitRadius;
        const z = Math.sin(p.angle) * (p.orbitRadius * 0.94);
        p.mesh.position.set(x, 0, z);
        p.mesh.rotation.y += 0.016;
      });

      // Sun pulse
      sunMesh.rotation.y += 0.005;
      const coronaScale = 1.0 + Math.sin(elapsedTime * 2.4) * 0.06;
      coronaMesh.scale.set(coronaScale, coronaScale, coronaScale);

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
                    padding: '8px 18px',
                    borderRadius: '14px',
                    background: 'rgba(12, 10, 4, 0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '1.5px solid rgba(251, 191, 36, 0.8)',
                    boxShadow: '0 0 35px rgba(251, 191, 36, 0.45)',
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                >
                  <div
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    My Journey
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#fbbf24',
                      letterSpacing: '0.04em',
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

      {/* ─── 5. BOTTOM PANELS (EXACTLY MATCHING REFERENCE BOTTOM ROW) ─── */}
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
        {/* Bottom-Left: Authentic Iris Character & Translucent Greeting Panel */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            pointerEvents: 'auto',
            cursor: 'pointer',
          }}
          onClick={handleOpenIrisChat}
          title="Click to Chat with Iris AI!"
        >
          {/* Authentic Iris Spacesuit Mascot with Black Crown */}
          <div
            style={{
              position: 'relative',
              width: '85px',
              height: '85px',
              filter: 'drop-shadow(0 0 16px rgba(0, 240, 255, 0.55))',
              transition: 'transform 0.25s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) translateY(0)')}
          >
            <Image
              src="/assets/mascot/iris_space.webp"
              alt="Iris AI Companion"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>

          {/* Translucent Greeting Speech Bubble */}
          <div
            style={{
              background: 'rgba(8, 14, 38, 0.82)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '16px',
              padding: '12px 18px',
              maxWidth: '280px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 16px rgba(56, 189, 248, 0.15)',
              transition: 'border-color 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00f0ff';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                fontSize: '0.88rem',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Hi! I&apos;m Iris</span>
              <span style={{ color: '#00f0ff' }}>✦</span>
            </div>
            <p
              style={{
                fontSize: '0.78rem',
                color: '#cbd5e1',
                lineHeight: 1.35,
              }}
            >
              Click on any planet to explore {ownerName}&apos;s projects, certificates and more!
            </p>
          </div>
        </div>

        {/* Bottom-Center: Mouse Scroll Indicator ("Scroll to explore") */}
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
          {/* Mouse Pill Outline with Animated Dot */}
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

        {/* Bottom-Right: "My Solar System" Information Panel */}
        <div
          style={{
            background: 'rgba(8, 14, 38, 0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '16px',
            padding: '14px 18px',
            maxWidth: '300px',
            pointerEvents: 'auto',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 16px rgba(56, 189, 248, 0.1)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.18)',
              border: '1px solid #38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              flexShrink: 0,
              marginTop: '2px',
            }}
          >
            <Globe size={16} />
          </div>
          <div>
            <div
              style={{
                fontSize: '0.86rem',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '4px',
              }}
            >
              My Solar System
            </div>
            <p
              style={{
                fontSize: '0.76rem',
                color: '#94a3b8',
                lineHeight: 1.4,
              }}
            >
              Each planet represents a project, certificate or milestone in my journey. Click, explore, and discover more!
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
