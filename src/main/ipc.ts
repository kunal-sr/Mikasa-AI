import { ipcMain } from "electron";
import { ipcChannels } from "../shared/ipc";
import type {
  ConversationRequest,
  OnboardingPayload,
  UpdateSettingsPayload
} from "../shared/types";
import { MikasaRuntime } from "./services/runtime";

const runtime = new MikasaRuntime();

export function registerIpc() {
  ipcMain.handle(ipcChannels.bootstrap, async () => runtime.bootstrap());
  ipcMain.handle(ipcChannels.onboard, async (_event, payload: OnboardingPayload) =>
    runtime.onboard(payload)
  );
  ipcMain.handle(
    ipcChannels.updateSettings,
    async (_event, payload: UpdateSettingsPayload) => runtime.updateSettings(payload)
  );
  ipcMain.handle(
    ipcChannels.sendConversation,
    async (_event, payload: ConversationRequest) => runtime.sendConversation(payload)
  );
  ipcMain.handle(ipcChannels.transcribeAudio, async (_event, audioBase64: string) =>
    runtime.transcribeAudio(audioBase64)
  );
  ipcMain.handle(ipcChannels.exportMemories, async () => runtime.exportMemories());
  ipcMain.handle(ipcChannels.clearMemories, async () => runtime.clearMemories());
}
