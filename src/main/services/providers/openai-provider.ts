import type {
  AudioTranscriptionResult,
  EmotionSignal,
  MemoryRecord,
  PersonalityStyle
} from "../../../shared/types";

interface CompanionReplyParams {
  companionName: string;
  personality: PersonalityStyle;
  userName: string;
  transcript: string;
  emotion: EmotionSignal;
  memories: MemoryRecord[];
  moodSummary: string;
  systemPrompt: string;
}

export class OpenAIProvider {
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  private readonly transcriptionModel =
    process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe";

  async generateCompanionReply(params: CompanionReplyParams): Promise<string> {
    if (!this.apiKey) {
      return buildFallbackReply(params);
    }

    const memorySummary =
      params.memories.length > 0
        ? params.memories.map((memory) => `- ${memory.summary}`).join("\n")
        : "- No highly relevant memories yet.";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        input: [
          {
            role: "system",
            content: params.systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: [
                  `User said: ${params.transcript}`,
                  `Detected mood: ${params.emotion.primaryMood} (${params.emotion.summary})`,
                  `Relevant memories:\n${memorySummary}`,
                  `Weekly mood trend: ${params.moodSummary}`,
                  "Respond with empathy, 2-5 sentences, and one natural follow-up when helpful."
                ].join("\n\n")
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      return buildFallbackReply(params);
    }

    const payload = (await response.json()) as { output_text?: string };
    return payload.output_text?.trim() || buildFallbackReply(params);
  }

  async transcribeAudio(audioBase64: string): Promise<AudioTranscriptionResult> {
    if (!this.apiKey) {
      return {
        text: "Voice transcription is not configured yet. Add an OpenAI API key or type your message instead."
      };
    }

    const form = new FormData();
    form.append("model", this.transcriptionModel);
    const bytes = Uint8Array.from(Buffer.from(audioBase64, "base64"));
    const blob = new Blob([bytes], { type: "audio/webm" });
    form.append("file", blob, "utterance.webm");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      },
      body: form
    });

    if (!response.ok) {
      return {
        text: "I couldn't transcribe that audio right now. You can try again or type your message."
      };
    }

    const payload = (await response.json()) as { text?: string };
    return { text: payload.text?.trim() || "" };
  }
}

function buildFallbackReply(params: CompanionReplyParams) {
  const lead = {
    sweet: "I'm here with you.",
    witty: "I'm tuned in, and yes, I have thoughts.",
    calm: "I'm right here, and we can take this gently.",
    adventurous: "I'm with you, and I'm curious where this day is taking you."
  }[params.personality];

  const emotionalLine =
    params.emotion.primaryMood === "sad"
      ? "That sounds heavy, and I want to make this moment a little softer for you."
      : params.emotion.primaryMood === "stressed"
        ? "You sound under a lot of pressure, so let's slow it down together."
        : params.emotion.primaryMood === "tired"
          ? "You sound worn out, and I want to meet you with something gentle."
          : params.emotion.primaryMood === "positive" || params.emotion.primaryMood === "excited"
            ? "I can feel the good energy in that, and I love hearing it."
            : "I'm listening closely and staying with what matters to you.";

  const memoryLine =
    params.memories[0]?.summary
      ? `It also connects with what you've shared before about ${params.memories[0].summary.toLowerCase()}.`
      : "I'm getting to know your rhythms a little more with each conversation.";

  return `${lead} ${emotionalLine} ${memoryLine} Tell me a little more about what feels most important right now, ${params.userName}.`;
}
