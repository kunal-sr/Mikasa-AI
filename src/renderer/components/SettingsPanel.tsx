import type { AppSettings, CheckInEvent, UpdateSettingsPayload } from "../../shared/types";

interface SettingsPanelProps {
  settings: AppSettings;
  checkIns: CheckInEvent[];
  onUpdate: (payload: UpdateSettingsPayload) => Promise<void>;
  onExportMemories: () => Promise<void>;
  onClearMemories: () => Promise<void>;
}

export function SettingsPanel({
  settings,
  checkIns,
  onUpdate,
  onExportMemories,
  onClearMemories
}: SettingsPanelProps) {
  return (
    <section className="settings-panel">
      <div className="panel-header compact">
        <div>
          <span className="eyebrow">Boundaries & controls</span>
          <h3>Settings</h3>
        </div>
      </div>
      <div className="settings-group">
        <label className="toggle-row">
          <span>Text-to-speech</span>
          <input
            type="checkbox"
            checked={settings.ttsEnabled}
            onChange={(event) => void onUpdate({ ttsEnabled: event.target.checked })}
          />
        </label>
        <label className="toggle-row">
          <span>Hands-free mode</span>
          <input
            type="checkbox"
            checked={settings.handsFreeMode}
            onChange={(event) => void onUpdate({ handsFreeMode: event.target.checked })}
          />
        </label>
        <label className="toggle-row">
          <span>Camera consent</span>
          <input
            type="checkbox"
            checked={settings.privacy.camera}
            onChange={(event) =>
              void onUpdate({ privacy: { camera: event.target.checked } })
            }
          />
        </label>
        <label className="toggle-row">
          <span>Care check-ins</span>
          <input
            type="checkbox"
            checked={settings.privacy.checkIns}
            onChange={(event) =>
              void onUpdate({ privacy: { checkIns: event.target.checked } })
            }
          />
        </label>
      </div>
      <div className="mini-card">
        <span className="eyebrow">Personality</span>
        <select
          value={settings.profile.personality}
          onChange={(event) =>
            void onUpdate({
              profile: {
                personality: event.target.value as AppSettings["profile"]["personality"]
              }
            })
          }
        >
          <option value="sweet">Sweet</option>
          <option value="witty">Witty</option>
          <option value="calm">Calm</option>
          <option value="adventurous">Adventurous</option>
        </select>
      </div>
      <div className="mini-card">
        <span className="eyebrow">Status</span>
        <p>{checkIns.filter((item) => item.enabled).length} active check-ins waiting.</p>
      </div>
      <div className="button-row">
        <button className="secondary-button" onClick={() => void onExportMemories()}>
          Export memory JSON
        </button>
        <button className="danger-button" onClick={() => void onClearMemories()}>
          Clear memories
        </button>
      </div>
    </section>
  );
}
