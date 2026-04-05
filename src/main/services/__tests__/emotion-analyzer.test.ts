import { describe, expect, it } from "vitest";
import { EmotionAnalyzer } from "../emotion-analyzer";

describe("EmotionAnalyzer", () => {
  it("marks stressed language as stressed", () => {
    const analyzer = new EmotionAnalyzer();
    const result = analyzer.analyze("I feel overwhelmed and anxious about this meeting.");
    expect(result.primaryMood).toBe("stressed");
    expect(result.confidence).toBeGreaterThan(0.4);
  });
});
