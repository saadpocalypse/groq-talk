#!/usr/bin/env node
import { Command } from "commander";
import { registerLogin } from "./commands/login.js";
import { registerLogout } from "./commands/logout.js";
import { registerChat } from "./commands/chat.js";

const program = new Command();

registerLogin(program);
registerLogout(program);
registerChat(program);

program.parse(process.argv);
