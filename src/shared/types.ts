export type SourceModality = "voice" | "text" | "system";

export type MemoryRecordType =
  | "fact"
  | "episode"
  | "goal"
  | "mood_pattern"
  | "reminder_seed";

export type AvatarEmotion =
  | "idle"
  | "listening"
  | "speaking"
  | "smiling"
  | "concerned"
  | "laughing"
  | "blushing";

export type PersonalityStyle = "sweet" | "witty" | "calm" | "adventurous";

export interface EmotionSignal {
  primaryMood: "positive" | "neutral" | "sad" | "stressed" | "tired" | "excited";
  sentimentScore: number;
  vocalHints?: string[];
  facialHints?: string[];
  confidence: number;
  summary: string;
}

export interface ConversationTurn {
  id: string;
  startedAt: string;
  completedAt: string;
  sourceModality: SourceModality;
  userTranscript: string;
  assistantReply: string;
  emotion: EmotionSignal;
  linkedMemoryIds: string[];
}

export interface UserProfile {
  displayName: string;
  companionName: string;
  personality: PersonalityStyle;
  likes: string[];
  dislikes: string[];
  routines: string[];
  goals: string[];
  importantPeople: string[];
  boundaries: string[];
  notes: string[];
}

export interface MemoryRecord {
  id: string;
  type: MemoryRecordType;
  content: string;
  summary: string;
  tags: string[];
  salience: number;
  confidence: number;
  createdAt: string;
  lastUsedAt: string;
}

export interface CheckInEvent {
  id: string;
  scheduledFor: string;
  reason: string;
  relatedMemoryId?: string;
  suggestedPrompt: string;
  enabled: boolean;
  completed: boolean;
}

export interface PrivacySettings {
  microphone: boolean;
  camera: boolean;
  memoryStorage: boolean;
  checkIns: boolean;
  transcriptRetention: boolean;
}

export interface AppSettings {
  profile: UserProfile;
  privacy: PrivacySettings;
  ttsEnabled: boolean;
  handsFreeMode: boolean;
  cameraVisibleIndicator: boolean;
}

export interface AvatarIntent {
  emotion: AvatarEmotion;
  intensity: number;
  reason: string;
}

export interface MikasaState {
  settings: AppSettings;
  turns: ConversationTurn[];
  memories: MemoryRecord[];
  checkIns: CheckInEvent[];
  avatar: AvatarIntent;
  onboardingComplete: boolean;
  moodSummary: string;
}

export interface ConversationRequest {
  transcript: string;
  modality: SourceModality;
  vocalHints?: string[];
}

export interface ConversationResponse {
  turn: ConversationTurn;
  avatar: AvatarIntent;
  checkIns: CheckInEvent[];
  moodSummary: string;
  ttsText: string;
}

export interface OnboardingPayload {
  displayName: string;
  companionName: string;
  personality: PersonalityStyle;
  privacy: PrivacySettings;
}

export interface UpdateSettingsPayload {
  profile?: Partial<UserProfile>;
  privacy?: Partial<PrivacySettings>;
  ttsEnabled?: boolean;
  handsFreeMode?: boolean;
  cameraVisibleIndicator?: boolean;
}

export interface AudioTranscriptionResult {
  text: string;
  durationMs?: number;
}
