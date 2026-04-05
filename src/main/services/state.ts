import type { AppSettings, MikasaState } from "../../shared/types";

export function createDefaultSettings(): AppSettings {
  return {
    profile: {
      displayName: "You",
      companionName: process.env.MIKASA_COMPANION_NAME || "Aria",
      personality: "sweet",
      likes: [],
      dislikes: [],
      routines: [],
      goals: [],
      importantPeople: [],
      boundaries: ["No manipulative behavior", "No explicit sexual content"],
      notes: []
    },
    privacy: {
      microphone: true,
      camera: false,
      memoryStorage: true,
      checkIns: true,
      transcriptRetention: true
    },
    ttsEnabled: true,
    handsFreeMode: false,
    cameraVisibleIndicator: true
  };
}

export function createInitialState(
  persisted: {
    settings: AppSettings;
    turns: MikasaState["turns"];
    memories: MikasaState["memories"];
    checkIns: MikasaState["checkIns"];
    onboardingComplete: boolean;
  },
  moodSummary: string
): MikasaState {
  return {
    settings: persisted.settings,
    turns: persisted.turns,
    memories: persisted.memories,
    checkIns: persisted.checkIns,
    onboardingComplete: persisted.onboardingComplete,
    moodSummary,
    avatar: {
      emotion: "idle",
      intensity: 0.35,
      reason: "Waiting for the next conversation."
    }
  };
}
