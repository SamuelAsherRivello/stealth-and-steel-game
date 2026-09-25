# Repository Agent Instructions

## UI Adjustments

- Prefer hardcoded UI values for sizing and spacing. Use CSS `calc()` only when the user explicitly requests it.

## Audio for spawned game windows

- The normal game URL intentionally defaults to the player's stored Music and
  SFX levels when no mute query parameters are present.
- Every AI-spawned, AI-tested, preview, or diagnostic game window MUST include
  both query parameters in its URL:
  `?muteMusic=true&muteSFX=true`
- Do not omit either parameter for an AI-created window. If the URL already has
  query parameters, append `&muteMusic=true&muteSFX=true`.
- A human-facing run may omit the parameters and use the normal audio
  experience.
