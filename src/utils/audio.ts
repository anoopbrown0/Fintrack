/**
 * Precision Mechanical Escapement & Haptic Synthesis Engine
 * Synthesizes realistic mechanical watchmaker ratchet clicks, metallic detent snaps,
 * and tactile keypad clicks using Web Audio API (zero external assets).
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Realistic mechanical watch ratchet / escapement click
 * Uses filtered impulse noise + micro metallic resonant tail
 */
export function playMechanicalTick(direction: 'up' | 'down' | 'neutral' = 'neutral', enabled = true): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const centerFreq = direction === 'up' ? 4200 : direction === 'down' ? 3600 : 3900;
    // Micro jitter so repeated ticks don't sound synthesized or robotic
    const jitter = (Math.random() - 0.5) * 200;

    // 1. Transient burst: filtered noise
    const bufferSize = Math.floor(ctx.sampleRate * 0.015); // ~15ms burst
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Decaying white noise
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(centerFreq + jitter, now);
    filter.Q.setValueAtTime(6.0, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);

    // 2. Resonant metallic body ping
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400 + (Math.random() - 0.5) * 100, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.018);

    oscGain.gain.setValueAtTime(0.04, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  } catch {
    // Ignore audio errors gracefully
  }
}

/**
 * Mechanical keyboard/keypad switch click
 */
export function playKeypadClick(enabled = true): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Crisp high snap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2600, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.012);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.015);
  } catch {
    // Ignore
  }
}

/**
 * Luxury acoustic dialer tone (harmonic dual tone + subtle mechanical transient)
 */
export function playDialTone(digit: string, enabled = true): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const DTMF_MAP: Record<string, [number, number]> = {
      '1': [697, 1209],
      '2': [697, 1336],
      '3': [697, 1477],
      '4': [770, 1209],
      '5': [770, 1336],
      '6': [770, 1477],
      '7': [852, 1209],
      '8': [852, 1336],
      '9': [852, 1477],
      '0': [941, 1336],
    };

    const freqs = DTMF_MAP[digit] || [800, 1200];
    const now = ctx.currentTime;

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    });

    // Also trigger tactile mechanical click
    playKeypadClick(enabled);
  } catch {
    // Ignore
  }
}


/**
 * Standard tick sound alias
 */
export function playTickSound(enabled = true): void {
  playMechanicalTick('neutral', enabled);
}

/**
 * Subtle warm champagne commit chime when an expense is logged
 */
export function playCommitSound(enabled = true): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [659.25, 880.0, 1046.5]; // E5, A5, C6 (Luxury triad)

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const startTime = now + idx * 0.035;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.045, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.38);
    });
  } catch {
    // Ignore audio errors gracefully
  }
}

export function triggerHaptic(pattern: number | number[] = 10, enabled = true): void {
  if (!enabled) return;
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore haptic failures
  }
}
