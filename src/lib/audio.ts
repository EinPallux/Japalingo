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

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}

/** Play a short sequence of tones with a gentle envelope. */
function tones(freqs: number[], type: OscillatorType, step = 0.09, dur = 0.14) {
  if (!audioPrefs.sfxEnabled) return;
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  const now = ac.currentTime;
  freqs.forEach((f, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const start = now + i * step;
    osc.type = type;
    osc.frequency.setValueAtTime(f, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  });
}

export const sfx = {
  correct: () => tones([660, 880], "sine"),
  wrong: () => tones([200, 150], "square", 0.12, 0.2),
  levelUp: () => tones([523, 659, 784, 1047], "triangle", 0.1, 0.16),
  tap: () => tones([440], "sine", 0.05, 0.06),
  complete: () => tones([523, 659, 784, 1047, 1319], "triangle", 0.11, 0.18),
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
