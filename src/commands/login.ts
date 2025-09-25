import { Command } from "commander";
import readlineSync from "readline-sync";
import chalk from "chalk";
import { saveConfig } from "../config.js";

export function registerLogin(program: Command) {
    program
        .command("login")
        .description("Save your Groq API key for future use")
        .action(() => {
            const key = readlineSync.question("Enter your Groq API key: ", { hideEchoBack: true });
            if (!key.startsWith("gsk_")) {
                console.error(`\n${chalk.red("Invalid key format. API keys usually start with gsk_")}\n`);
                process.exit(1);
            }
            saveConfig({ apiKey: key });
            console.log(`\n${chalk.green("API key saved successfully!")}\n`);
        });
}
