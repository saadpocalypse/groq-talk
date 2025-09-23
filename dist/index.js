#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import readlineSync from "readline-sync";
import axios from "axios";
import fs from "fs";
import path from "path";
import os from "os";
const program = new Command();
// Config paths
const CONFIG_DIR = path.join(os.homedir(), ".groq-talk");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");
// Helpers
function loadConfig() {
    if (fs.existsSync(CONFIG_PATH)) {
        const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
        return JSON.parse(raw);
    }
    return null;
}
function saveConfig(config) {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
function deleteConfig() {
    if (fs.existsSync(CONFIG_PATH)) {
        fs.unlinkSync(CONFIG_PATH);
    }
}
// ----- LOGIN COMMAND -----
program
    .command("login")
    .description("Save your Groq API key for future use")
    .action(() => {
    const key = readlineSync.question("Enter your Groq API key: ", {
        hideEchoBack: true,
    });
    if (!key.startsWith("gsk_")) {
        console.error(`\n${chalk.red("Invalid key format. API keys usually start with gsk_")}\n`);
        process.exit(1);
    }
    saveConfig({ apiKey: key });
    console.log(`\n${chalk.green("API key saved successfully!")}\n`);
});
// ----- LOGOUT COMMAND -----
program
    .command("logout")
    .description("Remove your saved Groq API key")
    .action(() => {
    deleteConfig();
    console.log(`\n${chalk.yellow("API key removed.")}\n`);
});
// ----- CHAT COMMAND -----
program
    .command("chat")
    .description("Start an interactive chat with Groq")
    .option("-m, --model <name>", "Choose Groq model", "llama-3.1-8b-instant" // default
)
    .action(async (options) => {
    const config = loadConfig();
    if (!config?.apiKey) {
        console.error(`\n${chalk.red("No API key found. Run 'groq-talk login' first.")}\n`);
        process.exit(1);
    }
    let model = options.model;
    console.log(`\n${chalk.blue(`Groq Chat started with model: ${chalk.green(model)}. Type 'help' for commands.`)}\n`);
    let messages = [
        { role: "system", content: "You are a helpful assistant." },
    ];
    // Helper: show in-chat commands
    function showHelp() {
        console.log(chalk.blue(`
Available commands inside chat:
  help            Show this help message
  clear           Clear conversation history (start fresh)
  logout          Remove saved API key
  goodbye         Exit the chat session
  model <name>    Change the current Groq model
  list-models     List all available models

Current model: ${chalk.green(model)}
`));
    }
    while (true) {
        const rawInput = readlineSync.question("You: "); // plain prompt
        const userInput = rawInput.trim();
        if (!userInput) {
            continue; // ignore blank input
        }
        const normalized = userInput.toLowerCase();
        // ---- Built-in commands ----
        if (normalized === "goodbye") {
            console.log(`\n${chalk.blue("Session ended.")}\n`);
            break;
        }
        if (normalized === "help") {
            console.log("");
            showHelp();
            console.log("");
            continue;
        }
        if (normalized === "clear") {
            messages = [{ role: "system", content: "You are a helpful assistant." }];
            console.log(`\n${chalk.blue("Conversation history cleared.")}\n`);
            continue;
        }
        if (normalized === "logout") {
            deleteConfig();
            console.log(`\n${chalk.yellow("API key removed. Run 'groq-talk login' to add a new one.")}\n`);
            break;
        }
        if (normalized.startsWith("model ")) {
            const newModel = userInput.split(" ")[1];
            if (newModel) {
                model = newModel;
                console.log(`\n${chalk.green(`Model changed successfully to: ${model}`)}\n`);
            }
            else {
                console.error(`\n${chalk.red("Usage: model <name>")}\n`);
            }
            continue;
        }
        if (normalized === "list-models") {
            try {
                const resp = await axios.get("https://api.groq.com/openai/v1/models", {
                    headers: {
                        Authorization: `Bearer ${config.apiKey}`,
                    },
                });
                const models = resp.data.data.map((m) => m.id);
                console.log(`\n${chalk.blue("Available models:")}`);
                models.forEach((m) => {
                    if (m === model) {
                        console.log(`  - ${chalk.green(m)} ${chalk.blue("(active)")}`);
                    }
                    else {
                        console.log(`  - ${chalk.blue(m)}`);
                    }
                });
                console.log("");
            }
            catch (err) {
                console.error(`\n${chalk.red("Failed to fetch models.")}\n`);
            }
            continue;
        }
        // ---- Normal Groq interaction ----
        messages.push({ role: "user", content: userInput });
        try {
            const resp = await axios.post("https://api.groq.com/openai/v1/chat/completions", { model, messages }, {
                headers: {
                    Authorization: `Bearer ${config.apiKey}`,
                    "Content-Type": "application/json",
                },
            });
            const reply = resp.data.choices[0].message.content;
            console.log(`\n${chalk.yellow(`Groq: ${reply}`)}\n`);
            messages.push({ role: "assistant", content: reply });
        }
        catch (err) {
            const axiosErr = err;
            if (axiosErr.response) {
                if (axiosErr.response.status === 429) {
                    console.error(`\n${chalk.red("Quota exceeded: Free tier limit reached. Try again later.")}\n`);
                }
                else if (axiosErr.response.status === 401) {
                    console.error(`\n${chalk.red("Invalid API key. Run 'groq-talk login' again.")}\n`);
                }
                else {
                    console.error(`\n${chalk.red("API Error:")}`, axiosErr.response.data, "\n");
                }
            }
            else {
                console.error(`\n${chalk.red("Request failed:")} ${axiosErr.message}\n`);
            }
        }
    }
});
program.parse(process.argv);
