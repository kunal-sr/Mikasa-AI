import { app } from "electron";
import fs from "node:fs/promises";
import path from "node:path";

export class JsonStore<T> {
  constructor(
    private readonly fileName: string,
    private readonly defaults: T
  ) {}

  async read(): Promise<T> {
    const filePath = this.resolvePath();
    try {
      const raw = await fs.readFile(filePath, "utf8");
      return JSON.parse(raw) as T;
    } catch {
      await this.write(this.defaults);
      return this.defaults;
    }
  }

  async write(data: T): Promise<void> {
    const filePath = this.resolvePath();
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  }

  private resolvePath() {
    return path.join(app.getPath("userData"), this.fileName);
  }
}
