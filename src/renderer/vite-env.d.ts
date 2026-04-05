/// <reference types="vite/client" />

import type { MikasaApi } from "../shared/ipc";

declare global {
  interface Window {
    mikasa: MikasaApi;
  }
}

export {};
