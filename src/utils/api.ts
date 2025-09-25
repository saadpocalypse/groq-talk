import axios, { AxiosError } from "axios";
import { Config } from "../config.js";

export async function listModels(config: Config) {
    const resp = await axios.get("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${config.apiKey}` },
    });
    return resp.data.data.map((m: any) => m.id);
}

export async function chatCompletion(config: Config, model: string, messages: any[]) {
    try {
        const resp = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            { model, messages },
            {
                headers: {
                    Authorization: `Bearer ${config.apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return resp.data.choices[0].message.content;
    } catch (err) {
        const axiosErr = err as AxiosError;
        if (axiosErr.response) throw axiosErr.response;
        throw err;
    }
}
