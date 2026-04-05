import type {
  AppSettings,
  AudioTranscriptionResult,
  CheckInEvent,
  ConversationRequest,
  ConversationResponse,
  MemoryRecord,
  MikasaState,
  OnboardingPayload,
  UpdateSettingsPayload
} from "../../shared/types";
import { buildAvatarIntent } from "./avatar-service";
import { EmotionAnalyzer } from "./emotion-analyzer";
import { MemoryService } from "./memory-service";
import { OpenAIProvider } from "./providers/openai-provider";
import { SafetyService } from "./safety-service";
import { SchedulerService } from "./scheduler-service";
import { createDefaultSettings, createInitialState } from "./state";
import { JsonStore } from "./store";
import { generateId, nowIso } from "./utils";

interface PersistedState {
  settings: AppSettings;
  turns: MikasaState["turns"];
  memories: MemoryRecord[];
  checkIns: CheckInEvent[];
  onboardingComplete: boolean;
}

export class MikasaRuntime {
  private readonly store = new JsonStore<PersistedState>("mikasa-state.json", {
    settings: createDefaultSettings(),
    turns: [],
    memories: [],
    checkIns: [],
    onboardingComplete: false
  });

  private readonly emotionAnalyzer = new EmotionAnalyzer();
  private readonly provider = new OpenAIProvider();
  private readonly safety = new SafetyService();
  private readonly scheduler = new SchedulerService();

  async bootstrap(): Promise<MikasaState> {
    const state = await this.store.read();
    return createInitialState(state, this.scheduler.buildMoodSummary(state.turns));
  }

  async onboard(payload: OnboardingPayload): Promise<MikasaState> {
    const state = await this.store.read();
    state.settings.profile.displayName = payload.displayName || state.settings.profile.displayName;
    state.settings.profile.companionName =
      payload.companionName || state.settings.profile.companionName;
    state.settings.profile.personality = payload.personality;
    state.settings.privacy = payload.privacy;
    state.onboardingComplete = true;
    await this.store.write(state);
    return createInitialState(state, this.scheduler.buildMoodSummary(state.turns));
  }

  async updateSettings(payload: UpdateSettingsPayload): Promise<MikasaState> {
    const state = await this.store.read();
    state.settings = {
      ...state.settings,
      ...pickTopLevelSettings(payload),
      profile: {
        ...state.settings.profile,
        ...payload.profile
      },
      privacy: {
        ...state.settings.privacy,
        ...payload.privacy
      }
    };
    await this.store.write(state);
    return createInitialState(state, this.scheduler.buildMoodSummary(state.turns));
  }

  async transcribeAudio(audioBase64: string): Promise<AudioTranscriptionResult> {
    return this.provider.transcribeAudio(audioBase64);
  }

  async sendConversation(payload: ConversationRequest): Promise<ConversationResponse> {
    const state = await this.store.read();
    const emotion = this.emotionAnalyzer.analyze(payload.transcript, payload.vocalHints);
    const memoryService = new MemoryService(state.memories, state.settings.profile);
    const relevantMemories = memoryService.retrieveRelevant(payload.transcript, emotion);
    const moodSummary = this.scheduler.buildMoodSummary(state.turns);
    const systemPrompt = this.safety.buildSystemPrompt(
      state.settings.profile,
      state.settings.privacy,
      moodSummary
    );
    const assistantReply = await this.provider.generateCompanionReply({
      companionName: state.settings.profile.companionName,
      personality: state.settings.profile.personality,
      userName: state.settings.profile.displayName,
      transcript: payload.transcript,
      emotion,
      memories: relevantMemories,
      moodSummary,
      systemPrompt
    });
    const safeReply = this.safety.enforceSafeReply(assistantReply);
    const newMemories = memoryService.extractMemories(payload.transcript, safeReply, emotion);
    const turn = {
      id: generateId("turn"),
      startedAt: nowIso(),
      completedAt: nowIso(),
      sourceModality: payload.modality,
      userTranscript: payload.transcript,
      assistantReply: safeReply,
      emotion,
      linkedMemoryIds: relevantMemories.map((memory) => memory.id)
    };
    const allTurns = [...state.turns, turn];
    const checkIns = this.scheduler.refreshCheckIns(
      state.checkIns,
      newMemories,
      state.settings.privacy.checkIns
    );
    const nextState: PersistedState = {
      ...state,
      turns: allTurns,
      memories: memoryService.mergeMemories(newMemories),
      checkIns
    };
    await this.store.write(nextState);

    return {
      turn,
      avatar: buildAvatarIntent(emotion, safeReply),
      checkIns,
      moodSummary: this.scheduler.buildMoodSummary(allTurns),
      ttsText: safeReply
    };
  }

  async exportMemories(): Promise<string> {
    const state = await this.store.read();
    return JSON.stringify(
      {
        exportedAt: nowIso(),
        profile: state.settings.profile,
        memories: state.memories,
        turns: state.settings.privacy.transcriptRetention ? state.turns : []
      },
      null,
      2
    );
  }

  async clearMemories(): Promise<MikasaState> {
    const state = await this.store.read();
    const next: PersistedState = {
      ...state,
      turns: [],
      memories: [],
      checkIns: []
    };
    await this.store.write(next);
    return createInitialState(next, this.scheduler.buildMoodSummary(next.turns));
  }
}

function pickTopLevelSettings(payload: UpdateSettingsPayload) {
  return {
    ...(payload.ttsEnabled !== undefined ? { ttsEnabled: payload.ttsEnabled } : {}),
    ...(payload.handsFreeMode !== undefined
      ? { handsFreeMode: payload.handsFreeMode }
      : {}),
    ...(payload.cameraVisibleIndicator !== undefined
      ? { cameraVisibleIndicator: payload.cameraVisibleIndicator }
      : {})
  };
}
