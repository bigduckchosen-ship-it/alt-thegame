import * as THREE from 'three';
import { StorySystem, CHAPTERS, getPortraitSVG } from './story.js';

// ===================== КОНСТАНТЫ И НАСТРОЙКИ =====================
const LANES = [-2.5, 0, 2.5];
const GRAVITY = -44;
const JUMP_VELOCITY = 15.8;
const FAST_FALL_VELOCITY = -28;
const SLIDE_DURATION = 0.72;
const LANE_SWITCH_SPEED = 14.5;
const BASE_RUN_SPEED = 24;
const MAX_RUN_SPEED = 46;
const SPEED_ACCEL_PER_SEC = 0.16;
const TRACK_LENGTH = 175;
const SPAWN_Z = -132;
const DESPAWN_Z = 16;

// ===================== ПРОЦЕДУРНЫЙ СИНТЕЗАТОР (WEB AUDIO API) =====================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.noiseBuffer = null;
    this.muted = false;
    this.musicPlaying = false;
    this.tempoMultiplier = 1;
    this.stepIndex = 0;
    this.nextNoteTime = 0;
    this.schedulerId = null;

    // Минорная пост-панк / фонк басовая линия (частоты в Гц, C# minor / F# minor вайб)
    this.bassPattern = [
      69.3, 0, 69.3, 82.41, 69.3, 0, 92.5, 82.41,
      55.0, 0, 55.0, 65.41, 61.74, 0, 73.42, 65.41
    ];
    this.cowbellPattern = [
      0, 0, 554.37, 0, 0, 659.25, 0, 554.37,
      0, 0, 493.88, 0, 659.25, 0, 739.99, 0
    ];
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.72;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.42;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.75;
      this.sfxGain.connect(this.masterGain);

      this.noiseBuffer = this.createNoiseBuffer();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  createNoiseBuffer() {
    const sampleRate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, sampleRate * 0.5, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.72, this.ctx.currentTime, 0.02);
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setTempoMultiplier(mult) {
    this.tempoMultiplier = Math.max(0.55, Math.min(1.65, mult));
  }

  startMusic() {
    if (!this.ensureContext() || this.musicPlaying) return;
    this.musicPlaying = true;
    this.stepIndex = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.06;
    this.schedulerId = window.setInterval(() => this.scheduleMusic(), 35);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.schedulerId !== null) {
      window.clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
  }

  scheduleMusic() {
    if (!this.ctx || !this.musicPlaying) return;
    const baseBpm = 128 * this.tempoMultiplier;
    const stepDuration = 60 / baseBpm / 4; // 16-е ноты

    while (this.nextNoteTime < this.ctx.currentTime + 0.14) {
      this.triggerStep(this.stepIndex, this.nextNoteTime, stepDuration);
      this.nextNoteTime += stepDuration;
      this.stepIndex = (this.stepIndex + 1) % 16;
    }
  }

  triggerStep(step, time, stepDur) {
    // Кик на 0, 4, 8, 12 + синкопа на 14
    if (step % 4 === 0 || step === 14) {
      this.playKick(time);
    }
    // Снэйр/клэп на 4 и 12
    if (step === 4 || step === 12) {
      this.playSnare(time);
    }
    // Хэт на четных и слабых долях
    if (step % 2 === 1) {
      this.playHat(time, 0.045);
    }
    // Пост-панк/фонк бас
    const bassFreq = this.bassPattern[step];
    if (bassFreq > 0) {
      this.playBassNote(bassFreq, time, stepDur * 1.45);
    }
    // Легкий фонк-коубелл при ускорении
    const cowFreq = this.cowbellPattern[step];
    if (cowFreq > 0 && this.tempoMultiplier >= 1.05) {
      this.playCowbell(cowFreq, time, 0.09);
    }
  }

  playKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(145, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);
    gain.gain.setValueAtTime(0.75, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.17);
  }

  playSnare(time) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, time);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.32, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    src.start(time);
    src.stop(time + 0.12);
  }

  playHat(time, dur) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7200, time);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.11, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    src.start(time);
    src.stop(time + dur + 0.01);
  }

  playBassNote(freq, time, dur) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420 * this.tempoMultiplier, time);
    filter.frequency.exponentialRampToValueAtTime(160, time + dur);
    gain.gain.setValueAtTime(0.28, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  playCowbell(freq, time, dur) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + dur + 0.01);
  }

  // ---- SFX ----
  playTone(type, startFreq, endFreq, duration, volume = 0.25, delay = 0) {
    if (!this.ensureContext() || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  playSwipe() {
    this.playTone('triangle', 320, 620, 0.08, 0.2);
  }

  playJump() {
    this.playTone('sine', 210, 560, 0.14, 0.28);
    this.playTone('triangle', 420, 740, 0.1, 0.12, 0.02);
  }

  playSlide() {
    this.playTone('sawtooth', 260, 95, 0.15, 0.18);
  }

  playMediator() {
    this.playTone('sine', 880, 1320, 0.09, 0.22);
    this.playTone('triangle', 1320, 1760, 0.1, 0.14, 0.045);
  }

  playCanOpen() {
    if (!this.ensureContext() || this.muted) return;
    const t = this.ctx.currentTime;
    // Пшик банки
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4200, t);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.42, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
    src.stop(t + 0.24);
    // Кислотный разгон
    this.playTone('sawtooth', 240, 980, 0.26, 0.22, 0.05);
  }

  playShield() {
    this.playTone('triangle', 440, 660, 0.12, 0.24);
    this.playTone('sine', 660, 990, 0.18, 0.22, 0.08);
  }

  playSlowmo() {
    this.playTone('square', 780, 260, 0.26, 0.18);
    this.playTone('sine', 520, 190, 0.3, 0.2, 0.06);
  }

  playCassette() {
    this.playTone('triangle', 523.25, 659.25, 0.11, 0.24, 0);
    this.playTone('triangle', 659.25, 783.99, 0.11, 0.24, 0.09);
    this.playTone('sine', 783.99, 1046.5, 0.24, 0.26, 0.18);
  }

  playSmash() {
    if (!this.ensureContext() || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
    src.stop(t + 0.24);
    this.playTone('sawtooth', 160, 55, 0.18, 0.28);
  }

  playHit() {
    this.playTone('sawtooth', 140, 36, 0.32, 0.36);
    this.playSmash();
  }

  playClick() {
    this.playTone('triangle', 640, 860, 0.05, 0.14);
  }
}

// ===================== ПРОЦЕДУРНЫЕ 3D-МОДЕЛИ =====================
function createAltushkaRig() {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const matSkin = new THREE.MeshStandardMaterial({ color: 0xf6e6f0, roughness: 0.65 });
  const matHairDark = new THREE.MeshStandardMaterial({ color: 0x120d1a, roughness: 0.7 });
  const matHairPink = new THREE.MeshStandardMaterial({
    color: 0xff2a85,
    emissive: 0xff2a85,
    emissiveIntensity: 0.35,
    roughness: 0.45
  });
  const matHoodie = new THREE.MeshStandardMaterial({ color: 0x1b1526, roughness: 0.85 });
  const matHoodieTrim = new THREE.MeshStandardMaterial({
    color: 0x9d4edd,
    emissive: 0x9d4edd,
    emissiveIntensity: 0.55
  });
  const matSkirt = new THREE.MeshStandardMaterial({ color: 0x261736, roughness: 0.8 });
  const matBoot = new THREE.MeshStandardMaterial({ color: 0x0b090f, roughness: 0.5, metalness: 0.25 });
  const matSole = new THREE.MeshStandardMaterial({
    color: 0xff2a85,
    emissive: 0xff2a85,
    emissiveIntensity: 0.4
  });
  const matStripeDark = new THREE.MeshStandardMaterial({ color: 0x120f17, roughness: 0.8 });
  const matStripePink = new THREE.MeshStandardMaterial({ color: 0xff99c8, roughness: 0.6 });

  // Оверсайз-худи (торс)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.68, 0.42), matHoodie);
  torso.position.set(0, 1.06, 0);
  bodyPivot.add(torso);

  // Капюшон и неоновая полоса на спине
  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.22, 0.36), matHoodie);
  hood.position.set(0, 1.38, 0.14);
  bodyPivot.add(hood);

  const backStripe = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.04), matHoodieTrim);
  backStripe.position.set(0, 1.06, 0.22);
  bodyPivot.add(backStripe);

  // Юбка-плиссе
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 0.28, 8), matSkirt);
  skirt.position.set(0, 0.66, 0);
  bodyPivot.add(skirt);

  // Чокер
  const choker = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.08, 10),
    new THREE.MeshStandardMaterial({ color: 0x09090b, emissive: 0xff2a85, emissiveIntensity: 0.4 })
  );
  choker.position.set(0, 1.44, 0);
  bodyPivot.add(choker);

  // Голова
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.66, 0);
  bodyPivot.add(headGroup);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.4, 0.38), matSkin);
  headGroup.add(head);

  const hairCap = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.26, 0.43), matHairDark);
  hairCap.position.set(0, 0.12, 0.02);
  headGroup.add(hairCap);

  const bangs = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.14, 0.1), matHairPink);
  bangs.position.set(0, 0.1, -0.19);
  headGroup.add(bangs);

  // Двухцветные хвостики (черно-розовые)
  const leftTailPivot = new THREE.Group();
  leftTailPivot.position.set(-0.28, 0.14, 0.06);
  headGroup.add(leftTailPivot);
  const leftBun = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), matHairDark);
  leftTailPivot.add(leftBun);
  const leftTailTop = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.42, 7), matHairDark);
  leftTailTop.position.set(-0.08, -0.22, 0.06);
  leftTailTop.rotation.z = -0.28;
  leftTailPivot.add(leftTailTop);
  const leftTailTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 7), matHairPink);
  leftTailTip.position.set(-0.14, -0.46, 0.09);
  leftTailTip.rotation.z = -0.28;
  leftTailPivot.add(leftTailTip);

  const rightTailPivot = new THREE.Group();
  rightTailPivot.position.set(0.28, 0.14, 0.06);
  headGroup.add(rightTailPivot);
  const rightBun = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), matHairPink);
  rightTailPivot.add(rightBun);
  const rightTailTop = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.42, 7), matHairPink);
  rightTailTop.position.set(0.08, -0.22, 0.06);
  rightTailTop.rotation.z = 0.28;
  rightTailPivot.add(rightTailTop);
  const rightTailTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 7), matHairDark);
  rightTailTip.position.set(0.14, -0.46, 0.09);
  rightTailTip.rotation.z = 0.28;
  rightTailPivot.add(rightTailTip);

  // Рукава худи
  const makeArm = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.42, 1.32, 0);
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.56, 0.22), matHoodie);
    sleeve.position.set(0, -0.24, 0);
    pivot.add(sleeve);
    const cuff = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.08, 0.23), matHairPink);
    cuff.position.set(0, -0.5, 0);
    pivot.add(cuff);
    bodyPivot.add(pivot);
    return pivot;
  };
  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);

  // Ноги: полосатые гетры + массивные ботинки на платформе
  const makeLeg = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.17, 0.56, 0);

    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.16), matSkin);
    thigh.position.set(0, -0.08, 0);
    pivot.add(thigh);

    // Полосатые гетры (4 сегмента)
    for (let i = 0; i < 4; i++) {
      const seg = new THREE.Mesh(
        new THREE.BoxGeometry(0.19, 0.075, 0.19),
        i % 2 === 0 ? matStripeDark : matStripePink
      );
      seg.position.set(0, -0.22 - i * 0.075, 0);
      pivot.add(seg);
    }

    // Ботинок на платформе
    const bootUpper = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.34), matBoot);
    bootUpper.position.set(0, -0.51, -0.04);
    pivot.add(bootUpper);

    const platform = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.09, 0.36), matSole);
    platform.position.set(0, -0.6, -0.04);
    pivot.add(platform);

    bodyPivot.add(pivot);
    return pivot;
  };
  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);

  // Визуальный купол Чокер-щита
  const shieldAura = new THREE.Mesh(
    new THREE.SphereGeometry(1.12, 16, 12),
    new THREE.MeshBasicMaterial({
      color: 0xe0aaff,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    })
  );
  shieldAura.position.set(0, 0.95, 0);
  shieldAura.visible = false;
  root.add(shieldAura);

  // Визуальная неоновая аура Энергетика
  const energyAura = new THREE.Mesh(
    new THREE.ConeGeometry(0.95, 2.2, 8, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xff2a85,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    })
  );
  energyAura.rotation.x = Math.PI / 2;
  energyAura.position.set(0, 0.95, 0.15);
  energyAura.visible = false;
  root.add(energyAura);

  return {
    root,
    bodyPivot,
    headGroup,
    leftTailPivot,
    rightTailPivot,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    shieldAura,
    energyAura
  };
}

function createSkufRig() {
  const root = new THREE.Group();
  const matCoat = new THREE.MeshStandardMaterial({ color: 0x4b4e57, roughness: 0.9 });
  const matPants = new THREE.MeshStandardMaterial({ color: 0x262830, roughness: 0.9 });
  const matSkin = new THREE.MeshStandardMaterial({ color: 0xd9b3a3, roughness: 0.75 });
  const matCap = new THREE.MeshStandardMaterial({ color: 0x22252e, roughness: 0.8 });
  const matGlow = new THREE.MeshStandardMaterial({
    color: 0xff3b3b,
    emissive: 0xff2244,
    emissiveIntensity: 1.1
  });

  // Массивный пузатый силуэт патрульного
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.56, 0.92, 8), matCoat);
  torso.position.set(0, 1.02, 0);
  root.add(torso);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.4), matSkin);
  head.position.set(0, 1.66, 0);
  root.add(head);

  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.5), matCap);
  cap.position.set(0, 1.84, -0.05);
  root.add(cap);

  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.05), matGlow);
  badge.position.set(0.16, 1.24, -0.47);
  root.add(badge);

  const makeArm = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.54, 1.32, 0);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.56, 0.22), matCoat);
    arm.position.set(0, -0.24, 0);
    pivot.add(arm);
    if (side === 1) {
      const baton = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.62, 6), matGlow);
      baton.position.set(0, -0.45, -0.28);
      baton.rotation.x = Math.PI / 2.4;
      pivot.add(baton);
    }
    root.add(pivot);
    return pivot;
  };
  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);

  const makeLeg = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.22, 0.56, 0);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.56, 0.24), matPants);
    leg.position.set(0, -0.28, 0);
    pivot.add(leg);
    root.add(pivot);
    return pivot;
  };
  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);

  return { root, leftArm, rightArm, leftLeg, rightLeg };
}

function createObstacleMesh(type, sharedMats) {
  const group = new THREE.Group();

  if (type === 'low') {
    // Низкий неоновый дорожный барьер (прыжок)
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.72, 0.55), sharedMats.darkMetal);
    body.position.set(0, 0.56, 0);
    group.add(body);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.08, 0.18, 0.58), sharedMats.neonPink);
    stripe.position.set(0, 0.82, 0);
    group.add(stripe);

    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.5), sharedMats.darkMetal);
    legL.position.set(-0.82, 0.17, 0);
    group.add(legL);

    const legR = legL.clone();
    legR.position.x = 0.82;
    group.add(legR);
  } else if (type === 'high') {
    // Высокая неоновая арка (подкат)
    const pillarGeo = new THREE.BoxGeometry(0.22, 2.55, 0.42);
    const pillarL = new THREE.Mesh(pillarGeo, sharedMats.darkMetal);
    pillarL.position.set(-1.04, 1.275, 0);
    group.add(pillarL);

    const pillarR = new THREE.Mesh(pillarGeo, sharedMats.darkMetal);
    pillarR.position.set(1.04, 1.275, 0);
    group.add(pillarR);

    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.92, 0.52), sharedMats.darkMetal);
    topBeam.position.set(0, 2.02, 0);
    group.add(topBeam);

    const laserBar = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.24, 0.58), sharedMats.neonPurple);
    laserBar.position.set(0, 1.44, 0);
    group.add(laserBar);
  } else {
    // Вагон метро / ночной грузовик во всю полосу (смена полосы)
    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.15, 2.65, 8.6), sharedMats.trainBody);
    hull.position.set(0, 1.42, 0);
    group.add(hull);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.22, 8.2), sharedMats.darkMetal);
    roof.position.set(0, 2.82, 0);
    group.add(roof);

    const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.95, 0.12), sharedMats.neonCyan);
    frontGlass.position.set(0, 1.85, 4.32);
    group.add(frontGlass);

    const headlightL = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.12), sharedMats.neonPink);
    headlightL.position.set(-0.68, 0.72, 4.32);
    group.add(headlightL);

    const headlightR = headlightL.clone();
    headlightR.position.x = 0.68;
    group.add(headlightR);

    const sideStripe = new THREE.Mesh(new THREE.BoxGeometry(2.19, 0.24, 8.2), sharedMats.neonPurple);
    sideStripe.position.set(0, 1.05, 0);
    group.add(sideStripe);
  }

  group.visible = false;
  return group;
}

function createItemMesh(type, sharedMats) {
  const group = new THREE.Group();

  if (type === 'mediator') {
    // Медиатор (треугольная неоновая призма)
    const pick = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 3), sharedMats.neonPink);
    pick.rotation.x = Math.PI / 2;
    group.add(pick);
  } else if (type === 'energy') {
    // Банка энергетика
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.76, 10), sharedMats.neonPink);
    group.add(can);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.24, 10), sharedMats.neonCyan);
    group.add(band);
  } else if (type === 'shield') {
    // Чокер с шипами
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.09, 8, 16), sharedMats.darkMetal);
    group.add(ring);
    const glowRing = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.035, 6, 16), sharedMats.neonPurple);
    glowRing.position.z = 0.06;
    group.add(glowRing);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 5), sharedMats.neonCyan);
      spike.position.set(Math.cos(a) * 0.46, Math.sin(a) * 0.46, 0);
      spike.rotation.z = a - Math.PI / 2;
      group.add(spike);
    }
  } else if (type === 'slowmo') {
    // Тамагочи (яйцевидный брелок с экраном)
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 10), sharedMats.neonCyan);
    shell.scale.set(0.88, 1.12, 0.55);
    group.add(shell);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.25), sharedMats.darkMetal);
    screen.position.set(0, 0.05, 0.12);
    group.add(screen);
  } else {
    // Сюжетная кассета
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.62, 0.2), sharedMats.darkMetal);
    group.add(body);
    const label = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.34, 0.23), sharedMats.neonPink);
    label.position.y = 0.05;
    group.add(label);
    const reelGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.25, 10);
    const reelL = new THREE.Mesh(reelGeo, sharedMats.neonCyan);
    reelL.rotation.x = Math.PI / 2;
    reelL.position.set(-0.2, 0.05, 0);
    group.add(reelL);
    const reelR = reelL.clone();
    reelR.position.x = 0.2;
    group.add(reelR);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.03, 6, 20), sharedMats.neonPurple);
    group.add(halo);
  }

  group.visible = false;
  return group;
}

// ===================== ОСНОВНОЙ КЛАСС ИГРЫ =====================
class AltRunnerGame {
  constructor() {
    this.story = new StorySystem();
    this.sound = new SoundEngine();

    this.dom = this.cacheDom();
    this.state = 'hub'; // 'hub' | 'playing' | 'paused' | 'vn' | 'endings'

    // Физика игрока
    this.laneIndex = 1;
    this.playerX = LANES[1];
    this.playerY = 0;
    this.playerVelY = 0;
    this.isGrounded = true;
    this.slideTimer = 0;
    this.invulnTimer = 0;
    this.animClock = 0;

    // Преследователь («Скуф-патрульный»)
    this.pursuerTimer = 0;
    this.pursuerZ = 12;
    this.pursuerX = 0;

    // Параметры забега
    this.runDistance = 0;
    this.runMediators = 0;
    this.runSpeed = BASE_RUN_SPEED;
    this.spawnCooldownDist = 0;
    this.nextCassetteAt = this.story.getNextCassetteSpawnInterval();
    this.cassetteOnTrack = false;
    this.cameraShake = 0;

    // Баффы
    this.buffs = {
      energy: { active: false, remaining: 0, max: 6 },
      shield: { active: false, remaining: 0, max: 8 },
      slowmo: { active: false, remaining: 0, max: 5.5 }
    };

    // Визуальная новелла (печатный текст)
    this.vnState = {
      cassette: null,
      fullText: '',
      charIndex: 0,
      typingTimer: null,
      isTyping: false,
      phase: 'prompt', // 'prompt' | 'reply'
      pendingFinale: null,
      pendingUnlockChapter: null
    };

    // Переиспользуемые объекты коллизий (ноль аллокаций в игровом цикле)
    this.playerBox = new THREE.Box3();
    this.tempBox = new THREE.Box3();
    this.tempVec = new THREE.Vector3();

    // Трекинг свайпов
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.touchHandled = false;

    this.initThree();
    this.initWorldPools();
    this.applyChapterTheme(this.story.currentChapter);
    this.bindEvents();
    this.refreshHubUI();
    this.openHub(false);

    this.lastFrameTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  cacheDom() {
    const $ = (id) => document.getElementById(id);
    return {
      canvas: $('game-canvas'),
      hud: $('hud'),
      hudDistance: $('hud-distance'),
      hudMediators: $('hud-mediators'),
      hudChapter: $('hud-chapter'),
      hudChapterProgress: $('hud-chapter-progress'),
      btnMute: $('btn-mute'),
      btnPause: $('btn-pause'),
      buffEnergy: $('buff-energy'),
      buffEnergyTimer: $('buff-energy-timer'),
      buffEnergyBar: $('buff-energy-bar'),
      buffShield: $('buff-shield'),
      buffShieldTimer: $('buff-shield-timer'),
      buffShieldBar: $('buff-shield-bar'),
      buffSlowmo: $('buff-slowmo'),
      buffSlowmoTimer: $('buff-slowmo-timer'),
      buffSlowmoBar: $('buff-slowmo-bar'),

      modalHub: $('modal-hub'),
      hubLastRun: $('hub-last-run'),
      hubMediators: $('hub-mediators'),
      hubBestDistance: $('hub-best-distance'),
      hubChapterStatus: $('hub-chapter-status'),
      chapterList: $('chapter-list'),
      hubChapterDesc: $('hub-chapter-desc'),
      upgEnergyLvl: $('upg-energy-lvl'),
      upgEnergyCost: $('upg-energy-cost'),
      btnUpgEnergy: $('btn-upg-energy'),
      upgShieldLvl: $('upg-shield-lvl'),
      upgShieldCost: $('upg-shield-cost'),
      btnUpgShield: $('btn-upg-shield'),
      upgSlowmoLvl: $('upg-slowmo-lvl'),
      upgSlowmoCost: $('upg-slowmo-cost'),
      btnUpgSlowmo: $('btn-upg-slowmo'),
      btnResume: $('btn-resume'),
      btnRun: $('btn-run'),
      btnOpenEndings: $('btn-open-endings'),
      hubEndingsCount: $('hub-endings-count'),

      modalVn: $('modal-vn'),
      vnPortrait: $('vn-portrait'),
      vnSpeaker: $('vn-speaker'),
      vnMood: $('vn-mood'),
      vnText: $('vn-text'),
      vnChoices: $('vn-choices'),

      modalEndings: $('modal-endings'),
      btnCloseEndingsTop: $('btn-close-endings-top'),
      btnCloseEndings: $('btn-close-endings'),
      endingFeatured: $('ending-featured'),
      endingFeaturedTag: $('ending-featured-tag'),
      endingFeaturedArt: $('ending-featured-art'),
      endingFeaturedTitle: $('ending-featured-title'),
      endingFeaturedDesc: $('ending-featured-desc'),
      endingsGalleryCount: $('endings-gallery-count'),
      endingsGallery: $('endings-gallery')
    };
  }

  initThree() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.dom.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0714);
    this.scene.fog = new THREE.FogExp2(0x0b0714, 0.0155);

    this.camera = new THREE.PerspectiveCamera(
      62,
      window.innerWidth / window.innerHeight,
      0.1,
      190
    );
    this.camera.position.set(0, 4.5, 8.2);
    this.camera.lookAt(0, 1.4, -10);

    // Освещение
    this.hemiLight = new THREE.HemisphereLight(0xe0aaff, 0x160a24, 1.05);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xff99c8, 1.25);
    this.dirLight.position.set(6, 14, 10);
    this.scene.add(this.dirLight);

    this.accentLight = new THREE.PointLight(0xff2a85, 3.2, 26);
    this.accentLight.position.set(0, 3.5, 2.5);
    this.scene.add(this.accentLight);

    // Общие материалы для пула (обновляются по палитре главы)
    this.sharedMats = {
      darkMetal: new THREE.MeshStandardMaterial({ color: 0x161221, roughness: 0.65, metalness: 0.35 }),
      trainBody: new THREE.MeshStandardMaterial({ color: 0x201833, roughness: 0.55, metalness: 0.3 }),
      neonPink: new THREE.MeshStandardMaterial({
        color: 0xff2a85,
        emissive: 0xff2a85,
        emissiveIntensity: 0.95,
        roughness: 0.3
      }),
      neonPurple: new THREE.MeshStandardMaterial({
        color: 0x9d4edd,
        emissive: 0x9d4edd,
        emissiveIntensity: 0.9,
        roughness: 0.3
      }),
      neonCyan: new THREE.MeshStandardMaterial({
        color: 0x56cfe1,
        emissive: 0x56cfe1,
        emissiveIntensity: 0.9,
        roughness: 0.3
      }),
      building: new THREE.MeshStandardMaterial({ color: 0x110c1c, roughness: 0.9 }),
      road: new THREE.MeshStandardMaterial({ color: 0x0d0a14, roughness: 0.92 }),
      railLine: new THREE.MeshBasicMaterial({ color: 0x9d4edd })
    };

    // Героиня и преследователь
    this.altushka = createAltushkaRig();
    this.scene.add(this.altushka.root);

    this.skuf = createSkufRig();
    this.skuf.root.position.set(0, 0, this.pursuerZ);
    this.scene.add(this.skuf.root);
  }

  initWorldPools() {
    // Полотно трассы
    const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(10.5, TRACK_LENGTH), this.sharedMats.road);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, -TRACK_LENGTH / 2 + 20);
    this.scene.add(roadMesh);

    // Неоновые разделители 3 полос + бордюры
    const lineXs = [-4.2, -1.25, 1.25, 4.2];
    const lineGeo = new THREE.PlaneGeometry(0.11, TRACK_LENGTH);
    for (const lx of lineXs) {
      const strip = new THREE.Mesh(
        lineGeo,
        Math.abs(lx) > 3 ? this.sharedMats.neonPink : this.sharedMats.railLine
      );
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(lx, 0.02, -TRACK_LENGTH / 2 + 20);
      this.scene.add(strip);
    }

    // Пул бегущих шпал/поперечных неоновых полос для ощущения скорости
    this.trackBars = [];
    const barGeo = new THREE.BoxGeometry(8.4, 0.04, 0.16);
    for (let i = 0; i < 24; i++) {
      const bar = new THREE.Mesh(barGeo, this.sharedMats.railLine);
      bar.position.set(0, 0.015, 12 - i * 7);
      this.scene.add(bar);
      this.trackBars.push(bar);
    }

    // Пул зданий с неоновыми вывесками (левая и правая стороны)
    this.buildings = [];
    const bldGeo = new THREE.BoxGeometry(1, 1, 1);
    const signGeo = new THREE.BoxGeometry(0.16, 1.4, 2.8);
    const winGeo = new THREE.BoxGeometry(0.12, 0.55, 0.9);
    for (let i = 0; i < 36; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const zSlot = 14 - Math.floor(i / 2) * 9.5;
      const group = new THREE.Group();

      const width = 4.6 + (i % 3) * 1.4;
      const height = 8 + ((i * 7) % 14);
      const depth = 7.4;

      const body = new THREE.Mesh(bldGeo, this.sharedMats.building);
      body.scale.set(width, height, depth);
      body.position.set(0, height / 2, 0);
      group.add(body);

      const signMat = i % 3 === 0 ? this.sharedMats.neonPink : i % 3 === 1 ? this.sharedMats.neonPurple : this.sharedMats.neonCyan;
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(-side * (width / 2 + 0.08), 3.6 + (i % 4) * 1.6, 0);
      group.add(sign);

      // Несколько светящихся окон
      for (let w = 0; w < 3; w++) {
        const win = new THREE.Mesh(winGeo, w === 1 ? this.sharedMats.neonPurple : this.sharedMats.neonPink);
        win.position.set(-side * (width / 2 + 0.04), 2.2 + w * 2.2, (w - 1) * 1.9);
        group.add(win);
      }

      group.position.set(side * (6.2 + width / 2), 0, zSlot);
      this.scene.add(group);
      this.buildings.push({ group, side, width });
    }

    // Пул препятствий
    this.obstaclePool = [];
    const addObs = (type, count) => {
      for (let i = 0; i < count; i++) {
        const mesh = createObstacleMesh(type, this.sharedMats);
        this.scene.add(mesh);
        this.obstaclePool.push({
          type,
          mesh,
          active: false,
          lane: 1,
          z: -200,
          smashed: false,
          velX: 0,
          velY: 0,
          velZ: 0
        });
      }
    };
    addObs('low', 12);
    addObs('high', 10);
    addObs('train', 10);

    // Пул предметов
    this.itemPool = [];
    const addItems = (type, count) => {
      for (let i = 0; i < count; i++) {
        const mesh = createItemMesh(type, this.sharedMats);
        this.scene.add(mesh);
        this.itemPool.push({
          type,
          mesh,
          active: false,
          lane: 1,
          baseY: 1.0,
          z: -200
        });
      }
    };
    addItems('mediator', 48);
    addItems('energy', 4);
    addItems('shield', 4);
    addItems('slowmo', 4);
    addItems('cassette', 2);

    // Пул неоновых осколков (эффект разрушения препятствий / сбора предметов)
    this.particles = [];
    const partGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    for (let i = 0; i < 36; i++) {
      const mesh = new THREE.Mesh(partGeo, i % 2 === 0 ? this.sharedMats.neonPink : this.sharedMats.neonCyan);
      mesh.visible = false;
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        active: false,
        life: 0,
        vx: 0,
        vy: 0,
        vz: 0
      });
    }
  }

  applyChapterTheme(chapterId) {
    const cfg = this.story.getChapterConfig(chapterId);
    const { fog, accent, secondary, grid } = cfg.palette;

    this.scene.background.setHex(fog);
    this.scene.fog.color.setHex(fog);
    this.accentLight.color.setHex(accent);

    this.sharedMats.neonPink.color.setHex(accent);
    this.sharedMats.neonPink.emissive.setHex(accent);
    this.sharedMats.neonPurple.color.setHex(secondary);
    this.sharedMats.neonPurple.emissive.setHex(secondary);
    this.sharedMats.railLine.color.setHex(grid);
  }

  // ===================== ОБРАБОТЧИКИ СОБЫТИЙ =====================
  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    });

    // Свайпы (Android touchstart / touchmove / touchend)
    const canvas = this.dom.canvas;
    canvas.addEventListener(
      'touchstart',
      (e) => {
        if (this.state !== 'playing' || !e.touches.length) return;
        this.sound.ensureContext();
        const t = e.touches[0];
        this.touchStartX = t.clientX;
        this.touchStartY = t.clientY;
        this.touchStartTime = performance.now();
        this.touchHandled = false;
      },
      { passive: true }
    );

    canvas.addEventListener(
      'touchmove',
      (e) => {
        if (this.state !== 'playing' || this.touchHandled || !e.touches.length) return;
        const t = e.touches[0];
        const dx = t.clientX - this.touchStartX;
        const dy = t.clientY - this.touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        if (Math.max(absX, absY) >= 28) {
          this.handleSwipeDirection(dx, dy, absX, absY);
          this.touchHandled = true;
        }
      },
      { passive: true }
    );

    canvas.addEventListener(
      'touchend',
      (e) => {
        if (this.state !== 'playing' || this.touchHandled || !e.changedTouches.length) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - this.touchStartX;
        const dy = t.clientY - this.touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        if (Math.max(absX, absY) >= 22) {
          this.handleSwipeDirection(dx, dy, absX, absY);
        }
      },
      { passive: true }
    );

    // Клавиатура (WASD / Стрелки / Пауза / Mute)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyM') {
        this.toggleMuteUI();
        return;
      }
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (this.state === 'playing') {
          this.pauseRun();
        } else if (this.state === 'paused') {
          this.resumeRun();
        } else if (this.state === 'endings') {
          this.closeEndings();
        }
        return;
      }
      if (this.state !== 'playing') return;

      this.sound.ensureContext();
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.moveLane(-1);
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.moveLane(1);
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          e.preventDefault();
          this.triggerJump();
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          this.triggerSlide();
          break;
        default:
          break;
      }
    });

    // HUD кнопки
    this.dom.btnMute.addEventListener('click', () => this.toggleMuteUI());
    this.dom.btnPause.addEventListener('click', () => {
      if (this.state === 'playing') {
        this.sound.playClick();
        this.pauseRun();
      }
    });

    // Хаб кнопки
    this.dom.btnRun.addEventListener('click', () => {
      this.sound.ensureContext();
      this.sound.playClick();
      this.startNewRun();
    });

    this.dom.btnResume.addEventListener('click', () => {
      this.sound.ensureContext();
      this.sound.playClick();
      this.resumeRun();
    });

    this.dom.chapterList.addEventListener('click', (e) => {
      const btn = e.target.closest('.chapter-btn');
      if (!btn || btn.disabled) return;
      const ch = Number(btn.dataset.chapter);
      if (this.story.selectChapter(ch)) {
        this.sound.playClick();
        this.applyChapterTheme(ch);
        this.refreshHubUI();
      }
    });

    const upgradeBtns = [this.dom.btnUpgEnergy, this.dom.btnUpgShield, this.dom.btnUpgSlowmo];
    for (const btn of upgradeBtns) {
      btn.addEventListener('click', () => {
        const key = btn.dataset.upgrade;
        const res = this.story.buyUpgrade(key);
        if (res.success) {
          this.sound.playMediator();
          this.refreshHubUI();
        }
      });
    }

    this.dom.btnOpenEndings.addEventListener('click', () => {
      this.sound.playClick();
      this.openEndings(null);
    });

    this.dom.btnCloseEndings.addEventListener('click', () => {
      this.sound.playClick();
      this.closeEndings();
    });

    this.dom.btnCloseEndingsTop.addEventListener('click', () => {
      this.sound.playClick();
      this.closeEndings();
    });

    // Тап по диалоговому окну ускоряет печатный текст
    this.dom.vnText.addEventListener('click', () => {
      if (this.state === 'vn' && this.vnState.isTyping) {
        this.finishTypewriterImmediately();
      }
    });
  }

  handleSwipeDirection(dx, dy, absX, absY) {
    if (absX > absY) {
      this.moveLane(dx > 0 ? 1 : -1);
    } else if (dy < 0) {
      this.triggerJump();
    } else {
      this.triggerSlide();
    }
  }

  toggleMuteUI() {
    this.sound.ensureContext();
    const muted = this.sound.toggleMute();
    this.dom.btnMute.classList.toggle('muted', muted);
    this.dom.btnMute.textContent = muted ? '✕' : '♪';
  }

  // ===================== УПРАВЛЕНИЕ ПЕРСОНАЖЕМ =====================
  moveLane(dir) {
    const next = Math.max(0, Math.min(2, this.laneIndex + dir));
    if (next !== this.laneIndex) {
      this.laneIndex = next;
      this.sound.playSwipe();
    }
  }

  triggerJump() {
    if (this.isGrounded) {
      this.isGrounded = false;
      this.playerVelY = JUMP_VELOCITY;
      this.slideTimer = 0;
      this.sound.playJump();
    }
  }

  triggerSlide() {
    if (!this.isGrounded) {
      this.playerVelY = FAST_FALL_VELOCITY;
    }
    this.slideTimer = SLIDE_DURATION;
    this.sound.playSlide();
  }

  // ===================== ПОТОК ЗАБЕГА И СОСТОЯНИЯ =====================
  clearTrackEntities() {
    for (const obs of this.obstaclePool) {
      obs.active = false;
      obs.smashed = false;
      obs.mesh.visible = false;
      obs.mesh.rotation.set(0, 0, 0);
    }
    for (const item of this.itemPool) {
      item.active = false;
      item.mesh.visible = false;
    }
    for (const p of this.particles) {
      p.active = false;
      p.mesh.visible = false;
    }
    this.cassetteOnTrack = false;
  }

  resetBuffs() {
    for (const key of ['energy', 'shield', 'slowmo']) {
      this.buffs[key].active = false;
      this.buffs[key].remaining = 0;
    }
    this.altushka.shieldAura.visible = false;
    this.altushka.energyAura.visible = false;
    this.updateBuffHud();
  }

  startNewRun() {
    this.clearTrackEntities();
    this.resetBuffs();

    this.laneIndex = 1;
    this.playerX = LANES[1];
    this.playerY = 0;
    this.playerVelY = 0;
    this.isGrounded = true;
    this.slideTimer = 0;
    this.invulnTimer = 0;

    this.pursuerTimer = 0;
    this.pursuerZ = 12;
    this.pursuerX = 0;

    this.runDistance = 0;
    this.runMediators = 0;
    this.runSpeed = BASE_RUN_SPEED + (this.story.currentChapter - 1) * 1.8;
    this.spawnCooldownDist = 14;
    this.nextCassetteAt = this.story.getNextCassetteSpawnInterval();
    this.cameraShake = 0;

    this.applyChapterTheme(this.story.currentChapter);

    this.state = 'playing';
    this.dom.modalHub.classList.add('hidden');
    this.dom.modalVn.classList.add('hidden');
    this.dom.modalEndings.classList.add('hidden');
    this.dom.hud.classList.remove('hidden');

    this.updateRunHud();
    this.sound.setTempoMultiplier(1);
    this.sound.startMusic();
  }

  pauseRun() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.sound.stopMusic();
    this.dom.hud.classList.add('hidden');
    this.openHub(true, `ПАУЗА · Текущий забег: ${Math.floor(this.runDistance)} м · ✦ ${this.runMediators}`);
  }

  resumeRun() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.dom.modalHub.classList.add('hidden');
    this.dom.hud.classList.remove('hidden');
    this.sound.startMusic();
  }

  finishRun(reasonText, forcedFinale = null) {
    this.sound.stopMusic();
    const result = this.story.recordRun(this.runDistance, this.runMediators);
    const finale = forcedFinale || result.finaleEnding;

    this.dom.hud.classList.add('hidden');
    this.resetBuffs();

    if (finale) {
      this.openEndings(finale);
      return;
    }

    let summary = `${reasonText} +${result.distance} м · ✦ +${result.mediators}`;
    if (result.unlockedNextChapter) {
      const nextCfg = this.story.getChapterConfig(result.unlockedNextChapter);
      summary = `★ ГЛАВА ${result.unlockedNextChapter} ОТКРЫТА: «${nextCfg.title}»! (+${result.distance} м · ✦ +${result.mediators})`;
      this.applyChapterTheme(result.unlockedNextChapter);
    }

    this.openHub(false, summary);
  }

  // ===================== СПАВНЕР ПРЕПЯТСТВИЙ И ПРЕДМЕТОВ =====================
  acquireObstacle(type) {
    return this.obstaclePool.find((o) => !o.active && o.type === type) || null;
  }

  acquireItem(type) {
    return this.itemPool.find((it) => !it.active && it.type === type) || null;
  }

  spawnBurst(x, y, z, count = 10) {
    let spawned = 0;
    for (const p of this.particles) {
      if (p.active) continue;
      p.active = true;
      p.life = 0.55 + Math.random() * 0.25;
      p.mesh.visible = true;
      p.mesh.position.set(x, y, z);
      p.vx = (Math.random() - 0.5) * 9;
      p.vy = 2 + Math.random() * 6;
      p.vz = (Math.random() - 0.5) * 6;
      spawned++;
      if (spawned >= count) break;
    }
  }

  spawnWave() {
    const zBase = SPAWN_Z;
    const blockedLanes = new Set();

    // Решаем, нужно ли заспавнить сюжетную кассету
    const nextCassette = this.story.getNextUncollectedCassette();
    const shouldSpawnCassette =
      Boolean(nextCassette) && !this.cassetteOnTrack && this.runDistance >= this.nextCassetteAt;

    // 1. Гарантируем минимум 1 свободную или преодолимую полосу
    const openLane = Math.floor(Math.random() * 3);

    // 2. Спавн препятствий на 1–2 полосах
    const patternRoll = Math.random();
    if (patternRoll < 0.42) {
      // 1–2 вагона на случайных полосах (кроме openLane)
      const candidates = [0, 1, 2].filter((l) => l !== openLane);
      const trainCount = Math.random() < 0.45 ? 2 : 1;
      for (let i = 0; i < trainCount; i++) {
        const lane = candidates[i];
        const obs = this.acquireObstacle('train');
        if (obs) {
          obs.active = true;
          obs.smashed = false;
          obs.lane = lane;
          obs.z = zBase - i * 4.5;
          obs.mesh.position.set(LANES[lane], 0, obs.z);
          obs.mesh.rotation.set(0, 0, 0);
          obs.mesh.visible = true;
          blockedLanes.add(lane);
        }
      }
      // На свободной полосе иногда ставим барьер или арку (кроме спавна кассеты)
      if (!shouldSpawnCassette && Math.random() < 0.55) {
        const type = Math.random() < 0.5 ? 'low' : 'high';
        const obs = this.acquireObstacle(type);
        if (obs) {
          obs.active = true;
          obs.smashed = false;
          obs.lane = openLane;
          obs.z = zBase;
          obs.mesh.position.set(LANES[openLane], 0, obs.z);
          obs.mesh.rotation.set(0, 0, 0);
          obs.mesh.visible = true;
        }
      }
    } else {
      // Комбинация из низких барьеров и высоких арок
      const count = Math.random() < 0.6 ? 2 : 3;
      const lanes = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, count);
      for (const lane of lanes) {
        if (shouldSpawnCassette && lane === openLane) continue;
        const type = Math.random() < 0.52 ? 'low' : 'high';
        const obs = this.acquireObstacle(type);
        if (obs) {
          obs.active = true;
          obs.smashed = false;
          obs.lane = lane;
          obs.z = zBase;
          obs.mesh.position.set(LANES[lane], 0, obs.z);
          obs.mesh.rotation.set(0, 0, 0);
          obs.mesh.visible = true;
        }
      }
    }

    // 3. Спавн кассеты или баффа / линии медиаторов на безопасной полосе
    if (shouldSpawnCassette) {
      const cass = this.acquireItem('cassette');
      if (cass) {
        cass.active = true;
        cass.lane = openLane;
        cass.baseY = 1.25;
        cass.z = zBase - 2;
        cass.mesh.position.set(LANES[openLane], cass.baseY, cass.z);
        cass.mesh.visible = true;
        this.cassetteOnTrack = true;
        this.nextCassetteAt = this.runDistance + this.story.getNextCassetteSpawnInterval();
      }
      return;
    }

    // Шанс спавна баффа
    const buffRoll = Math.random();
    if (buffRoll < 0.16) {
      const buffTypes = ['energy', 'shield', 'slowmo'];
      const chosen = buffTypes[Math.floor(Math.random() * buffTypes.length)];
      const item = this.acquireItem(chosen);
      if (item) {
        item.active = true;
        item.lane = openLane;
        item.baseY = 1.15;
        item.z = zBase - 5.5;
        item.mesh.position.set(LANES[openLane], item.baseY, item.z);
        item.mesh.visible = true;
      }
    } else {
      // Линия медиаторов (3–5 штук)
      const count = 3 + Math.floor(Math.random() * 3);
      const isJumpArc = Math.random() < 0.35;
      for (let i = 0; i < count; i++) {
        const med = this.acquireItem('mediator');
        if (!med) break;
        med.active = true;
        med.lane = openLane;
        med.baseY = isJumpArc ? 1.0 + Math.sin((i / (count - 1)) * Math.PI) * 1.45 : 0.95;
        med.z = zBase - 7 + i * 2.5;
        med.mesh.position.set(LANES[openLane], med.baseY, med.z);
        med.mesh.visible = true;
      }
    }
  }

  // ===================== ОБНОВЛЕНИЕ ФИЗИКИ И КОЛЛИЗИЙ =====================
  updatePlaying(rawDt) {
    const slowScale = this.buffs.slowmo.active ? this.story.getUpgradeEffect('tamagotchi').timeScale : 1;
    const worldDt = rawDt * slowScale;
    this.animClock += worldDt;

    // Обновление таймеров баффов (в реальном времени)
    this.updateBuffTimers(rawDt);

    if (this.invulnTimer > 0) {
      this.invulnTimer = Math.max(0, this.invulnTimer - rawDt);
    }

    // Скорость и темп музыки
    this.runSpeed = Math.min(MAX_RUN_SPEED, this.runSpeed + SPEED_ACCEL_PER_SEC * worldDt);
    const energyMult = this.buffs.energy.active
      ? this.story.getUpgradeEffect('energy').speedMultiplier
      : 1;
    const effectiveSpeed = this.runSpeed * energyMult;

    const musicTempo = this.buffs.energy.active
      ? 1.38
      : this.buffs.slowmo.active
        ? 0.72
        : 1 + (this.runSpeed - BASE_RUN_SPEED) / 90;
    this.sound.setTempoMultiplier(musicTempo);

    // Продвижение дистанции
    const dz = effectiveSpeed * worldDt;
    this.runDistance += dz * 0.85;

    // Проверка авто-завершения главы, если игрок уже собрал все 3 кассеты и добил дистанцию
    const chProg = this.story.getChapterProgress();
    if (
      chProg.cassettesCollected >= chProg.cassettesTotal &&
      chProg.distance + this.runDistance >= chProg.targetDistance
    ) {
      this.finishRun(`ГЛАВА ${this.story.currentChapter} ПРОЙДЕНА!`);
      return;
    }

    // Плавный переход между полосами
    const targetX = LANES[this.laneIndex];
    this.playerX += (targetX - this.playerX) * Math.min(1, LANE_SWITCH_SPEED * rawDt);

    // Прыжок и гравитация
    if (!this.isGrounded) {
      this.playerVelY += GRAVITY * worldDt;
      this.playerY += this.playerVelY * worldDt;
      if (this.playerY <= 0) {
        this.playerY = 0;
        this.playerVelY = 0;
        this.isGrounded = true;
      }
    }

    // Подкат
    if (this.slideTimer > 0) {
      this.slideTimer = Math.max(0, this.slideTimer - worldDt);
    }

    // Анимация Альтушки
    this.animateAltushka(effectiveSpeed);

    // Анимация и позиция преследователя («Скуф-патрульный»)
    this.updatePursuer(rawDt, worldDt);

    // Движение трассы и зданий (пул)
    for (const bar of this.trackBars) {
      bar.position.z += dz;
      if (bar.position.z > 16) {
        bar.position.z -= 24 * 7;
      }
    }
    for (const b of this.buildings) {
      b.group.position.z += dz;
      if (b.group.position.z > 20) {
        b.group.position.z -= 18 * 9.5;
      }
    }

    // Спавн новых волн
    this.spawnCooldownDist -= dz;
    if (this.spawnCooldownDist <= 0) {
      this.spawnWave();
      this.spawnCooldownDist = Math.max(17, 25 - (this.runSpeed - BASE_RUN_SPEED) * 0.25);
    }

    // Актуальный честный хитбокс игрока (сжимается при подкате)
    const isSliding = this.slideTimer > 0 && this.isGrounded;
    const hitboxHeight = isSliding ? 0.8 : 1.72;
    this.playerBox.min.set(this.playerX - 0.34, this.playerY + 0.04, -0.32);
    this.playerBox.max.set(this.playerX + 0.34, this.playerY + hitboxHeight, 0.32);

    // Обновление препятствий и коллизий
    for (const obs of this.obstaclePool) {
      if (!obs.active) continue;
      if (obs.smashed) {
        obs.mesh.position.x += obs.velX * rawDt;
        obs.mesh.position.y += obs.velY * rawDt;
        obs.mesh.position.z += obs.velZ * rawDt;
        obs.velY -= 26 * rawDt;
        obs.mesh.rotation.x += 6 * rawDt;
        obs.mesh.rotation.z += 5 * rawDt;
        if (obs.mesh.position.y < -4 || obs.mesh.position.z > 20) {
          obs.active = false;
          obs.smashed = false;
          obs.mesh.visible = false;
        }
        continue;
      }

      obs.z += dz;
      obs.mesh.position.z = obs.z;

      if (obs.z > DESPAWN_Z) {
        obs.active = false;
        obs.mesh.visible = false;
        continue;
      }

      // Проверка столкновения только рядом с игроком
      if (Math.abs(obs.z) < 5.5) {
        this.computeObstacleBox(obs, this.tempBox);
        if (this.playerBox.intersectsBox(this.tempBox)) {
          const died = this.handleObstacleCollision(obs);
          if (died) return;
        }
      }
    }

    // Обновление предметов и магнит Чокер-щита
    const magnetActive = this.buffs.shield.active || this.buffs.energy.active;
    for (const item of this.itemPool) {
      if (!item.active) continue;
      item.z += dz;
      item.mesh.position.z = item.z;
      item.mesh.rotation.y += 3.2 * worldDt;
      item.mesh.position.y = item.baseY + Math.sin(this.animClock * 4.5 + item.z * 0.3) * 0.14;

      // Магнит для медиаторов
      if (item.type === 'mediator' && magnetActive && item.z > -15 && item.z < 2.2) {
        item.mesh.position.x += (this.playerX - item.mesh.position.x) * Math.min(1, 12 * rawDt);
        item.mesh.position.y += (this.playerY + 1.0 - item.mesh.position.y) * Math.min(1, 12 * rawDt);
        item.z += (0 - item.z) * Math.min(1, 8 * rawDt);
        item.mesh.position.z = item.z;
      }

      if (item.z > DESPAWN_Z) {
        if (item.type === 'cassette') {
          this.cassetteOnTrack = false;
          // Если игрок пропустил кассету — даем повторный шанс быстрее
          this.nextCassetteAt = this.runDistance + 420;
        }
        item.active = false;
        item.mesh.visible = false;
        continue;
      }

      if (Math.abs(item.z) < 2.2) {
        const radius = item.type === 'cassette' ? 0.72 : 0.48;
        this.tempBox.min.set(
          item.mesh.position.x - radius,
          item.mesh.position.y - radius,
          item.mesh.position.z - radius
        );
        this.tempBox.max.set(
          item.mesh.position.x + radius,
          item.mesh.position.y + radius,
          item.mesh.position.z + radius
        );
        if (this.playerBox.intersectsBox(this.tempBox)) {
          const openedVn = this.collectItem(item);
          if (openedVn) return;
        }
      }
    }

    // Обновление частиц
    for (const p of this.particles) {
      if (!p.active) continue;
      p.life -= rawDt;
      if (p.life <= 0) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }
      p.mesh.position.x += p.vx * rawDt;
      p.mesh.position.y += p.vy * rawDt;
      p.mesh.position.z += p.vz * rawDt;
      p.vy -= 18 * rawDt;
      p.mesh.rotation.x += 8 * rawDt;
      p.mesh.rotation.y += 6 * rawDt;
      p.mesh.scale.setScalar(Math.max(0.05, p.life * 1.4));
    }

    // Камера с легким наклоном, FOV под энергетиком и тряской
    const targetFov = this.buffs.energy.active ? 74 : this.buffs.slowmo.active ? 56 : 62;
    this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, 6 * rawDt);
    this.camera.updateProjectionMatrix();

    let shakeX = 0;
    let shakeY = 0;
    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - rawDt * 3.2);
      shakeX = (Math.random() - 0.5) * this.cameraShake * 0.7;
      shakeY = (Math.random() - 0.5) * this.cameraShake * 0.5;
    }

    this.camera.position.set(
      this.playerX * 0.48 + shakeX,
      4.5 + this.playerY * 0.3 + shakeY,
      8.2
    );
    this.camera.lookAt(this.playerX * 0.24, 1.35 + this.playerY * 0.2, -10);
    this.accentLight.position.set(this.playerX, 3.2, 2.2);

    this.updateRunHud();
  }

  computeObstacleBox(obs, targetBox) {
    const x = obs.mesh.position.x;
    const z = obs.z;
    if (obs.type === 'low') {
      targetBox.min.set(x - 0.94, 0, z - 0.32);
      targetBox.max.set(x + 0.94, 0.96, z + 0.32);
    } else if (obs.type === 'high') {
      // Верхняя балка: при подкате (высота игрока 0.8) проходим чисто снизу
      targetBox.min.set(x - 0.96, 1.15, z - 0.36);
      targetBox.max.set(x + 0.96, 2.55, z + 0.36);
    } else {
      // Вагон / грузовик
      targetBox.min.set(x - 0.98, 0, z - 4.18);
      targetBox.max.set(x + 0.98, 2.75, z + 4.18);
    }
  }

  handleObstacleCollision(obs) {
    // 1. Энергетик: неуязвимость + разносим препятствие в щепки
    if (this.buffs.energy.active) {
      obs.smashed = true;
      obs.velX = (obs.lane <= this.laneIndex ? -1 : 1) * (8 + Math.random() * 6);
      obs.velY = 10 + Math.random() * 5;
      obs.velZ = -18;
      this.cameraShake = 0.45;
      this.sound.playSmash();
      this.spawnBurst(obs.mesh.position.x, 1.2, obs.z, 12);
      return false;
    }

    // Короткая неуязвимость после щита или спотыкания
    if (this.invulnTimer > 0) {
      return false;
    }

    // 2. Чокер-щит: поглощает 1 столкновение
    if (this.buffs.shield.active) {
      this.buffs.shield.active = false;
      this.buffs.shield.remaining = 0;
      this.altushka.shieldAura.visible = false;
      this.invulnTimer = 1.15;
      this.cameraShake = 0.65;
      obs.smashed = true;
      obs.velX = (Math.random() - 0.5) * 14;
      obs.velY = 9;
      obs.velZ = -14;
      this.sound.playSmash();
      this.spawnBurst(this.playerX, 1.1, 0, 14);
      this.updateBuffHud();
      return false;
    }

    // 3. Спотыкание о барьер/арку (если Скуф-патрульный еще далеко -> он выбегает за спину!)
    if (obs.type !== 'train' && this.pursuerTimer <= 0) {
      this.pursuerTimer = 7.0;
      this.invulnTimer = 0.9;
      this.cameraShake = 0.55;
      obs.smashed = true;
      obs.velX = (Math.random() - 0.5) * 8;
      obs.velY = 6;
      obs.velZ = -8;
      this.sound.playHit();
      this.spawnBurst(this.playerX, 0.9, 0, 8);
      return false;
    }

    // 4. Фатальное столкновение или поимка Скуф-патрульным
    this.sound.playHit();
    this.cameraShake = 0.9;
    this.pursuerZ = 1.6;
    this.skuf.root.position.set(this.playerX, 0, this.pursuerZ);
    this.spawnBurst(this.playerX, 1.1, 0, 16);
    const reason =
      obs.type === 'train'
        ? 'СНЕСС ВАГОН НА ПОЛНОЙ СКОРОСТИ!'
        : 'СКУФ-ПАТРУЛЬНЫЙ ДОГНАЛ ТЕБЯ!';
    this.finishRun(reason);
    return true;
  }

  collectItem(item) {
    item.active = false;
    item.mesh.visible = false;
    this.spawnBurst(item.mesh.position.x, item.mesh.position.y, item.mesh.position.z, 6);

    if (item.type === 'mediator') {
      this.runMediators += 1;
      this.sound.playMediator();
      return false;
    }

    if (item.type === 'energy') {
      const eff = this.story.getUpgradeEffect('energy');
      this.buffs.energy.active = true;
      this.buffs.energy.max = eff.duration;
      this.buffs.energy.remaining = eff.duration;
      this.altushka.energyAura.visible = true;
      this.story.recordEnergyDrink();
      this.sound.playCanOpen();
      this.updateBuffHud();
      return false;
    }

    if (item.type === 'shield') {
      const eff = this.story.getUpgradeEffect('choker');
      this.buffs.shield.active = true;
      this.buffs.shield.max = eff.duration;
      this.buffs.shield.remaining = eff.duration;
      this.altushka.shieldAura.visible = true;
      this.sound.playShield();
      this.updateBuffHud();
      return false;
    }

    if (item.type === 'slowmo') {
      const eff = this.story.getUpgradeEffect('tamagotchi');
      this.buffs.slowmo.active = true;
      this.buffs.slowmo.max = eff.duration;
      this.buffs.slowmo.remaining = eff.duration;
      this.sound.playSlowmo();
      this.updateBuffHud();
      return false;
    }

    if (item.type === 'cassette') {
      this.cassetteOnTrack = false;
      this.sound.playCassette();
      const cassette = this.story.getNextUncollectedCassette();
      if (cassette) {
        this.openVisualNovel(cassette);
        return true;
      }
    }

    return false;
  }

  updateBuffTimers(dt) {
    let dirty = false;
    for (const key of ['energy', 'shield', 'slowmo']) {
      const b = this.buffs[key];
      if (!b.active) continue;
      b.remaining -= dt;
      dirty = true;
      if (b.remaining <= 0) {
        b.active = false;
        b.remaining = 0;
        if (key === 'energy') this.altushka.energyAura.visible = false;
        if (key === 'shield') this.altushka.shieldAura.visible = false;
      }
    }
    if (dirty) {
      this.updateBuffHud();
    }
  }

  animateAltushka(speed) {
    const rig = this.altushka;
    rig.root.position.set(this.playerX, this.playerY, 0);

    // Легкий крен при смене полосы
    const laneDiff = LANES[this.laneIndex] - this.playerX;
    rig.root.rotation.z = -laneDiff * 0.14;

    const isSliding = this.slideTimer > 0 && this.isGrounded;
    if (isSliding) {
      // Подкат: пригибаемся и сжимаем силуэт
      rig.bodyPivot.position.y = -0.35;
      rig.bodyPivot.rotation.x = -0.95;
      rig.bodyPivot.scale.y = 0.72;
      rig.leftLeg.rotation.x = 0.65;
      rig.rightLeg.rotation.x = -0.3;
      rig.leftArm.rotation.x = -0.7;
      rig.rightArm.rotation.x = -0.7;
    } else if (!this.isGrounded) {
      // Прыжок
      rig.bodyPivot.position.y = 0;
      rig.bodyPivot.rotation.x = 0.14;
      rig.bodyPivot.scale.y = 1;
      rig.leftLeg.rotation.x = 0.72;
      rig.rightLeg.rotation.x = -0.55;
      rig.leftArm.rotation.x = -1.1;
      rig.rightArm.rotation.x = -0.9;
    } else {
      // Плавный цикл бега
      const freq = speed * 0.42;
      const swing = Math.sin(this.animClock * freq);
      rig.bodyPivot.position.y = Math.abs(Math.cos(this.animClock * freq)) * 0.11;
      rig.bodyPivot.rotation.x = 0.12;
      rig.bodyPivot.scale.y = 1;
      rig.leftLeg.rotation.x = swing * 0.95;
      rig.rightLeg.rotation.x = -swing * 0.95;
      rig.leftArm.rotation.x = -swing * 0.85;
      rig.rightArm.rotation.x = swing * 0.85;
    }

    // Подпрыгивание черно-розовых хвостиков
    const tailBounce = Math.sin(this.animClock * 11) * 0.18;
    rig.leftTailPivot.rotation.z = tailBounce;
    rig.rightTailPivot.rotation.z = -tailBounce;

    // Вращение аур баффов
    if (rig.shieldAura.visible) {
      rig.shieldAura.rotation.y += 0.04;
      rig.shieldAura.rotation.x += 0.02;
    }
    if (rig.energyAura.visible) {
      rig.energyAura.rotation.z += 0.14;
    }
  }

  updatePursuer(rawDt, worldDt) {
    if (this.pursuerTimer > 0) {
      this.pursuerTimer = Math.max(0, this.pursuerTimer - rawDt);
    }
    const targetZ = this.pursuerTimer > 0 ? 2.15 : 11.5;
    this.pursuerZ += (targetZ - this.pursuerZ) * Math.min(1, 3.8 * rawDt);
    this.pursuerX += (this.playerX - this.pursuerX) * Math.min(1, 6.5 * rawDt);

    const skuf = this.skuf;
    skuf.root.visible = this.pursuerZ < 10.5;
    if (!skuf.root.visible) return;

    const swing = Math.sin(this.animClock * 12);
    skuf.root.position.set(this.pursuerX, Math.abs(swing) * 0.08, this.pursuerZ);
    skuf.leftLeg.rotation.x = swing * 0.85;
    skuf.rightLeg.rotation.x = -swing * 0.85;
    skuf.leftArm.rotation.x = -swing * 0.75;
    skuf.rightArm.rotation.x = -0.6 + swing * 0.45;
  }

  updateIdleScene(dt) {
    this.animClock += dt;
    this.altushka.root.position.set(0, 0, 0);
    this.altushka.root.rotation.set(0, 0, 0);
    this.animateAltushka(12);
    this.skuf.root.visible = false;

    const dz = 8 * dt;
    for (const bar of this.trackBars) {
      bar.position.z += dz;
      if (bar.position.z > 16) bar.position.z -= 24 * 7;
    }
    for (const b of this.buildings) {
      b.group.position.z += dz;
      if (b.group.position.z > 20) b.group.position.z -= 18 * 9.5;
    }

    this.camera.position.set(Math.sin(this.animClock * 0.35) * 1.1, 4.4, 8.2);
    this.camera.lookAt(0, 1.4, -10);
  }

  // ===================== HUD И UI ХАБА =====================
  updateRunHud() {
    this.dom.hudDistance.textContent = String(Math.floor(this.runDistance));
    this.dom.hudMediators.textContent = String(this.story.currency + this.runMediators);

    const prog = this.story.getChapterProgress();
    const totalChDist = prog.distance + this.runDistance;
    const pct = Math.min(100, (totalChDist / prog.targetDistance) * 100);
    this.dom.hudChapter.textContent = `ГЛ.${prog.chapterId} · 📼${prog.cassettesCollected}/${prog.cassettesTotal}`;
    this.dom.hudChapterProgress.style.width = `${pct.toFixed(1)}%`;
  }

  updateBuffHud() {
    const sync = (key, pillEl, timerEl, barEl) => {
      const b = this.buffs[key];
      pillEl.classList.toggle('hidden', !b.active);
      if (b.active) {
        timerEl.textContent = `${b.remaining.toFixed(1)}s`;
        const pct = Math.max(0, Math.min(100, (b.remaining / b.max) * 100));
        barEl.style.width = `${pct.toFixed(1)}%`;
      }
    };
    sync('energy', this.dom.buffEnergy, this.dom.buffEnergyTimer, this.dom.buffEnergyBar);
    sync('shield', this.dom.buffShield, this.dom.buffShieldTimer, this.dom.buffShieldBar);
    sync('slowmo', this.dom.buffSlowmo, this.dom.buffSlowmoTimer, this.dom.buffSlowmoBar);
  }

  openHub(isPaused = false, noticeText = '') {
    this.state = isPaused ? 'paused' : 'hub';
    this.refreshHubUI();

    this.dom.btnResume.classList.toggle('hidden', !isPaused);
    this.dom.btnRun.textContent = isPaused ? 'НАЧАТЬ ЗАНОВО ✦' : 'БЕЖАТЬ ✦';

    if (noticeText) {
      this.dom.hubLastRun.textContent = noticeText;
      this.dom.hubLastRun.classList.remove('hidden');
    } else {
      this.dom.hubLastRun.classList.add('hidden');
    }

    this.dom.modalVn.classList.add('hidden');
    this.dom.modalEndings.classList.add('hidden');
    this.dom.modalHub.classList.remove('hidden');
  }

  refreshHubUI() {
    this.dom.hubMediators.textContent = String(this.story.currency);
    this.dom.hubBestDistance.textContent = String(this.story.bestDistance);
    this.dom.hubChapterStatus.textContent = `${this.story.unlockedChapter} / ${CHAPTERS.length}`;

    // Кнопки выбора глав
    const buttons = this.dom.chapterList.querySelectorAll('.chapter-btn');
    for (const btn of buttons) {
      const ch = Number(btn.dataset.chapter);
      const unlocked = ch <= this.story.unlockedChapter;
      const active = ch === this.story.currentChapter;
      const completed = this.story.isChapterComplete(ch);

      btn.disabled = !unlocked;
      btn.classList.toggle('locked', !unlocked);
      btn.classList.toggle('active', active);

      const stateEl = btn.querySelector('.ch-state');
      if (stateEl) {
        stateEl.textContent = !unlocked ? 'LOCK' : completed ? 'DONE' : active ? 'PLAY' : 'OPEN';
      }
    }

    // Описание и прогресс выбранной главы
    const prog = this.story.getChapterProgress();
    this.dom.hubChapterDesc.textContent =
      `Глава ${prog.chapterId}: «${prog.title}» · ${prog.distance}/${prog.targetDistance}м · Кассеты ${prog.cassettesCollected}/${prog.cassettesTotal}`;

    // Апгрейды
    const syncUpgrade = (key, lvlEl, costEl, btnEl) => {
      const lvl = this.story.getUpgradeLevel(key);
      const cost = this.story.getUpgradeCost(key);
      lvlEl.textContent = String(lvl);
      if (cost === null) {
        costEl.textContent = 'MAX';
        btnEl.disabled = true;
      } else {
        costEl.textContent = String(cost);
        btnEl.disabled = !this.story.canAffordUpgrade(key);
      }
    };
    syncUpgrade('energy', this.dom.upgEnergyLvl, this.dom.upgEnergyCost, this.dom.btnUpgEnergy);
    syncUpgrade('shield', this.dom.upgShieldLvl, this.dom.upgShieldCost, this.dom.btnUpgShield);
    syncUpgrade('slowmo', this.dom.upgSlowmoLvl, this.dom.upgSlowmoCost, this.dom.btnUpgSlowmo);

    // Счетчик концовок
    const gallery = this.story.getEndingsGallery();
    const unlockedCount = gallery.filter((e) => e.unlocked).length;
    this.dom.hubEndingsCount.textContent = `${unlockedCount}/${gallery.length}`;
  }

  // ===================== ВИЗУАЛЬНАЯ НОВЕЛЛА (КАССЕТЫ) =====================
  openVisualNovel(cassette) {
    this.state = 'vn';
    this.sound.stopMusic();
    this.dom.hud.classList.add('hidden');
    this.dom.modalVn.classList.remove('hidden');

    this.vnState.cassette = cassette;
    this.vnState.phase = 'prompt';
    this.vnState.pendingFinale = null;
    this.vnState.pendingUnlockChapter = null;

    this.dom.vnPortrait.innerHTML = getPortraitSVG(cassette.emotion);
    this.dom.vnSpeaker.textContent = cassette.speaker;
    this.dom.vnMood.textContent = `${cassette.title} · ${cassette.mood}`;

    this.startTypewriter(cassette.text, () => this.renderVnChoices(cassette.choices));
  }

  startTypewriter(text, onDone) {
    this.stopTypewriter();
    this.vnState.fullText = text;
    this.vnState.charIndex = 0;
    this.vnState.isTyping = true;
    this.vnState.onDone = onDone;

    this.dom.vnText.textContent = '';
    this.dom.vnText.classList.add('typing');
    this.dom.vnChoices.innerHTML = '';

    this.vnState.typingTimer = window.setInterval(() => {
      this.vnState.charIndex += 2;
      if (this.vnState.charIndex >= this.vnState.fullText.length) {
        this.finishTypewriterImmediately();
      } else {
        this.dom.vnText.textContent = this.vnState.fullText.slice(0, this.vnState.charIndex);
      }
    }, 22);
  }

  stopTypewriter() {
    if (this.vnState.typingTimer !== null) {
      window.clearInterval(this.vnState.typingTimer);
      this.vnState.typingTimer = null;
    }
  }

  finishTypewriterImmediately() {
    this.stopTypewriter();
    this.vnState.isTyping = false;
    this.dom.vnText.textContent = this.vnState.fullText;
    this.dom.vnText.classList.remove('typing');
    if (typeof this.vnState.onDone === 'function') {
      const cb = this.vnState.onDone;
      this.vnState.onDone = null;
      cb();
    }
  }

  renderVnChoices(choices) {
    this.dom.vnChoices.innerHTML = '';
    choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vn-choice-btn';
      btn.textContent = choice.label;
      btn.addEventListener('click', () => this.handleVnChoice(idx));
      this.dom.vnChoices.appendChild(btn);
    });
  }

  handleVnChoice(choiceIndex) {
    if (!this.vnState.cassette) return;
    this.sound.playClick();
    const res = this.story.applyCassetteChoice(this.vnState.cassette.id, choiceIndex);
    if (!res) return;

    this.vnState.phase = 'reply';
    this.vnState.pendingFinale = res.finaleEnding;
    this.vnState.pendingUnlockChapter = res.unlockedNextChapter;

    this.dom.vnPortrait.innerHTML = getPortraitSVG(res.replyEmotion);
    const bonusLine = res.reward > 0 ? `\n\n[ +${res.reward} ✦ МЕДИАТОРОВ · КАССЕТА СОХРАНЕНА ]` : '';

    this.startTypewriter(`${res.reply}${bonusLine}`, () => {
      this.dom.vnChoices.innerHTML = '';
      const contBtn = document.createElement('button');
      contBtn.type = 'button';
      contBtn.className = 'vn-choice-btn';
      contBtn.textContent = this.vnState.pendingFinale
        ? 'ОТКРЫТЬ ФИНАЛ ИСТОРИИ ✦'
        : 'ВЕРНУТЬСЯ В ЗАБЕГ ▸';
      contBtn.addEventListener('click', () => this.closeVisualNovel());
      this.dom.vnChoices.appendChild(contBtn);
    });
  }

  closeVisualNovel() {
    this.stopTypewriter();
    this.sound.playClick();
    this.dom.modalVn.classList.add('hidden');

    if (this.vnState.pendingFinale) {
      this.finishRun('ФИНАЛ ДОСТИГНУТ!', this.vnState.pendingFinale);
      return;
    }

    if (this.vnState.pendingUnlockChapter) {
      this.applyChapterTheme(this.vnState.pendingUnlockChapter);
    }

    // Даем короткую неуязвимость при возврате в забег, чтобы не врезаться мгновенно
    this.invulnTimer = 1.6;
    this.state = 'playing';
    this.dom.hud.classList.remove('hidden');
    this.updateRunHud();
    this.sound.startMusic();
  }

  // ===================== ЭКРАН ФИНАЛА / ГАЛЕРЕЯ КОНЦОВОК =====================
  openEndings(featuredEnding = null) {
    this.state = 'endings';
    this.dom.modalHub.classList.add('hidden');
    this.dom.modalVn.classList.add('hidden');
    this.dom.hud.classList.add('hidden');
    this.dom.modalEndings.classList.remove('hidden');

    this.renderFeaturedEnding(featuredEnding);

    const gallery = this.story.getEndingsGallery();
    const unlockedCount = gallery.filter((e) => e.unlocked).length;
    this.dom.endingsGalleryCount.textContent = `${unlockedCount} / ${gallery.length}`;

    this.dom.endingsGallery.innerHTML = '';
    for (const item of gallery) {
      const card = document.createElement('div');
      card.className = `ending-card ${item.unlocked ? 'unlocked' : 'locked'}`;

      const head = document.createElement('div');
      head.className = 'ending-card-head';
      head.innerHTML = `<span>${item.unlocked ? item.title : '??? [ЗАБЛОКИРОВАНО]'}</span><span>${item.unlocked ? 'OPEN' : 'LOCK'}</span>`;

      const body = document.createElement('p');
      body.className = 'ending-card-body';
      body.textContent = item.unlocked
        ? item.summary
        : 'Пройди 5-ю главу («Крыша телебашни») с подходящими выборами, чтобы открыть этот финал.';

      card.appendChild(head);
      card.appendChild(body);

      if (item.unlocked) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          this.sound.playClick();
          this.renderFeaturedEnding(item);
        });
      }

      this.dom.endingsGallery.appendChild(card);
    }
  }

  renderFeaturedEnding(ending) {
    if (!ending) {
      this.dom.endingFeatured.classList.add('hidden');
      return;
    }
    this.dom.endingFeatured.classList.remove('hidden');
    this.dom.endingFeaturedTag.textContent = ending.tag || 'ФИНАЛ ОТКРЫТ';
    this.dom.endingFeaturedArt.innerHTML = getPortraitSVG(ending.emotion || 'smirk');
    this.dom.endingFeaturedTitle.textContent = ending.title;
    this.dom.endingFeaturedDesc.textContent = ending.description;
  }

  closeEndings() {
    this.dom.modalEndings.classList.add('hidden');
    this.openHub(false);
  }

  // ===================== ГЛАВНЫЙ ЦИКЛ =====================
  loop(now) {
    const rawDt = Math.min(0.05, Math.max(0.001, (now - this.lastFrameTime) / 1000));
    this.lastFrameTime = now;

    if (this.state === 'playing') {
      this.updatePlaying(rawDt);
    } else if (this.state === 'hub' || this.state === 'endings') {
      this.updateIdleScene(rawDt);
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame((t) => this.loop(t));
  }
}

// Запуск приложения
window.addEventListener('DOMContentLoaded', () => {
  new AltRunnerGame();
});
