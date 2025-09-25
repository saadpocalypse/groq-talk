export type Message = { role: "system" | "user" | "assistant"; content: string };

export function createSystemMessage(): Message {
    return { role: "system", content: "You are a helpful assistant." };
}
