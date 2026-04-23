# Command Deployment Utility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a script to register slash commands with Discord.

**Architecture:** A standalone script `src/deploy-commands.ts` that uses `discord.js` REST API to register commands. A placeholder command `/ping` will be created in `src/commands/ping.ts`.

**Tech Stack:** `discord.js`, `ts-node`, `dotenv`.

---

### Task 1: Create Placeholder Ping Command

**Files:**
- Create: `src/commands/ping.ts`

- [ ] **Step 1: Create ping command**

```typescript
import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pong!');

export async function execute(interaction: CommandInteraction) {
	await interaction.reply('Pong!');
}
```

- [ ] **Step 2: Commit**

```bash
git add src/commands/ping.ts
git commit -m "feat: add ping command placeholder"
```

### Task 2: Create Deployment Script

**Files:**
- Create: `src/deploy-commands.ts`

- [ ] **Step 1: Create deploy-commands.ts**

```typescript
import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import * as ping from './commands/ping';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
	console.error('Missing DISCORD_TOKEN or CLIENT_ID in environment variables');
	process.exit(1);
}

const commands = [
	ping.data.toJSON(),
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();
```

- [ ] **Step 2: Commit**

```bash
git add src/deploy-commands.ts
git commit -m "feat: add command deployment script"
```

### Task 3: Update package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add deploy script to package.json**

```json
{
  "scripts": {
    "deploy": "ts-node src/deploy-commands.ts"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: add deploy script to package.json"
```
