/**
 * AudioService — Japanese pronunciation via the Web Speech API (SpeechSynthesis)
 * and game SFX generated with the Web Audio API (oscillators). No audio files
 * ship; recorded audio can replace `speakJa` later behind this same surface.
 */

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

export function ttsAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let jaVoice: SpeechSynthesisVoice | null = null;
let voicesBound = false;

/** Resolve the best ja-JP voice, caching it and refreshing when the voice list
 *  loads (getVoices() is frequently empty on the first call in Chrome). */
function resolveJaVoice(): SpeechSynthesisVoice | null {
  if (!ttsAvailable()) return null;
  const synth = window.speechSynthesis;
  const pick = () =>
    synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith("ja")) ?? null;
  jaVoice = pick();
  if (!voicesBound && typeof synth.addEventListener === "function") {
    voicesBound = true;
    synth.addEventListener("voiceschanged", () => {
      jaVoice = pick();
    });
  }
  return jaVoice;
}

/** Speak Japanese text with the best available ja-JP voice. */
export function speakJa(text: string, rate = 0.9): void {
  if (!ttsAvailable()) return;
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ja-JP";
  utter.rate = rate;
  const ja = jaVoice ?? resolveJaVoice();
  if (ja) utter.voice = ja;
  synth.cancel();
  synth.speak(utter);
}
