import fs from "fs";
import path from "path";
import os from "os";

const CONFIG_DIR = path.join(os.homedir(), ".groq-talk");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

export interface Config {
    apiKey: string;
}

export function loadConfig(): Config | null {
    if (fs.existsSync(CONFIG_PATH)) {
        const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
        return JSON.parse(raw) as Config;
    }
    return null;
}

export function saveConfig(config: Config) {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function deleteConfig() {
    if (fs.existsSync(CONFIG_PATH)) {
        fs.unlinkSync(CONFIG_PATH);
    }
}
