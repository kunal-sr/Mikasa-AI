import type { AvatarIntent, EmotionSignal } from "../../shared/types";

export function buildAvatarIntent(emotion: EmotionSignal, reply: string): AvatarIntent {
  if (emotion.primaryMood === "sad" || emotion.primaryMood === "stressed") {
    return {
      emotion: "concerned",
      intensity: 0.76,
      reason: "Offering comfort and emotional support."
    };
  }

  if (emotion.primaryMood === "excited" || /proud|celebrate|amazing|yay/i.test(reply)) {
    return {
      emotion: "laughing",
      intensity: 0.82,
      reason: "Sharing in the user's excitement."
    };
  }

  if (/sweet|glad|adorable|missed/i.test(reply)) {
    return {
      emotion: "blushing",
      intensity: 0.64,
      reason: "Warm affectionate tone."
    };
  }

  if (emotion.primaryMood === "positive") {
    return {
      emotion: "smiling",
      intensity: 0.7,
      reason: "Positive conversational energy."
    };
  }

  return {
    emotion: "speaking",
    intensity: 0.55,
    reason: "Replying in a calm, attentive way."
  };
}
