# Mikasa

Mikasa is a Windows-first Electron desktop AI companion MVP focused on voice conversation, emotional memory, consent-aware persistence, and an immersive always-there interface.

## What is implemented

- Electron + React desktop scaffold with secure IPC
- Onboarding flow for privacy and permissions preferences
- Conversation session UI with push-to-talk and typed fallback
- OpenAI-oriented provider abstraction for response generation, transcription, and optional TTS
- Structured local persistence for profile, memories, transcripts, and scheduled check-ins
- Memory extraction, retrieval scoring, mood trend summaries, and check-in suggestions

## Getting started

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and add your OpenAI key.
4. Run `npm run dev`.

## Notes

- This workspace did not have `node` or `npm` available when the project was scaffolded, so dependencies were not installed and tests were not executed here.
- Voice input uses browser media capture from the renderer and sends audio to the Electron main process for provider transcription.
