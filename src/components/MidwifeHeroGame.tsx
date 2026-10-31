import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Heart,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Award,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface MidwifeHeroGameProps {
  onClose: () => void;
  language?: string;
}

type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

export const MidwifeHeroGame: React.FC<MidwifeHeroGameProps> = ({ onClose, language = 'English' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();

  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [score, setScore] = useState<number>(0);
  const [mothersHelped, setMothersHelped] = useState<number>(0);
  const [kitsDelivered, setKitsDelivered] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [clinicalPearl, setClinicalPearl] = useState<string>(
    'Every minute counts in maternal triage: early ANC visits, clean delivery kits, and rapid referral save lives across rural communities.'
  );

  // Audio Context ref for procedural Web Audio sound synthesis
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Game internal mutable state ref to decouple from React renders for 60fps simulation
  const gameRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    player: THREE.Group | null;
    groundTiles: THREE.Group[];
    pickups: THREE.Group[];
    hazards: THREE.Group[];
    villages: THREE.Group[];
    particles: THREE.Points | null;
    particlePositions: Float32Array | null;
    clock: THREE.Clock;
    playerPos: { x: number; y: number; z: number };
    playerVel: { x: number; y: number; z: number };
    lane: number; // -1 (left), 0 (center), 1 (right)
    targetX: number;
    isGrounded: boolean;
    speed: number;
    distance: number;
    lives: number;
    score: number;
    mothersHelped: number;
    kitsDelivered: number;
    hitStopTimer: number;
    cameraShake: number;
    runAnimTime: number;
    heldKeys: Record<string, boolean>;
    justPressedKeys: Record<string, boolean>;
    animFrameId: number | null;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    player: null,
    groundTiles: [],
    pickups: [],
    hazards: [],
    villages: [],
    particles: null,
    particlePositions: null,
    clock: new THREE.Clock(),
    playerPos: { x: 0, y: 0, z: 0 },
    playerVel: { x: 0, y: 0, z: 0 },
    lane: 0,
    targetX: 0,
    isGrounded: true,
    speed: 12,
    distance: 0,
    lives: 3,
    score: 0,
    mothersHelped: 0,
    kitsDelivered: 0,
    hitStopTimer: 0,
    cameraShake: 0,
    runAnimTime: 0,
    heldKeys: {},
    justPressedKeys: {},
    animFrameId: null,
  });

  // Sound Synthesizer via Web Audio API
  const playSound = (type: 'pickup' | 'jump' | 'hit' | 'victory' | 'step') => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      if (type === 'pickup') {
        // Cheerful Kalimba Pentatonic Chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'jump') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'hit') {
        // Low impact hit thud
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'victory') {
        // Triumphant midwife delivery fanfare
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0.18, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.35);
        });
      }
    } catch {}
  };

  // Build Procedural Three.js Assets
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a120c); // African sunset warmth
    scene.fog = new THREE.FogExp2(0x1a120c, 0.018);
    gameRef.current.scene = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 4.5, 7.5);
    camera.lookAt(0, 1.5, -6);
    gameRef.current.camera = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    gameRef.current.renderer = renderer;

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffecd2, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffaa55, 1.8);
    sunLight.position.set(20, 35, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    scene.add(sunLight);

    // 5. Build Procedural Mama-G Hero Model (Composite THREE.Group: 7 parts)
    const playerGroup = new THREE.Group();

    // Body (African Wax Dress)
    const dressGeo = new THREE.CylinderGeometry(0.3, 0.55, 1.3, 12);
    const dressMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Amber gold wax print
      roughness: 0.6,
      metalness: 0.1,
    });
    const dress = new THREE.Mesh(dressGeo, dressMat);
    dress.position.y = 0.65;
    dress.castShadow = true;
    playerGroup.add(dress);

    // Head
    const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x5c3317, // Rich warm skin tone
      roughness: 0.8,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.45;
    head.castShadow = true;
    playerGroup.add(head);

    // Gele / Headwrap (Sculpted crown)
    const geleGeo = new THREE.TorusGeometry(0.26, 0.12, 10, 24);
    const geleMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48, // Crimson rose gele
      roughness: 0.4,
      metalness: 0.2,
    });
    const gele = new THREE.Mesh(geleGeo, geleMat);
    gele.position.y = 1.62;
    gele.rotation.x = Math.PI / 2.3;
    gele.castShadow = true;
    playerGroup.add(gele);

    // Midwife First-Aid Kit Satchel
    const kitGeo = new THREE.BoxGeometry(0.32, 0.24, 0.16);
    const kitMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Health green bag
      roughness: 0.5,
      metalness: 0.3,
    });
    const kit = new THREE.Mesh(kitGeo, kitMat);
    kit.position.set(0.38, 0.75, 0.1);
    kit.rotation.z = -0.15;
    kit.castShadow = true;
    playerGroup.add(kit);

    // Red Cross Emblem on Kit
    const crossGeo = new THREE.BoxGeometry(0.12, 0.04, 0.02);
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const crossH = new THREE.Mesh(crossGeo, crossMat);
    crossH.position.set(0.38, 0.75, 0.19);
    playerGroup.add(crossH);
    const crossV = crossH.clone();
    crossV.rotation.z = Math.PI / 2;
    playerGroup.add(crossV);

    playerGroup.position.set(0, 0, 0);
    scene.add(playerGroup);
    gameRef.current.player = playerGroup;

    // 6. Build Initial Ground Tiles (Savanna Earth & Road)
    const createGroundTile = (zPos: number) => {
      const tileGroup = new THREE.Group();

      // Earth Road
      const roadGeo = new THREE.PlaneGeometry(7.5, 40);
      const roadMat = new THREE.MeshStandardMaterial({
        color: 0x854d0e, // Rich terracotta red-earth road
        roughness: 0.9,
      });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.receiveShadow = true;
      tileGroup.add(road);

      // Savanna Grass Borders
      const grassGeo = new THREE.PlaneGeometry(35, 40);
      const grassMat = new THREE.MeshStandardMaterial({
        color: 0x3f2e18, // Savanna dry scrub
        roughness: 0.95,
      });
      const grassL = new THREE.Mesh(grassGeo, grassMat);
      grassL.rotation.x = -Math.PI / 2;
      grassL.position.x = -21;
      grassL.receiveShadow = true;
      tileGroup.add(grassL);

      const grassR = grassL.clone();
      grassR.position.x = 21;
      tileGroup.add(grassR);

      // Procedural Acacia & Baobab Trees along the perimeter
      [-12, 12].forEach((xSide) => {
        for (let i = 0; i < 3; i++) {
          const treeGroup = new THREE.Group();
          const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3.5, 8);
          const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.9 });
          const trunk = new THREE.Mesh(trunkGeo, trunkMat);
          trunk.position.y = 1.75;
          trunk.castShadow = true;
          treeGroup.add(trunk);

          const canopyGeo = new THREE.DodecahedronGeometry(1.6, 1);
          const canopyMat = new THREE.MeshStandardMaterial({
            color: Math.random() > 0.5 ? 0x2d4a1d : 0x4d6b2f,
            roughness: 0.8,
          });
          const canopy = new THREE.Mesh(canopyGeo, canopyMat);
          canopy.position.y = 3.6;
          canopy.scale.set(1.5, 0.6, 1.5);
          canopy.castShadow = true;
          treeGroup.add(canopy);

          treeGroup.position.set(xSide + (Math.random() - 0.5) * 4, 0, (i - 1) * 12);
          tileGroup.add(treeGroup);
        }
      });

      tileGroup.position.z = zPos;
      scene.add(tileGroup);
      return tileGroup;
    };

    const tiles = [
      createGroundTile(0),
      createGroundTile(-40),
      createGroundTile(-80),
      createGroundTile(-120),
    ];
    gameRef.current.groundTiles = tiles;

    // 7. Particle System (Golden healing dust)
    const particleCount = 80;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = Math.random() * 5;
      particlePositions[i + 2] = -Math.random() * 80;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.18,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    gameRef.current.particles = particles;
    gameRef.current.particlePositions = particlePositions;

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !gameRef.current.camera || !gameRef.current.renderer) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      gameRef.current.camera.aspect = w / h;
      gameRef.current.camera.updateProjectionMatrix();
      gameRef.current.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameRef.current.animFrameId) cancelAnimationFrame(gameRef.current.animFrameId);
      renderer.dispose();
    };
  }, []);

  // Keyboard Event Listeners with Edge-Triggering
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Flat Control-Hint Actions: Space to Start / Jump, Esc to Pause
      if (e.key === ' ' || e.key === 'Enter') {
        if (gameState === 'TITLE' || gameState === 'GAMEOVER' || gameState === 'VICTORY') {
          startGame();
          return;
        }
      }

      if (e.key === 'Escape') {
        if (gameState === 'PLAYING') setGameState('PAUSED');
        else if (gameState === 'PAUSED') setGameState('PLAYING');
        return;
      }

      if (key === 'm') {
        setIsMuted((prev) => !prev);
        return;
      }

      if (!gameRef.current.heldKeys[key]) {
        gameRef.current.justPressedKeys[key] = true;
      }
      gameRef.current.heldKeys[key] = true;

      // Handle Lane Shift left/right with A/D or Arrows
      if (gameState === 'PLAYING') {
        if (key === 'a' || e.key === 'ArrowLeft') {
          shiftLane(-1);
        } else if (key === 'd' || e.key === 'ArrowRight') {
          shiftLane(1);
        } else if (key === ' ' || key === 'w' || e.key === 'ArrowUp') {
          jump();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      delete gameRef.current.heldKeys[key];
    };

    const handleBlur = () => {
      gameRef.current.heldKeys = {};
      gameRef.current.justPressedKeys = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameState]);

  const shiftLane = (dir: number) => {
    const newLane = Math.max(-1, Math.min(1, gameRef.current.lane + dir));
    if (newLane !== gameRef.current.lane) {
      gameRef.current.lane = newLane;
      gameRef.current.targetX = newLane * 2.2;
      playSound('step');
    }
  };

  const jump = () => {
    if (gameRef.current.isGrounded) {
      gameRef.current.playerVel.y = 8.5;
      gameRef.current.isGrounded = false;
      playSound('jump');
    }
  };

  const startGame = () => {
    const g = gameRef.current;
    g.playerPos = { x: 0, y: 0, z: 0 };
    g.playerVel = { x: 0, y: 0, z: 0 };
    g.lane = 0;
    g.targetX = 0;
    g.isGrounded = true;
    g.speed = 13;
    g.distance = 0;
    g.lives = 3;
    g.score = 0;
    g.mothersHelped = 0;
    g.kitsDelivered = 0;
    g.hitStopTimer = 0;
    g.cameraShake = 0;

    // Clear existing objects
    g.pickups.forEach((p) => g.scene?.remove(p));
    g.hazards.forEach((h) => g.scene?.remove(h));
    g.villages.forEach((v) => g.scene?.remove(v));
    g.pickups = [];
    g.hazards = [];
    g.villages = [];

    // Spawn initial wave
    spawnWave();

    setLives(3);
    setScore(0);
    setMothersHelped(0);
    setKitsDelivered(0);
    setGameState('PLAYING');
  };

  // Spawn obstacles, pickups, and rural clinic delivery points
  const spawnWave = () => {
    const g = gameRef.current;
    if (!g.scene) return;

    for (let z = -20; z >= -180; z -= 14) {
      const laneChoice = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      const randType = Math.random();

      if (randType < 0.45) {
        // Safe Delivery Supply Kit Pickup
        const boxGroup = new THREE.Group();
        const boxGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        const boxMat = new THREE.MeshStandardMaterial({
          color: 0x10b981, // Emerald medical green
          roughness: 0.3,
          metalness: 0.4,
          emissive: 0x065f46,
          emissiveIntensity: 0.5,
        });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.castShadow = true;
        boxGroup.add(box);

        // Gold ribbon
        const ribbonGeo = new THREE.TorusGeometry(0.48, 0.05, 8, 16);
        const ribbonMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
        ribbon.rotation.x = Math.PI / 2;
        boxGroup.add(ribbon);

        boxGroup.position.set(laneChoice * 2.2, 0.8, z);
        g.scene.add(boxGroup);
        g.pickups.push(boxGroup);
      } else if (randType < 0.8) {
        // Pothole / Mud hazard with telegraph ripple
        const hazardGroup = new THREE.Group();
        const mudGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.1, 16);
        const mudMat = new THREE.MeshStandardMaterial({
          color: 0x3d2314, // Mud pit
          roughness: 0.3,
        });
        const mud = new THREE.Mesh(mudGeo, mudMat);
        mud.position.y = 0.05;
        hazardGroup.add(mud);

        // Danger telegraph border ring
        const ringGeo = new THREE.RingGeometry(0.95, 1.15, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.06;
        hazardGroup.add(ring);

        hazardGroup.position.set(laneChoice * 2.2, 0, z);
        g.scene.add(hazardGroup);
        g.hazards.push(hazardGroup);
      } else {
        // Rural Village Maternity Post
        const hutGroup = new THREE.Group();
        const wallGeo = new THREE.CylinderGeometry(1.2, 1.2, 1.8, 16);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.9 });
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.y = 0.9;
        wall.castShadow = true;
        hutGroup.add(wall);

        const roofGeo = new THREE.ConeGeometry(1.6, 1.2, 16);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 2.4;
        roof.castShadow = true;
        hutGroup.add(roof);

        // Maternity Health Flag
        const flagGeo = new THREE.PlaneGeometry(0.7, 0.45);
        const flagMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(0, 3.2, 0);
        hutGroup.add(flag);

        hutGroup.position.set(laneChoice * 2.2, 0, z);
        g.scene.add(hutGroup);
        g.villages.push(hutGroup);
      }
    }
  };

  // Main 60fps Game Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      gameRef.current.animFrameId = requestAnimationFrame(loop);

      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      // Clamp frame delta time strictly to 0.05s (20fps minimum step) per guidelines
      const dt = Math.min(rawDt, 0.05);

      const g = gameRef.current;
      if (!g.scene || !g.camera || !g.renderer || !g.player) return;

      // Handle hitstop (brief simulation freeze on heavy impact)
      if (g.hitStopTimer > 0) {
        g.hitStopTimer -= dt;
        g.renderer.render(g.scene, g.camera);
        return;
      }

      if (gameState === 'TITLE') {
        // Atmospheric title pan
        const t = currentTime * 0.0005;
        g.camera.position.x = Math.sin(t) * 5;
        g.camera.position.z = 8 + Math.cos(t) * 2;
        g.camera.position.y = 4.2;
        g.camera.lookAt(0, 1.2, -4);
        g.player.rotation.y = Math.sin(currentTime * 0.002) * 0.3;
        g.renderer.render(g.scene, g.camera);
        return;
      }

      if (gameState !== 'PLAYING') {
        g.renderer.render(g.scene, g.camera);
        return;
      }

      // 1. Simulation Physics & Player Lateral Motion
      g.playerPos.x += (g.targetX - g.playerPos.x) * Math.min(1, dt * 14);

      // Vertical Gravity & Jump
      g.playerVel.y -= 22 * dt;
      g.playerPos.y += g.playerVel.y * dt;
      if (g.playerPos.y <= 0) {
        g.playerPos.y = 0;
        g.playerVel.y = 0;
        g.isGrounded = true;
      }

      // Forward motion progression
      g.distance += g.speed * dt;
      g.speed = Math.min(22, 13 + g.distance * 0.015); // Smooth difficulty ramp

      // Update player group position
      g.player.position.set(g.playerPos.x, g.playerPos.y, 0);

      // Running animation tilt & bobbing
      g.runAnimTime += dt * g.speed;
      g.player.rotation.z = (g.targetX - g.playerPos.x) * -0.15;
      g.player.rotation.x = Math.sin(g.runAnimTime * 2) * 0.08;

      // 2. Infinite Ground Scrolling
      g.groundTiles.forEach((tile) => {
        tile.position.z += g.speed * dt;
        if (tile.position.z > 20) {
          tile.position.z -= 160;
        }
      });

      // 3. Move Pickups & Check Collision
      for (let i = g.pickups.length - 1; i >= 0; i--) {
        const pickup = g.pickups[i];
        pickup.position.z += g.speed * dt;
        pickup.rotation.y += dt * 3;
        pickup.position.y = 0.8 + Math.sin(currentTime * 0.005 + i) * 0.2;

        // Collision Check (AABB box test)
        const dx = pickup.position.x - g.playerPos.x;
        const dy = pickup.position.y - g.playerPos.y;
        const dz = pickup.position.z - 0;

        if (Math.abs(dx) < 0.85 && Math.abs(dy) < 1.2 && Math.abs(dz) < 0.9) {
          // Collected Delivery Kit!
          playSound('pickup');
          g.scene.remove(pickup);
          g.pickups.splice(i, 1);
          g.score += 100;
          g.kitsDelivered += 1;
          setScore(g.score);
          setKitsDelivered(g.kitsDelivered);
          continue;
        }

        // Recycle offscreen
        if (pickup.position.z > 10) {
          g.scene.remove(pickup);
          g.pickups.splice(i, 1);
        }
      }

      // 4. Move Hazards & Check Collision
      for (let i = g.hazards.length - 1; i >= 0; i--) {
        const hazard = g.hazards[i];
        hazard.position.z += g.speed * dt;

        const dx = hazard.position.x - g.playerPos.x;
        const dz = hazard.position.z - 0;

        // If player is on ground and hits hazard
        if (Math.abs(dx) < 0.95 && Math.abs(dz) < 0.8 && g.playerPos.y < 0.45) {
          playSound('hit');
          g.hitStopTimer = 0.06; // 60ms hitstop
          g.cameraShake = 0.45;
          g.lives -= 1;
          setLives(g.lives);

          g.scene.remove(hazard);
          g.hazards.splice(i, 1);

          if (g.lives <= 0) {
            setGameState('GAMEOVER');
            saveScoreToCloud(g.score, g.mothersHelped, g.kitsDelivered, Math.floor(g.distance));
          }
          continue;
        }

        if (hazard.position.z > 10) {
          g.scene.remove(hazard);
          g.hazards.splice(i, 1);
        }
      }

      // 5. Move Village Clinics & Deliveries
      for (let i = g.villages.length - 1; i >= 0; i--) {
        const village = g.villages[i];
        village.position.z += g.speed * dt;

        const dx = village.position.x - g.playerPos.x;
        const dz = village.position.z - 0;

        if (Math.abs(dx) < 1.4 && Math.abs(dz) < 1.2) {
          // Reached rural clinic!
          playSound('victory');
          g.score += 350;
          g.mothersHelped += 1;
          setScore(g.score);
          setMothersHelped(g.mothersHelped);

          g.scene.remove(village);
          g.villages.splice(i, 1);

          if (g.mothersHelped >= 10) {
            setGameState('VICTORY');
            saveScoreToCloud(g.score, g.mothersHelped, g.kitsDelivered, Math.floor(g.distance));
          }
          continue;
        }

        if (village.position.z > 10) {
          g.scene.remove(village);
          g.villages.splice(i, 1);
        }
      }

      // Replenish wave if needed
      if (g.pickups.length + g.hazards.length < 5) {
        spawnWave();
      }

      // 6. Camera Follow with Decaying Shake
      let shakeX = 0;
      let shakeY = 0;
      if (g.cameraShake > 0) {
        shakeX = (Math.random() - 0.5) * g.cameraShake;
        shakeY = (Math.random() - 0.5) * g.cameraShake;
        g.cameraShake = Math.max(0, g.cameraShake - dt * 2.5);
      }

      g.camera.position.x = g.playerPos.x * 0.4 + shakeX;
      g.camera.position.y = 4.2 + g.playerPos.y * 0.2 + shakeY;
      g.camera.position.z = 7.5;
      g.camera.lookAt(g.playerPos.x * 0.2, 1.6, -10);

      g.renderer.render(g.scene, g.camera);
    };

    gameRef.current.animFrameId = requestAnimationFrame(loop);

    return () => {
      if (gameRef.current.animFrameId) cancelAnimationFrame(gameRef.current.animFrameId);
    };
  }, [gameState, isMuted]);

  // Persist high scores to Firestore under user profile
  const saveScoreToCloud = async (finalScore: number, mothers: number, kits: number, dist: number) => {
    if (!user) return;
    try {
      const scoreId = `game-${Date.now()}`;
      const path = `users/${user.uid}/gameScores/${scoreId}`;
      await setDoc(doc(db, 'users', user.uid, 'gameScores', scoreId), {
        id: scoreId,
        userId: user.uid,
        score: finalScore,
        mothersHelped: mothers,
        kitsDelivered: kits,
        distance: dist,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Game score save error:', err);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-stone-950 flex flex-col font-sans select-none overflow-hidden"
    >
      {/* 3D WebGL Canvas Viewport */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block focus:outline-none cursor-grab active:cursor-grabbing" />

      {/* World-Matched, Low-Occlusion UI (<15% screen coverage, pointer-events-none on wrapper) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-10">
        {/* Top Perimeter Status Cluster */}
        <div className="flex items-center justify-between w-full">
          {/* Left Cluster: Hearts, Kits, Mothers Saved */}
          <div className="flex items-center gap-2.5 sm:gap-3 bg-stone-950/75 border border-stone-800/90 rounded-2xl px-3.5 py-2 pointer-events-auto shadow-xl">
            {/* Health Hearts */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                    i < lives
                      ? 'text-rose-500 fill-rose-500 scale-100'
                      : 'text-stone-700 fill-transparent scale-90'
                  }`}
                />
              ))}
            </div>

            <div className="h-4 w-px bg-stone-700" />

            {/* Kits Delivered */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-300 tabular-nums">
              <span>📦</span>
              <span>{kitsDelivered}</span>
            </div>

            <div className="h-4 w-px bg-stone-700" />

            {/* Mothers Helped */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-400 tabular-nums">
              <span>🤱</span>
              <span>{mothersHelped}/10</span>
            </div>
          </div>

          {/* Right Cluster: Score, Sound Mute, Exit Game */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Score Ticker with Tabular Numbers */}
            <div className="bg-stone-950/75 border border-amber-500/30 rounded-2xl px-4 py-2 text-right shadow-xl">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider leading-none">
                Score
              </span>
              <span className="text-base sm:text-lg font-black text-amber-400 font-mono tabular-nums leading-none">
                {score.toLocaleString()} PTS
              </span>
            </div>

            {/* Mute Toggle */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 rounded-2xl bg-stone-900/80 hover:bg-stone-850 text-stone-300 hover:text-white border border-stone-700 flex items-center justify-center transition-colors cursor-pointer shadow-md"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Exit to Mama-G App */}
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-stone-900/80 hover:bg-rose-950/70 text-stone-300 hover:text-rose-300 border border-stone-700 flex items-center justify-center transition-colors cursor-pointer shadow-md"
              title="Exit Game to Mama-G Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile On-Screen Controls for Low-Cost Phones (320px–412px viewports) */}
        {gameState === 'PLAYING' && (
          <div className="sm:hidden flex items-center justify-between w-full pointer-events-auto pt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onTouchStart={() => shiftLane(-1)}
                onClick={() => shiftLane(-1)}
                className="w-14 h-14 rounded-2xl bg-stone-900/85 active:bg-amber-500 active:text-stone-950 text-white font-bold text-xl border border-stone-700 flex items-center justify-center shadow-2xl transition-all"
              >
                ←
              </button>
              <button
                type="button"
                onTouchStart={() => shiftLane(1)}
                onClick={() => shiftLane(1)}
                className="w-14 h-14 rounded-2xl bg-stone-900/85 active:bg-amber-500 active:text-stone-950 text-white font-bold text-xl border border-stone-700 flex items-center justify-center shadow-2xl transition-all"
              >
                →
              </button>
            </div>

            <button
              type="button"
              onTouchStart={jump}
              onClick={jump}
              className="w-16 h-16 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-black text-sm flex flex-col items-center justify-center shadow-2xl transition-all"
            >
              <span>JUMP</span>
              <span className="text-[10px]">📦 DELIVER</span>
            </button>
          </div>
        )}
      </div>

      {/* TITLE SCREEN OVERLAY: Full-viewport Game Shell with bespoke SVG title lockup & 30-40% negative space */}
      {gameState === 'TITLE' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-6 sm:p-10 bg-black/45 backdrop-blur-xs text-center animate-fade-in">
          {/* Top Negative Space */}
          <div className="w-full flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-900/90 text-stone-300 hover:text-white border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Back to Mama-G</span>
            </button>
          </div>

          {/* Central Bespoke Inline SVG Title Lockup */}
          <div className="max-w-xl mx-auto flex flex-col items-center space-y-4">
            <svg
              className="w-72 sm:w-96 h-auto drop-shadow-2xl"
              viewBox="0 0 380 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="5" y="5" width="370" height="80" rx="20" fill="#1c1917" stroke="#f59e0b" strokeWidth="2.5" />
              <text x="190" y="42" textAnchor="middle" fill="#fbbf24" fontSize="28" fontWeight="900" letterSpacing="2">
                MAMA-G ODYSSEY
              </text>
              <text x="190" y="66" textAnchor="middle" fill="#fef08a" fontSize="13" fontWeight="700" letterSpacing="4">
                VILLAGE MATERNAL RESCUE RUN
              </text>
            </svg>

            <p className="text-xs sm:text-sm text-stone-200 font-medium max-w-md leading-relaxed">
              Step into Mama-G's shoes! Dash across rural communities to deliver Safe Delivery Kits and reach expectant mothers at rural maternity posts before emergencies arise.
            </p>

            {/* Primary Start CTA */}
            <button
              type="button"
              onClick={startGame}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 active:scale-95 text-stone-950 font-black text-sm sm:text-base rounded-2xl flex items-center gap-2 shadow-2xl shadow-amber-950/80 transition-all cursor-pointer animate-pulse"
            >
              <Play className="w-5 h-5 fill-stone-950" />
              <span>PRESS SPACE OR CLICK TO START</span>
            </button>

            {/* Single Flat Control-Hint Line per guidelines */}
            <p className="text-[11px] sm:text-xs font-mono font-semibold text-stone-400 tracking-wide">
              WASD / Arrows Move · Space Deliver Kit / Jump · Esc Pause · M Mute
            </p>
          </div>

          {/* Bottom DPG Accreditation */}
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Educational Maternal Health 3D Simulation · UNICEF DPG Standard</span>
          </div>
        </div>
      )}

      {/* PAUSE MODAL */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-xl font-extrabold text-white">Simulation Paused</h3>
            <p className="text-xs text-stone-400">
              Catch your breath, sister! Your mission to protect mothers in the community is ongoing.
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setGameState('PLAYING')}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Resume Run
              </button>
              <button
                type="button"
                onClick={startGame}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Restart Mission
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-transparent hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
              >
                Exit to Mama-G
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER / VICTORY MODAL */}
      {(gameState === 'GAMEOVER' || gameState === 'VICTORY') && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-xl bg-amber-500/20 border border-amber-500/40">
              {gameState === 'VICTORY' ? (
                <Award className="w-8 h-8 text-amber-400" />
              ) : (
                <Heart className="w-8 h-8 text-rose-500" />
              )}
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {gameState === 'VICTORY' ? '🏆 Village Midwife Hero!' : 'Rescue Run Concluded'}
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/90 font-medium mt-1">
                {gameState === 'VICTORY'
                  ? 'You reached all 10 village maternity posts and equipped them with life-saving delivery kits!'
                  : 'Every delivery kit delivered brought life-saving emergency care closer to a mother in need.'}
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-2 bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800 text-xs">
              <div>
                <span className="text-[10px] text-stone-400 block uppercase">Final Score</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {score.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block uppercase">Kits Delivered</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {kitsDelivered}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block uppercase">Mothers Helped</span>
                <span className="font-mono font-bold text-blue-400 text-sm">
                  {mothersHelped}
                </span>
              </div>
            </div>

            {/* Clinical Pearl */}
            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800/80 text-left text-xs space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Clinical Maternal Care Takeaway:</span>
              </span>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                {clinicalPearl}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={startGame}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
              >
                Back to Mama-G
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
