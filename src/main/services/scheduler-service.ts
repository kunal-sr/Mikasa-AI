import type { CheckInEvent, ConversationTurn, MemoryRecord } from "../../shared/types";
import { generateId } from "./utils";

export class SchedulerService {
  refreshCheckIns(
    existing: CheckInEvent[],
    memories: MemoryRecord[],
    enabled: boolean
  ): CheckInEvent[] {
    const next = existing.filter((item) => !item.completed);

    if (!enabled) {
      return next.map((item) => ({ ...item, enabled: false }));
    }

    for (const memory of memories) {
      if (memory.type !== "reminder_seed") {
        continue;
      }
      const duplicate = next.find((item) => item.relatedMemoryId === memory.id);
      if (duplicate) {
        continue;
      }
      next.push({
        id: generateId("checkin"),
        scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
        reason: memory.summary,
        relatedMemoryId: memory.id,
        suggestedPrompt: `How did that go for you? I remembered: ${memory.summary}`,
        enabled: true,
        completed: false
      });
    }

    return next.slice(-20);
  }

  buildMoodSummary(turns: ConversationTurn[]) {
    const recent = turns.slice(-7);
    if (recent.length === 0) {
      return "Not enough conversation history yet to infer a weekly mood pattern.";
    }

    const weights = recent.reduce(
      (acc, turn) => {
        acc[turn.emotion.primaryMood] = (acc[turn.emotion.primaryMood] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const [dominantMood] = Object.entries(weights).sort((left, right) => right[1] - left[1])[0];
    return `Recent conversations suggest the user's dominant mood trend has been ${dominantMood}.`;
  }
}
