/**
 * AudioService — Japanese pronunciation via the Web Speech API (SpeechSynthesis)
 * and game SFX generated with the Web Audio API (oscillators). No audio files
 * ship; recorded audio can replace `speakJa` later behind this same surface.
 */

/** Runtime audio preferences, synced from the store (see AudioSync). */
const audioPrefs = { sfxEnabled: true, speechRate: 0.9 };

export function configureAudio(prefs: Partial<typeof audioPrefs>): void {
  Object.assign(audioPrefs, prefs);
}

let audioCtx: AudioContext | null = null;
let masterOut: DynamicsCompressorNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}

/** A gentle compressor on the master bus glues layered notes together and
 *  stops stacked oscillators from ever clipping. */
function getOut(ac: AudioContext): AudioNode {
  if (!masterOut) {
    masterOut = ac.createDynamicsCompressor();
    masterOut.threshold.value = -18;
    masterOut.ratio.value = 6;
    masterOut.connect(ac.destination);
  }
  return masterOut;
}

interface Note {
  f: number; // frequency (Hz)
  at?: number; // start offset (s)
  dur?: number; // decay length (s)
  type?: OscillatorType;
  gain?: number;
  slideTo?: number; // pitch-bend target — bends make sounds feel alive
  cutoff?: number; // lowpass cutoff — low values = soft/muted, high = bright
  shimmer?: number; // 0..1 — adds a fast-decaying octave partial (bell-like)
}

/** One layered, filtered, enveloped note — the building block of every sound. */
function playNote(n: Note): void {
  if (!audioPrefs.sfxEnabled) return;
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  const out = getOut(ac);
  const { f, at = 0, dur = 0.15, type = "sine", gain = 0.16, slideTo, cutoff = 6000, shimmer = 0 } = n;
  const t = ac.currentTime + at;

  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = cutoff;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  filter.connect(g);
  g.connect(out);

  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(f, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur * 0.7);
  osc.connect(filter);
  osc.start(t);
  osc.stop(t + dur + 0.05);

  if (shimmer > 0) {
    // a quiet, quickly-fading octave partial on top — the "ding" sparkle
    const g2 = ac.createGain();
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(gain * shimmer, t + 0.008);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.6);
    g2.connect(out);
    const osc2 = ac.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(f * 2, t);
    osc2.connect(g2);
    osc2.start(t);
    osc2.stop(t + dur);
  }
}

export const sfx = {
  /** Bright, steady "du-DING" — the same satisfying sound on every correct. */
  correct: () => {
    playNote({ f: 523.25, dur: 0.09, gain: 0.13 }); // C5
    playNote({ f: 783.99, at: 0.07, dur: 0.28, gain: 0.17, shimmer: 0.5 }); // G5
  },
  /** Soft, muted "bonk" — clearly wrong, never punishing. */
  wrong: () => {
    playNote({ f: 220, slideTo: 150, dur: 0.22, type: "triangle", gain: 0.15, cutoff: 500 });
    playNote({ f: 110, slideTo: 82, dur: 0.26, gain: 0.12, cutoff: 300 });
  },
  /** Reward jingle for crowns, records, and purchases. */
  levelUp: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      playNote({ f, at: i * 0.09, dur: 0.2, type: "triangle", gain: 0.12, cutoff: 4000, shimmer: i === 3 ? 0.6 : 0 }),
    );
  },
  /** Subtle UI tick. */
  tap: () => playNote({ f: 440, dur: 0.05, gain: 0.06 }),
  /** Bubbly pop — tiles, cards, and "got it" moments. */
  pop: () => playNote({ f: 330, slideTo: 660, dur: 0.08, gain: 0.11 }),
  /** Two-note coin sparkle for gems, coins, and quest claims. */
  coin: () => {
    playNote({ f: 987.77, dur: 0.07, gain: 0.11 });
    playNote({ f: 1318.51, at: 0.06, dur: 0.24, gain: 0.14, shimmer: 0.6 });
  },
  /** Quiet "can't do that" — softer than wrong, for denied actions. */
  deny: () => playNote({ f: 196, dur: 0.11, type: "triangle", gain: 0.09, cutoff: 600 }),
  /** End-of-session fanfare: arpeggio into a shimmering final chord. */
  complete: () => {
    [523.25, 659.25, 783.99].forEach((f, i) =>
      playNote({ f, at: i * 0.1, dur: 0.18, type: "triangle", gain: 0.11, cutoff: 4500 }),
    );
    // final chord with sparkle
    [1046.5, 1318.51, 1567.98].forEach((f, i) =>
      playNote({ f, at: 0.32, dur: 0.5, gain: 0.09 + (i === 0 ? 0.04 : 0), shimmer: 0.5 }),
    );
  },
};

/** Whether the Speech Synthesis API even exists. Note: this being true does NOT
 *  guarantee any voice is installed — use `ensureSpeech()` to confirm sound. */
export function ttsAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

function currentVoices(): SpeechSynthesisVoice[] {
  return ttsAvailable() ? window.speechSynthesis.getVoices() : [];
}

let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/** Resolve once the browser's voice list is populated. `getVoices()` is often
 *  empty on the first call (voices load asynchronously in Chrome/Edge), so we
 *  wait for `voiceschanged` — with a timeout, since some engines never fire it. */
function ensureVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!ttsAvailable()) return Promise.resolve([]);
  const immediate = currentVoices();
  if (immediate.length) return Promise.resolve(immediate);
  if (voicesPromise) return voicesPromise;

  const synth = window.speechSynthesis;
  voicesPromise = new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve(currentVoices());
    };
    if (typeof synth.addEventListener === "function") {
      const handler = () => {
        synth.removeEventListener("voiceschanged", handler);
        finish();
      };
      synth.addEventListener("voiceschanged", handler);
    }
    window.setTimeout(finish, 1500);
  });
  return voicesPromise;
}

function pickJaVoice(): SpeechSynthesisVoice | null {
  const vs = currentVoices();
  return (
    vs.find((v) => (v.lang || "").toLowerCase().replace("_", "-").startsWith("ja")) ??
    vs.find((v) => /japan|日本|にほん/i.test(v.name)) ??
    null
  );
}

export type SpeechStatus = "ready" | "unavailable";

/**
 * Resolve whether *Japanese* speech will actually work. The API existing isn't
 * enough — nor is having some voice: a browser with only, say, English voices
 * either stays silent or mangles Japanese text. So we require an installed
 * ja voice, letting the UI show an honest fallback instead of silence.
 */
export function ensureSpeech(): Promise<SpeechStatus> {
  if (!ttsAvailable()) return Promise.resolve("unavailable");
  return ensureVoices().then(() => (pickJaVoice() ? "ready" : "unavailable"));
}

/** Speak Japanese text with the best available ja-JP voice. Waits for voices on
 *  first use, prefers a Japanese voice (falling back to the lang hint), and
 *  nudges a spontaneously-paused synth (a known Chrome quirk). */
export function speakJa(text: string, rate = audioPrefs.speechRate): void {
  if (!ttsAvailable()) return;
  const synth = window.speechSynthesis;

  const doSpeak = () => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ja-JP";
    utter.rate = rate;
    const voice = pickJaVoice();
    if (voice) utter.voice = voice;
    // Only cancel when something is actually queued — cancelling then speaking
    // in the same tick can drop the new utterance on some Chrome builds.
    if (synth.speaking || synth.pending) {
      try {
        synth.cancel();
      } catch {
        /* ignore */
      }
    }
    synth.speak(utter);
    try {
      synth.resume();
    } catch {
      /* ignore */
    }
  };

  if (currentVoices().length === 0) void ensureVoices().then(doSpeak);
  else doSpeak();
}
