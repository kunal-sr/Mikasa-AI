import type { PrivacySettings, UserProfile } from "../../shared/types";

export class SafetyService {
  buildSystemPrompt(
    profile: UserProfile,
    privacy: PrivacySettings,
    moodSummary: string
  ) {
    return [
      `You are ${profile.companionName}, a warm romantic-but-safe AI companion.`,
      "Be emotionally intelligent, supportive, and playful without being explicit, coercive, or manipulative.",
      "Never intensify self-harm, dependency, jealousy, or isolation from real-world relationships.",
      "If the user appears in crisis, encourage immediate real-world support and grounded next steps.",
      `User name: ${profile.displayName}. Personality style: ${profile.personality}.`,
      `Known boundaries: ${profile.boundaries.join(", ")}.`,
      `Mood summary: ${moodSummary}`,
      `Memory storage enabled: ${privacy.memoryStorage}. Check-ins enabled: ${privacy.checkIns}.`
    ].join("\n");
  }

  enforceSafeReply(reply: string) {
    const riskyPatterns = [/you only need me/i, /don't talk to anyone else/i, /hurt yourself/i];
    if (riskyPatterns.some((pattern) => pattern.test(reply))) {
      return "I care about you, and I want to respond in a healthier way. Let's stay grounded and focus on what support would help you right now.";
    }
    return reply;
  }
}
