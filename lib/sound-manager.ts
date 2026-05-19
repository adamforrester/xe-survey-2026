"use client";

// Sound manager — tries Howler-loaded MP3s in /sounds/ first, falls back to
// Web Audio synthesis if a file is missing. Persists on/off pref in localStorage.

import { Howl } from "howler";

type SoundKey =
  | "key-1"
  | "key-2"
  | "key-3"
  | "key-enter"
  | "beep-section"
  | "beep-error"
  | "boot-chime"
  | "modem-sync";

const FILES: Record<SoundKey, string> = {
  "key-1": "/sounds/key-1.mp3",
  "key-2": "/sounds/key-2.mp3",
  "key-3": "/sounds/key-3.mp3",
  "key-enter": "/sounds/key-enter.mp3",
  "beep-section": "/sounds/beep-section.mp3",
  "beep-error": "/sounds/beep-error.mp3",
  "boot-chime": "/sounds/boot-chime.mp3",
  "modem-sync": "/sounds/modem-sync.mp3",
};

const VOLUMES: Record<SoundKey, number> = {
  "key-1": 0.18,
  "key-2": 0.18,
  "key-3": 0.18,
  "key-enter": 0.25,
  "beep-section": 0.3,
  "beep-error": 0.4,
  "boot-chime": 0.45,
  "modem-sync": 0.5,
};

const SOUND_KEY_LS = "xe.sound";

class SoundManager {
  private cache = new Map<SoundKey, Howl>();
  private fileMissing = new Set<SoundKey>();
  private audioContext: AudioContext | null = null;
  private _enabled = true;
  private _ready = false;

  init() {
    if (this._ready) return;
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(SOUND_KEY_LS);
    if (stored === "off") this._enabled = false;
    this._ready = true;
  }

  get enabled() {
    return this._enabled;
  }

  setEnabled(on: boolean) {
    this._enabled = on;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SOUND_KEY_LS, on ? "on" : "off");
    }
  }

  toggle() {
    this.setEnabled(!this._enabled);
    return this._enabled;
  }

  play(key: SoundKey) {
    if (!this._enabled || typeof window === "undefined") return;
    if (this.fileMissing.has(key)) {
      this.synthesize(key);
      return;
    }
    let howl = this.cache.get(key);
    if (!howl) {
      howl = new Howl({
        src: [FILES[key]],
        volume: VOLUMES[key],
        preload: true,
        onloaderror: () => {
          this.fileMissing.add(key);
        },
      });
      this.cache.set(key, howl);
    }
    try {
      howl.play();
    } catch {
      this.fileMissing.add(key);
      this.synthesize(key);
    }
  }

  playKeystroke() {
    const r = Math.random();
    if (r < 0.34) this.play("key-1");
    else if (r < 0.67) this.play("key-2");
    else this.play("key-3");
  }

  private getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioContext) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      this.audioContext = new Ctor();
    }
    return this.audioContext;
  }

  private synthesize(key: SoundKey) {
    const ctx = this.getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    switch (key) {
      case "key-1":
      case "key-2":
      case "key-3": {
        // Filtered noise burst — ~40ms keystroke
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.4));
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = key === "key-1" ? 1800 : key === "key-2" ? 1500 : 2100;
        src.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        src.start(now);
        src.stop(now + 0.05);
        break;
      }
      case "key-enter": {
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.5));
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 900;
        src.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        src.start(now);
        src.stop(now + 0.1);
        break;
      }
      case "beep-section": {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 520;
        osc.connect(gain);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case "beep-error": {
        const osc1 = ctx.createOscillator();
        osc1.type = "square";
        osc1.frequency.value = 760;
        osc1.connect(gain);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.setValueAtTime(0.12, now + 0.08);
        gain.gain.setValueAtTime(0, now + 0.09);
        osc1.start(now);
        osc1.stop(now + 0.09);

        const gain2 = ctx.createGain();
        gain2.connect(ctx.destination);
        const osc2 = ctx.createOscillator();
        osc2.type = "square";
        osc2.frequency.value = 380;
        osc2.connect(gain2);
        gain2.gain.setValueAtTime(0.12, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.22);
        break;
      }
      case "boot-chime": {
        const notes = [220, 330, 440, 660];
        notes.forEach((freq, i) => {
          const g = ctx.createGain();
          g.connect(ctx.destination);
          const osc = ctx.createOscillator();
          osc.type = "triangle";
          osc.frequency.value = freq;
          osc.connect(g);
          const start = now + i * 0.18;
          g.gain.setValueAtTime(0, start);
          g.gain.linearRampToValueAtTime(0.14, start + 0.04);
          g.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
          osc.start(start);
          osc.stop(start + 0.6);
        });
        break;
      }
      case "modem-sync": {
        // Series of squelchy sweeps, then a settling tone
        const sweeps: [number, number, number][] = [
          [400, 1800, 0.4],
          [1200, 600, 0.5],
          [800, 1400, 0.5],
        ];
        let t = now;
        sweeps.forEach(([from, to, dur]) => {
          const g = ctx.createGain();
          g.connect(ctx.destination);
          const osc = ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(from, t);
          osc.frequency.exponentialRampToValueAtTime(to, t + dur);
          osc.connect(g);
          g.gain.setValueAtTime(0.08, t);
          g.gain.setValueAtTime(0.08, t + dur - 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          osc.start(t);
          osc.stop(t + dur);
          t += dur * 0.85;
        });
        // Final settling tone
        const g = ctx.createGain();
        g.connect(ctx.destination);
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 880;
        osc.connect(g);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.16, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
        osc.start(t);
        osc.stop(t + 0.7);
        break;
      }
    }
  }
}

export const sound = new SoundManager();
