import type {
  AudioTranscriptionResult,
  ConversationRequest,
  ConversationResponse,
  MikasaState,
  OnboardingPayload,
  UpdateSettingsPayload
} from "./types";

export const ipcChannels = {
  bootstrap: "mikasa/bootstrap",
  onboard: "mikasa/onboard",
  updateSettings: "mikasa/update-settings",
  sendConversation: "mikasa/send-conversation",
  transcribeAudio: "mikasa/transcribe-audio",
  exportMemories: "mikasa/export-memories",
  clearMemories: "mikasa/clear-memories"
} as const;

export interface MikasaApi {
  bootstrap: () => Promise<MikasaState>;
  onboard: (payload: OnboardingPayload) => Promise<MikasaState>;
  updateSettings: (payload: UpdateSettingsPayload) => Promise<MikasaState>;
  sendConversation: (payload: ConversationRequest) => Promise<ConversationResponse>;
  transcribeAudio: (audioBase64: string) => Promise<AudioTranscriptionResult>;
  exportMemories: () => Promise<string>;
  clearMemories: () => Promise<MikasaState>;
}
