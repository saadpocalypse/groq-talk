import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { Message } from "./messages.js";

export interface ChatSession {
    id: string;
    messages: Message[];
    lastUsed: number;
}

const chatsFile = path.join(os.homedir(), ".groq-talk", "chats.json");

function ensureDir() {
    const dir = path.dirname(chatsFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

export function loadChats(): Record<string, ChatSession> {
    ensureDir();
    if (!fs.existsSync(chatsFile)) {
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(chatsFile, "utf-8"));
    } catch {
        return {};
    }
}

export function saveChats(chats: Record<string, ChatSession>) {
    ensureDir();
    fs.writeFileSync(chatsFile, JSON.stringify(chats, null, 2), "utf-8");
}

export function createChat(): ChatSession {
    const id = crypto.randomUUID().slice(0, 6); // short id
    return {
        id,
        messages: [],
        lastUsed: Date.now(),
    };
}

export function updateChat(session: ChatSession) {
    const chats = loadChats();
    chats[session.id] = session;
    saveChats(chats);
}

export function listChats(): ChatSession[] {
    const chats = loadChats();
    return Object.values(chats).sort((a, b) => b.lastUsed - a.lastUsed);
}

export function getChat(id: string): ChatSession | null {
    const chats = loadChats();
    return chats[id] || null;
}

export function deleteChat(id: string): boolean {
    const chats = loadChats();
    if (!chats[id]) return false;
    delete chats[id];
    saveChats(chats);
    return true;
}

export function getChatSummary(session: ChatSession): string {
    const lastUser = [...session.messages].reverse().find(m => m.role === "user");
    if (!lastUser) return "(empty)";
    const text = lastUser.content.replace(/\s+/g, " ").trim();
    return text.length > 40 ? text.slice(0, 40) + "…" : text;
}
