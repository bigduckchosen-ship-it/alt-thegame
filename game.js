import * as THREE from 'three';
import { StorySystem, CHAPTERS, getPortraitSVG } from './story.js';

// ===================== КОНСТАНТЫ =====================
const LANES = [-2.5, 0, 2.5];
const GRAVITY = -44;
const JUMP_VELOCITY = 16.0;
const FAST_FALL_VELOCITY = -28;
const SLIDE_DURATION = 0.72;
const LANE_SWITCH_SPEED = 14.5;
const BASE_RUN_SPEED = 24;
const MAX_RUN_SPEED = 46;
const SPEED_ACCEL_PER_SEC = 0.16;
const TRACK_LENGTH = 190;
const SPAWN_Z = -134;
const DESPAWN_Z = 16;

// Светлые, контрастные комикс-палитры для каждой главы (препятствия отлично видны!)
const CHAPTER_THEMES = {
  1: { sky: 0x6c7ae0, fog: 0x8a95eb, fogDensity: 0.0068, sun: 0xfff3bf, accent: 0xff3b8d, secondary: 0x845ef7, hemiSky: 0xffffff, hemiGround: 0x7c6fa0 },
  2: { sky: 0xc96480, fog: 0xe08ea4, fogDensity: 0.0068, sun: 0xffe066, accent: 0xff2a7a, secondary: 0x3bc9db, hemiSky: 0xfff4e6, hemiGround: 0x8f5b78 },
  3: { sky: 0x9b72cf, fog: 0xbda3e6, fogDensity: 0.0065, sun: 0xfff0f6, accent: 0xff4d94, secondary: 0x38d9a9, hemiSky: 0xffffff, hemiGround: 0x8d72b5 },
  4: { sky: 0x3b82c4, fog: 0x6ca9e0, fogDensity: 0.0072, sun: 0xd0ebff, accent: 0x20c997, secondary: 0xff5ca8, hemiSky: 0xe7f5ff, hemiGround: 0x456990 },
  5: { sky: 0xd97398, fog: 0xf2a7be, fogDensity: 0.0062, sun: 0xffec99, accent: 0xff3b8d, secondary: 0x7950f2, hemiSky: 0xfff9db, hemiGround: 0x9c6282 }
};

// ===================== КОМИКСНЫЙ CEL-SHADING И ОБВОДКА =====================
function createToonGradientMap() {
  // 4-ступенчатая карта теней для четкого аниме/комикс шейдинга (RGBA для 100% совместимости с Android)
  const steps = [115, 175, 225, 255];
  const data = new Uint8Array(steps.length * 4);
  for (let i = 0; i < steps.length; i++) {
    const v = steps[i];
    data[i * 4] = v;
    data[i * 4 + 1] = v;
    data[i * 4 + 2] = v;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

const OUTLINE_MAT = new THREE.MeshBasicMaterial({
  color: 0x161124,
  side: THREE.BackSide
});

function addComicOutline(mesh, scale = 1.07) {
  const outline = new THREE.Mesh(mesh.geometry, OUTLINE_MAT);
  outline.scale.setScalar(scale);
  mesh.add(outline);
  return outline;
}

// ===================== ПРОЦЕДУРНЫЕ КОМИКС-ТЕКСТУРЫ =====================
function makeCanvasTex(w, h, drawFn, repeatX = 1, repeatY = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.needsUpdate = true;
  return tex;
}

function makeSockTexture(colorA, colorB) {
  return makeCanvasTex(64, 128, (ctx, w, h) => {
    for (let y = 0; y < h; y += 16) {
      ctx.fillStyle = (y / 16) % 2 === 0 ? colorA : colorB;
      ctx.fillRect(0, y, w, 16);
      ctx.fillStyle = '#14101f';
      ctx.fillRect(0, y, w, 2);
    }
  });
}

function createComicTextures() {
  // Светлый стилизованный асфальт с четкой комиксной разметкой
  const asphalt = makeCanvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#474b61';
    ctx.fillRect(0, 0, w, h);
    // Комиксные штрихи-точки
    ctx.fillStyle = 'rgba(20, 16, 36, 0.14)';
    for (let i = 0; i < 650; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 3, 2);
    }
    // Яркие разделители полос
    ctx.fillStyle = '#ffffff';
    for (let y = 12; y < h; y += 64) {
      ctx.fillRect(83, y, 6, 36);
      ctx.fillRect(167, y, 6, 36);
    }
    // Желтые боковые линии с черной обводкой
    ctx.fillStyle = '#14101f';
    ctx.fillRect(4, 0, 10, h);
    ctx.fillRect(w - 14, 0, 10, h);
    ctx.fillStyle = '#ffd43b';
    ctx.fillRect(6, 0, 6, h);
    ctx.fillRect(w - 12, 0, 6, h);
  }, 1, 18);

  // Светлая плитка тротуара
  const sidewalk = makeCanvasTex(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#c5bed9';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#3c3554';
    ctx.lineWidth = 3;
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
  }, 1, 24);

  // Комиксный фасад здания (пастельные панели + яркие обведенные окна)
  const buildingFacade = makeCanvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#d8d0eb';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#2d2642';
    ctx.lineWidth = 3;
    for (let y = 0; y < h; y += 64) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    const winColors = ['#74c0fc', '#ffe066', '#ffa8d6', '#b197fc', '#495070'];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const wx = col * 64 + 12;
        const wy = row * 64 + 14;
        ctx.fillStyle = '#161124';
        ctx.fillRect(wx - 3, wy - 3, 44, 38);
        ctx.fillStyle = winColors[(row * 3 + col) % winColors.length];
        ctx.fillRect(wx, wy, 38, 32);
        // Диагональный комиксный блик на стекле
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.beginPath();
        ctx.moveTo(wx + 4, wy + 28);
        ctx.lineTo(wx + 18, wy + 4);
        ctx.lineTo(wx + 26, wy + 4);
        ctx.lineTo(wx + 12, wy + 28);
        ctx.closePath();
        ctx.fill();
      }
    }
  }, 1, 1);

  // Мультяшный вагон с граффити и четкими окнами
  const trainSide = makeCanvasTex(256, 128, (ctx, w, h) => {
    ctx.fillStyle = '#5c7cfa';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffd43b';
    ctx.fillRect(0, 76, w, 16);
    ctx.fillStyle = '#161124';
    ctx.fillRect(0, 74, w, 3);
    ctx.fillRect(0, 92, w, 3);
    ctx.fillStyle = '#364fc7';
    ctx.fillRect(0, 95, w, 33);

    for (let x = 14; x < w - 20; x += 48) {
      ctx.fillStyle = '#161124';
      ctx.fillRect(x - 3, 16, 38, 44);
      ctx.fillStyle = '#d0ebff';
      ctx.fillRect(x, 19, 32, 38);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 4, 23, 7, 28);
    }
    // Поп-арт граффити
    ctx.strokeStyle = '#ff3b8d';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(22, 114);
    ctx.quadraticCurveTo(56, 86, 88, 114);
    ctx.quadraticCurveTo(118, 88, 148, 112);
    ctx.stroke();
  }, 1, 1);

  // Яркие контрастные полосы барьера
  const hazard = makeCanvasTex(128, 64, (ctx, w, h) => {
    ctx.fillStyle = '#ffd43b';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#161124';
    for (let i = -h; i < w + h; i += 28) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 14, 0);
      ctx.lineTo(i - 14, h);
      ctx.lineTo(i - 28, h);
      ctx.closePath();
      ctx.fill();
    }
  }, 2, 1);

  // Аниме-лицо для 3D-головы
  const faceTex = makeCanvasTex(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#ffe4e8';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255, 105, 165, 0.36)';
    ctx.beginPath();
    ctx.ellipse(30, 80, 12, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(98, 80, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    const eye = (cx, col) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(cx, 62, 14, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(cx, 63, 9, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#14101f';
      ctx.beginPath(); ctx.arc(cx, 64, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx - 3.5, 58, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#14101f';
      ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.moveTo(cx - 15, 54); ctx.quadraticCurveTo(cx, 46, cx + 15, 54); ctx.stroke();
    };
    eye(40, '#7c4dff');
    eye(88, '#ff3b8d');
    ctx.strokeStyle = '#d6336c';
    ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(55, 95); ctx.quadraticCurveTo(64, 102, 73, 95); ctx.stroke();
  });

  // Мягкая тень под ногами
  const blobShadow = makeCanvasTex(64, 64, (ctx, w, h) => {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    grad.addColorStop(0, 'rgba(20, 16, 36, 0.55)');
    grad.addColorStop(0.7, 'rgba(20, 16, 36, 0.22)');
    grad.addColorStop(1, 'rgba(20, 16, 36, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  });

  return { asphalt, sidewalk, buildingFacade, trainSide, hazard, faceTex, blobShadow };
}

// ===================== WEB AUDIO SYNTH =====================
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
      this.musicGain.gain.value = 0.4;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.75;
      this.sfxGain.connect(this.masterGain);

      this.noiseBuffer = this.createNoiseBuffer();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return true;
  }

  createNoiseBuffer() {
    const sampleRate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, sampleRate * 0.5, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
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
    const stepDuration = 60 / (128 * this.tempoMultiplier) / 4;
    while (this.nextNoteTime < this.ctx.currentTime + 0.14) {
      this.triggerStep(this.stepIndex, this.nextNoteTime, stepDuration);
      this.nextNoteTime += stepDuration;
      this.stepIndex = (this.stepIndex + 1) % 16;
    }
  }

  triggerStep(step, time, stepDur) {
    if (step % 4 === 0 || step === 14) this.playKick(time);
    if (step === 4 || step === 12) this.playSnare(time);
    if (step % 2 === 1) this.playHat(time, 0.045);
    const bassFreq = this.bassPattern[step];
    if (bassFreq > 0) this.playBassNote(bassFreq, time, stepDur * 1.45);
    const cowFreq = this.cowbellPattern[step];
    if (cowFreq > 0 && this.tempoMultiplier >= 1.05) this.playCowbell(cowFreq, time, 0.09);
  }

  playKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(145, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);
    gain.gain.setValueAtTime(0.75, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
    osc.connect(gain); gain.connect(this.musicGain);
    osc.start(time); osc.stop(time + 0.17);
  }

  playSnare(time) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.setValueAtTime(1600, time);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.32, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);
    src.connect(filter); filter.connect(gain); gain.connect(this.musicGain);
    src.start(time); src.stop(time + 0.12);
  }

  playHat(time, dur) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass'; filter.frequency.setValueAtTime(7200, time);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.11, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    src.connect(filter); filter.connect(gain); gain.connect(this.musicGain);
    src.start(time); src.stop(time + dur + 0.01);
  }

  playBassNote(freq, time, dur) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(freq, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420 * this.tempoMultiplier, time);
    filter.frequency.exponentialRampToValueAtTime(160, time + dur);
    gain.gain.setValueAtTime(0.28, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(filter); filter.connect(gain); gain.connect(this.musicGain);
    osc.start(time); osc.stop(time + dur + 0.02);
  }

  playCowbell(freq, time, dur) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain); gain.connect(this.musicGain);
    osc.start(time); osc.stop(time + dur + 0.01);
  }

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
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.start(t); osc.stop(t + duration + 0.01);
  }

  playSwipe() { this.playTone('triangle', 340, 640, 0.08, 0.2); }
  playJump() {
    this.playTone('sine', 220, 580, 0.14, 0.28);
    this.playTone('triangle', 440, 760, 0.1, 0.12, 0.02);
  }
  playDoubleJump() {
    this.playTone('triangle', 460, 980, 0.15, 0.26);
    this.playTone('sine', 700, 1240, 0.12, 0.15, 0.03);
  }
  playSlide() { this.playTone('sawtooth', 260, 95, 0.15, 0.18); }
  playMediator() {
    this.playTone('sine', 880, 1320, 0.09, 0.22);
    this.playTone('triangle', 1320, 1760, 0.1, 0.14, 0.045);
  }
  playCanOpen() {
    if (!this.ensureContext() || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.setValueAtTime(4200, t);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.42, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    src.connect(filter); filter.connect(gain); gain.connect(this.sfxGain);
    src.start(t); src.stop(t + 0.24);
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
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(1400, t);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    src.connect(filter); filter.connect(gain); gain.connect(this.sfxGain);
    src.start(t); src.stop(t + 0.24);
    this.playTone('sawtooth', 160, 55, 0.18, 0.28);
  }
  playHit() {
    this.playTone('sawtooth', 140, 36, 0.32, 0.36);
    this.playSmash();
  }
  playClick() { this.playTone('triangle', 640, 860, 0.05, 0.14); }
}

// ===================== ФИГУРНАЯ КОМИКС-МОДЕЛЬ АЛЬТУШКИ (С ПОДДЕРЖКОЙ СКИНОВ) =====================
function createAltushkaRig(textures, gradientMap, initialSkin) {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const p = initialSkin.palette;
  const toon = (color, extra = {}) =>
    new THREE.MeshToonMaterial({ color, gradientMap, ...extra });

  const mats = {
    skin: toon(p.skin),
    face: new THREE.MeshToonMaterial({ map: textures.faceTex, gradientMap }),
    hoodie: toon(p.hoodie),
    hoodieTrim: toon(p.hoodieTrim),
    skirt: toon(p.skirt),
    hairBase: toon(p.hairBase),
    hairLeft: toon(p.hairLeft),
    hairRight: toon(p.hairRight),
    socks: new THREE.MeshToonMaterial({ map: makeSockTexture(p.sockA, p.sockB), gradientMap }),
    boot: toon(p.boot),
    sole: toon(p.sole),
    backpack: toon(p.backpack),
    silver: toon(0xe9ecef)
  };

  // --- ФИГУРНЫЙ ТОРС (LatheGeometry: узкая талия + плавная грудь и плечи) ---
  const torsoPts = [
    new THREE.Vector2(0.16, 0.0),   // низ талии
    new THREE.Vector2(0.125, 0.11), // тонкая талия
    new THREE.Vector2(0.155, 0.23), // ребра
    new THREE.Vector2(0.215, 0.35), // бюст
    new THREE.Vector2(0.20, 0.46),  // плечи
    new THREE.Vector2(0.085, 0.52)  // горловина
  ];
  const torsoMesh = new THREE.Mesh(new THREE.LatheGeometry(torsoPts, 18), mats.hoodie);
  torsoMesh.scale.set(1.04, 1, 0.86);
  torsoMesh.position.set(0, 0.84, 0);
  addComicOutline(torsoMesh, 1.07);
  bodyPivot.add(torsoMesh);

  // Резинка худи на талии
  const hem = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.028, 8, 18), mats.hoodieTrim);
  hem.rotation.x = Math.PI / 2;
  hem.position.set(0, 0.86, 0);
  bodyPivot.add(hem);

  // Капюшон с кошачьими ушками на спине
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 12), mats.hoodie);
  hood.scale.set(1.08, 0.65, 0.82);
  hood.position.set(0, 1.32, 0.13);
  addComicOutline(hood, 1.08);
  bodyPivot.add(hood);

  const earGeo = new THREE.ConeGeometry(0.058, 0.14, 6);
  const earL = new THREE.Mesh(earGeo, mats.hoodie);
  earL.position.set(-0.13, 1.44, 0.17);
  earL.rotation.set(0.45, 0, 0.35);
  addComicOutline(earL, 1.12);
  bodyPivot.add(earL);

  const earR = new THREE.Mesh(earGeo, mats.hoodie);
  earR.position.set(0.13, 1.44, 0.17);
  earR.rotation.set(0.45, 0, -0.35);
  addComicOutline(earR, 1.12);
  bodyPivot.add(earR);

  // Мини-рюкзачок на спине (главный акцент сзади)
  const backpack = new THREE.Group();
  backpack.position.set(0, 1.07, 0.19);
  const bpBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.125, 0.12, 6, 10), mats.backpack);
  bpBody.scale.set(1.05, 1.0, 0.62);
  addComicOutline(bpBody, 1.09);
  backpack.add(bpBody);

  const bpStar = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), mats.hoodieTrim);
  bpStar.position.set(0, 0.02, 0.085);
  backpack.add(bpStar);
  bodyPivot.add(backpack);

  // --- ПЫШНАЯ ФИГУРНАЯ ЮБКА-КОЛОКОЛ (LatheGeometry) ---
  const skirtPivot = new THREE.Group();
  skirtPivot.position.set(0, 0.82, 0);
  bodyPivot.add(skirtPivot);

  const skirtPts = [
    new THREE.Vector2(0.36, -0.28),
    new THREE.Vector2(0.31, -0.17),
    new THREE.Vector2(0.23, -0.06),
    new THREE.Vector2(0.16, 0.03)
  ];
  const skirtMesh = new THREE.Mesh(new THREE.LatheGeometry(skirtPts, 20), mats.skirt);
  addComicOutline(skirtMesh, 1.06);
  skirtPivot.add(skirtMesh);

  const skirtStripe = new THREE.Mesh(new THREE.TorusGeometry(0.345, 0.018, 8, 22), mats.hoodieTrim);
  skirtStripe.rotation.x = Math.PI / 2;
  skirtStripe.position.y = -0.25;
  skirtPivot.add(skirtStripe);

  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.024, 8, 18), mats.boot);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.01;
  skirtPivot.add(belt);

  // --- ШЕЯ, ЧОКЕР И ГОЛОВА ---
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.072, 0.14, 10), mats.skin);
  neck.position.set(0, 1.38, 0);
  bodyPivot.add(neck);

  const choker = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.018, 8, 14), mats.boot);
  choker.rotation.x = Math.PI / 2;
  choker.position.set(0, 1.37, 0);
  bodyPivot.add(choker);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.58, 0);
  bodyPivot.add(headGroup);

  const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.195, 18, 14), mats.skin);
  headSphere.scale.set(0.96, 1.03, 0.94);
  addComicOutline(headSphere, 1.06);
  headGroup.add(headSphere);

  const facePlane = new THREE.Mesh(new THREE.CircleGeometry(0.15, 16), mats.face);
  facePlane.position.set(0, -0.01, -0.18);
  facePlane.rotation.y = Math.PI;
  headGroup.add(facePlane);

  const hairCrown = new THREE.Mesh(
    new THREE.SphereGeometry(0.215, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.66),
    mats.hairBase
  );
  hairCrown.position.set(0, 0.025, 0.015);
  addComicOutline(hairCrown, 1.06);
  headGroup.add(hairCrown);

  const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.205, 14, 12), mats.hairBase);
  hairBack.scale.set(1.04, 1.06, 0.74);
  hairBack.position.set(0, -0.02, 0.08);
  addComicOutline(hairBack, 1.06);
  headGroup.add(hairBack);

  // Пышные изогнутые двухцветные хвостики с бантами
  const makeTwinTail = (side, tipMat) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.21, 0.08, 0.07);

    const bow = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), mats.hoodieTrim);
    bow.scale.set(1.3, 0.85, 0.8);
    addComicOutline(bow, 1.15);
    pivot.add(bow);

    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.082, 0.24, 6, 10), mats.hairBase);
    upper.position.set(side * 0.085, -0.17, 0.05);
    upper.rotation.z = side * 0.34;
    upper.rotation.x = 0.18;
    addComicOutline(upper, 1.09);
    pivot.add(upper);

    const midPivot = new THREE.Group();
    midPivot.position.set(side * 0.15, -0.33, 0.09);
    pivot.add(midPivot);

    const lower = new THREE.Mesh(new THREE.ConeGeometry(0.088, 0.44, 10), tipMat);
    lower.position.set(side * 0.05, -0.19, 0.04);
    lower.rotation.z = side * 0.18 + Math.PI;
    addComicOutline(lower, 1.09);
    midPivot.add(lower);

    headGroup.add(pivot);
    return { pivot, midPivot };
  };

  const leftTail = makeTwinTail(-1, mats.hairLeft);
  const rightTail = makeTwinTail(1, mats.hairRight);

  // --- СТРОЙНЫЕ РУКИ ---
  const makeArm = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.245, 1.26, 0);

    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.34, 6, 10), mats.hoodie);
    sleeve.position.set(0, -0.21, 0);
    addComicOutline(sleeve, 1.09);
    pivot.add(sleeve);

    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.018, 6, 12), mats.hoodieTrim);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.set(0, -0.4, 0);
    pivot.add(cuff);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 8, 8), mats.skin);
    hand.position.set(0, -0.45, 0);
    addComicOutline(hand, 1.12);
    pivot.add(hand);

    bodyPivot.add(pivot);
    return pivot;
  };
  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);

  // --- ФИГУРНЫЕ НОГИ, ПОЛОСАТЫЕ ГЕТРЫ И БОТИНКИ НА ПЛАТФОРМЕ ---
  const makeLeg = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.125, 0.68, 0);

    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.078, 0.2, 6, 10), mats.skin);
    thigh.position.set(0, -0.14, 0);
    addComicOutline(thigh, 1.08);
    pivot.add(thigh);

    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.08, 0.3, 12), mats.socks);
    calf.position.set(0, -0.38, 0);
    addComicOutline(calf, 1.08);
    pivot.add(calf);

    const bootUpper = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.13, 6, 10), mats.boot);
    bootUpper.rotation.x = Math.PI / 2;
    bootUpper.position.set(0, -0.56, -0.04);
    addComicOutline(bootUpper, 1.09);
    pivot.add(bootUpper);

    const platform = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.095, 0.3), mats.sole);
    platform.position.set(0, -0.635, -0.04);
    addComicOutline(platform, 1.08);
    pivot.add(platform);

    bodyPivot.add(pivot);
    return pivot;
  };
  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);

  // Тень под ногами
  const shadowBlob = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 1.2),
    new THREE.MeshBasicMaterial({ map: textures.blobShadow, transparent: true, depthWrite: false })
  );
  shadowBlob.rotation.x = -Math.PI / 2;
  shadowBlob.position.set(0, 0.03, 0);
  root.add(shadowBlob);

  // Комиксные ауры баффов
  const shieldAura = new THREE.Mesh(
    new THREE.SphereGeometry(1.08, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0x9775fa, wireframe: true, transparent: true, opacity: 0.45 })
  );
  shieldAura.position.set(0, 0.95, 0);
  shieldAura.visible = false;
  root.add(shieldAura);

  const energyAura = new THREE.Mesh(
    new THREE.ConeGeometry(0.92, 2.0, 10, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xff3b8d, wireframe: true, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  );
  energyAura.rotation.x = Math.PI / 2;
  energyAura.position.set(0, 0.95, 0.18);
  energyAura.visible = false;
  root.add(energyAura);

  // Кольцо двойного прыжка под ногами
  const jumpRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.06, 8, 20),
    new THREE.MeshBasicMaterial({ color: 0xffd43b, transparent: true, opacity: 0.9 })
  );
  jumpRing.rotation.x = Math.PI / 2;
  jumpRing.visible = false;
  root.add(jumpRing);

  const applySkin = (skinConfig) => {
    const pal = skinConfig.palette;
    mats.skin.color.setHex(pal.skin);
    mats.hoodie.color.setHex(pal.hoodie);
    mats.hoodieTrim.color.setHex(pal.hoodieTrim);
    mats.skirt.color.setHex(pal.skirt);
    mats.hairBase.color.setHex(pal.hairBase);
    mats.hairLeft.color.setHex(pal.hairLeft);
    mats.hairRight.color.setHex(pal.hairRight);
    mats.boot.color.setHex(pal.boot);
    mats.sole.color.setHex(pal.sole);
    mats.backpack.color.setHex(pal.backpack);
    if (mats.socks.map) mats.socks.map.dispose();
    mats.socks.map = makeSockTexture(pal.sockA, pal.sockB);
    mats.socks.needsUpdate = true;
  };

  return {
    root,
    bodyPivot,
    skirtPivot,
    headGroup,
    leftTail,
    rightTail,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    shadowBlob,
    shieldAura,
    energyAura,
    jumpRing,
    applySkin
  };
}

// ===================== ПРЕСЛЕДОВАТЕЛЬ («СКУФ-ПАТРУЛЬНЫЙ») =====================
function createSkufRig(gradientMap) {
  const root = new THREE.Group();
  const toon = (color) => new THREE.MeshToonMaterial({ color, gradientMap });

  const matCoat = toon(0x5c667a);
  const matPants = toon(0x343a47);
  const matSkin = toon(0xf1c2b0);
  const matCap = toon(0x2b303d);
  const matVest = toon(0xffd43b);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.45, 8, 12), matCoat);
  torso.scale.set(1.05, 1, 1.15);
  torso.position.set(0, 1.05, 0);
  addComicOutline(torso, 1.06);
  root.add(torso);

  const vestStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.47, 0.12, 12), matVest);
  vestStripe.position.set(0, 1.04, 0);
  root.add(vestStripe);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), matSkin);
  head.position.set(0, 1.66, 0);
  addComicOutline(head, 1.08);
  root.add(head);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.13, 12), matCap);
  cap.position.set(0, 1.82, 0);
  addComicOutline(cap, 1.08);
  root.add(cap);

  const makeArm = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.5, 1.32, 0);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.36, 6, 8), matCoat);
    arm.position.set(0, -0.22, 0);
    addComicOutline(arm, 1.09);
    pivot.add(arm);
    root.add(pivot);
    return pivot;
  };
  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);

  const makeLeg = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.21, 0.56, 0);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.34, 6, 8), matPants);
    leg.position.set(0, -0.26, 0);
    addComicOutline(leg, 1.09);
    pivot.add(leg);
    root.add(pivot);
    return pivot;
  };
  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);

  return { root, leftArm, rightArm, leftLeg, rightLeg };
}

// ===================== КОМИКС-ПРЕПЯТСТВИЯ И ПРЕДМЕТЫ =====================
function createObstacleMesh(type, sharedMats) {
  const group = new THREE.Group();

  if (type === 'low') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.44, 0.56), sharedMats.concrete);
    base.position.set(0, 0.22, 0);
    addComicOutline(base, 1.04);
    group.add(base);

    const board = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.42, 0.16), sharedMats.hazard);
    board.position.set(0, 0.72, 0);
    addComicOutline(board, 1.05);
    group.add(board);

    const beaconGeo = new THREE.SphereGeometry(0.11, 8, 8);
    const bL = new THREE.Mesh(beaconGeo, sharedMats.accent);
    bL.position.set(-0.86, 1.0, 0);
    addComicOutline(bL, 1.15);
    group.add(bL);
    const bR = bL.clone();
    bR.position.x = 0.86;
    group.add(bR);
  } else if (type === 'high') {
    const pillarGeo = new THREE.CylinderGeometry(0.09, 0.1, 2.6, 8);
    const pL = new THREE.Mesh(pillarGeo, sharedMats.darkMetal);
    pL.position.set(-1.04, 1.3, 0);
    addComicOutline(pL, 1.12);
    group.add(pL);
    const pR = pL.clone();
    pR.position.x = 1.04;
    group.add(pR);

    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.86, 0.36), sharedMats.secondary);
    signBoard.position.set(0, 2.04, 0);
    addComicOutline(signBoard, 1.04);
    group.add(signBoard);

    const hazardStrip = new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.24, 0.4), sharedMats.hazard);
    hazardStrip.position.set(0, 1.52, 0);
    addComicOutline(hazardStrip, 1.04);
    group.add(hazardStrip);
  } else {
    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.15, 2.48, 8.6), sharedMats.trainSide);
    hull.position.set(0, 1.48, 0);
    addComicOutline(hull, 1.03);
    group.add(hull);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.26, 8.4), sharedMats.concrete);
    roof.position.set(0, 2.82, 0);
    addComicOutline(roof, 1.04);
    group.add(roof);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.94, 0.12), sharedMats.skyGlass);
    windshield.position.set(0, 1.92, 4.32);
    addComicOutline(windshield, 1.04);
    group.add(windshield);

    const routeSign = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.24, 0.12), sharedMats.accent);
    routeSign.position.set(0, 2.52, 4.32);
    group.add(routeSign);

    const lampGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 10);
    const hlL = new THREE.Mesh(lampGeo, sharedMats.sunYellow);
    hlL.rotation.x = Math.PI / 2;
    hlL.position.set(-0.68, 0.78, 4.32);
    addComicOutline(hlL, 1.12);
    group.add(hlL);
    const hlR = hlL.clone();
    hlR.position.x = 0.68;
    group.add(hlR);
  }

  group.visible = false;
  return group;
}

function createItemMesh(type, sharedMats) {
  const group = new THREE.Group();

  if (type === 'mediator') {
    const pick = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 3), sharedMats.accent);
    pick.rotation.x = Math.PI / 2;
    addComicOutline(pick, 1.12);
    group.add(pick);
  } else if (type === 'energy') {
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.76, 12), sharedMats.accent);
    addComicOutline(can, 1.1);
    group.add(can);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.255, 0.24, 12), sharedMats.sunYellow);
    group.add(band);
  } else if (type === 'shield') {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.095, 8, 16), sharedMats.secondary);
    addComicOutline(ring, 1.12);
    group.add(ring);
  } else if (type === 'slowmo') {
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), sharedMats.skyGlass);
    shell.scale.set(0.86, 1.12, 0.55);
    addComicOutline(shell, 1.1);
    group.add(shell);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.24), sharedMats.sunYellow);
    screen.position.set(0, 0.04, 0.12);
    group.add(screen);
  } else {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.62, 0.2), sharedMats.darkMetal);
    addComicOutline(body, 1.08);
    group.add(body);
    const label = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.34, 0.23), sharedMats.sunYellow);
    label.position.y = 0.05;
    group.add(label);
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
    this.state = 'hub';
    this.activeTab = 'run';

    // Физика игрока
    this.laneIndex = 1;
    this.playerX = LANES[1];
    this.playerY = 0;
    this.playerVelY = 0;
    this.isGrounded = true;
    this.doubleJumpUsed = false;
    this.jumpRingTimer = 0;
    this.slideTimer = 0;
    this.invulnTimer = 0;
    this.animClock = 0;

    this.pursuerTimer = 0;
    this.pursuerZ = 12;
    this.pursuerX = 0;

    this.runDistance = 0;
    this.runMediators = 0;
    this.runSpeed = BASE_RUN_SPEED;
    this.spawnCooldownDist = 0;
    this.nextCassetteAt = this.story.getNextCassetteSpawnInterval();
    this.cassetteOnTrack = false;
    this.cameraShake = 0;

    this.buffs = {
      energy: { active: false, remaining: 0, max: 6 },
      shield: { active: false, remaining: 0, max: 8 },
      slowmo: { active: false, remaining: 0, max: 5.5 }
    };

    this.vnState = {
      cassette: null,
      fullText: '',
      charIndex: 0,
      typingTimer: null,
      isTyping: false,
      pendingFinale: null,
      pendingUnlockChapter: null
    };

    this.playerBox = new THREE.Box3();
    this.tempBox = new THREE.Box3();

    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchHandled = false;

    this.gradientMap = createToonGradientMap();
    this.textures = createComicTextures();
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
      upgradeList: $('upgrade-list'),
      skinsList: $('skins-list'),
      hubSkinsCount: $('hub-skins-count'),
      btnResume: $('btn-resume'),
      btnRun: $('btn-run'),
      btnOpenEndings: $('btn-open-endings'),
      hubEndingsCount: $('hub-endings-count'),

      tabRun: $('tab-run'),
      tabShop: $('tab-shop'),
      tabSkins: $('tab-skins'),

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
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x6c7ae0);
    this.scene.fog = new THREE.FogExp2(0x8a95eb, 0.0068);

    this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 240);
    this.camera.position.set(0, 4.1, 7.6);
    this.camera.lookAt(0, 1.35, -10);

    // Яркий комиксный свет — всё прекрасно видно!
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x7c6fa0, 1.35);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff6e5, 1.45);
    this.sunLight.position.set(-12, 26, 18);
    this.scene.add(this.sunLight);

    this.fillLight = new THREE.DirectionalLight(0xffd6e8, 0.45);
    this.fillLight.position.set(14, 10, 8);
    this.scene.add(this.fillLight);

    const g = this.gradientMap;
    this.sharedMats = {
      road: new THREE.MeshToonMaterial({ map: this.textures.asphalt, gradientMap: g }),
      sidewalk: new THREE.MeshToonMaterial({ map: this.textures.sidewalk, gradientMap: g }),
      curb: new THREE.MeshToonMaterial({ color: 0xe9e4f5, gradientMap: g }),
      building: new THREE.MeshToonMaterial({ map: this.textures.buildingFacade, gradientMap: g }),
      concrete: new THREE.MeshToonMaterial({ color: 0xb4adc9, gradientMap: g }),
      darkMetal: new THREE.MeshToonMaterial({ color: 0x3b3652, gradientMap: g }),
      trainSide: new THREE.MeshToonMaterial({ map: this.textures.trainSide, gradientMap: g }),
      hazard: new THREE.MeshToonMaterial({ map: this.textures.hazard, gradientMap: g }),
      skyGlass: new THREE.MeshToonMaterial({ color: 0x74c0fc, gradientMap: g }),
      sunYellow: new THREE.MeshToonMaterial({ color: 0xffd43b, gradientMap: g }),
      accent: new THREE.MeshToonMaterial({ color: 0xff3b8d, gradientMap: g }),
      secondary: new THREE.MeshToonMaterial({ color: 0x845ef7, gradientMap: g })
    };

    this.initBackdrop();

    this.altushka = createAltushkaRig(this.textures, this.gradientMap, this.story.getEquippedSkin());
    this.scene.add(this.altushka.root);

    this.skuf = createSkufRig(this.gradientMap);
    this.skuf.root.position.set(0, 0, this.pursuerZ);
    this.scene.add(this.skuf.root);
  }

  initBackdrop() {
    const skyGroup = new THREE.Group();

    // Большое стилизованное солнце/луна с комиксным кольцом
    this.sunDisc = new THREE.Mesh(
      new THREE.CircleGeometry(11, 24),
      new THREE.MeshBasicMaterial({ color: 0xfff3bf, fog: false })
    );
    this.sunDisc.position.set(-24, 46, -185);
    skyGroup.add(this.sunDisc);

    const sunRing = new THREE.Mesh(
      new THREE.RingGeometry(12.2, 13.4, 28),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, fog: false })
    );
    sunRing.position.set(-24, 46, -186);
    skyGroup.add(sunRing);

    // Мультяшные объемные облака
    const cloudMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: this.gradientMap, fog: false });
    for (let i = 0; i < 8; i++) {
      const cloud = new THREE.Group();
      const s1 = new THREE.Mesh(new THREE.SphereGeometry(5.5, 10, 8), cloudMat);
      const s2 = new THREE.Mesh(new THREE.SphereGeometry(4.2, 10, 8), cloudMat);
      s2.position.set(-5.2, -1.0, 0);
      const s3 = new THREE.Mesh(new THREE.SphereGeometry(4.0, 10, 8), cloudMat);
      s3.position.set(5.0, -1.2, 0);
      cloud.add(s1, s2, s3);
      cloud.position.set(-95 + i * 28, 34 + (i % 3) * 10, -172 - (i % 2) * 14);
      skyGroup.add(cloud);
    }

    // Силуэт далекого города и телебашни
    const skylineMat = new THREE.MeshBasicMaterial({ color: 0x45416e, fog: false });
    for (let i = 0; i < 18; i++) {
      const w = 7 + (i % 4) * 3;
      const h = 14 + ((i * 11) % 26);
      const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, 4), skylineMat);
      tower.position.set(-95 + i * 11.4, h / 2 - 2, -175);
      skyGroup.add(tower);
    }
    const tvTower = new THREE.Mesh(new THREE.ConeGeometry(2.8, 56, 6), skylineMat);
    tvTower.position.set(18, 26, -176);
    skyGroup.add(tvTower);

    this.scene.add(skyGroup);
  }

  initWorldPools() {
    // Полотно трассы
    const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(9.2, TRACK_LENGTH), this.sharedMats.road);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, -TRACK_LENGTH / 2 + 22);
    this.scene.add(roadMesh);

    // Тротуары и бордюры
    const swGeo = new THREE.BoxGeometry(4.4, 0.24, TRACK_LENGTH);
    const curbGeo = new THREE.BoxGeometry(0.36, 0.3, TRACK_LENGTH);
    for (const side of [-1, 1]) {
      const sw = new THREE.Mesh(swGeo, this.sharedMats.sidewalk);
      sw.position.set(side * 6.9, 0.12, -TRACK_LENGTH / 2 + 22);
      this.scene.add(sw);

      const curb = new THREE.Mesh(curbGeo, this.sharedMats.curb);
      curb.position.set(side * 4.65, 0.15, -TRACK_LENGTH / 2 + 22);
      this.scene.add(curb);
    }

    // Уличные фонари
    this.streetLamps = [];
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.11, 5.8, 8);
    const armGeo = new THREE.BoxGeometry(1.4, 0.12, 0.12);
    const bulbGeo = new THREE.SphereGeometry(0.24, 8, 8);
    for (let i = 0; i < 16; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const zSlot = 12 - Math.floor(i / 2) * 20;
      const lamp = new THREE.Group();

      const pole = new THREE.Mesh(poleGeo, this.sharedMats.darkMetal);
      pole.position.set(0, 2.9, 0);
      addComicOutline(pole, 1.15);
      lamp.add(pole);

      const arm = new THREE.Mesh(armGeo, this.sharedMats.darkMetal);
      arm.position.set(-side * 0.65, 5.75, 0);
      lamp.add(arm);

      const bulb = new THREE.Mesh(bulbGeo, this.sharedMats.sunYellow);
      bulb.position.set(-side * 1.25, 5.65, 0);
      addComicOutline(bulb, 1.14);
      lamp.add(bulb);

      lamp.position.set(side * 5.2, 0.24, zSlot);
      this.scene.add(lamp);
      this.streetLamps.push(lamp);
    }

    // Пул комиксных зданий с обводкой, козырьками и крышами
    this.buildings = [];
    const bldGeo = new THREE.BoxGeometry(1, 1, 1);
    const awningGeo = new THREE.BoxGeometry(0.9, 0.28, 3.6);
    const signGeo = new THREE.BoxGeometry(0.18, 1.05, 2.5);

    for (let i = 0; i < 32; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const zSlot = 16 - Math.floor(i / 2) * 10.5;
      const group = new THREE.Group();

      const width = 5.4 + (i % 3) * 1.5;
      const height = 9.5 + ((i * 7) % 13);
      const depth = 8.4;

      const body = new THREE.Mesh(bldGeo, this.sharedMats.building);
      body.scale.set(width, height, depth);
      body.position.set(0, height / 2, 0);
      addComicOutline(body, 1.03);
      group.add(body);

      const roof = new THREE.Mesh(bldGeo, i % 2 === 0 ? this.sharedMats.secondary : this.sharedMats.concrete);
      roof.scale.set(width + 0.3, 0.55, depth + 0.3);
      roof.position.set(0, height + 0.25, 0);
      addComicOutline(roof, 1.03);
      group.add(roof);

      const faceX = -side * (width / 2);
      const awning = new THREE.Mesh(awningGeo, i % 3 === 0 ? this.sharedMats.accent : this.sharedMats.sunYellow);
      awning.position.set(faceX - side * 0.42, 2.8, 0);
      awning.rotation.z = side * 0.22;
      addComicOutline(awning, 1.07);
      group.add(awning);

      if (i % 2 === 0) {
        const sign = new THREE.Mesh(signGeo, i % 4 === 0 ? this.sharedMats.accent : this.sharedMats.secondary);
        sign.position.set(faceX - side * 0.14, 5.2, 0);
        addComicOutline(sign, 1.08);
        group.add(sign);
      }

      group.position.set(side * (8.5 + width / 2), 0, zSlot);
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
          type, mesh, active: false, lane: 1, z: -200, smashed: false, velX: 0, velY: 0, velZ: 0
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
        this.itemPool.push({ type, mesh, active: false, lane: 1, baseY: 1.0, z: -200 });
      }
    };
    addItems('mediator', 48);
    addItems('energy', 4);
    addItems('shield', 4);
    addItems('slowmo', 4);
    addItems('cassette', 2);

    // Пул комикс-частиц
    this.particles = [];
    const partGeo = new THREE.OctahedronGeometry(0.18, 0);
    for (let i = 0; i < 36; i++) {
      const mesh = new THREE.Mesh(partGeo, i % 2 === 0 ? this.sharedMats.accent : this.sharedMats.sunYellow);
      mesh.visible = false;
      this.scene.add(mesh);
      this.particles.push({ mesh, active: false, life: 0, vx: 0, vy: 0, vz: 0 });
    }
  }

  applyChapterTheme(chapterId) {
    const theme = CHAPTER_THEMES[chapterId] || CHAPTER_THEMES[1];
    this.scene.background.setHex(theme.sky);
    this.scene.fog.color.setHex(theme.fog);
    this.scene.fog.density = theme.fogDensity;

    this.hemiLight.color.setHex(theme.hemiSky);
    this.hemiLight.groundColor.setHex(theme.hemiGround);
    this.sunDisc.material.color.setHex(theme.sun);

    this.sharedMats.accent.color.setHex(theme.accent);
    this.sharedMats.secondary.color.setHex(theme.secondary);
  }

  // ===================== ОБРАБОТЧИКИ СОБЫТИЙ =====================
  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    });

    const canvas = this.dom.canvas;
    canvas.addEventListener('touchstart', (e) => {
      if (this.state !== 'playing' || !e.touches.length) return;
      this.sound.ensureContext();
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchHandled = false;
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (this.state !== 'playing' || this.touchHandled || !e.touches.length) return;
      const dx = e.touches[0].clientX - this.touchStartX;
      const dy = e.touches[0].clientY - this.touchStartY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) >= 28) {
        this.handleSwipeDirection(dx, dy, Math.abs(dx), Math.abs(dy));
        this.touchHandled = true;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
      if (this.state !== 'playing' || this.touchHandled || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - this.touchStartX;
      const dy = e.changedTouches[0].clientY - this.touchStartY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) >= 22) {
        this.handleSwipeDirection(dx, dy, Math.abs(dx), Math.abs(dy));
      }
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyM') { this.toggleMuteUI(); return; }
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (this.state === 'playing') this.pauseRun();
        else if (this.state === 'paused') this.resumeRun();
        else if (this.state === 'endings') this.closeEndings();
        return;
      }
      if (this.state !== 'playing') return;
      this.sound.ensureContext();
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.moveLane(-1);
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') this.moveLane(1);
      else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') { e.preventDefault(); this.triggerJump(); }
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') { e.preventDefault(); this.triggerSlide(); }
    });

    // Вкладки меню
    document.querySelectorAll('.hub-tab').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.switchHubTab(tabBtn.dataset.tab);
      });
    });

    this.dom.btnMute.addEventListener('click', () => this.toggleMuteUI());
    this.dom.btnPause.addEventListener('click', () => {
      if (this.state === 'playing') { this.sound.playClick(); this.pauseRun(); }
    });

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

    this.dom.btnOpenEndings.addEventListener('click', () => {
      this.sound.playClick();
      this.openEndings(null);
    });
    this.dom.btnCloseEndings.addEventListener('click', () => { this.sound.playClick(); this.closeEndings(); });
    this.dom.btnCloseEndingsTop.addEventListener('click', () => { this.sound.playClick(); this.closeEndings(); });

    this.dom.vnText.addEventListener('click', () => {
      if (this.state === 'vn' && this.vnState.isTyping) this.finishTypewriterImmediately();
    });
  }

  switchHubTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.hub-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    this.dom.tabRun.classList.toggle('hidden', tabName !== 'run');
    this.dom.tabShop.classList.toggle('hidden', tabName !== 'shop');
    this.dom.tabSkins.classList.toggle('hidden', tabName !== 'skins');
  }

  handleSwipeDirection(dx, dy, absX, absY) {
    if (absX > absY) this.moveLane(dx > 0 ? 1 : -1);
    else if (dy < 0) this.triggerJump();
    else this.triggerSlide();
  }

  toggleMuteUI() {
    this.sound.ensureContext();
    const muted = this.sound.toggleMute();
    this.dom.btnMute.classList.toggle('muted', muted);
    this.dom.btnMute.textContent = muted ? '✕' : '♪';
  }

  // ===================== УПРАВЛЕНИЕ ПЕРСОНАЖЕМ (С ДВОЙНЫМ ПРЫЖКОМ) =====================
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
      this.doubleJumpUsed = false;
      this.playerVelY = JUMP_VELOCITY;
      this.slideTimer = 0;
      this.sound.playJump();
      return;
    }

    // Двойной прыжок от нового дополнения «Платформы-пружины»
    const boots = this.story.getUpgradeEffect('boots');
    if (boots && boots.hasDoubleJump && !this.doubleJumpUsed) {
      this.doubleJumpUsed = true;
      this.playerVelY = boots.doubleJumpBoost;
      this.slideTimer = 0;
      this.jumpRingTimer = 0.35;
      this.altushka.jumpRing.visible = true;
      this.altushka.jumpRing.scale.setScalar(0.6);
      this.sound.playDoubleJump();
      this.spawnBurst(this.playerX, this.playerY, 0, 8);
    }
  }

  triggerSlide() {
    if (!this.isGrounded) this.playerVelY = FAST_FALL_VELOCITY;
    this.slideTimer = SLIDE_DURATION;
    this.sound.playSlide();
  }

  // ===================== ЗАБЕГ =====================
  clearTrackEntities() {
    for (const obs of this.obstaclePool) {
      obs.active = false; obs.smashed = false; obs.mesh.visible = false; obs.mesh.rotation.set(0, 0, 0);
    }
    for (const item of this.itemPool) { item.active = false; item.mesh.visible = false; }
    for (const p of this.particles) { p.active = false; p.mesh.visible = false; }
    this.cassetteOnTrack = false;
  }

  resetBuffs() {
    for (const key of ['energy', 'shield', 'slowmo']) {
      this.buffs[key].active = false;
      this.buffs[key].remaining = 0;
    }
    this.altushka.shieldAura.visible = false;
    this.altushka.energyAura.visible = false;
    this.altushka.jumpRing.visible = false;
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
    this.doubleJumpUsed = false;
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
    this.openHub(true, `ПАУЗА · Забег: ${Math.floor(this.runDistance)} м · ✦ ${this.runMediators}`);
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

  // ===================== СПАВНЕР =====================
  acquireObstacle(type) { return this.obstaclePool.find((o) => !o.active && o.type === type) || null; }
  acquireItem(type) { return this.itemPool.find((it) => !it.active && it.type === type) || null; }

  spawnBurst(x, y, z, count = 10) {
    let spawned = 0;
    for (const p of this.particles) {
      if (p.active) continue;
      p.active = true;
      p.life = 0.5 + Math.random() * 0.25;
      p.mesh.visible = true;
      p.mesh.position.set(x, y, z);
      p.vx = (Math.random() - 0.5) * 9;
      p.vy = 2.5 + Math.random() * 5.5;
      p.vz = (Math.random() - 0.5) * 6;
      if (++spawned >= count) break;
    }
  }

  spawnWave() {
    const zBase = SPAWN_Z;
    const nextCassette = this.story.getNextUncollectedCassette();
    const shouldSpawnCassette =
      Boolean(nextCassette) && !this.cassetteOnTrack && this.runDistance >= this.nextCassetteAt;

    const openLane = Math.floor(Math.random() * 3);
    if (Math.random() < 0.42) {
      const candidates = [0, 1, 2].filter((l) => l !== openLane);
      const trainCount = Math.random() < 0.45 ? 2 : 1;
      for (let i = 0; i < trainCount; i++) {
        const obs = this.acquireObstacle('train');
        if (obs) {
          obs.active = true; obs.smashed = false; obs.lane = candidates[i]; obs.z = zBase - i * 4.5;
          obs.mesh.position.set(LANES[candidates[i]], 0, obs.z);
          obs.mesh.rotation.set(0, 0, 0); obs.mesh.visible = true;
        }
      }
      if (!shouldSpawnCassette && Math.random() < 0.55) {
        const obs = this.acquireObstacle(Math.random() < 0.5 ? 'low' : 'high');
        if (obs) {
          obs.active = true; obs.smashed = false; obs.lane = openLane; obs.z = zBase;
          obs.mesh.position.set(LANES[openLane], 0, obs.z);
          obs.mesh.rotation.set(0, 0, 0); obs.mesh.visible = true;
        }
      }
    } else {
      const lanes = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, Math.random() < 0.6 ? 2 : 3);
      for (const lane of lanes) {
        if (shouldSpawnCassette && lane === openLane) continue;
        const obs = this.acquireObstacle(Math.random() < 0.52 ? 'low' : 'high');
        if (obs) {
          obs.active = true; obs.smashed = false; obs.lane = lane; obs.z = zBase;
          obs.mesh.position.set(LANES[lane], 0, obs.z);
          obs.mesh.rotation.set(0, 0, 0); obs.mesh.visible = true;
        }
      }
    }

    if (shouldSpawnCassette) {
      const cass = this.acquireItem('cassette');
      if (cass) {
        cass.active = true; cass.lane = openLane; cass.baseY = 1.25; cass.z = zBase - 2;
        cass.mesh.position.set(LANES[openLane], cass.baseY, cass.z);
        cass.mesh.visible = true;
        this.cassetteOnTrack = true;
        this.nextCassetteAt = this.runDistance + this.story.getNextCassetteSpawnInterval();
      }
      return;
    }

    if (Math.random() < 0.16) {
      const chosen = ['energy', 'shield', 'slowmo'][Math.floor(Math.random() * 3)];
      const item = this.acquireItem(chosen);
      if (item) {
        item.active = true; item.lane = openLane; item.baseY = 1.15; item.z = zBase - 5.5;
        item.mesh.position.set(LANES[openLane], item.baseY, item.z);
        item.mesh.visible = true;
      }
    } else {
      const count = 3 + Math.floor(Math.random() * 3);
      const isJumpArc = Math.random() < 0.35;
      for (let i = 0; i < count; i++) {
        const med = this.acquireItem('mediator');
        if (!med) break;
        med.active = true; med.lane = openLane;
        med.baseY = isJumpArc ? 1.0 + Math.sin((i / (count - 1)) * Math.PI) * 1.45 : 0.95;
        med.z = zBase - 7 + i * 2.5;
        med.mesh.position.set(LANES[openLane], med.baseY, med.z);
        med.mesh.visible = true;
      }
    }
  }

  // ===================== ОБНОВЛЕНИЕ КАДРА =====================
  updatePlaying(rawDt) {
    const slowScale = this.buffs.slowmo.active ? this.story.getUpgradeEffect('tamagotchi').timeScale : 1;
    const worldDt = rawDt * slowScale;
    this.animClock += worldDt;

    this.updateBuffTimers(rawDt);
    if (this.invulnTimer > 0) this.invulnTimer = Math.max(0, this.invulnTimer - rawDt);

    this.runSpeed = Math.min(MAX_RUN_SPEED, this.runSpeed + SPEED_ACCEL_PER_SEC * worldDt);
    const energyMult = this.buffs.energy.active ? this.story.getUpgradeEffect('energy').speedMultiplier : 1;
    const effectiveSpeed = this.runSpeed * energyMult;

    const musicTempo = this.buffs.energy.active ? 1.38 : this.buffs.slowmo.active ? 0.72 : 1 + (this.runSpeed - BASE_RUN_SPEED) / 90;
    this.sound.setTempoMultiplier(musicTempo);

    const dz = effectiveSpeed * worldDt;
    this.runDistance += dz * 0.85;

    this.textures.asphalt.offset.y += dz * 0.1;
    this.textures.sidewalk.offset.y += dz * 0.13;

    const chProg = this.story.getChapterProgress();
    if (chProg.cassettesCollected >= chProg.cassettesTotal && chProg.distance + this.runDistance >= chProg.targetDistance) {
      this.finishRun(`ГЛАВА ${this.story.currentChapter} ПРОЙДЕНА!`);
      return;
    }

    this.playerX += (LANES[this.laneIndex] - this.playerX) * Math.min(1, LANE_SWITCH_SPEED * rawDt);

    if (!this.isGrounded) {
      this.playerVelY += GRAVITY * worldDt;
      this.playerY += this.playerVelY * worldDt;
      if (this.playerY <= 0) {
        this.playerY = 0;
        this.playerVelY = 0;
        this.isGrounded = true;
        this.doubleJumpUsed = false;
      }
    }

    if (this.jumpRingTimer > 0) {
      this.jumpRingTimer -= rawDt;
      const s = 0.6 + (0.35 - this.jumpRingTimer) * 3.4;
      this.altushka.jumpRing.scale.setScalar(s);
      if (this.jumpRingTimer <= 0) this.altushka.jumpRing.visible = false;
    }

    if (this.slideTimer > 0) this.slideTimer = Math.max(0, this.slideTimer - worldDt);

    this.animateAltushka(effectiveSpeed);
    this.updatePursuer(rawDt);

    for (const lamp of this.streetLamps) {
      lamp.position.z += dz;
      if (lamp.position.z > 20) lamp.position.z -= 8 * 20;
    }
    for (const b of this.buildings) {
      b.group.position.z += dz;
      if (b.group.position.z > 22) b.group.position.z -= 16 * 10.5;
    }

    this.spawnCooldownDist -= dz;
    if (this.spawnCooldownDist <= 0) {
      this.spawnWave();
      this.spawnCooldownDist = Math.max(17, 25 - (this.runSpeed - BASE_RUN_SPEED) * 0.25);
    }

    const isSliding = this.slideTimer > 0 && this.isGrounded;
    const hitboxHeight = isSliding ? 0.8 : 1.72;
    this.playerBox.min.set(this.playerX - 0.34, this.playerY + 0.04, -0.32);
    this.playerBox.max.set(this.playerX + 0.34, this.playerY + hitboxHeight, 0.32);

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
          obs.active = false; obs.smashed = false; obs.mesh.visible = false;
        }
        continue;
      }

      obs.z += dz;
      obs.mesh.position.z = obs.z;
      if (obs.z > DESPAWN_Z) { obs.active = false; obs.mesh.visible = false; continue; }

      if (Math.abs(obs.z) < 5.5) {
        this.computeObstacleBox(obs, this.tempBox);
        if (this.playerBox.intersectsBox(this.tempBox)) {
          if (this.handleObstacleCollision(obs)) return;
        }
      }
    }

    // Пассивный магнит из дополнения + активный магнит щита/энергетика
    const passiveMagnetRadius = this.story.getUpgradeEffect('magnet').radius;
    const activeMagnet = this.buffs.shield.active || this.buffs.energy.active;
    const pullZ = activeMagnet ? 15 : passiveMagnetRadius;

    for (const item of this.itemPool) {
      if (!item.active) continue;
      item.z += dz;
      item.mesh.position.z = item.z;
      item.mesh.rotation.y += 3.2 * worldDt;
      item.mesh.position.y = item.baseY + Math.sin(this.animClock * 4.5 + item.z * 0.3) * 0.14;

      if (item.type === 'mediator' && pullZ > 0 && item.z > -pullZ && item.z < 2.2) {
        const pullStrength = activeMagnet ? 12 : 8.5;
        item.mesh.position.x += (this.playerX - item.mesh.position.x) * Math.min(1, pullStrength * rawDt);
        item.mesh.position.y += (this.playerY + 1.0 - item.mesh.position.y) * Math.min(1, pullStrength * rawDt);
        item.z += (0 - item.z) * Math.min(1, 7 * rawDt);
        item.mesh.position.z = item.z;
      }

      if (item.z > DESPAWN_Z) {
        if (item.type === 'cassette') {
          this.cassetteOnTrack = false;
          this.nextCassetteAt = this.runDistance + 420;
        }
        item.active = false; item.mesh.visible = false; continue;
      }

      if (Math.abs(item.z) < 2.2) {
        const radius = item.type === 'cassette' ? 0.72 : 0.5;
        this.tempBox.min.set(item.mesh.position.x - radius, item.mesh.position.y - radius, item.mesh.position.z - radius);
        this.tempBox.max.set(item.mesh.position.x + radius, item.mesh.position.y + radius, item.mesh.position.z + radius);
        if (this.playerBox.intersectsBox(this.tempBox)) {
          if (this.collectItem(item)) return;
        }
      }
    }

    for (const p of this.particles) {
      if (!p.active) continue;
      p.life -= rawDt;
      if (p.life <= 0) { p.active = false; p.mesh.visible = false; continue; }
      p.mesh.position.x += p.vx * rawDt;
      p.mesh.position.y += p.vy * rawDt;
      p.mesh.position.z += p.vz * rawDt;
      p.vy -= 18 * rawDt;
      p.mesh.rotation.x += 8 * rawDt;
      p.mesh.rotation.y += 6 * rawDt;
      p.mesh.scale.setScalar(Math.max(0.05, p.life * 1.4));
    }

    const targetFov = this.buffs.energy.active ? 70 : this.buffs.slowmo.active ? 53 : 58;
    this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, 6 * rawDt);
    this.camera.updateProjectionMatrix();

    let shakeX = 0; let shakeY = 0;
    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - rawDt * 3.2);
      shakeX = (Math.random() - 0.5) * this.cameraShake * 0.7;
      shakeY = (Math.random() - 0.5) * this.cameraShake * 0.5;
    }

    this.camera.position.set(this.playerX * 0.48 + shakeX, 4.1 + this.playerY * 0.3 + shakeY, 7.6);
    this.camera.lookAt(this.playerX * 0.24, 1.35 + this.playerY * 0.2, -10);
    this.updateRunHud();
  }

  computeObstacleBox(obs, targetBox) {
    const x = obs.mesh.position.x;
    const z = obs.z;
    if (obs.type === 'low') {
      targetBox.min.set(x - 0.94, 0, z - 0.32);
      targetBox.max.set(x + 0.94, 0.96, z + 0.32);
    } else if (obs.type === 'high') {
      targetBox.min.set(x - 0.96, 1.15, z - 0.36);
      targetBox.max.set(x + 0.96, 2.55, z + 0.36);
    } else {
      targetBox.min.set(x - 0.98, 0, z - 4.18);
      targetBox.max.set(x + 0.98, 2.75, z + 4.18);
    }
  }

  handleObstacleCollision(obs) {
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
    if (this.invulnTimer > 0) return false;

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

    this.sound.playHit();
    this.cameraShake = 0.9;
    this.pursuerZ = 1.6;
    this.skuf.root.position.set(this.playerX, 0, this.pursuerZ);
    this.spawnBurst(this.playerX, 1.1, 0, 16);
    this.finishRun(obs.type === 'train' ? 'СНЕС ВАГОН НА ПОЛНОЙ СКОРОСТИ!' : 'СКУФ-ПАТРУЛЬНЫЙ ДОГНАЛ ТЕБЯ!');
    return true;
  }

  collectItem(item) {
    item.active = false;
    item.mesh.visible = false;
    this.spawnBurst(item.mesh.position.x, item.mesh.position.y, item.mesh.position.z, 6);

    if (item.type === 'mediator') {
      const multEff = this.story.getUpgradeEffect('multiplier');
      const bonus = Math.random() < multEff.doubleChance ? 2 : 1;
      this.runMediators += bonus;
      this.sound.playMediator();
      return false;
    }
    if (item.type === 'energy') {
      const eff = this.story.getUpgradeEffect('energy');
      this.buffs.energy.active = true; this.buffs.energy.max = eff.duration; this.buffs.energy.remaining = eff.duration;
      this.altushka.energyAura.visible = true;
      this.story.recordEnergyDrink();
      this.sound.playCanOpen();
      this.updateBuffHud();
      return false;
    }
    if (item.type === 'shield') {
      const eff = this.story.getUpgradeEffect('choker');
      this.buffs.shield.active = true; this.buffs.shield.max = eff.duration; this.buffs.shield.remaining = eff.duration;
      this.altushka.shieldAura.visible = true;
      this.sound.playShield();
      this.updateBuffHud();
      return false;
    }
    if (item.type === 'slowmo') {
      const eff = this.story.getUpgradeEffect('tamagotchi');
      this.buffs.slowmo.active = true; this.buffs.slowmo.max = eff.duration; this.buffs.slowmo.remaining = eff.duration;
      this.sound.playSlowmo();
      this.updateBuffHud();
      return false;
    }
    if (item.type === 'cassette') {
      this.cassetteOnTrack = false;
      this.sound.playCassette();
      const cassette = this.story.getNextUncollectedCassette();
      if (cassette) { this.openVisualNovel(cassette); return true; }
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
        b.active = false; b.remaining = 0;
        if (key === 'energy') this.altushka.energyAura.visible = false;
        if (key === 'shield') this.altushka.shieldAura.visible = false;
      }
    }
    if (dirty) this.updateBuffHud();
  }

  animateAltushka(speed) {
    const rig = this.altushka;
    rig.root.position.set(this.playerX, this.playerY, 0);

    rig.shadowBlob.position.y = -this.playerY + 0.03;
    rig.shadowBlob.scale.setScalar(Math.max(0.4, 1 - this.playerY * 0.16));

    const laneDiff = LANES[this.laneIndex] - this.playerX;
    rig.root.rotation.z = -laneDiff * 0.14;

    const isSliding = this.slideTimer > 0 && this.isGrounded;
    if (isSliding) {
      rig.bodyPivot.position.y = -0.36;
      rig.bodyPivot.rotation.x = -0.95;
      rig.bodyPivot.scale.y = 0.72;
      rig.skirtPivot.rotation.z = 0;
      rig.leftLeg.rotation.x = 0.65;
      rig.rightLeg.rotation.x = -0.3;
      rig.leftArm.rotation.x = -0.7;
      rig.rightArm.rotation.x = -0.7;
    } else if (!this.isGrounded) {
      rig.bodyPivot.position.y = 0;
      rig.bodyPivot.rotation.x = 0.14;
      rig.bodyPivot.scale.y = 1;
      rig.skirtPivot.rotation.z = 0;
      rig.leftLeg.rotation.x = 0.72;
      rig.rightLeg.rotation.x = -0.55;
      rig.leftArm.rotation.x = -1.1;
      rig.rightArm.rotation.x = -0.9;
    } else {
      const freq = speed * 0.42;
      const swing = Math.sin(this.animClock * freq);
      rig.bodyPivot.position.y = Math.abs(Math.cos(this.animClock * freq)) * 0.1;
      rig.bodyPivot.rotation.x = 0.11;
      rig.bodyPivot.scale.y = 1;
      rig.skirtPivot.rotation.z = swing * 0.1;
      rig.leftLeg.rotation.x = swing * 0.92;
      rig.rightLeg.rotation.x = -swing * 0.92;
      rig.leftArm.rotation.x = -swing * 0.82;
      rig.rightArm.rotation.x = swing * 0.82;
    }

    const tailBounce = Math.sin(this.animClock * 11) * 0.18;
    const tailLag = Math.cos(this.animClock * 11) * 0.24;
    rig.leftTail.pivot.rotation.z = tailBounce;
    rig.rightTail.pivot.rotation.z = -tailBounce;
    rig.leftTail.midPivot.rotation.x = 0.22 + Math.abs(tailLag);
    rig.rightTail.midPivot.rotation.x = 0.22 + Math.abs(tailLag);

    if (rig.shieldAura.visible) { rig.shieldAura.rotation.y += 0.04; rig.shieldAura.rotation.x += 0.02; }
    if (rig.energyAura.visible) rig.energyAura.rotation.z += 0.14;
  }

  updatePursuer(rawDt) {
    if (this.pursuerTimer > 0) this.pursuerTimer = Math.max(0, this.pursuerTimer - rawDt);
    this.pursuerZ += ((this.pursuerTimer > 0 ? 2.15 : 11.5) - this.pursuerZ) * Math.min(1, 3.8 * rawDt);
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
    // В хабе и на вкладке скинов поворачиваем героиню к камере, чтобы рассмотреть образ!
    this.altushka.root.rotation.set(0, this.activeTab === 'skins' ? Math.PI + Math.sin(this.animClock * 0.9) * 0.7 : Math.PI * 0.82, 0);
    this.animateAltushka(10);
    this.skuf.root.visible = false;

    const dz = 6 * dt;
    this.textures.asphalt.offset.y += dz * 0.1;
    this.textures.sidewalk.offset.y += dz * 0.13;
    for (const lamp of this.streetLamps) { lamp.position.z += dz; if (lamp.position.z > 20) lamp.position.z -= 8 * 20; }
    for (const b of this.buildings) { b.group.position.z += dz; if (b.group.position.z > 22) b.group.position.z -= 16 * 10.5; }

    // Камера в верхней части экрана показывает героиню над нижней панелью меню
    this.camera.position.set(0, 2.3, 4.4);
    this.camera.lookAt(0, 0.55, 0);
  }

  // ===================== HUD И UI ХАБА =====================
  updateRunHud() {
    this.dom.hudDistance.textContent = String(Math.floor(this.runDistance));
    this.dom.hudMediators.textContent = String(this.story.currency + this.runMediators);
    const prog = this.story.getChapterProgress();
    const pct = Math.min(100, ((prog.distance + this.runDistance) / prog.targetDistance) * 100);
    this.dom.hudChapter.textContent = `ГЛ.${prog.chapterId} · 📼${prog.cassettesCollected}/${prog.cassettesTotal}`;
    this.dom.hudChapterProgress.style.width = `${pct.toFixed(1)}%`;
  }

  updateBuffHud() {
    const sync = (key, pillEl, timerEl, barEl) => {
      const b = this.buffs[key];
      pillEl.classList.toggle('hidden', !b.active);
      if (b.active) {
        timerEl.textContent = `${b.remaining.toFixed(1)}s`;
        barEl.style.width = `${Math.max(0, Math.min(100, (b.remaining / b.max) * 100)).toFixed(1)}%`;
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
    this.dom.btnRun.textContent = isPaused ? 'НАЧАТЬ ЗАНОВО ✦' : 'БЕЖАТЬ! ✦';

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

    // Главы
    this.dom.chapterList.querySelectorAll('.chapter-btn').forEach((btn) => {
      const ch = Number(btn.dataset.chapter);
      const unlocked = ch <= this.story.unlockedChapter;
      const active = ch === this.story.currentChapter;
      const completed = this.story.isChapterComplete(ch);
      btn.disabled = !unlocked;
      btn.classList.toggle('locked', !unlocked);
      btn.classList.toggle('active', active);
      const stateEl = btn.querySelector('.ch-state');
      if (stateEl) stateEl.textContent = !unlocked ? 'LOCK' : completed ? 'DONE' : active ? 'PLAY' : 'OPEN';
    });

    const prog = this.story.getChapterProgress();
    this.dom.hubChapterDesc.textContent =
      `Глава ${prog.chapterId}: «${prog.title}» · ${prog.distance}/${prog.targetDistance}м · 📼 ${prog.cassettesCollected}/${prog.cassettesTotal}`;

    // Магазин (3 баффа + 3 новых дополнения)
    this.dom.upgradeList.innerHTML = '';
    for (const upg of this.story.getAllUpgrades()) {
      const card = document.createElement('div');
      card.className = `upgrade-card ${upg.isAddon ? 'is-addon' : ''}`;

      const lvlText = upg.level === 0 ? 'НЕ КУПЛЕНО' : `Ур. ${upg.level}/5`;
      card.innerHTML = `
        <div class="upgrade-info">
          <span class="upgrade-name">
            ${upg.icon} ${upg.name}
            ${upg.isAddon ? '<span class="addon-tag">NEW</span>' : ''}
          </span>
          <span class="upgrade-meta">
            <span class="upgrade-lvl">${lvlText}</span> · ${upg.desc}
          </span>
        </div>
      `;

      const buyBtn = document.createElement('button');
      buyBtn.type = 'button';
      buyBtn.className = 'btn btn-upgrade';
      if (upg.cost === null) {
        buyBtn.textContent = 'MAX';
        buyBtn.disabled = true;
      } else {
        buyBtn.textContent = `✦ ${upg.cost}`;
        buyBtn.disabled = !upg.affordable;
        buyBtn.addEventListener('click', () => {
          const res = this.story.buyUpgrade(upg.key);
          if (res.success) {
            this.sound.playMediator();
            this.refreshHubUI();
          }
        });
      }
      card.appendChild(buyBtn);
      this.dom.upgradeList.appendChild(card);
    }

    // Скины
    const skins = this.story.getSkins();
    this.dom.hubSkinsCount.textContent = `${skins.filter((s) => s.owned).length} / ${skins.length}`;
    this.dom.skinsList.innerHTML = '';
    for (const skin of skins) {
      const card = document.createElement('div');
      card.className = `skin-card ${skin.equipped ? 'equipped' : ''}`;

      const swatchesHtml = skin.swatches.map((c) => `<span class="swatch" style="background:${c}"></span>`).join('');
      card.innerHTML = `
        <div>
          <div class="skin-swatches">${swatchesHtml}</div>
          <div class="skin-title" style="margin-top:6px">${skin.name}</div>
          <div class="skin-desc">${skin.desc}</div>
        </div>
      `;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn skin-btn ${skin.equipped ? 'btn-mint' : skin.owned ? 'btn-secondary' : 'btn-upgrade'}`;
      if (skin.equipped) {
        btn.textContent = '✓ НАДЕТ';
        btn.disabled = true;
      } else if (skin.owned) {
        btn.textContent = 'НАДЕТЬ';
      } else {
        btn.textContent = `КУПИТЬ ✦ ${skin.cost}`;
        btn.disabled = !skin.affordable;
      }

      btn.addEventListener('click', () => {
        const res = this.story.buyOrEquipSkin(skin.id);
        if (res.success) {
          this.sound.playMediator();
          this.altushka.applySkin(res.skin);
          this.refreshHubUI();
        }
      });

      card.appendChild(btn);
      this.dom.skinsList.appendChild(card);
    }

    // Концовки
    const gallery = this.story.getEndingsGallery();
    this.dom.hubEndingsCount.textContent = `${gallery.filter((e) => e.unlocked).length}/${gallery.length}`;
  }

  // ===================== ВИЗУАЛЬНАЯ НОВЕЛЛА =====================
  openVisualNovel(cassette) {
    this.state = 'vn';
    this.sound.stopMusic();
    this.dom.hud.classList.add('hidden');
    this.dom.modalVn.classList.remove('hidden');

    this.vnState.cassette = cassette;
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

    this.vnState.pendingFinale = res.finaleEnding;
    this.vnState.pendingUnlockChapter = res.unlockedNextChapter;

    this.dom.vnPortrait.innerHTML = getPortraitSVG(res.replyEmotion);
    const bonusLine = res.reward > 0 ? `\n\n[ +${res.reward} ✦ МЕДИАТОРОВ · КАССЕТА СОХРАНЕНА ]` : '';

    this.startTypewriter(`${res.reply}${bonusLine}`, () => {
      this.dom.vnChoices.innerHTML = '';
      const contBtn = document.createElement('button');
      contBtn.type = 'button';
      contBtn.className = 'vn-choice-btn';
      contBtn.textContent = this.vnState.pendingFinale ? 'ОТКРЫТЬ ФИНАЛ ИСТОРИИ ✦' : 'ВЕРНУТЬСЯ В ЗАБЕГ ▸';
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
    if (this.vnState.pendingUnlockChapter) this.applyChapterTheme(this.vnState.pendingUnlockChapter);

    this.invulnTimer = 1.6;
    this.state = 'playing';
    this.dom.hud.classList.remove('hidden');
    this.updateRunHud();
    this.sound.startMusic();
  }

  // ===================== ГАЛЕРЕЯ КОНЦОВОК =====================
  openEndings(featuredEnding = null) {
    this.state = 'endings';
    this.dom.modalHub.classList.add('hidden');
    this.dom.modalVn.classList.add('hidden');
    this.dom.hud.classList.add('hidden');
    this.dom.modalEndings.classList.remove('hidden');

    this.renderFeaturedEnding(featuredEnding);

    const gallery = this.story.getEndingsGallery();
    this.dom.endingsGalleryCount.textContent = `${gallery.filter((e) => e.unlocked).length} / ${gallery.length}`;
    this.dom.endingsGallery.innerHTML = '';

    for (const item of gallery) {
      const card = document.createElement('div');
      card.className = `ending-card ${item.unlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="ending-card-head">
          <span>${item.unlocked ? item.title : '??? [ЗАБЛОКИРОВАНО]'}</span>
          <span>${item.unlocked ? 'OPEN' : 'LOCK'}</span>
        </div>
        <p class="ending-card-body">${item.unlocked ? item.summary : 'Пройди 5-ю главу («Крыша телебашни») с подходящими выборами.'}</p>
      `;
      if (item.unlocked) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => { this.sound.playClick(); this.renderFeaturedEnding(item); });
      }
      this.dom.endingsGallery.appendChild(card);
    }
  }

  renderFeaturedEnding(ending) {
    if (!ending) { this.dom.endingFeatured.classList.add('hidden'); return; }
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

    if (this.state === 'playing') this.updatePlaying(rawDt);
    else if (this.state === 'hub' || this.state === 'endings') this.updateIdleScene(rawDt);

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame((t) => this.loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new AltRunnerGame();
});
