import { contextBridge, ipcRenderer } from "electron";
import { ipcChannels, type MikasaApi } from "../shared/ipc";

const api: MikasaApi = {
  bootstrap: () => ipcRenderer.invoke(ipcChannels.bootstrap),
  onboard: (payload) => ipcRenderer.invoke(ipcChannels.onboard, payload),
  updateSettings: (payload) => ipcRenderer.invoke(ipcChannels.updateSettings, payload),
  sendConversation: (payload) => ipcRenderer.invoke(ipcChannels.sendConversation, payload),
  transcribeAudio: (audioBase64) =>
    ipcRenderer.invoke(ipcChannels.transcribeAudio, audioBase64),
  exportMemories: () => ipcRenderer.invoke(ipcChannels.exportMemories),
  clearMemories: () => ipcRenderer.invoke(ipcChannels.clearMemories)
};

contextBridge.exposeInMainWorld("mikasa", api);
