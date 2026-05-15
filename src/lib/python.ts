import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function runPython(script: string, args = "", timeout = 30000): Promise<string> {
  const cmd = `python3 ${script} ${args}`;
  try {
    const { stdout } = await execAsync(cmd, { timeout, encoding: "utf-8" });
    return stdout;
  } catch (err: any) {
    return err?.stdout || err?.stderr || JSON.stringify(err);
  }
}

export async function readJsonFile(path: string): Promise<any> {
  const fs = await import("node:fs/promises");
  try {
    const data = await fs.readFile(path, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function readTextFile(path: string): Promise<string> {
  const fs = await import("node:fs/promises");
  try {
    return await fs.readFile(path, "utf-8");
  } catch {
    return "";
  }
}

export async function readCsv(path: string): Promise<string[][]> {
  const text = await readTextFile(path);
  if (!text) return [];
  return text
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => l.split(",").map((c) => c.trim()));
}
