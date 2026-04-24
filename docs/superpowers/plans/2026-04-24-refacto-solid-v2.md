# Unified SOLID Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize all interaction routing (Commands, Buttons, Modals) into a dynamic manager to ensure O(1) lookup speed and high maintainability.

**Architecture:** Standardize `BaseHandler` to include `CommandHandler`. Migrate all existing commands to class-based handlers. Update `InteractionManager` to dynamically load and route these commands alongside buttons and modals, cleaning up `index.ts` and `deploy-commands.ts`.

**Tech Stack:** TypeScript, discord.js

---

### Task 1: Standardize Handlers

**Files:**
- Modify: `src/core/BaseHandler.ts`

- [ ] **Step 1: Write the interface definition**
Update `BaseHandler.ts` to include the new `CommandHandler` interface.

```typescript
import { ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';

export interface CommandHandler {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface ButtonHandler {
  customId: string;
  execute(interaction: ButtonInteraction): Promise<void>;
}

export interface ModalHandler {
  customId: string;
  execute(interaction: ModalSubmitInteraction): Promise<void>;
}
```

- [ ] **Step 2: Commit**
```bash
git add src/core/BaseHandler.ts
git commit -m "refactor: standardize interaction handler interfaces"
```

---

### Task 2: Migrate Commands to Classes

**Files:**
- Modify: `src/commands/ping.ts`
- Modify: `src/commands/setup.ts`
- Modify: `src/commands/config.ts`

- [ ] **Step 1: Refactor `ping.ts`**

```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CommandHandler } from '../core/BaseHandler';

export default class PingCommand implements CommandHandler {
  data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply('Pong!');
  }
}
```

- [ ] **Step 2: Refactor `setup.ts`**
Convert `src/commands/setup.ts` to export a default class implementing `CommandHandler`.

- [ ] **Step 3: Refactor `config.ts`**
Convert `src/commands/config.ts` to export a default class implementing `CommandHandler`.

- [ ] **Step 4: Commit**
```bash
git add src/commands/ping.ts src/commands/setup.ts src/commands/config.ts
git commit -m "refactor: migrate slash commands to class-based handlers"
```

---

### Task 3: Enhance InteractionManager

**Files:**
- Modify: `src/core/InteractionManager.ts`

- [ ] **Step 1: Add command collection and dynamic loading**

```typescript
import { ButtonInteraction, ModalSubmitInteraction, ChatInputCommandInteraction, Collection } from 'discord.js';
import { ButtonHandler, ModalHandler, CommandHandler } from './BaseHandler';
import path from 'path';
import fs from 'fs';

export class InteractionManager {
  private buttons = new Collection<string, ButtonHandler>();
  private modals = new Collection<string, ModalHandler>();
  private commands = new Collection<string, CommandHandler>();

  async loadInteractions() {
    await this.loadHandlers('../interactions/buttons', this.buttons, 'customId');
    await this.loadHandlers('../interactions/modals', this.modals, 'customId');
    await this.loadHandlers('../commands', this.commands, 'name', true);
  }

  private async loadHandlers(relativePath: string, collection: Collection<string, any>, keyProp: string, isCommand = false) {
    const fullPath = path.join(__dirname, relativePath);
    if (!fs.existsSync(fullPath)) return;

    const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    for (const file of files) {
      const handlerClass = (await import(path.join(fullPath, file))).default;
      if (handlerClass) {
        const handler = new handlerClass();
        const key = isCommand ? handler.data.name : handler[keyProp];
        collection.set(key, handler);
        console.log(`Loaded handler: ${key}`);
      }
    }
  }

  async handleButton(interaction: ButtonInteraction) {
    const handler = this.buttons.get(interaction.customId);
    if (handler) await handler.execute(interaction);
  }

  async handleModal(interaction: ModalSubmitInteraction) {
    const handler = this.modals.get(interaction.customId);
    if (handler) await handler.execute(interaction);
  }

  async handleCommand(interaction: ChatInputCommandInteraction) {
    const handler = this.commands.get(interaction.commandName);
    if (handler) await handler.execute(interaction);
  }

  getCommandData() {
    return this.commands.map(cmd => cmd.data.toJSON());
  }
}

export const interactionManager = new InteractionManager();
```

- [ ] **Step 2: Commit**
```bash
git add src/core/InteractionManager.ts
git commit -m "feat: enhance interaction manager with dynamic command loading"
```

---

### Task 4: Unify Routing and Deployment

**Files:**
- Modify: `src/index.ts`
- Modify: `src/deploy-commands.ts`

- [ ] **Step 1: Simplify `index.ts` routing**

```typescript
import { Client, GatewayIntentBits, Events, MessageFlags } from 'discord.js';
import dotenv from 'dotenv';
import { interactionManager } from './core/InteractionManager';

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once(Events.ClientReady, async (c) => {
  await interactionManager.loadInteractions();
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      await interactionManager.handleCommand(interaction);
    } else if (interaction.isButton()) {
      await interactionManager.handleButton(interaction);
    } else if (interaction.isModalSubmit()) {
      await interactionManager.handleModal(interaction);
    }
  } catch (error) {
    console.error('Interaction error:', error);
    try {
      if (interaction.isRepliable()) {
        const errorMessage = 'There was an error while executing this interaction!';
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral });
        } else {
          await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
        }
      }
    } catch (innerError) {
      console.error('Failed to send error message to user:', innerError);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
```

- [ ] **Step 2: Automate deployment in `deploy-commands.ts`**

```typescript
import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import { interactionManager } from './core/InteractionManager';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID in environment variables');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    await interactionManager.loadInteractions();
    const commands = interactionManager.getCommandData();

    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    console.log(`Successfully reloaded application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
```

- [ ] **Step 3: Run build to verify types**
Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add src/index.ts src/deploy-commands.ts
git commit -m "refactor: simplify routing and automate command deployment"
```
