import { useState } from "react";

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [vocalHints] = useState<string[]>(["present"]);

  async function capture() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone capture is not available in this environment.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    setRecording(true);

    const result = await new Promise<string>((resolve, reject) => {
      recorder.addEventListener("dataavailable", (event) => {
        chunks.push(event.data);
      });

      recorder.addEventListener("stop", async () => {
        try {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const buffer = await blob.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          const binary = bytes.reduce(
            (text, byte) => text + String.fromCharCode(byte),
            ""
          );
          resolve(btoa(binary));
        } catch (reason) {
          reject(reason);
        } finally {
          stream.getTracks().forEach((track) => track.stop());
          setRecording(false);
        }
      });

      recorder.start();
      window.setTimeout(() => recorder.stop(), 4500);
    });

    return result;
  }

  return {
    recording,
    vocalHints,
    capture
  };
}
