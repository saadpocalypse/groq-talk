import { Command } from "commander";
import chalk from "chalk";
import { deleteConfig } from "../config.js";

export function registerLogout(program: Command) {
    program
        .command("logout")
        .description("Remove your saved Groq API key")
        .action(() => {
            deleteConfig();
            console.log(`\n${chalk.yellow("API key removed.")}\n`);
        });
}
