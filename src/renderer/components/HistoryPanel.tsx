import type { CheckInEvent, MemoryRecord } from "../../shared/types";

interface HistoryPanelProps {
  memories: MemoryRecord[];
  checkIns: CheckInEvent[];
}

export function HistoryPanel({ memories, checkIns }: HistoryPanelProps) {
  return (
    <section className="history-panel">
      <div className="history-column">
        <div className="panel-header compact">
          <div>
            <span className="eyebrow">Memory log</span>
            <h3>What she remembers</h3>
          </div>
        </div>
        <div className="history-list">
          {memories.length === 0 ? (
            <div className="empty-state">Meaningful moments and preferences will start showing up here.</div>
          ) : (
            memories.slice(-8).reverse().map((memory) => (
              <article key={memory.id} className="history-card">
                <span className="chip">{memory.type}</span>
                <p>{memory.summary}</p>
              </article>
            ))
          )}
        </div>
      </div>
      <div className="history-column">
        <div className="panel-header compact">
          <div>
            <span className="eyebrow">Care prompts</span>
            <h3>Upcoming check-ins</h3>
          </div>
        </div>
        <div className="history-list">
          {checkIns.length === 0 ? (
            <div className="empty-state">Future follow-ups will appear once you share upcoming moments.</div>
          ) : (
            checkIns.slice(-6).reverse().map((checkIn) => (
              <article key={checkIn.id} className="history-card">
                <span className="chip">{new Date(checkIn.scheduledFor).toLocaleString()}</span>
                <p>{checkIn.suggestedPrompt}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
