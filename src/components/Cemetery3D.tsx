import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Grave } from '../types';
import { 
  Eye, 
  Compass, 
  RotateCcw, 
  Shuffle, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Sparkles,
  Flame,
  MousePointerClick
} from 'lucide-react';

interface Cemetery3DProps {
  graves: Grave[];
  onSelectGrave: (grave: Grave) => void;
  className?: string;
}

interface GraveMeshUserData {
  grave: Grave;
  originalY: number;
  beaconOrb: THREE.Mesh;
  beaconAura: THREE.Mesh;
  pointLight: THREE.PointLight;
  headstoneMesh: THREE.Mesh;
  stoneMaterial: THREE.MeshStandardMaterial;
  plateMaterial: THREE.MeshStandardMaterial;
  canvasTexture: THREE.CanvasTexture;
  index: number;
}

export const Cemetery3D: React.FC<Cemetery3DProps> = ({
  graves,
  onSelectGrave,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredGrave, setHoveredGrave] = useState<Grave | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // References for Three.js instance
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const graveGroupsRef = useRef<THREE.Group[]>([]);
  const clickableMeshesRef = useRef<THREE.Mesh[]>([]);
  const hoveredGroupRef = useRef<THREE.Group | null>(null);
  const reqAnimIdRef = useRef<number | null>(null);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Camera transition animation state
  const cameraTransitionRef = useRef<{
    active: boolean;
    startTime: number;
    duration: number;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
  } | null>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Web Audio synth helpers
  const playHoverSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Ignore audio failure
    }
  }, [soundEnabled]);

  const playSelectSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Spooky double bell chime
      [146.83, 220].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.98, ctx.currentTime + 1.2);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.2);
      });
    } catch {
      // Ignore
    }
  }, [soundEnabled]);

  // Smooth camera glider
  const animateCameraTo = useCallback((targetPos: THREE.Vector3, targetLookAt: THREE.Vector3, duration = 1200) => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraTransitionRef.current = {
      active: true,
      startTime: performance.now(),
      duration,
      startPos: cameraRef.current.position.clone(),
      endPos: targetPos,
      startTarget: controlsRef.current.target.clone(),
      endTarget: targetLookAt
    };
  }, []);

  // Quick Preset Actions
  const handlePresetOverview = () => {
    animateCameraTo(new THREE.Vector3(0, 24, 26), new THREE.Vector3(0, 0, 0), 1000);
  };

  const handlePresetWander = () => {
    animateCameraTo(new THREE.Vector3(0, 3.2, 14), new THREE.Vector3(0, 1.2, 0), 1200);
  };

  const handlePresetRandom = () => {
    if (graveGroupsRef.current.length === 0) return;
    const randomIndex = Math.floor(Math.random() * graveGroupsRef.current.length);
    const targetGroup = graveGroupsRef.current[randomIndex];
    const gravePos = targetGroup.position;
    const camPos = new THREE.Vector3(gravePos.x, gravePos.y + 2.5, gravePos.z + 5.5);
    const lookAtPos = new THREE.Vector3(gravePos.x, gravePos.y + 1.2, gravePos.z);
    animateCameraTo(camPos, lookAtPos, 1200);
  };

  const handlePresetReset = () => {
    animateCameraTo(new THREE.Vector3(0, 12, 22), new THREE.Vector3(0, 1.2, 0), 1000);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Main Three.js Scene Setup & Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x06080e);
    // Dark gothic exponential fog
    scene.fog = new THREE.FogExp2(0x06080e, 0.026);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 160);
    camera.position.set(0, 12, 22);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    // Clean any prior canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3.5;
    controls.maxDistance = 55;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Never dip underground
    controls.minPolarAngle = Math.PI / 10;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // 5. Lighting
    // Deep nocturnal ambient
    const ambientLight = new THREE.AmbientLight(0x181c2b, 0.9);
    scene.add(ambientLight);

    // Eerie cold moonlight
    const moonLight = new THREE.DirectionalLight(0xa5c4e8, 1.8);
    moonLight.position.set(-25, 38, -30);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    moonLight.shadow.camera.near = 10;
    moonLight.shadow.camera.far = 90;
    moonLight.shadow.camera.left = -25;
    moonLight.shadow.camera.right = 25;
    moonLight.shadow.camera.top = 25;
    moonLight.shadow.camera.bottom = -25;
    moonLight.shadow.bias = -0.0005;
    scene.add(moonLight);

    // Subtle crimson rim light from opposite angle for gothic contrast
    const rimLight = new THREE.DirectionalLight(0x992222, 0.6);
    rimLight.position.set(30, 15, 25);
    scene.add(rimLight);

    // 6. Ground Terrain with subtle undulating mounds
    const groundGeometry = new THREE.PlaneGeometry(110, 110, 64, 64);
    groundGeometry.rotateX(-Math.PI / 2);
    const posAttr = groundGeometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      // Gentle noise mounds
      const elev = Math.sin(vx * 0.12) * Math.cos(vz * 0.12) * 0.35 +
                   Math.sin(vx * 0.05 + 1.2) * Math.cos(vz * 0.06) * 0.5;
      posAttr.setY(i, elev);
    }
    groundGeometry.computeVertexNormals();

    // Procedural terrain texture
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 256;
    groundCanvas.height = 256;
    const gctx = groundCanvas.getContext('2d');
    if (gctx) {
      gctx.fillStyle = '#0f121a';
      gctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const radius = Math.random() * 1.5;
        gctx.fillStyle = Math.random() > 0.6 ? '#1b202c' : '#080a0f';
        gctx.beginPath();
        gctx.arc(x, y, radius, 0, Math.PI * 2);
        gctx.fill();
      }
    }
    const groundTexture = new THREE.CanvasTexture(groundCanvas);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(16, 16);

    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x131720,
      roughness: 0.92,
      metalness: 0.1,
      map: groundTexture
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // 7. Celestial Moon in the sky
    const moonGeo = new THREE.SphereGeometry(3.6, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xe6f0fa
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(-28, 42, -55);
    scene.add(moonMesh);

    // Moon Glow Billboard
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 128;
    haloCanvas.height = 128;
    const hctx = haloCanvas.getContext('2d');
    if (hctx) {
      const grad = hctx.createRadialGradient(64, 64, 10, 64, 64, 64);
      grad.addColorStop(0, 'rgba(210, 230, 255, 0.8)');
      grad.addColorStop(0.3, 'rgba(140, 180, 235, 0.3)');
      grad.addColorStop(0.7, 'rgba(80, 120, 200, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      hctx.fillStyle = grad;
      hctx.fillRect(0, 0, 128, 128);
    }
    const haloTexture = new THREE.CanvasTexture(haloCanvas);
    const haloMat = new THREE.SpriteMaterial({
      map: haloTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.9
    });
    const haloSprite = new THREE.Sprite(haloMat);
    haloSprite.scale.set(24, 24, 1);
    haloSprite.position.copy(moonMesh.position);
    scene.add(haloSprite);

    // 8. Gothic Scenery: Bare Dead Trees around perimeter
    const treeTrunkGeo = new THREE.CylinderGeometry(0.18, 0.35, 6, 7);
    const branchGeo = new THREE.CylinderGeometry(0.08, 0.16, 3.2, 5);
    const treeMat = new THREE.MeshStandardMaterial({
      color: 0x161414,
      roughness: 0.95
    });

    const createBareTree = (x: number, z: number, scale = 1) => {
      const treeGroup = new THREE.Group();
      const trunk = new THREE.Mesh(treeTrunkGeo, treeMat);
      trunk.position.y = 3;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Twisted branches
      const branchAngles = [0.4, -0.5, 0.7, -0.6];
      branchAngles.forEach((angle, idx) => {
        const b = new THREE.Mesh(branchGeo, treeMat);
        b.position.set(Math.sin(angle) * 0.4, 4 + idx * 0.4, Math.cos(angle) * 0.4);
        b.rotation.z = angle * 0.9;
        b.rotation.y = idx * 1.5;
        b.castShadow = true;
        treeGroup.add(b);
      });

      treeGroup.position.set(x, 0, z);
      treeGroup.scale.setScalar(scale);
      treeGroup.rotation.y = Math.random() * Math.PI * 2;
      return treeGroup;
    };

    const treePositions = [
      [-22, -20, 1.2], [22, -22, 1.1], [-25, 5, 1.3], [24, 8, 1.0],
      [-18, 22, 1.2], [18, 24, 1.1], [-30, -5, 1.4], [30, -8, 1.3]
    ];
    treePositions.forEach(([tx, tz, ts]) => {
      scene.add(createBareTree(tx, tz, ts));
    });

    // 9. Floating Glowing Soul Orbs (Green & Red Particles)
    const particleCount = 220;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particlePhases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 55;
      particlePositions[i * 3 + 1] = Math.random() * 14 + 0.2;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 55;

      particleSpeeds[i] = 0.4 + Math.random() * 0.6;
      particlePhases[i] = Math.random() * Math.PI * 2;

      // Half green souls (code/life), half red souls (abandoned/failure)
      if (i % 2 === 0) {
        // Spectral Green
        particleColors[i * 3] = 0.1;
        particleColors[i * 3 + 1] = 0.95;
        particleColors[i * 3 + 2] = 0.45;
      } else {
        // Cursed Blood Red
        particleColors[i * 3] = 0.95;
        particleColors[i * 3 + 1] = 0.18;
        particleColors[i * 3 + 2] = 0.22;
      }
    }

    const soulParticleGeo = new THREE.BufferGeometry();
    soulParticleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    soulParticleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Particle soft radial texture
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 64;
    particleCanvas.height = 64;
    const pctx = particleCanvas.getContext('2d');
    if (pctx) {
      const grad = pctx.createRadialGradient(32, 32, 2, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pctx.fillStyle = grad;
      pctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    const soulParticleMat = new THREE.PointsMaterial({
      size: 0.75,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const soulParticles = new THREE.Points(soulParticleGeo, soulParticleMat);
    scene.add(soulParticles);

    // 10. Generate 3D Tombstones for Graves
    graveGroupsRef.current = [];
    clickableMeshesRef.current = [];

    // Tombstone Geometry - Arched Gothic Shape
    const archShape = new THREE.Shape();
    const stoneW = 1.4;
    const stoneH = 2.1;
    const archR = stoneW / 2;
    archShape.moveTo(-stoneW / 2, 0);
    archShape.lineTo(stoneW / 2, 0);
    archShape.lineTo(stoneW / 2, stoneH - archR);
    archShape.absarc(0, stoneH - archR, archR, 0, Math.PI, false);
    archShape.lineTo(-stoneW / 2, 0);

    const stoneExtrudeSettings = {
      depth: 0.32,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.035,
      bevelThickness: 0.035
    };
    const stoneGeometry = new THREE.ExtrudeGeometry(archShape, stoneExtrudeSettings);
    // Center extrude geometry along z
    stoneGeometry.translate(0, 0, -0.16);

    // Base Plinth Geometry
    const plinthGeo = new THREE.BoxGeometry(1.85, 0.28, 0.95);
    const moundGeo = new THREE.SphereGeometry(0.9, 14, 10);
    moundGeo.scale(1.0, 0.22, 1.4);

    // Soul Beacon Geometry
    const beaconPedestalGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.18, 8);
    const beaconOrbGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const beaconAuraGeo = new THREE.SphereGeometry(0.26, 16, 16);

    // Inscription Plate Geometry
    const plateGeo = new THREE.PlaneGeometry(1.22, 1.82);

    // Grid layout calculation
    const count = graves.length;
    const cols = Math.max(3, Math.min(6, Math.ceil(Math.sqrt(Math.max(count, 1) * 1.5))));
    const rows = Math.ceil(Math.max(count, 1) / cols);
    const spacingX = 4.0;
    const spacingZ = 4.4;

    graves.forEach((grave, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = (col - (cols - 1) / 2) * spacingX + Math.sin(i * 11.3) * 0.25;
      const z = (row - (rows - 1) / 2) * spacingZ + Math.cos(i * 8.7) * 0.25;
      const rotY = (Math.sin(i * 7.1) * 0.09); // slight organic cemetery tilt

      const tombstoneGroup = new THREE.Group();
      tombstoneGroup.position.set(x, 0, z);
      tombstoneGroup.rotation.y = rotY;

      // Base stone material
      const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0x2c303a,
        roughness: 0.85,
        metalness: 0.12
      });

      const headstoneMesh = new THREE.Mesh(stoneGeometry, stoneMaterial);
      headstoneMesh.position.y = 0.2;
      headstoneMesh.castShadow = true;
      headstoneMesh.receiveShadow = true;
      tombstoneGroup.add(headstoneMesh);

      // Plinth base
      const plinthMaterial = new THREE.MeshStandardMaterial({
        color: 0x1d2028,
        roughness: 0.9,
        metalness: 0.1
      });
      const plinthMesh = new THREE.Mesh(plinthGeo, plinthMaterial);
      plinthMesh.position.y = 0.14;
      plinthMesh.castShadow = true;
      plinthMesh.receiveShadow = true;
      tombstoneGroup.add(plinthMesh);

      // Freshly dug mound of dirt
      const moundMaterial = new THREE.MeshStandardMaterial({
        color: 0x14100c,
        roughness: 0.96
      });
      const moundMesh = new THREE.Mesh(moundGeo, moundMaterial);
      moundMesh.position.set(0, 0.05, 0.85);
      moundMesh.receiveShadow = true;
      tombstoneGroup.add(moundMesh);

      // Inscription Canvas Texture
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 680;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Slate background with dark chiseled frame
        ctx.fillStyle = '#22252e';
        ctx.fillRect(0, 0, 512, 680);

        // Stone grunge
        for (let s = 0; s < 1200; s++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.08)';
          ctx.fillRect(Math.random() * 512, Math.random() * 680, 2, 2);
        }

        // Chiseled border
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, 472, 640);

        ctx.strokeStyle = '#1e2129';
        ctx.lineWidth = 2;
        ctx.strokeRect(26, 26, 460, 628);

        // Gothic Cross Icon
        ctx.fillStyle = '#9ca3af';
        ctx.font = 'bold 36px serif';
        ctx.textAlign = 'center';
        ctx.fillText('✟', 256, 75);

        // "R.I.P."
        ctx.font = 'bold 22px serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('R. I. P.', 256, 115);

        // Thin divider
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(100, 135);
        ctx.lineTo(412, 135);
        ctx.stroke();

        // Project Name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Courier New", monospace';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Auto wrap project name
        const words = (grave.project_name || 'Unnamed Project').split(' ');
        let line = '';
        let lineY = 195;
        const maxLineWidth = 420;
        for (let w = 0; w < words.length; w++) {
          const testLine = line + words[w] + ' ';
          if (ctx.measureText(testLine).width > maxLineWidth && w > 0) {
            ctx.fillText(line.trim(), 256, lineY);
            line = words[w] + ' ';
            lineY += 38;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line.trim(), 256, lineY);
        ctx.shadowColor = 'transparent';

        // Cause of Death Banner
        lineY += 50;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fillRect(50, lineY - 24, 412, 54);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.strokeRect(50, lineY - 24, 412, 54);

        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 15px "Courier New", monospace';
        ctx.fillText('CAUSE OF DEATH:', 256, lineY - 4);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Courier New", monospace';
        const cause = grave.cause_of_death || 'Unknown Malady';
        ctx.fillText(cause.length > 28 ? cause.substring(0, 26) + '...' : cause, 256, lineY + 20);

        // Lived for
        lineY += 60;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px "Courier New", monospace';
        ctx.fillText(`✦ Lived: ${grave.lived_for || 'Unknown duration'}`, 256, lineY);

        // Tech Stack
        if (grave.tech_stack) {
          lineY += 32;
          ctx.fillStyle = '#64748b';
          ctx.font = '14px "Courier New", monospace';
          const tech = grave.tech_stack.length > 34 ? grave.tech_stack.substring(0, 32) + '...' : grave.tech_stack;
          ctx.fillText(`Stack: ${tech}`, 256, lineY);
        }

        // Bottom respects candle count
        lineY = 610;
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 19px "Courier New", monospace';
        ctx.fillText(`🕯️ ${grave.respects || 0} RIPs Paid`, 256, lineY);

        // Bottom dirt vignette
        const bGrad = ctx.createLinearGradient(0, 520, 0, 680);
        bGrad.addColorStop(0, 'rgba(19, 23, 32, 0)');
        bGrad.addColorStop(1, 'rgba(19, 23, 32, 0.9)');
        ctx.fillStyle = bGrad;
        ctx.fillRect(0, 520, 512, 160);
      }

      const canvasTexture = new THREE.CanvasTexture(canvas);
      canvasTexture.colorSpace = THREE.SRGBColorSpace;

      const plateMaterial = new THREE.MeshStandardMaterial({
        map: canvasTexture,
        roughness: 0.6,
        metalness: 0.1
      });
      const plateMesh = new THREE.Mesh(plateGeo, plateMaterial);
      plateMesh.position.set(0, 1.15, 0.17);
      tombstoneGroup.add(plateMesh);

      // Glowing Soul Beacon
      const isGreenBeacon = i % 2 === 0;
      const beaconColor = isGreenBeacon ? 0x10b981 : 0xef4444;

      // Pedestal
      const beaconPedestal = new THREE.Mesh(beaconPedestalGeo, plinthMaterial);
      beaconPedestal.position.set(0, 2.25, 0);
      tombstoneGroup.add(beaconPedestal);

      // Core Orb
      const beaconMat = new THREE.MeshStandardMaterial({
        color: beaconColor,
        emissive: beaconColor,
        emissiveIntensity: 2.2,
        roughness: 0.2
      });
      const beaconOrb = new THREE.Mesh(beaconOrbGeo, beaconMat);
      beaconOrb.position.set(0, 2.45, 0);
      tombstoneGroup.add(beaconOrb);

      // Outer Aura Shell
      const beaconAuraMat = new THREE.MeshBasicMaterial({
        color: beaconColor,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      const beaconAura = new THREE.Mesh(beaconAuraGeo, beaconAuraMat);
      beaconAura.position.copy(beaconOrb.position);
      tombstoneGroup.add(beaconAura);

      // Beacon Point Light
      const pointLight = new THREE.PointLight(beaconColor, 0.65, 3.8);
      pointLight.position.set(0, 2.5, 0.3);
      tombstoneGroup.add(pointLight);

      // Attach metadata
      const userData: GraveMeshUserData = {
        grave,
        originalY: 0,
        beaconOrb,
        beaconAura,
        pointLight,
        headstoneMesh,
        stoneMaterial,
        plateMaterial,
        canvasTexture,
        index: i
      };
      tombstoneGroup.userData = userData;
      headstoneMesh.userData = userData;
      plateMesh.userData = userData;

      scene.add(tombstoneGroup);
      graveGroupsRef.current.push(tombstoneGroup);
      clickableMeshesRef.current.push(headstoneMesh, plateMesh);
    });

    // 11. Raycasting & Interaction Logic
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0, time: 0 };

    const updateRaycast = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(clickableMeshesRef.current, false);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const hitData = hitMesh.userData as GraveMeshUserData;

        if (hitData && hitData.grave) {
          const hitGroup = graveGroupsRef.current[hitData.index];

          if (hoveredGroupRef.current !== hitGroup) {
            // Unhover previous
            if (hoveredGroupRef.current) {
              const prevData = hoveredGroupRef.current.userData as GraveMeshUserData;
              prevData.stoneMaterial.emissive.setHex(0x000000);
              prevData.beaconOrb.scale.set(1, 1, 1);
            }

            hoveredGroupRef.current = hitGroup;
            playHoverSound();
          }

          // Highlight current
          hitData.stoneMaterial.emissive.setHex(hitData.index % 2 === 0 ? 0x052e16 : 0x450a0a);
          hitData.beaconOrb.scale.set(1.3, 1.3, 1.3);

          setHoveredGrave(hitData.grave);

          // Project to 2D screen coordinates for floating tooltip
          const worldPos = hitGroup.position.clone();
          worldPos.y += 2.6; // Top of tombstone beacon
          worldPos.project(camera);

          const screenX = ((worldPos.x * 0.5) + 0.5) * rect.width;
          const screenY = ((-(worldPos.y * 0.5)) + 0.5) * rect.height;

          // Tooltip position clamped within container
          setTooltipPos({
            x: Math.max(160, Math.min(rect.width - 160, screenX)),
            y: Math.max(120, Math.min(rect.height - 80, screenY))
          });

          renderer.domElement.style.cursor = 'pointer';
          return;
        }
      }

      // No intersection
      if (hoveredGroupRef.current) {
        const prevData = hoveredGroupRef.current.userData as GraveMeshUserData;
        prevData.stoneMaterial.emissive.setHex(0x000000);
        prevData.beaconOrb.scale.set(1, 1, 1);
        hoveredGroupRef.current = null;
      }
      setHoveredGrave(null);
      setTooltipPos(null);
      renderer.domElement.style.cursor = 'grab';
    };

    const handlePointerMove = (e: MouseEvent) => {
      updateRaycast(e.clientX, e.clientY);
    };

    const handlePointerDown = (e: MouseEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY, time: performance.now() };
      renderer.domElement.style.cursor = 'grabbing';
    };

    const handlePointerUp = (e: MouseEvent) => {
      renderer.domElement.style.cursor = 'grab';
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      const dist = Math.hypot(dx, dy);
      const elapsed = performance.now() - pointerDownPos.time;

      // Click detected if mouse didn't drag and finished in < 450ms
      if (dist < 6 && elapsed < 450) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(clickableMeshesRef.current, false);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh;
          const hitData = hitMesh.userData as GraveMeshUserData;
          if (hitData && hitData.grave) {
            playSelectSound();
            onSelectGrave(hitData.grave);
          }
        }
      }
    };

    // Touch support for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        pointerDownPos = { x: touch.clientX, y: touch.clientY, time: performance.now() };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - pointerDownPos.x;
        const dy = touch.clientY - pointerDownPos.y;
        const dist = Math.hypot(dx, dy);
        const elapsed = performance.now() - pointerDownPos.time;

        if (dist < 10 && elapsed < 500) {
          const rect = renderer.domElement.getBoundingClientRect();
          pointer.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(pointer, camera);
          const intersects = raycaster.intersectObjects(clickableMeshesRef.current, false);

          if (intersects.length > 0) {
            const hitMesh = intersects[0].object as THREE.Mesh;
            const hitData = hitMesh.userData as GraveMeshUserData;
            if (hitData && hitData.grave) {
              playSelectSound();
              onSelectGrave(hitData.grave);
            }
          }
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('mousedown', handlePointerDown);
    renderer.domElement.addEventListener('mouseup', handlePointerUp);
    renderer.domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    renderer.domElement.addEventListener('touchend', handleTouchEnd);

    // 12. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    // 13. Main Render Loop
    let lastTime = performance.now();

    const animate = () => {
      reqAnimIdRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Animate Soul Particles
      const posArr = soulParticleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        // Ascend gently
        posArr[i * 3 + 1] += particleSpeeds[i] * delta * 1.2;
        // Horizontal wisp sway
        posArr[i * 3] += Math.sin(now * 0.0012 + particlePhases[i]) * 0.012;
        posArr[i * 3 + 2] += Math.cos(now * 0.0014 + particlePhases[i]) * 0.012;

        // Reset if too high
        if (posArr[i * 3 + 1] > 14) {
          posArr[i * 3 + 1] = 0.2;
          posArr[i * 3] = (Math.random() - 0.5) * 55;
          posArr[i * 3 + 2] = (Math.random() - 0.5) * 55;
        }
      }
      soulParticleGeo.attributes.position.needsUpdate = true;

      // Animate Tombstone Soul Beacons (pulsing float)
      graveGroupsRef.current.forEach((group, idx) => {
        const u = group.userData as GraveMeshUserData;
        if (u && u.beaconOrb && u.beaconAura) {
          const pulse = Math.sin(now * 0.003 + idx * 1.2);
          const beaconY = 2.45 + pulse * 0.07;
          u.beaconOrb.position.y = beaconY;
          u.beaconAura.position.y = beaconY;

          // Aura scale pulsation
          const auraScale = 1.0 + pulse * 0.15;
          u.beaconAura.scale.set(auraScale, auraScale, auraScale);

          // Subtle elevation lift when hovered
          const isHovered = hoveredGroupRef.current === group;
          const targetY = isHovered ? 0.25 : 0;
          group.position.y += (targetY - group.position.y) * 0.1;
        }
      });

      // Smooth camera transition animation if active
      if (cameraTransitionRef.current && cameraTransitionRef.current.active) {
        const anim = cameraTransitionRef.current;
        const progress = Math.min(1, (now - anim.startTime) / anim.duration);
        // Smooth ease-in-out cubic
        const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        camera.position.lerpVectors(anim.startPos, anim.endPos, ease);
        controls.target.lerpVectors(anim.startTarget, anim.endTarget, ease);

        if (progress >= 1) {
          anim.active = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 14. Cleanup
    return () => {
      if (reqAnimIdRef.current) {
        cancelAnimationFrame(reqAnimIdRef.current);
      }
      resizeObserver.disconnect();

      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('mousedown', handlePointerDown);
      renderer.domElement.removeEventListener('mouseup', handlePointerUp);
      renderer.domElement.removeEventListener('touchstart', handleTouchStart);
      renderer.domElement.removeEventListener('touchend', handleTouchEnd);

      // Dispose Geometries & Textures
      groundGeometry.dispose();
      groundMaterial.dispose();
      groundTexture.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      haloCanvas.remove();
      haloTexture.dispose();
      haloMat.dispose();
      treeTrunkGeo.dispose();
      branchGeo.dispose();
      treeMat.dispose();
      soulParticleGeo.dispose();
      soulParticleMat.dispose();
      particleTexture.dispose();
      stoneGeometry.dispose();
      plinthGeo.dispose();
      moundGeo.dispose();
      beaconPedestalGeo.dispose();
      beaconOrbGeo.dispose();
      beaconAuraGeo.dispose();
      plateGeo.dispose();

      graveGroupsRef.current.forEach((grp) => {
        const u = grp.userData as GraveMeshUserData;
        if (u) {
          u.canvasTexture?.dispose();
          u.stoneMaterial?.dispose();
          u.plateMaterial?.dispose();
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [graves, onSelectGrave, playHoverSound, playSelectSound]);

  return (
    <div 
      className={`relative w-full rounded-2xl overflow-hidden border border-[#c53030]/30 bg-[#06080e] shadow-[0_0_60px_rgba(0,0,0,0.9)] select-none transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-[100] h-screen w-screen rounded-none' : 'h-[620px] md:h-[720px]'
      } ${className}`}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Atmospheric Top Bar HUD */}
      <div className="absolute top-4 inset-x-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
        {/* Cemetery Status Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/60 border border-[#c53030]/40 backdrop-blur-md shadow-lg pointer-events-auto">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c53030] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ef4444]" />
          </span>
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-200">
            Gothic 3D Cemetery
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#c53030]/20 text-[#f87171] border border-[#c53030]/30 font-semibold">
            {graves.length} SOULS
          </span>
        </div>

        {/* Camera Views & Tools */}
        <div className="flex items-center gap-1.5 bg-black/60 border border-zinc-800/80 p-1 rounded-xl backdrop-blur-md pointer-events-auto">
          <button
            type="button"
            onClick={handlePresetOverview}
            title="High panoramic view"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#c53030]" />
            <span className="hidden sm:inline">Overview</span>
          </button>

          <button
            type="button"
            onClick={handlePresetWander}
            title="Ground eye-level view"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Wander</span>
          </button>

          <button
            type="button"
            onClick={handlePresetRandom}
            title="Inspect random grave"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Random</span>
          </button>

          <button
            type="button"
            onClick={handlePresetReset}
            title="Reset camera position"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-zinc-800 mx-0.5" />

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-zinc-300" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-zinc-600" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-zinc-300" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-zinc-300" />
            )}
          </button>
        </div>
      </div>

      {/* Floating 3D Hover Tooltip */}
      {hoveredGrave && tooltipPos && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150 ease-out"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 14}px`
          }}
        >
          <div className="w-64 sm:w-72 p-3.5 rounded-xl bg-black/90 border border-[#c53030]/60 backdrop-blur-xl shadow-[0_0_30px_rgba(197,48,48,0.35)] text-left space-y-2">
            <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-2">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#f87171] uppercase font-semibold block">
                  Gravestone Inscription
                </span>
                <h4 className="font-mono font-bold text-white text-sm sm:text-base leading-tight truncate">
                  {hoveredGrave.project_name}
                </h4>
              </div>
              <span className="text-sm">🪦</span>
            </div>

            <div className="space-y-1 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Flame className="w-3.5 h-3.5 text-[#ef4444] shrink-0" />
                <span className="text-zinc-500">Died:</span>
                <span className="text-[#fca5a5] font-semibold truncate">
                  {hoveredGrave.cause_of_death}
                </span>
              </div>

              {hoveredGrave.lived_for && (
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <span className="text-zinc-500">Lived:</span>
                  <span>{hoveredGrave.lived_for}</span>
                </div>
              )}

              {hoveredGrave.tech_stack && (
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <span className="text-zinc-500">Stack:</span>
                  <span className="text-zinc-300 truncate">{hoveredGrave.tech_stack}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-amber-400 flex items-center gap-1">
                🕯️ {hoveredGrave.respects || 0} RIPs
              </span>
              <span className="text-[#f87171] font-semibold flex items-center gap-1">
                Click to inspect →
              </span>
            </div>
          </div>

          {/* Pointer tail */}
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#c53030]/60 mx-auto" />
        </div>
      )}

      {/* Bottom Controls Guide / Hint */}
      <div className="absolute bottom-4 inset-x-4 flex justify-center pointer-events-none z-10">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 rounded-full bg-black/60 border border-zinc-800/90 backdrop-blur-md text-[11px] font-mono text-zinc-400 shadow-lg text-center">
          <MousePointerClick className="w-3.5 h-3.5 text-[#c53030] shrink-0 hidden sm:inline" />
          {isMobile ? (
            <span>👆 <strong>Drag</strong> to look around • <strong>Pinch</strong> to zoom • <strong>Tap</strong> grave to inspect</span>
          ) : (
            <span>🖱️ <strong>Left-Drag</strong> orbit • <strong>Scroll</strong> zoom • <strong>Right-Drag</strong> pan • <strong>Click</strong> grave to inspect</span>
          )}
        </div>
      </div>
    </div>
  );
};
