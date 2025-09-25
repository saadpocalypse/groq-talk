import { Command } from "commander";
import chalk from "chalk";
import readlineSync from "readline-sync";
import { loadConfig, deleteConfig } from "../config.js";
import { listModels, chatCompletion } from "../utils/api.js";
import { Message, createSystemMessage } from "../utils/messages.js";
import {
    createChat, updateChat, listChats, getChat, getChatSummary, deleteChat, ChatSession
} from "../utils/chatStore.js";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";

marked.setOptions({
    renderer: new TerminalRenderer(),
});

function clearScreen() {
    process.stdout.write("\x1Bc");
}

export function registerChat(program: Command) {
    program
        .command("chat")
        .description("Start an interactive chat with Groq")
        .option("-m, --model <name>", "Choose Groq model", "llama-3.1-8b-instant")
        .action(async (options) => {
            const config = loadConfig();
            if (!config?.apiKey) {
                console.error(`\n${chalk.red("No API key found. Run 'groq-talk login' first.")}\n`);
                process.exit(1);
            }

            let model = options.model;

            let currentChat: ChatSession | null = null;
            const chats = listChats();
            if (chats.length > 0) {
                currentChat = chats[0]; // resume last chat
            } else {
                currentChat = createChat();
            }

            clearScreen();
            console.log(`\n${chalk.blue(
                `Groq Chat started with model: ${chalk.green(model)}. Type 'help' for commands.`
            )}`);
            console.log(chalk.blue(`Active chat: [${currentChat.id}]\n`));

            function showHelp() {
                console.log(chalk.blue(`
Available commands inside chat:
  help                 Show this help message
  logout               Remove saved API key
  goodbye              Exit the chat session
  switch model <name>  Change the current Groq model
  list models          List all available models
  list chats           Show all chats
  new chat             Start a new chat
  switch chat <id>     Switch to a different chat
  delete chat <id>     Delete a chat (cannot delete current one)

Current model: ${chalk.green(model)}
Active chat: [${currentChat?.id}]
`));
            }

            while (true) {
                const rawInput = readlineSync.question("You: ");
                const userInput = rawInput.trim();
                if (!userInput) continue;

                const normalized = userInput.toLowerCase();

                if (normalized === "goodbye") {
                    if (currentChat) updateChat(currentChat);
                    console.log(`\n${chalk.blue("Session ended.")}\n`);
                    break;
                }
                if (normalized === "help") {
                    console.log(""); showHelp(); console.log(""); continue;
                }
                if (normalized === "logout") {
                    deleteConfig();
                    console.log(`\n${chalk.yellow("API key removed. Run 'groq-talk login' to add a new one.")}\n`);
                    break;
                }
                if (normalized.startsWith("switch model ")) {
                    const parts = userInput.split(" ");
                    const newModel = parts[2];
                    if (newModel) {
                        model = newModel;
                        console.log(`\n${chalk.green(`Model changed successfully to: ${model}`)}\n`);
                    } else {
                        console.error(`\n${chalk.red("Usage: switch model <name>")}\n`);
                    }
                    continue;
                }
                if (normalized === "list models") {
                    try {
                        const models = await listModels(config);
                        console.log(`\n${chalk.blue("Available models:")}`);
                        models.forEach((m: any) => {
                            if (m === model) {
                                console.log(`  - ${chalk.green(m)} ${chalk.blue("(active)")}`);
                            } else {
                                console.log(`  - ${chalk.blue(m)}`);
                            }
                        });
                        console.log("");
                    } catch {
                        console.error(`\n${chalk.red("Failed to fetch models.")}\n`);
                    }
                    continue;
                }

                if (normalized === "list chats") {
                    const chats = listChats();
                    if (chats.length === 0) {
                        console.log(chalk.yellow("\nNo chats found.\n"));
                    } else {
                        console.log(chalk.blue("\nChats:"));
                        chats.forEach(c => {
                            const summary = getChatSummary(c);
                            console.log(`[${c.id}] ${summary}`);
                        });
                        console.log("");
                    }
                    continue;
                }

                if (normalized === "new chat") {
                    if (currentChat) updateChat(currentChat);
                    currentChat = createChat();
                    clearScreen();
                    console.log(`\n${chalk.blue(
                        `Groq Chat started with model: ${chalk.green(model)}. Type 'help' for commands.`
                    )}`);
                    console.log(chalk.blue(`Active chat: [${currentChat.id}]\n`));
                    continue;
                }

                if (normalized.startsWith("switch chat")) {
                    const [, , id] = userInput.split(" ");
                    if (!id) {
                        console.error(`\n${chalk.red("Usage: switch chat <id>")}\n`);
                        continue;
                    }
                    const target = getChat(id);
                    if (!target) {
                        console.error(`\n${chalk.red(`Chat with id ${id} not found.`)}\n`);
                        continue;
                    }

                    if (currentChat) updateChat(currentChat);
                    currentChat = target;

                    clearScreen();
                    console.log(`\n${chalk.blue(
                        `Groq Chat started with model: ${chalk.green(model)}. Type 'help' for commands.`
                    )}`);
                    console.log(chalk.blue(`Switched to chat: [${currentChat.id}]\n`));

                    currentChat.messages.forEach(m => {
                        if (m.role === "user") {
                            console.log(chalk.cyan(`You: ${m.content}`));
                        } else if (m.role === "assistant") {
                            console.log(`\n${chalk.yellow("Groq:")}\n`);
                            console.log(marked(m.content));
                            console.log("");
                        }
                    });

                    continue;
                }

                if (normalized.startsWith("delete chat")) {
                    const [, , id] = userInput.split(" ");
                    if (!id) {
                        console.error(`\n${chalk.red("Usage: delete chat <id>")}\n`);
                        continue;
                    }
                    if (id === currentChat?.id) {
                        console.error(`\n${chalk.red("You cannot delete the chat you are currently in.")}\n`);
                        continue;
                    }
                    const ok = deleteChat(id);
                    if (ok) {
                        console.log(`\n${chalk.green(`Chat [${id}] deleted.`)}\n`);
                    } else {
                        console.error(`\n${chalk.red(`Chat with id ${id} not found.`)}\n`);
                    }
                    continue;
                }

                currentChat.messages.push({ role: "user", content: userInput });
                currentChat.lastUsed = Date.now();

                try {
                    const reply = await chatCompletion(config, model, currentChat.messages);
                    console.log(`\n${chalk.yellow("Groq:")}\n`);
                    console.log(marked(reply));
                    console.log("");
                    currentChat.messages.push({ role: "assistant", content: reply });
                    currentChat.lastUsed = Date.now();
                    updateChat(currentChat);
                } catch (err: any) {
                    if (err.status === 429) {
                        console.error(`\n${chalk.red("Quota exceeded: Free tier limit reached. Try again later.")}\n`);
                    } else if (err.status === 401) {
                        console.error(`\n${chalk.red("Invalid API key. Run 'groq-talk login' again.")}\n`);
                    } else {
                        console.error(`\n${chalk.red("API Error:")}`, err.data, "\n");
                    }
                }
            }
        });
}
