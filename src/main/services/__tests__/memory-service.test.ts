import { describe, expect, it } from "vitest";
import { MemoryService } from "../memory-service";

describe("MemoryService", () => {
  it("extracts reminder seeds from future-facing transcripts", () => {
    const service = new MemoryService([], {
      displayName: "User",
      companionName: "Aria",
      personality: "sweet",
      likes: [],
      dislikes: [],
      routines: [],
      goals: [],
      importantPeople: [],
      boundaries: [],
      notes: []
    });

    const memories = service.extractMemories(
      "I have a big interview tomorrow morning and I'm nervous.",
      "I'm proud of you already.",
      {
        primaryMood: "stressed",
        sentimentScore: -0.4,
        confidence: 0.8,
        summary: "The user seems tense and may need grounding support."
      }
    );

    expect(memories.some((memory) => memory.type === "reminder_seed")).toBe(true);
  });
});
