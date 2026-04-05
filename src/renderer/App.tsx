import { useEffect, useState } from "react";
import type {
  ConversationResponse,
  MikasaState,
  OnboardingPayload,
  UpdateSettingsPayload
} from "../shared/types";
import { AvatarStage } from "./components/AvatarStage";
import { ConversationPanel } from "./components/ConversationPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { SettingsPanel } from "./components/SettingsPanel";
import { useVoiceRecorder } from "./hooks/useVoiceRecorder";

const fallbackState: MikasaState = {
  onboardingComplete: false,
  turns: [],
  memories: [],
  checkIns: [],
  moodSummary: "Loading your companion state...",
  avatar: {
    emotion: "idle",
    intensity: 0.35,
    reason: "Waiting for the app to initialize."
  },
  settings: {
    profile: {
      displayName: "You",
      companionName: "Aria",
      personality: "sweet",
      likes: [],
      dislikes: [],
      routines: [],
      goals: [],
      importantPeople: [],
      boundaries: [],
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
  }
};

export function App() {
  const [state, setState] = useState<MikasaState>(fallbackState);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const voiceRecorder = useVoiceRecorder();

  useEffect(() => {
    void window.mikasa
      .bootstrap()
      .then(setState)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setBusy(false));
  }, []);

  async function handleOnboard(payload: OnboardingPayload) {
    setBusy(true);
    try {
      const next = await window.mikasa.onboard(payload);
      setState(next);
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdateSettings(payload: UpdateSettingsPayload) {
    try {
      const next = await window.mikasa.updateSettings(payload);
      setState(next);
    } catch (reason) {
      setError(getErrorMessage(reason));
    }
  }

  async function handleSendText() {
    if (!draft.trim()) {
      return;
    }
    setSending(true);
    setError(null);
    try {
      const response = await window.mikasa.sendConversation({
        transcript: draft.trim(),
        modality: "text"
      });
      applyConversationResponse(response);
      setDraft("");
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setSending(false);
    }
  }

  async function handleVoiceTurn() {
    setError(null);
    try {
      const audio = await voiceRecorder.capture();
      const transcription = await window.mikasa.transcribeAudio(audio);
      if (!transcription.text.trim()) {
        return;
      }
      const response = await window.mikasa.sendConversation({
        transcript: transcription.text,
        modality: "voice",
        vocalHints: voiceRecorder.vocalHints
      });
      applyConversationResponse(response);
    } catch (reason) {
      setError(getErrorMessage(reason));
    }
  }

  async function handleExportMemories() {
    const exported = await window.mikasa.exportMemories();
    await navigator.clipboard.writeText(exported).catch(() => undefined);
    setError("Memory export copied to clipboard.");
  }

  async function handleClearMemories() {
    const next = await window.mikasa.clearMemories();
    setState(next);
  }

  function applyConversationResponse(response: ConversationResponse) {
    setState((current) => ({
      ...current,
      turns: [...current.turns, response.turn],
      checkIns: response.checkIns,
      moodSummary: response.moodSummary,
      avatar: response.avatar
    }));
    if (state.settings.ttsEnabled) {
      speakText(response.ttsText);
    }
  }

  if (busy) {
    return <div className="loading-screen">Waking Mikasa up...</div>;
  }

  if (!state.onboardingComplete) {
    return <OnboardingFlow onSubmit={handleOnboard} />;
  }

  return (
    <div className="app-shell">
      <aside className="left-panel">
        <div className="brand">
          <span className="brand-mark">M</span>
          <div>
            <h1>Mikasa</h1>
            <p>{state.settings.profile.companionName}, always close by</p>
          </div>
        </div>
        <AvatarStage avatar={state.avatar} companionName={state.settings.profile.companionName} />
        <div className="mood-card">
          <span className="eyebrow">Weekly read</span>
          <p>{state.moodSummary}</p>
        </div>
        <SettingsPanel
          settings={state.settings}
          checkIns={state.checkIns}
          onUpdate={handleUpdateSettings}
          onExportMemories={handleExportMemories}
          onClearMemories={handleClearMemories}
        />
      </aside>
      <main className="main-panel">
        <ConversationPanel
          companionName={state.settings.profile.companionName}
          turns={state.turns}
          draft={draft}
          sending={sending}
          recording={voiceRecorder.recording}
          onDraftChange={setDraft}
          onSend={handleSendText}
          onVoiceTurn={handleVoiceTurn}
        />
        <HistoryPanel memories={state.memories} checkIns={state.checkIns} />
        {error ? <div className="toast">{error}</div> : null}
      </main>
    </div>
  );
}

function getErrorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : "Something went wrong.";
}

function speakText(text: string) {
  if (!("speechSynthesis" in window)) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.98;
  utterance.pitch = 1.08;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
