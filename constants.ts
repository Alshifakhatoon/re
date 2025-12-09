export const APP_NAME = "Gemini Suite";

// Model Definitions
export const MODEL_TEXT = "gemini-2.5-flash";
export const MODEL_IMAGE = "gemini-2.5-flash-image";
export const MODEL_LIVE = "gemini-2.5-flash-native-audio-preview-09-2025";

// Voice Options for Live API
export const VOICE_OPTIONS = [
  { id: 'Zephyr', name: 'Zephyr (Friendly)' },
  { id: 'Puck', name: 'Puck (Playful)' },
  { id: 'Fenrir', name: 'Fenrir (Deep)' },
  { id: 'Kore', name: 'Kore (Calm)' },
  { id: 'Charon', name: 'Charon (Authoritative)' },
];

export const SAMPLE_PROMPTS = [
  "Explain quantum computing in simple terms",
  "Write a haiku about a robot who loves gardening",
  "Debug this Python code...",
  "Plan a 3-day trip to Tokyo",
];

export const IMAGE_PROMPTS = [
  "A futuristic city with flying cars, neon lights, cyberpunk style",
  "A cute robot painting a canvas in a sunlit studio, oil painting style",
  "An astronaut riding a horse on Mars, realistic 4k",
];
