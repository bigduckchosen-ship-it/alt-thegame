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
const TRACK_LENGTH = 185;
const SPAWN_Z = -132;
const DESPAWN_Z = 16;

// Реалистичные ночные палитры глав (баланс теплого уличного света и акцентов вместо сплошного неона)
const CHAPTER_THEMES = {
  1: { sky: 0x101320, fog: 0x131624, fogDensity: 0.0135, lamp: 0xffc373, accent: 0xe64980, secondary: 0x845ef7, hemiSky: 0x8ea4d2, hemiGround: 0x1d1826 },
  2: { sky: 0x140e1c, fog: 0x181122, fogDensity: 0.014, lamp: 0xff9f68, accent: 0xf03e7c, secondary: 0x4dabf7, hemiSky: 0x9b89c4, hemiGround: 0x221629 },
  3: { sky: 0x1a1426, fog: 0x1f172d, fogDensity: 0.0128, lamp: 0xffd8a8, accent: 0xff6b9d, secondary: 0xb197fc, hemiSky: 0xc2a8e8, hemiGround: 0x261d33 },
  4: { sky: 0x0b121c, fog: 0x0e1622, fogDensity: 0.0155, lamp: 0x99e9f2, accent: 0x3bc9db, secondary: 0x7950f2, hemiSky: 0x6ea8c9, hemiGround: 0x121926 },
  5: { sky: 0x1a1020, fog: 0x211528, fogDensity: 0.012, lamp: 0xffb38a, accent: 0xff4d88, secondary: 0xd0bfff, hemiSky: 0xd4a5d6, hemiGround: 0x24162b }
};

// ===================== ГЕНЕРАТОР ПРОЦЕДУРНЫХ ТЕКСТУР =====================
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

function createProceduralTextures() {
  // 1. Мокрый городской асфальт с зернистостью, трещинами и потертой разметкой
  const asphalt = makeCanvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#1b1d24';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 3600; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const shade = 20 + Math.floor(Math.random() * 24);
      ctx.fillStyle = `rgb(${shade},${shade + 1},${shade + 6})`;
      ctx.fillRect(x, y, 2, 2);
    }
    // Легкие темные полосы колеи
    ctx.fillStyle = 'rgba(8, 9, 14, 0.35)';
    ctx.fillRect(34, 0, 26, h);
    ctx.fillRect(115, 0, 26, h);
    ctx.fillRect(196, 0, 26, h);
    // Тонкая дорожная разметка полос
    ctx.fillStyle = 'rgba(215, 210, 224, 0.28)';
    for (let y = 10; y < h; y += 64) {
      ctx.fillRect(84, y, 4, 34);
      ctx.fillRect(168, y, 4, 34);
    }
    // Желто-белые потертые края
    ctx.fillStyle = 'rgba(230, 175, 95, 0.32)';
    ctx.fillRect(6, 0, 4, h);
    ctx.fillRect(w - 10, 0, 4, h);
  }, 1, 18);

  // 2. Бетонная плитка тротуара
  const sidewalk = makeCanvasTex(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#2b2d38';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#1a1b24';
    ctx.lineWidth = 2;
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let i = 0; i < 600; i++) {
      const v = 35 + Math.floor(Math.random() * 20);
      ctx.fillStyle = `rgba(${v},${v},${v + 8},0.4)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  }, 1, 24);

  // 3. Фасад панельного дома (бетонные плиты + теплые/холодные окна с рамами)
  const buildingFacade = makeCanvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#252734';
    ctx.fillRect(0, 0, w, h);
    // Швы плит
    ctx.strokeStyle = '#191a24';
    ctx.lineWidth = 2;
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let x = 0; x < w; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    // Зернистость бетона
    for (let i = 0; i < 1200; i++) {
      const c = 30 + Math.floor(Math.random() * 24);
      ctx.fillStyle = `rgba(${c},${c},${c + 8},0.35)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 3, 2);
    }
    // Окна (часть выключена, часть — теплый домашний свет, часть — холодный ТВ)
    const palette = ['#131520', '#161926', '#ffd08a', '#f2b872', '#89b4fa', '#e599c8'];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 4; col++) {
        const wx = col * 64 + 14;
        const wy = row * 32 + 7;
        const r = Math.random();
        const fill = r < 0.56 ? palette[0] : r < 0.78 ? palette[2] : r < 0.88 ? palette[3] : r < 0.95 ? palette[4] : palette[5];
        ctx.fillStyle = '#12131c';
        ctx.fillRect(wx - 2, wy - 2, 38, 20);
        ctx.fillStyle = fill;
        ctx.fillRect(wx, wy, 34, 16);
        // Оконная рама
        ctx.fillStyle = '#1c1e2b';
        ctx.fillRect(wx + 16, wy, 2, 16);
        ctx.fillRect(wx, wy + 7, 34, 2);
      }
    }
  }, 1, 1);

  // 4. Борт вагона / ночного грузовика (гофра, двери, окна, потертости и граффити)
  const trainSide = makeCanvasTex(256, 128, (ctx, w, h) => {
    ctx.fillStyle = '#2d3242';
    ctx.fillRect(0, 0, w, h);
    // Нижняя полоса и гофра
    ctx.fillStyle = '#1f2330';
    ctx.fillRect(0, 86, w, 42);
    ctx.fillStyle = '#d9487b';
    ctx.fillRect(0, 76, w, 9);
    ctx.fillStyle = '#e5e7f0';
    ctx.fillRect(0, 85, w, 3);
    // Горизонтальные ребра металла
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let y = 92; y < h; y += 6) {
      ctx.fillRect(0, y, w, 2);
    }
    // Окна вагона с теплым салонным светом
    for (let x = 14; x < w - 20; x += 48) {
      ctx.fillStyle = '#141722';
      ctx.fillRect(x - 2, 18, 36, 42);
      const grad = ctx.createLinearGradient(0, 20, 0, 58);
      grad.addColorStop(0, '#ffe3b3');
      grad.addColorStop(1, '#8c7a99');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 20, 32, 38);
      // Блик на стекле
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(x + 3, 22, 6, 34);
    }
    // Легкий тег граффити поверх нижней части
    ctx.strokeStyle = 'rgba(255, 110, 175, 0.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(28, 112);
    ctx.quadraticCurveTo(60, 78, 92, 110);
    ctx.quadraticCurveTo(120, 82, 152, 108);
    ctx.stroke();
  }, 1, 1);

  // 5. Предупреждающие полосы для барьеров
  const hazard = makeCanvasTex(128, 64, (ctx, w, h) => {
    ctx.fillStyle = '#e8b949';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1c1d24';
    for (let i = -h; i < w + h; i += 28) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 14, 0);
      ctx.lineTo(i - 14, h);
      ctx.lineTo(i - 28, h);
      ctx.closePath();
      ctx.fill();
    }
    // Легкая грязь/потертость
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = 'rgba(20,20,25,0.22)';
      ctx.fillRect(Math.random() * w, Math.random() * h, 3, 2);
    }
  }, 2, 1);

  // 6. Полосатые гетры Альтушки (фактурный трикотаж)
  const stripedSocks = makeCanvasTex(64, 128, (ctx, w, h) => {
    for (let y = 0; y < h; y += 16) {
      ctx.fillStyle = (y / 16) % 2 === 0 ? '#18141f' : '#f48fb1';
      ctx.fillRect(0, y, w, 16);
      // Тонкая рубчиковая фактура вязки
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let x = 0; x < w; x += 4) {
        ctx.fillRect(x, y, 1, 16);
      }
    }
  }, 1, 1);

  // 7. Текстура худи (плотный хлопок + принт на спине)
  const hoodieFabric = makeCanvasTex(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#1d1826';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) {
      const v = 22 + Math.floor(Math.random() * 18);
      ctx.fillStyle = `rgb(${v},${v - 2},${v + 8})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    // Строчка и принт в стиле Y2K
    ctx.strokeStyle = 'rgba(244, 143, 177, 0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(64, 34);
    ctx.lineTo(74, 54);
    ctx.lineTo(94, 62);
    ctx.lineTo(74, 70);
    ctx.lineTo(64, 92);
    ctx.lineTo(54, 70);
    ctx.lineTo(34, 62);
    ctx.lineTo(54, 54);
    ctx.closePath();
    ctx.stroke();
  }, 1, 1);

  // 8. Аниме-лицо Альтушки (на случай облета камеры в Хабе)
  const faceTex = makeCanvasTex(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#fae5e8';
    ctx.fillRect(0, 0, w, h);
    // Румянец
    ctx.fillStyle = 'rgba(255, 115, 160, 0.28)';
    ctx.beginPath();
    ctx.ellipse(32, 78, 12, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(96, 78, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Глаза (гетерохромия: фиолетовый и розовый)
    const drawEye = (cx, irisColor) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, 62, 13, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = irisColor;
      ctx.beginPath();
      ctx.ellipse(cx, 63, 8, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#120c18';
      ctx.beginPath();
      ctx.arc(cx, 64, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 3, 58, 3, 0, Math.PI * 2);
      ctx.fill();
      // Стрелка подводки
      ctx.strokeStyle = '#120c18';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 14, 55);
      ctx.quadraticCurveTo(cx, 48, cx + 14, 55);
      ctx.stroke();
    };
    drawEye(40, '#845ef7');
    drawEye(88, '#e64980');
    // Губы
    ctx.strokeStyle = '#c45b7c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(56, 95);
    ctx.quadraticCurveTo(64, 100, 72, 95);
    ctx.stroke();
  }, 1, 1);

  // 9. Мягкая круглая тень под персонажем
  const blobShadow = makeCanvasTex(64, 64, (ctx, w, h) => {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    grad.addColorStop(0, 'rgba(5, 5, 10, 0.72)');
    grad.addColorStop(0.6, 'rgba(5, 5, 10, 0.32)');
    grad.addColorStop(1, 'rgba(5, 5, 10, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }, 1, 1);

  return {
    asphalt,
    sidewalk,
    buildingFacade,
    trainSide,
    hazard,
    stripedSocks,
    hoodieFabric,
    faceTex,
    blobShadow
  };
}

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
    const stepDuration = 60 / baseBpm / 4;

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

  playSwipe() { this.playTone('triangle', 320, 620, 0.08, 0.2); }
  playJump() {
    this.playTone('sine', 210, 560, 0.14, 0.28);
    this.playTone('triangle', 420, 740, 0.1, 0.12, 0.02);
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
  playClick() { this.playTone('triangle', 640, 860, 0.05, 0.14); }
}

// ===================== ФАКТУРНАЯ ЖЕНСТВЕННАЯ 3D-МОДЕЛЬ АЛЬТУШКИ =====================
function createAltushkaRig(textures) {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const matSkin = new THREE.MeshStandardMaterial({ color: 0xfbe5e8, roughness: 0.58, metalness: 0.02 });
  const matFace = new THREE.MeshStandardMaterial({ map: textures.faceTex, roughness: 0.52 });
  const matHairDark = new THREE.MeshStandardMaterial({ color: 0x16121f, roughness: 0.48, metalness: 0.12 });
  const matHairPink = new THREE.MeshStandardMaterial({
    color: 0xf06595,
    emissive: 0x7a1c42,
    emissiveIntensity: 0.25,
    roughness: 0.42
  });
  const matHairViolet = new THREE.MeshStandardMaterial({
    color: 0x9775fa,
    emissive: 0x3b2273,
    emissiveIntensity: 0.22,
    roughness: 0.42
  });
  const matHoodie = new THREE.MeshStandardMaterial({
    map: textures.hoodieFabric,
    roughness: 0.88,
    metalness: 0.04
  });
  const matHoodieTrim = new THREE.MeshStandardMaterial({ color: 0xf48fb1, roughness: 0.65 });
  const matSkirt = new THREE.MeshStandardMaterial({ color: 0x251a2e, roughness: 0.78 });
  const matLeather = new THREE.MeshStandardMaterial({ color: 0x141219, roughness: 0.35, metalness: 0.28 });
  const matSilver = new THREE.MeshStandardMaterial({ color: 0xd8dce8, roughness: 0.22, metalness: 0.85 });
  const matSocks = new THREE.MeshStandardMaterial({ map: textures.stripedSocks, roughness: 0.85 });
  const matSole = new THREE.MeshStandardMaterial({ color: 0x1c1924, roughness: 0.7 });

  // --- ТОРС (женственный силуэт: узкая талия, плавные бедра, укороченный оверсайз-худи) ---
  const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.19, 0.24, 14), matHoodie);
  waist.position.set(0, 0.86, 0);
  bodyPivot.add(waist);

  const upperTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.155, 0.34, 14), matHoodie);
  upperTorso.scale.set(1.06, 1, 0.82);
  upperTorso.position.set(0, 1.13, 0);
  bodyPivot.add(upperTorso);

  // Мягкий объем груди и ключиц
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), matHoodie);
  chest.scale.set(1.22, 0.75, 0.72);
  chest.position.set(0, 1.15, -0.09);
  bodyPivot.add(chest);

  // Нижняя резинка укороченного худи
  const hoodieHem = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.032, 8, 18), matHoodieTrim);
  hoodieHem.rotation.x = Math.PI / 2;
  hoodieHem.position.set(0, 0.86, 0);
  bodyPivot.add(hoodieHem);

  // Спущенный капюшон на спине с кошачьими ушками
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 10), matHoodie);
  hood.scale.set(1.1, 0.65, 0.85);
  hood.position.set(0, 1.32, 0.13);
  bodyPivot.add(hood);

  const earGeo = new THREE.ConeGeometry(0.055, 0.13, 5);
  const earL = new THREE.Mesh(earGeo, matHoodie);
  earL.position.set(-0.14, 1.43, 0.18);
  earL.rotation.set(0.5, 0, 0.35);
  bodyPivot.add(earL);
  const earR = new THREE.Mesh(earGeo, matHoodie);
  earR.position.set(0.14, 1.43, 0.18);
  earR.rotation.set(0.5, 0, -0.35);
  bodyPivot.add(earR);

  // Кожаный мини-рюкзачок с серебряными заклепками и брелком (виден в забеге!)
  const backpack = new THREE.Group();
  backpack.position.set(0, 1.07, 0.18);
  const bpBody = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 0.13), matLeather);
  backpack.add(bpBody);
  const bpPocket = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.05), matLeather);
  bpPocket.position.set(0, -0.07, 0.07);
  backpack.add(bpPocket);
  const bpZip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.015, 0.02), matSilver);
  bpZip.position.set(0, -0.01, 0.09);
  backpack.add(bpZip);
  // Серебряный крестик-подвеска на рюкзаке
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.09, 0.015), matSilver);
  crossV.position.set(0, 0.06, 0.07);
  backpack.add(crossV);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.015), matSilver);
  crossH.position.set(0, 0.075, 0.07);
  backpack.add(crossH);
  // Лямки рюкзака
  const strapGeo = new THREE.TorusGeometry(0.14, 0.016, 6, 12, Math.PI);
  const strapL = new THREE.Mesh(strapGeo, matLeather);
  strapL.position.set(-0.15, 0.05, -0.08);
  strapL.rotation.y = Math.PI / 2;
  backpack.add(strapL);
  const strapR = strapL.clone();
  strapR.position.x = 0.15;
  backpack.add(strapR);
  bodyPivot.add(backpack);

  // --- ПЫШНАЯ СКЛАДЧАТАЯ ЮБКА-ПЛИССЕ + РЕМЕНЬ С ЦЕПОЧКОЙ ---
  const skirtPivot = new THREE.Group();
  skirtPivot.position.set(0, 0.77, 0);
  bodyPivot.add(skirtPivot);

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.185, 0.06, 16), matLeather);
  belt.position.y = 0.06;
  skirtPivot.add(belt);

  const skirtBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, 0.28, 16), matSkirt);
  skirtBase.position.y = -0.08;
  skirtPivot.add(skirtBase);

  // Складки плиссе по кругу
  const pleatGeo = new THREE.BoxGeometry(0.085, 0.27, 0.03);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const pleat = new THREE.Mesh(pleatGeo, i % 2 === 0 ? matSkirt : matLeather);
    pleat.position.set(Math.sin(angle) * 0.25, -0.085, Math.cos(angle) * 0.25);
    pleat.rotation.y = angle;
    pleat.rotation.x = 0.32;
    skirtPivot.add(pleat);
  }
  // Розовая окантовка по краю юбки и цепочка сбоку
  const skirtTrim = new THREE.Mesh(new THREE.TorusGeometry(0.335, 0.014, 6, 20), matHoodieTrim);
  skirtTrim.rotation.x = Math.PI / 2;
  skirtTrim.position.y = -0.21;
  skirtPivot.add(skirtTrim);

  const chain = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.01, 6, 12, Math.PI), matSilver);
  chain.position.set(0.21, -0.02, 0.04);
  chain.rotation.z = Math.PI;
  chain.rotation.y = 0.4;
  skirtPivot.add(chain);

  // --- ШЕЯ, ЧОКЕР И ГОЛОВА ---
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.14, 10), matSkin);
  neck.position.set(0, 1.36, 0);
  bodyPivot.add(neck);

  const chokerBand = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.045, 12), matLeather);
  chokerBand.position.set(0, 1.36, 0);
  bodyPivot.add(chokerBand);
  const chokerRing = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.008, 6, 12), matSilver);
  chokerRing.position.set(0, 1.34, -0.082);
  bodyPivot.add(chokerRing);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.56, 0);
  bodyPivot.add(headGroup);

  // Округлая аниме-голова с текстурой лица спереди
  const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.185, 16, 14), matSkin);
  headSphere.scale.set(0.95, 1.03, 0.92);
  headGroup.add(headSphere);

  const facePlane = new THREE.Mesh(
    new THREE.CircleGeometry(0.145, 16),
    matFace
  );
  facePlane.position.set(0, -0.01, -0.168);
  facePlane.rotation.y = Math.PI;
  headGroup.add(facePlane);

  // Объемная шапка волос + рваная челка + боковые пряди
  const hairCrown = new THREE.Mesh(new THREE.SphereGeometry(0.205, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65), matHairDark);
  hairCrown.position.set(0, 0.02, 0.015);
  headGroup.add(hairCrown);

  const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.195, 14, 10), matHairDark);
  hairBack.scale.set(1.04, 1.08, 0.72);
  hairBack.position.set(0, -0.02, 0.08);
  headGroup.add(hairBack);

  // Боковые пряди у лица (розовая и фиолетовая)
  const sideStrandGeo = new THREE.CapsuleGeometry(0.036, 0.18, 4, 8);
  const strandL = new THREE.Mesh(sideStrandGeo, matHairViolet);
  strandL.position.set(-0.15, -0.05, -0.07);
  strandL.rotation.z = -0.14;
  headGroup.add(strandL);

  const strandR = new THREE.Mesh(sideStrandGeo, matHairPink);
  strandR.position.set(0.15, -0.05, -0.07);
  strandR.rotation.z = 0.14;
  headGroup.add(strandR);

  // Пышные изогнутые двухцветные хвостики с бантами
  const makeTwinTail = (side, topMat, tipMat) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.2, 0.08, 0.07);

    // Резинка-бантик
    const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.018, 6, 12), matHoodieTrim);
    ribbon.rotation.y = side * 0.5;
    pivot.add(ribbon);

    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.24, 6, 10), topMat);
    upper.position.set(side * 0.08, -0.16, 0.05);
    upper.rotation.z = side * 0.32;
    upper.rotation.x = 0.18;
    pivot.add(upper);

    const midPivot = new THREE.Group();
    midPivot.position.set(side * 0.14, -0.32, 0.09);
    pivot.add(midPivot);

    const lower = new THREE.Mesh(new THREE.ConeGeometry(0.078, 0.42, 10), tipMat);
    lower.position.set(side * 0.05, -0.18, 0.04);
    lower.rotation.z = side * 0.18 + Math.PI;
    midPivot.add(lower);

    headGroup.add(pivot);
    return { pivot, midPivot };
  };

  const leftTail = makeTwinTail(-1, matHairDark, matHairViolet);
  const rightTail = makeTwinTail(1, matHairDark, matHairPink);

  // --- СТРОЙНЫЕ РУКИ В ОБЪЕМНЫХ РУКАВАХ ---
  const makeArm = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.25, 1.24, 0);

    const upperSleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.2, 6, 8), matHoodie);
    upperSleeve.position.set(0, -0.12, 0);
    pivot.add(upperSleeve);

    const forearmSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.085, 0.24, 10), matHoodie);
    forearmSleeve.position.set(0, -0.33, -0.02);
    pivot.add(forearmSleeve);

    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.015, 6, 12), matHoodieTrim);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.set(0, -0.45, -0.02);
    pivot.add(cuff);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), matSkin);
    hand.position.set(0, -0.49, -0.02);
    pivot.add(hand);

    bodyPivot.add(pivot);
    return pivot;
  };
  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);

  // --- СТРОЙНЫЕ НОГИ В ПОЛОСАТЫХ ГЕТРАХ И БОТИНКАХ НА ПЛАТФОРМЕ ---
  const makeLeg = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.115, 0.68, 0);

    // Бедро (округлое, женственное)
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, 0.2, 6, 10), matSkin);
    thigh.position.set(0, -0.14, 0);
    pivot.add(thigh);

    // Полосатые гольфы / гетры с текстурой вязки
    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.076, 0.3, 12), matSocks);
    calf.position.set(0, -0.38, 0);
    pivot.add(calf);

    // Кожаный ботинок на массивной платформе + серебряная пряжка
    const bootUpper = new THREE.Mesh(new THREE.CapsuleGeometry(0.078, 0.12, 6, 10), matLeather);
    bootUpper.rotation.x = Math.PI / 2;
    bootUpper.position.set(0, -0.56, -0.04);
    pivot.add(bootUpper);

    const bootBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 0.06), matSilver);
    bootBuckle.position.set(0, -0.51, -0.02);
    pivot.add(bootBuckle);

    const platform = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.085, 0.28), matSole);
    platform.position.set(0, -0.64, -0.04);
    pivot.add(platform);

    const soleAccent = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.02, 0.285), matHoodieTrim);
    soleAccent.position.set(0, -0.61, -0.04);
    pivot.add(soleAccent);

    bodyPivot.add(pivot);
    return pivot;
  };
  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);

  // Мягкая тень под ногами
  const shadowBlob = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 1.15),
    new THREE.MeshBasicMaterial({ map: textures.blobShadow, transparent: true, depthWrite: false })
  );
  shadowBlob.rotation.x = -Math.PI / 2;
  shadowBlob.position.set(0, 0.03, 0);
  root.add(shadowBlob);

  // Деликатные ауры баффов
  const shieldAura = new THREE.Mesh(
    new THREE.SphereGeometry(1.06, 18, 14),
    new THREE.MeshBasicMaterial({
      color: 0xd0bfff,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    })
  );
  shieldAura.position.set(0, 0.95, 0);
  shieldAura.visible = false;
  root.add(shieldAura);

  const energyAura = new THREE.Mesh(
    new THREE.ConeGeometry(0.88, 2.0, 10, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xff4d88,
      wireframe: true,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide
    })
  );
  energyAura.rotation.x = Math.PI / 2;
  energyAura.position.set(0, 0.95, 0.18);
  energyAura.visible = false;
  root.add(energyAura);

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
    energyAura
  };
}

// ===================== ПРЕСЛЕДОВАТЕЛЬ («СКУФ-ПАТРУЛЬНЫЙ») =====================
function createSkufRig() {
  const root = new THREE.Group();
  const matCoat = new THREE.MeshStandardMaterial({ color: 0x3b404d, roughness: 0.88 });
  const matVest = new THREE.MeshStandardMaterial({ color: 0x23262e, roughness: 0.8 });
  const matPants = new THREE.MeshStandardMaterial({ color: 0x22252e, roughness: 0.9 });
  const matSkin = new THREE.MeshStandardMaterial({ color: 0xd9b3a3, roughness: 0.72 });
  const matCap = new THREE.MeshStandardMaterial({ color: 0x1e212b, roughness: 0.75 });
  const matReflective = new THREE.MeshStandardMaterial({
    color: 0xe6e8f0,
    emissive: 0x748ffc,
    emissiveIntensity: 0.4
  });
  const matFlashlight = new THREE.MeshStandardMaterial({
    color: 0xffe066,
    emissive: 0xffcc33,
    emissiveIntensity: 1.2
  });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.45, 8, 12), matCoat);
  torso.scale.set(1.05, 1, 1.15);
  torso.position.set(0, 1.05, 0);
  root.add(torso);

  const vestStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.47, 0.1, 12), matReflective);
  vestStripe.position.set(0, 1.04, 0);
  root.add(vestStripe);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), matSkin);
  head.position.set(0, 1.66, 0);
  root.add(head);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.12, 12), matCap);
  cap.position.set(0, 1.82, 0);
  root.add(cap);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.18), matCap);
  visor.position.set(0, 1.77, -0.2);
  root.add(visor);

  const makeArm = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.5, 1.32, 0);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.36, 6, 8), matCoat);
    arm.position.set(0, -0.22, 0);
    pivot.add(arm);
    if (side === 1) {
      const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, 0.34, 8), matVest);
      torch.position.set(0, -0.44, -0.18);
      torch.rotation.x = Math.PI / 2.2;
      pivot.add(torch);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.052, 8), matFlashlight);
      lens.position.set(0, -0.46, -0.36);
      lens.rotation.y = Math.PI;
      pivot.add(lens);
    }
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
    pivot.add(leg);
    root.add(pivot);
    return pivot;
  };
  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);

  return { root, leftArm, rightArm, leftLeg, rightLeg };
}

// ===================== ДЕТАЛИЗИРОВАННЫЕ ПРЕПЯТСТВИЯ И ПРЕДМЕТЫ =====================
function createObstacleMesh(type, sharedMats) {
  const group = new THREE.Group();

  if (type === 'low') {
    // Бетонный дорожный блок + изношенная предупреждающая доска с фонарями
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.44, 0.56), sharedMats.concrete);
    base.position.set(0, 0.22, 0);
    group.add(base);

    const board = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.38, 0.14), sharedMats.hazard);
    board.position.set(0, 0.72, 0);
    group.add(board);

    const postGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const postL = new THREE.Mesh(postGeo, sharedMats.darkMetal);
    postL.position.set(-0.82, 0.58, 0);
    group.add(postL);
    const postR = postL.clone();
    postR.position.x = 0.82;
    group.add(postR);

    const beaconGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 8);
    const beaconL = new THREE.Mesh(beaconGeo, sharedMats.warmLamp);
    beaconL.position.set(-0.82, 0.96, 0);
    group.add(beaconL);
    const beaconR = beaconL.clone();
    beaconR.position.x = 0.82;
    group.add(beaconR);
  } else if (type === 'high') {
    // Индустриальные строительные леса / арка с предупреждающим щитом
    const pillarGeo = new THREE.CylinderGeometry(0.08, 0.09, 2.6, 8);
    const pillarL = new THREE.Mesh(pillarGeo, sharedMats.darkMetal);
    pillarL.position.set(-1.04, 1.3, 0);
    group.add(pillarL);
    const pillarR = pillarL.clone();
    pillarR.position.x = 1.04;
    group.add(pillarR);

    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.84, 0.36), sharedMats.concrete);
    signBoard.position.set(0, 2.02, 0);
    group.add(signBoard);

    const hazardStrip = new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.22, 0.4), sharedMats.hazard);
    hazardStrip.position.set(0, 1.52, 0);
    group.add(hazardStrip);

    const accentTrim = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.12, 0.4), sharedMats.accentGlow);
    accentTrim.position.set(0, 2.04, 0);
    group.add(accentTrim);
  } else {
    // Детализированный вагон метро / ночной грузовик
    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.15, 2.48, 8.6), sharedMats.trainSide);
    hull.position.set(0, 1.48, 0);
    group.add(hull);

    // Ходовая тележка и бампер
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.34, 8.2), sharedMats.darkMetal);
    chassis.position.set(0, 0.18, 0);
    group.add(chassis);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.24, 8.4), sharedMats.concrete);
    roof.position.set(0, 2.82, 0);
    group.add(roof);

    // Кондиционеры на крыше вагона
    const acGeo = new THREE.BoxGeometry(1.1, 0.22, 1.6);
    const ac1 = new THREE.Mesh(acGeo, sharedMats.darkMetal);
    ac1.position.set(0, 3.02, -2.0);
    group.add(ac1);
    const ac2 = ac1.clone();
    ac2.position.z = 2.0;
    group.add(ac2);

    // Лобовое стекло и теплые фары
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.92, 0.1), sharedMats.glassDark);
    windshield.position.set(0, 1.92, 4.32);
    group.add(windshield);

    const routeSign = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.22, 0.1), sharedMats.accentGlow);
    routeSign.position.set(0, 2.52, 4.32);
    group.add(routeSign);

    const lampGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.1, 10);
    const hlL = new THREE.Mesh(lampGeo, sharedMats.warmLamp);
    hlL.rotation.x = Math.PI / 2;
    hlL.position.set(-0.68, 0.78, 4.32);
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
    const pick = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 3), sharedMats.accentGlow);
    pick.rotation.x = Math.PI / 2;
    group.add(pick);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 3), sharedMats.silver);
    core.rotation.x = Math.PI / 2;
    group.add(core);
  } else if (type === 'energy') {
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.72, 12), sharedMats.accentGlow);
    group.add(can);
    const topRim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.08, 12), sharedMats.silver);
    topRim.position.y = 0.38;
    group.add(topRim);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.22, 12), sharedMats.secondaryGlow);
    group.add(band);
  } else if (type === 'shield') {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.085, 8, 16), sharedMats.darkMetal);
    group.add(ring);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.2, 5), sharedMats.silver);
      spike.position.set(Math.cos(a) * 0.44, Math.sin(a) * 0.44, 0);
      spike.rotation.z = a - Math.PI / 2;
      group.add(spike);
    }
  } else if (type === 'slowmo') {
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), sharedMats.secondaryGlow);
    shell.scale.set(0.86, 1.12, 0.52);
    group.add(shell);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.22), sharedMats.warmLamp);
    screen.position.set(0, 0.05, 0.12);
    group.add(screen);
  } else {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.58, 0.18), sharedMats.darkMetal);
    group.add(body);
    const label = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.32, 0.21), sharedMats.accentGlow);
    label.position.y = 0.05;
    group.add(label);
    const reelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.23, 10);
    const reelL = new THREE.Mesh(reelGeo, sharedMats.silver);
    reelL.rotation.x = Math.PI / 2;
    reelL.position.set(-0.2, 0.05, 0);
    group.add(reelL);
    const reelR = reelL.clone();
    reelR.position.x = 0.2;
    group.add(reelR);
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

    this.laneIndex = 1;
    this.playerX = LANES[1];
    this.playerY = 0;
    this.playerVelY = 0;
    this.isGrounded = true;
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
      phase: 'prompt',
      pendingFinale: null,
      pendingUnlockChapter: null
    };

    this.playerBox = new THREE.Box3();
    this.tempBox = new THREE.Box3();

    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchHandled = false;

    this.textures = createProceduralTextures();
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
    this.renderer.toneMappingExposure = 1.18;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x101320);
    this.scene.fog = new THREE.FogExp2(0x131624, 0.0135);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      220
    );
    this.camera.position.set(0, 4.2, 7.6);
    this.camera.lookAt(0, 1.35, -10);

    // Сбалансированное ночное освещение (луна + теплый уличный свет + контровой блик)
    this.hemiLight = new THREE.HemisphereLight(0x8ea4d2, 0x1d1826, 1.15);
    this.scene.add(this.hemiLight);

    this.moonLight = new THREE.DirectionalLight(0xc8dcff, 1.1);
    this.moonLight.position.set(-10, 22, 12);
    this.scene.add(this.moonLight);

    this.warmStreetLight = new THREE.PointLight(0xffc373, 2.8, 28);
    this.warmStreetLight.position.set(3.8, 5.2, 2.5);
    this.scene.add(this.warmStreetLight);

    this.rimLight = new THREE.PointLight(0xe64980, 1.5, 18);
    this.rimLight.position.set(-3.2, 2.8, -3.5);
    this.scene.add(this.rimLight);

    // Общие материалы с фактурами
    this.sharedMats = {
      road: new THREE.MeshStandardMaterial({
        map: this.textures.asphalt,
        roughness: 0.72,
        metalness: 0.08
      }),
      sidewalk: new THREE.MeshStandardMaterial({
        map: this.textures.sidewalk,
        roughness: 0.9
      }),
      curb: new THREE.MeshStandardMaterial({ color: 0x3b3f4f, roughness: 0.85 }),
      building: new THREE.MeshStandardMaterial({
        map: this.textures.buildingFacade,
        roughness: 0.86
      }),
      concrete: new THREE.MeshStandardMaterial({ color: 0x323544, roughness: 0.9 }),
      darkMetal: new THREE.MeshStandardMaterial({ color: 0x1e202b, roughness: 0.5, metalness: 0.45 }),
      silver: new THREE.MeshStandardMaterial({ color: 0xd8dce8, roughness: 0.25, metalness: 0.85 }),
      glassDark: new THREE.MeshStandardMaterial({ color: 0x151b29, roughness: 0.15, metalness: 0.7 }),
      trainSide: new THREE.MeshStandardMaterial({
        map: this.textures.trainSide,
        roughness: 0.52,
        metalness: 0.25
      }),
      hazard: new THREE.MeshStandardMaterial({
        map: this.textures.hazard,
        roughness: 0.68
      }),
      warmLamp: new THREE.MeshStandardMaterial({
        color: 0xffd89b,
        emissive: 0xffb85c,
        emissiveIntensity: 1.4
      }),
      lampCone: new THREE.MeshBasicMaterial({
        color: 0xffcf87,
        transparent: true,
        opacity: 0.09,
        depthWrite: false,
        side: THREE.DoubleSide
      }),
      accentGlow: new THREE.MeshStandardMaterial({
        color: 0xe64980,
        emissive: 0xe64980,
        emissiveIntensity: 0.75,
        roughness: 0.35
      }),
      secondaryGlow: new THREE.MeshStandardMaterial({
        color: 0x845ef7,
        emissive: 0x845ef7,
        emissiveIntensity: 0.7,
        roughness: 0.35
      })
    };

    // Ночное небо: луна + далекие звезды + силуэт горизонта
    this.initBackdrop();

    // Персонажи
    this.altushka = createAltushkaRig(this.textures);
    this.scene.add(this.altushka.root);

    this.skuf = createSkufRig();
    this.skuf.root.position.set(0, 0, this.pursuerZ);
    this.scene.add(this.skuf.root);
  }

  initBackdrop() {
    const skyGroup = new THREE.Group();

    // Луна в дымке
    const moon = new THREE.Mesh(
      new THREE.CircleGeometry(7.5, 24),
      new THREE.MeshBasicMaterial({ color: 0xf4ecff, fog: false })
    );
    moon.position.set(-22, 46, -170);
    skyGroup.add(moon);

    const moonHalo = new THREE.Mesh(
      new THREE.CircleGeometry(14, 24),
      new THREE.MeshBasicMaterial({
        color: 0xb197fc,
        transparent: true,
        opacity: 0.14,
        fog: false,
        depthWrite: false
      })
    );
    moonHalo.position.set(-22, 46, -171);
    skyGroup.add(moonHalo);

    // Звезды
    const starPositions = [];
    for (let i = 0; i < 120; i++) {
      starPositions.push(
        (Math.random() - 0.5) * 240,
        18 + Math.random() * 75,
        -160 - Math.random() * 30
      );
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xe8e4ff, size: 0.7, fog: false })
    );
    skyGroup.add(stars);

    // Силуэт далеких высоток и телебашни на горизонте
    const skylineMat = new THREE.MeshBasicMaterial({ color: 0x16192a, fog: false });
    for (let i = 0; i < 18; i++) {
      const w = 6 + (i % 4) * 3;
      const h = 14 + ((i * 11) % 28);
      const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, 4), skylineMat);
      tower.position.set(-95 + i * 11.2, h / 2 - 2, -165);
      skyGroup.add(tower);
    }
    // Шпиль телебашни вдали
    const tvTower = new THREE.Mesh(new THREE.ConeGeometry(2.8, 56, 6), skylineMat);
    tvTower.position.set(16, 26, -166);
    skyGroup.add(tvTower);
    const tvBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.75, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff4d6d, fog: false })
    );
    tvBeacon.position.set(16, 54, -166);
    skyGroup.add(tvBeacon);

    this.scene.add(skyGroup);
  }

  initWorldPools() {
    // Полотно трассы с текстурой мокрого асфальта
    const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(9.2, TRACK_LENGTH), this.sharedMats.road);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, -TRACK_LENGTH / 2 + 22);
    this.scene.add(roadMesh);

    // Тротуары и бордюры по бокам
    const swGeo = new THREE.BoxGeometry(4.2, 0.24, TRACK_LENGTH);
    const curbGeo = new THREE.BoxGeometry(0.32, 0.3, TRACK_LENGTH);
    for (const side of [-1, 1]) {
      const sw = new THREE.Mesh(swGeo, this.sharedMats.sidewalk);
      sw.position.set(side * 6.8, 0.12, -TRACK_LENGTH / 2 + 22);
      this.scene.add(sw);

      const curb = new THREE.Mesh(curbGeo, this.sharedMats.curb);
      curb.position.set(side * 4.65, 0.15, -TRACK_LENGTH / 2 + 22);
      this.scene.add(curb);
    }

    // Пул уличных фонарей вдоль тротуаров (создают глубину и теплый городской уют)
    this.streetLamps = [];
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.11, 6.2, 8);
    const armGeo = new THREE.BoxGeometry(1.5, 0.1, 0.1);
    const headGeo = new THREE.BoxGeometry(0.55, 0.14, 0.26);
    const coneGeo = new THREE.ConeGeometry(2.2, 5.8, 12, 1, true);
    for (let i = 0; i < 16; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const zSlot = 12 - Math.floor(i / 2) * 20;
      const lamp = new THREE.Group();

      const pole = new THREE.Mesh(poleGeo, this.sharedMats.darkMetal);
      pole.position.set(0, 3.1, 0);
      lamp.add(pole);

      const arm = new THREE.Mesh(armGeo, this.sharedMats.darkMetal);
      arm.position.set(-side * 0.72, 6.1, 0);
      lamp.add(arm);

      const head = new THREE.Mesh(headGeo, this.sharedMats.warmLamp);
      head.position.set(-side * 1.35, 6.02, 0);
      lamp.add(head);

      const cone = new THREE.Mesh(coneGeo, this.sharedMats.lampCone);
      cone.position.set(-side * 1.35, 3.1, 0);
      lamp.add(cone);

      lamp.position.set(side * 5.2, 0.24, zSlot);
      this.scene.add(lamp);
      this.streetLamps.push(lamp);
    }

    // Пул детализированных городских зданий (панельки, балконы, антенны, локальные вывески)
    this.buildings = [];
    const bldGeo = new THREE.BoxGeometry(1, 1, 1);
    const balconyGeo = new THREE.BoxGeometry(0.55, 0.9, 2.2);
    const acGeo = new THREE.BoxGeometry(0.35, 0.42, 0.55);
    const signGeo = new THREE.BoxGeometry(0.14, 0.9, 2.4);
    const roofBoxGeo = new THREE.BoxGeometry(2.2, 1.2, 2.2);

    for (let i = 0; i < 32; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const zSlot = 16 - Math.floor(i / 2) * 10.5;
      const group = new THREE.Group();

      const width = 5.4 + (i % 3) * 1.5;
      const height = 10 + ((i * 7) % 15);
      const depth = 8.4;

      const body = new THREE.Mesh(bldGeo, this.sharedMats.building);
      body.scale.set(width, height, depth);
      body.position.set(0, height / 2, 0);
      group.add(body);

      // Крыша-парапет и техпостройка
      const parapet = new THREE.Mesh(bldGeo, this.sharedMats.concrete);
      parapet.scale.set(width + 0.2, 0.45, depth + 0.2);
      parapet.position.set(0, height + 0.2, 0);
      group.add(parapet);

      if (i % 2 === 0) {
        const roofBox = new THREE.Mesh(roofBoxGeo, this.sharedMats.concrete);
        roofBox.position.set(0, height + 0.95, 0);
        group.add(roofBox);
      }

      // Выступающие балконы на фасаде
      const faceX = -side * (width / 2);
      for (let b = 0; b < 2; b++) {
        const bal = new THREE.Mesh(balconyGeo, this.sharedMats.concrete);
        bal.position.set(faceX - side * 0.25, 4.6 + b * 3.4, (b === 0 ? -1.8 : 1.9));
        group.add(bal);
      }

      // Наружный блок кондиционера
      const ac = new THREE.Mesh(acGeo, this.sharedMats.curb);
      ac.position.set(faceX - side * 0.16, 3.2, 0);
      group.add(ac);

      // Умеренные вывески (только на каждом 3-м доме, без перегруза неоном)
      if (i % 3 === 0) {
        const sign = new THREE.Mesh(
          signGeo,
          i % 6 === 0 ? this.sharedMats.accentGlow : this.sharedMats.secondaryGlow
        );
        sign.position.set(faceX - side * 0.1, 2.8, 0);
        group.add(sign);
      }

      group.position.set(side * (8.4 + width / 2), 0, zSlot);
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

    // Пул частиц
    this.particles = [];
    const partGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    for (let i = 0; i < 36; i++) {
      const mesh = new THREE.Mesh(
        partGeo,
        i % 2 === 0 ? this.sharedMats.accentGlow : this.sharedMats.warmLamp
      );
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
    const theme = CHAPTER_THEMES[chapterId] || CHAPTER_THEMES[1];
    this.scene.background.setHex(theme.sky);
    this.scene.fog.color.setHex(theme.fog);
    this.scene.fog.density = theme.fogDensity;

    this.hemiLight.color.setHex(theme.hemiSky);
    this.hemiLight.groundColor.setHex(theme.hemiGround);
    this.warmStreetLight.color.setHex(theme.lamp);
    this.rimLight.color.setHex(theme.accent);

    this.sharedMats.warmLamp.color.setHex(theme.lamp);
    this.sharedMats.warmLamp.emissive.setHex(theme.lamp);
    this.sharedMats.lampCone.color.setHex(theme.lamp);

    this.sharedMats.accentGlow.color.setHex(theme.accent);
    this.sharedMats.accentGlow.emissive.setHex(theme.accent);
    this.sharedMats.secondaryGlow.color.setHex(theme.secondary);
    this.sharedMats.secondaryGlow.emissive.setHex(theme.secondary);
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
    canvas.addEventListener(
      'touchstart',
      (e) => {
        if (this.state !== 'playing' || !e.touches.length) return;
        this.sound.ensureContext();
        const t = e.touches[0];
        this.touchStartX = t.clientX;
        this.touchStartY = t.clientY;
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
        if (Math.max(Math.abs(dx), Math.abs(dy)) >= 28) {
          this.handleSwipeDirection(dx, dy, Math.abs(dx), Math.abs(dy));
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
        if (Math.max(Math.abs(dx), Math.abs(dy)) >= 22) {
          this.handleSwipeDirection(dx, dy, Math.abs(dx), Math.abs(dy));
        }
      },
      { passive: true }
    );

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyM') {
        this.toggleMuteUI();
        return;
      }
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (this.state === 'playing') this.pauseRun();
        else if (this.state === 'paused') this.resumeRun();
        else if (this.state === 'endings') this.closeEndings();
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

    this.dom.btnMute.addEventListener('click', () => this.toggleMuteUI());
    this.dom.btnPause.addEventListener('click', () => {
      if (this.state === 'playing') {
        this.sound.playClick();
        this.pauseRun();
      }
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

    for (const btn of [this.dom.btnUpgEnergy, this.dom.btnUpgShield, this.dom.btnUpgSlowmo]) {
      btn.addEventListener('click', () => {
        const res = this.story.buyUpgrade(btn.dataset.upgrade);
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

    this.dom.vnText.addEventListener('click', () => {
      if (this.state === 'vn' && this.vnState.isTyping) {
        this.finishTypewriterImmediately();
      }
    });
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
    if (!this.isGrounded) this.playerVelY = FAST_FALL_VELOCITY;
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

  // ===================== СПАВНЕР =====================
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
    const nextCassette = this.story.getNextUncollectedCassette();
    const shouldSpawnCassette =
      Boolean(nextCassette) && !this.cassetteOnTrack && this.runDistance >= this.nextCassetteAt;

    const openLane = Math.floor(Math.random() * 3);
    const patternRoll = Math.random();

    if (patternRoll < 0.42) {
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
        }
      }
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

    if (Math.random() < 0.16) {
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

    this.updateBuffTimers(rawDt);
    if (this.invulnTimer > 0) this.invulnTimer = Math.max(0, this.invulnTimer - rawDt);

    this.runSpeed = Math.min(MAX_RUN_SPEED, this.runSpeed + SPEED_ACCEL_PER_SEC * worldDt);
    const energyMult = this.buffs.energy.active ? this.story.getUpgradeEffect('energy').speedMultiplier : 1;
    const effectiveSpeed = this.runSpeed * energyMult;

    const musicTempo = this.buffs.energy.active
      ? 1.38
      : this.buffs.slowmo.active
        ? 0.72
        : 1 + (this.runSpeed - BASE_RUN_SPEED) / 90;
    this.sound.setTempoMultiplier(musicTempo);

    const dz = effectiveSpeed * worldDt;
    this.runDistance += dz * 0.85;

    // Скролл текстуры асфальта и тротуара (реалистичное движение дороги)
    this.textures.asphalt.offset.y += dz * 0.1;
    this.textures.sidewalk.offset.y += dz * 0.13;

    const chProg = this.story.getChapterProgress();
    if (
      chProg.cassettesCollected >= chProg.cassettesTotal &&
      chProg.distance + this.runDistance >= chProg.targetDistance
    ) {
      this.finishRun(`ГЛАВА ${this.story.currentChapter} ПРОЙДЕНА!`);
      return;
    }

    const targetX = LANES[this.laneIndex];
    this.playerX += (targetX - this.playerX) * Math.min(1, LANE_SWITCH_SPEED * rawDt);

    if (!this.isGrounded) {
      this.playerVelY += GRAVITY * worldDt;
      this.playerY += this.playerVelY * worldDt;
      if (this.playerY <= 0) {
        this.playerY = 0;
        this.playerVelY = 0;
        this.isGrounded = true;
      }
    }

    if (this.slideTimer > 0) this.slideTimer = Math.max(0, this.slideTimer - worldDt);

    this.animateAltushka(effectiveSpeed);
    this.updatePursuer(rawDt);

    // Движение фонарей и зданий (пул)
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

      if (Math.abs(obs.z) < 5.5) {
        this.computeObstacleBox(obs, this.tempBox);
        if (this.playerBox.intersectsBox(this.tempBox)) {
          if (this.handleObstacleCollision(obs)) return;
        }
      }
    }

    const magnetActive = this.buffs.shield.active || this.buffs.energy.active;
    for (const item of this.itemPool) {
      if (!item.active) continue;
      item.z += dz;
      item.mesh.position.z = item.z;
      item.mesh.rotation.y += 3.2 * worldDt;
      item.mesh.position.y = item.baseY + Math.sin(this.animClock * 4.5 + item.z * 0.3) * 0.14;

      if (item.type === 'mediator' && magnetActive && item.z > -15 && item.z < 2.2) {
        item.mesh.position.x += (this.playerX - item.mesh.position.x) * Math.min(1, 12 * rawDt);
        item.mesh.position.y += (this.playerY + 1.0 - item.mesh.position.y) * Math.min(1, 12 * rawDt);
        item.z += (0 - item.z) * Math.min(1, 8 * rawDt);
        item.mesh.position.z = item.z;
      }

      if (item.z > DESPAWN_Z) {
        if (item.type === 'cassette') {
          this.cassetteOnTrack = false;
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
          if (this.collectItem(item)) return;
        }
      }
    }

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

    const targetFov = this.buffs.energy.active ? 72 : this.buffs.slowmo.active ? 54 : 60;
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
      4.2 + this.playerY * 0.3 + shakeY,
      7.6
    );
    this.camera.lookAt(this.playerX * 0.24, 1.35 + this.playerY * 0.2, -10);
    this.warmStreetLight.position.set(this.playerX + 3.2, 5.2, 2.5);
    this.rimLight.position.set(this.playerX - 2.6, 2.6, -3.5);

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
    if (dirty) this.updateBuffHud();
  }

  animateAltushka(speed) {
    const rig = this.altushka;
    rig.root.position.set(this.playerX, this.playerY, 0);

    // Динамическая тень при прыжке
    rig.shadowBlob.position.y = -this.playerY + 0.03;
    const shadowScale = Math.max(0.4, 1 - this.playerY * 0.16);
    rig.shadowBlob.scale.setScalar(shadowScale);

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
      // Легкое женственное покачивание бедер и юбки при беге
      rig.skirtPivot.rotation.z = swing * 0.08;
      rig.leftLeg.rotation.x = swing * 0.92;
      rig.rightLeg.rotation.x = -swing * 0.92;
      rig.leftArm.rotation.x = -swing * 0.82;
      rig.rightArm.rotation.x = swing * 0.82;
    }

    // Двойная физика пружинящих хвостиков
    const tailBounce = Math.sin(this.animClock * 11) * 0.16;
    const tailLag = Math.cos(this.animClock * 11) * 0.22;
    rig.leftTail.pivot.rotation.z = tailBounce;
    rig.rightTail.pivot.rotation.z = -tailBounce;
    rig.leftTail.midPivot.rotation.x = 0.2 + Math.abs(tailLag);
    rig.rightTail.midPivot.rotation.x = 0.2 + Math.abs(tailLag);

    if (rig.shieldAura.visible) {
      rig.shieldAura.rotation.y += 0.04;
      rig.shieldAura.rotation.x += 0.02;
    }
    if (rig.energyAura.visible) {
      rig.energyAura.rotation.z += 0.14;
    }
  }

  updatePursuer(rawDt) {
    if (this.pursuerTimer > 0) this.pursuerTimer = Math.max(0, this.pursuerTimer - rawDt);
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

    const dz = 7 * dt;
    this.textures.asphalt.offset.y += dz * 0.1;
    this.textures.sidewalk.offset.y += dz * 0.13;

    for (const lamp of this.streetLamps) {
      lamp.position.z += dz;
      if (lamp.position.z > 20) lamp.position.z -= 8 * 20;
    }
    for (const b of this.buildings) {
      b.group.position.z += dz;
      if (b.group.position.z > 22) b.group.position.z -= 16 * 10.5;
    }

    // Плавный кинематографичный облет камеры в Хабе
    const camAngle = Math.sin(this.animClock * 0.35) * 0.55;
    this.camera.position.set(Math.sin(camAngle) * 5.2, 3.4, Math.cos(camAngle) * 5.6);
    this.camera.lookAt(0, 1.25, -2.5);
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

    const prog = this.story.getChapterProgress();
    this.dom.hubChapterDesc.textContent =
      `Глава ${prog.chapterId}: «${prog.title}» · ${prog.distance}/${prog.targetDistance}м · Кассеты ${prog.cassettesCollected}/${prog.cassettesTotal}`;

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

    const gallery = this.story.getEndingsGallery();
    const unlockedCount = gallery.filter((e) => e.unlocked).length;
    this.dom.hubEndingsCount.textContent = `${unlockedCount}/${gallery.length}`;
  }

  // ===================== ВИЗУАЛЬНАЯ НОВЕЛЛА =====================
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

window.addEventListener('DOMContentLoaded', () => {
  new AltRunnerGame();
});
