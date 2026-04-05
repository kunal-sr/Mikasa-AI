import type { EmotionSignal } from "../../shared/types";

const positiveWords = ["happy", "great", "excited", "proud", "good", "love", "fun"];
const sadWords = ["sad", "down", "lonely", "hurt", "cry", "upset", "miss"];
const stressedWords = ["stress", "anxious", "worried", "overwhelmed", "pressure", "tense"];
const tiredWords = ["tired", "exhausted", "sleepy", "drained", "fatigued"];

export class EmotionAnalyzer {
  analyze(text: string, vocalHints: string[] = []): EmotionSignal {
    const lowered = text.toLowerCase();
    const positive = countMatches(lowered, positiveWords);
    const sad = countMatches(lowered, sadWords);
    const stressed = countMatches(lowered, stressedWords);
    const tired = countMatches(lowered, tiredWords);
    const excited = vocalHints.includes("energetic") ? positive + 1 : positive;
    const scores = [
      { mood: "positive", value: positive },
      { mood: "sad", value: sad },
      { mood: "stressed", value: stressed },
      { mood: "tired", value: tired },
      { mood: "excited", value: excited }
    ].sort((left, right) => right.value - left.value);
    const top = scores[0];
    const primaryMood =
      top.value === 0 ? "neutral" : (top.mood as EmotionSignal["primaryMood"]);

    return {
      primaryMood,
      sentimentScore:
        positive * 0.7 - sad * 0.8 - stressed * 0.6 - tired * 0.5 + excited * 0.2,
      vocalHints,
      confidence: top.value === 0 ? 0.35 : Math.min(0.95, 0.45 + top.value * 0.12),
      summary: describeMood(primaryMood)
    };
  }
}

function countMatches(text: string, words: string[]) {
  return words.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
}

function describeMood(mood: EmotionSignal["primaryMood"]) {
  switch (mood) {
    case "positive":
      return "The user seems upbeat and open to playful warmth.";
    case "sad":
      return "The user sounds low and likely needs comfort and reassurance.";
    case "stressed":
      return "The user seems tense and may need grounding support.";
    case "tired":
      return "The user sounds drained and may benefit from gentleness and calm pacing.";
    case "excited":
      return "The user seems energized and receptive to celebratory responses.";
    default:
      return "The user's emotional state is steady or unclear.";
  }
}
