import { useState } from "react";
import type { OnboardingPayload, PersonalityStyle, PrivacySettings } from "../../shared/types";

interface OnboardingFlowProps {
  onSubmit: (payload: OnboardingPayload) => Promise<void>;
}

const defaultPrivacy: PrivacySettings = {
  microphone: true,
  camera: false,
  memoryStorage: true,
  checkIns: true,
  transcriptRetention: true
};

export function OnboardingFlow({ onSubmit }: OnboardingFlowProps) {
  const [payload, setPayload] = useState<OnboardingPayload>({
    displayName: "",
    companionName: "Aria",
    personality: "sweet",
    privacy: defaultPrivacy
  });

  return (
    <div className="onboarding-shell">
      <div className="onboarding-card">
        <span className="eyebrow">Desktop AI Companion</span>
        <h1>Mikasa</h1>
        <p className="lead">
          Build your private space with {payload.companionName}: warm voice, caring memory,
          gentle check-ins, and a full-screen presence that feels close without crossing your
          boundaries.
        </p>
        <label>
          Your name
          <input
            value={payload.displayName}
            onChange={(event) => setPayload({ ...payload, displayName: event.target.value })}
            placeholder="How should she call you?"
          />
        </label>
        <label>
          Companion name
          <input
            value={payload.companionName}
            onChange={(event) => setPayload({ ...payload, companionName: event.target.value })}
          />
        </label>
        <label>
          Personality style
          <select
            value={payload.personality}
            onChange={(event) =>
              setPayload({
                ...payload,
                personality: event.target.value as PersonalityStyle
              })
            }
          >
            <option value="sweet">Sweet</option>
            <option value="witty">Witty</option>
            <option value="calm">Calm</option>
            <option value="adventurous">Adventurous</option>
          </select>
        </label>
        <div className="consent-grid">
          {Object.entries(payload.privacy).map(([key, value]) => (
            <label key={key} className="toggle-row">
              <span>{formatKey(key)}</span>
              <input
                type="checkbox"
                checked={value}
                onChange={(event) =>
                  setPayload({
                    ...payload,
                    privacy: {
                      ...payload.privacy,
                      [key]: event.target.checked
                    }
                  })
                }
              />
            </label>
          ))}
        </div>
        <button className="primary-button" onClick={() => void onSubmit(payload)}>
          Start with {payload.companionName}
        </button>
      </div>
    </div>
  );
}

function formatKey(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}
