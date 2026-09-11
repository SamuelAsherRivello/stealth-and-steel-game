import { RUNTIME_AUDIO_SETTING_KEYS } from "./runtime-settings-store.js";

export function applyUrlAudioMuteParameters({ search = "", store } = {}) {
  const parameters = new URLSearchParams(search);
  const musicMuted = parameters.get("muteMusic") === "true";
  const sfxMuted = parameters.get("muteSFX") === "true";

  if (musicMuted) store?.set(RUNTIME_AUDIO_SETTING_KEYS.music, 0);
  if (sfxMuted) store?.set(RUNTIME_AUDIO_SETTING_KEYS.sfx, 0);

  return { musicMuted, sfxMuted };
}

export function normalizeVolume(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }
  return Math.min(100, Math.max(0, numericValue)) / 100;
}

export function applyCategoryVolume(baseVolume = 1, categoryVolume = 100) {
  const normalizedBase = Number.isFinite(Number(baseVolume))
    ? Math.min(1, Math.max(0, Number(baseVolume)))
    : 1;
  return normalizedBase * normalizeVolume(categoryVolume);
}
