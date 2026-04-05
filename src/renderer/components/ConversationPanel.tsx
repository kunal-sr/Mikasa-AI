import type { ConversationTurn } from "../../shared/types";

interface ConversationPanelProps {
  companionName: string;
  turns: ConversationTurn[];
  draft: string;
  sending: boolean;
  recording: boolean;
  onDraftChange: (value: string) => void;
  onSend: () => Promise<void>;
  onVoiceTurn: () => Promise<void>;
}

export function ConversationPanel({
  companionName,
  turns,
  draft,
  sending,
  recording,
  onDraftChange,
  onSend,
  onVoiceTurn
}: ConversationPanelProps) {
  return (
    <section className="conversation-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Live session</span>
          <h2>Talk with {companionName}</h2>
        </div>
        <button
          className={`voice-button ${recording ? "recording" : ""}`}
          onClick={() => void onVoiceTurn()}
        >
          {recording ? "Listening..." : "Push to Talk"}
        </button>
      </div>
      <div className="turn-list">
        {turns.length === 0 ? (
          <div className="empty-state">
            Start with anything real: how your day went, what you're excited about, or what feels heavy.
          </div>
        ) : (
          turns.map((turn) => (
            <article key={turn.id} className="turn-card">
              <div className="turn-role">You</div>
              <p>{turn.userTranscript}</p>
              <div className="turn-meta">{turn.emotion.summary}</div>
              <div className="turn-role companion">{companionName}</div>
              <p>{turn.assistantReply}</p>
            </article>
          ))
        )}
      </div>
      <div className="composer">
        <textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder={`Tell ${companionName} what's on your mind...`}
        />
        <button className="primary-button" disabled={sending} onClick={() => void onSend()}>
          {sending ? "Replying..." : "Send"}
        </button>
      </div>
    </section>
  );
}
