"use client";

import { useEffect } from "react";
import { configureAudio } from "@/lib/audio";
import { useProgress } from "@/stores/progress";

/** Keeps the audio service in sync with the user's saved sound preferences.
 *  Renders nothing; mounted once at the app root. */
export function AudioSync() {
  const sfxEnabled = useProgress((s) => s.sfxEnabled);
  const speechRate = useProgress((s) => s.speechRate);
  useEffect(() => {
    configureAudio({ sfxEnabled, speechRate });
  }, [sfxEnabled, speechRate]);
  return null;
}
