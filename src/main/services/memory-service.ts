import type {
  EmotionSignal,
  MemoryRecord,
  MemoryRecordType,
  UserProfile
} from "../../shared/types";
import { generateId, nowIso, tokenize } from "./utils";

export class MemoryService {
  constructor(
    private readonly memories: MemoryRecord[],
    private readonly profile: UserProfile
  ) {}

  retrieveRelevant(transcript: string, emotion: EmotionSignal) {
    const queryTokens = tokenize(`${transcript} ${emotion.primaryMood}`);
    return [...this.memories]
      .map((memory) => ({
        memory,
        score: scoreMemory(memory, queryTokens)
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 5)
      .map((entry) => entry.memory);
  }

  extractMemories(
    transcript: string,
    assistantReply: string,
    emotion: EmotionSignal
  ): MemoryRecord[] {
    const extracted: MemoryRecord[] = [];
    const lowered = transcript.toLowerCase();
    const now = nowIso();

    if (lowered.includes("i like ") || lowered.includes("my favorite")) {
      extracted.push(
        createMemory("fact", transcript, summarizeContent(transcript), ["preference"], now, 0.74)
      );
    }

    if (lowered.includes("i need to") || lowered.includes("i want to") || lowered.includes("goal")) {
      extracted.push(createMemory("goal", transcript, summarizeContent(transcript), ["goal"], now, 0.76));
    }

    if (emotion.primaryMood === "sad" || emotion.primaryMood === "stressed" || emotion.primaryMood === "tired") {
      extracted.push(
        createMemory(
          "mood_pattern",
          `${transcript}\nAssistant support: ${assistantReply}`,
          `User showed ${emotion.primaryMood} cues during conversation.`,
          [emotion.primaryMood],
          now,
          0.68
        )
      );
    }

    if (/\btomorrow\b|\bnext week\b|\bmeeting\b|\binterview\b|\bappointment\b/.test(lowered)) {
      extracted.push(
        createMemory(
          "reminder_seed",
          transcript,
          `Future-facing event to check in about: ${summarizeContent(transcript)}`,
          ["follow-up"],
          now,
          0.81
        )
      );
    }

    if (extracted.length === 0 && transcript.length > 30) {
      extracted.push(
        createMemory("episode", transcript, summarizeContent(transcript), ["daily-life"], now, 0.58)
      );
    }

    return dedupeBySummary(extracted);
  }

  mergeMemories(nextMemories: MemoryRecord[]) {
    const merged = [...this.memories];
    for (const memory of nextMemories) {
      const duplicate = merged.find(
        (existing) => existing.summary.toLowerCase() === memory.summary.toLowerCase()
      );
      if (duplicate) {
        duplicate.lastUsedAt = nowIso();
        duplicate.salience = Math.min(1, (duplicate.salience + memory.salience) / 2 + 0.05);
        duplicate.confidence = Math.max(duplicate.confidence, memory.confidence);
      } else {
        merged.push(memory);
      }
    }
    return merged.slice(-200);
  }
}

function scoreMemory(memory: MemoryRecord, queryTokens: string[]) {
  const contentTokens = new Set(tokenize(`${memory.summary} ${memory.content} ${memory.tags.join(" ")}`));
  let score = 0;
  for (const token of queryTokens) {
    if (contentTokens.has(token)) {
      score += 1;
    }
  }
  return score + memory.salience + memory.confidence * 0.4;
}

function createMemory(
  type: MemoryRecordType,
  content: string,
  summary: string,
  tags: string[],
  createdAt: string,
  confidence: number
): MemoryRecord {
  return {
    id: generateId("memory"),
    type,
    content,
    summary,
    tags,
    salience: confidence,
    confidence,
    createdAt,
    lastUsedAt: createdAt
  };
}

function summarizeContent(text: string) {
  return text.trim().replace(/\s+/g, " ").slice(0, 140);
}

function dedupeBySummary(memories: MemoryRecord[]) {
  const seen = new Set<string>();
  return memories.filter((memory) => {
    const key = memory.summary.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
