# Refactorisation SOLID de BetterTicket - Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactoriser le bot pour utiliser une architecture SOLID basée sur des classes, une couche Service et un chargement automatique des interactions, supprimant ainsi les `if/else` imbriqués.

**Architecture:** Utilisation d'un `InteractionManager` pour le routage dynamique, d'un `TicketService` pour la logique métier, et de classes spécialisées pour chaque bouton et modal.

**Tech Stack:** TypeScript, Discord.js, Prisma, Vitest (pour les tests unitaires).

---

### Task 1: Configuration de l'environnement de test (Vitest)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Installer Vitest**
Run: `npm install -D vitest @types/node`

- [ ] **Step 2: Ajouter les scripts de test**
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Créer vitest.config.ts**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

- [ ] **Step 4: Commit**
```bash
git add package.json vitest.config.ts
git commit -m "chore: setup vitest for unit testing"
```

### Task 2: Définition des interfaces de base

**Files:**
- Create: `src/core/BaseHandler.ts`

- [ ] **Step 1: Créer les interfaces pour les handlers**
```typescript
import { ButtonInteraction, ModalSubmitInteraction, ChatInputCommandInteraction } from 'discord.js';

export interface InteractionHandler {
  customId: string;
  execute(interaction: ButtonInteraction | ModalSubmitInteraction): Promise<void>;
}

export interface ButtonHandler extends InteractionHandler {
  execute(interaction: ButtonInteraction): Promise<void>;
}

export interface ModalHandler extends InteractionHandler {
  execute(interaction: ModalSubmitInteraction): Promise<void>;
}
```

- [ ] **Step 2: Commit**
```bash
git add src/core/BaseHandler.ts
git commit -m "feat: add base interaction interfaces"
```

### Task 3: Création du TicketService

**Files:**
- Create: `src/services/TicketService.ts`
- Create: `src/services/__tests__/TicketService.spec.ts`

- [ ] **Step 1: Créer le squelette du TicketService**
```typescript
import { TextChannel, Guild, User, PermissionFlagsBits, ChannelType } from 'discord.js';
import { db } from '../db';

export class TicketService {
  async getTicketByChannel(channelId: string) {
    return db.ticket.findUnique({ where: { channelId } });
  }

  async closeTicket(channel: TextChannel, ticket: any, closedBy: string) {
    await db.ticket.update({
      where: { channelId: channel.id },
      data: { status: 'CLOSED' }
    });

    await channel.permissionOverwrites.edit(ticket.authorId, {
      ViewChannel: false,
      SendMessages: false
    });
  }

  async reopenTicket(channel: TextChannel, ticket: any) {
    await db.ticket.update({
      where: { channelId: channel.id },
      data: { status: 'OPEN' }
    });

    await channel.permissionOverwrites.edit(ticket.authorId, {
      ViewChannel: true,
      SendMessages: true
    });
  }

  async archiveTicket(channel: TextChannel) {
    await db.ticket.update({
      where: { channelId: channel.id },
      data: { status: 'ARCHIVED' }
    });
    await channel.delete();
  }
}

export const ticketService = new TicketService();
```

- [ ] **Step 2: Ajouter des tests unitaires basiques** (Mocking de db nécessaire)

- [ ] **Step 3: Commit**
```bash
git add src/services/TicketService.ts
git commit -m "feat: implement TicketService for business logic"
```

### Task 4: Implémentation de l'InteractionManager

**Files:**
- Create: `src/core/InteractionManager.ts`

- [ ] **Step 1: Implémenter le chargeur dynamique**
```typescript
import { ButtonInteraction, ModalSubmitInteraction, Collection } from 'discord.js';
import { ButtonHandler, ModalHandler } from './BaseHandler';
import path from 'path';
import fs from 'fs';

export class InteractionManager {
  private buttons = new Collection<string, ButtonHandler>();
  private modals = new Collection<string, ModalHandler>();

  async loadInteractions() {
    const buttonPath = path.join(__dirname, '../interactions/buttons');
    const modalPath = path.join(__dirname, '../interactions/modals');

    if (fs.existsSync(buttonPath)) {
      const files = fs.readdirSync(buttonPath).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
      for (const file of files) {
        const handler = new (await import(path.join(buttonPath, file))).default();
        this.buttons.set(handler.customId, handler);
      }
    }

    if (fs.existsSync(modalPath)) {
      const files = fs.readdirSync(modalPath).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
      for (const file of files) {
        const handler = new (await import(path.join(modalPath, file))).default();
        this.modals.set(handler.customId, handler);
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
}

export const interactionManager = new InteractionManager();
```

- [ ] **Step 2: Commit**
```bash
git add src/core/InteractionManager.ts
git commit -m "feat: implement InteractionManager with auto-loading"
```

### Task 5: Extraction des Boutons (Exemple: CloseTicket)

**Files:**
- Create: `src/interactions/buttons/CloseTicket.ts`

- [ ] **Step 1: Créer le handler CloseTicket**
```typescript
import { ButtonInteraction, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { ButtonHandler } from '../../core/BaseHandler';
import { ticketService } from '../../services/TicketService';
import { t } from '../../i18n';

export default class CloseTicket implements ButtonHandler {
  customId = 'close_ticket';

  async execute(interaction: ButtonInteraction) {
    const ticket = await ticketService.getTicketByChannel(interaction.channelId);
    if (!ticket) {
      return interaction.reply({ content: 'Ticket not found.', flags: MessageFlags.Ephemeral });
    }

    await ticketService.closeTicket(interaction.channel as TextChannel, ticket, interaction.user.tag);

    const reopenButton = new ButtonBuilder()
      .setCustomId('reopen_ticket')
      .setLabel(t('ticket_reopen_button_label', interaction.locale))
      .setStyle(ButtonStyle.Primary);

    const archiveButton = new ButtonBuilder()
      .setCustomId('archive_ticket')
      .setLabel(t('ticket_archive_button_label', interaction.locale))
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(reopenButton, archiveButton);

    await interaction.reply({
      content: t('ticket_closed_by', interaction.locale, { user: interaction.user.tag }),
      components: [row]
    });
  }
}
```

- [ ] **Step 2: Commit**
```bash
git add src/interactions/buttons/CloseTicket.ts
git commit -m "feat: extract close_ticket button to its own class"
```

### Task 6: Répéter pour les autres boutons et modaux

- [ ] **Step 1: Créer `src/interactions/buttons/OpenTicket.ts`**
- [ ] **Step 2: Créer `src/interactions/buttons/ReopenTicket.ts`**
- [ ] **Step 3: Créer `src/interactions/buttons/ArchiveTicket.ts`**
- [ ] **Step 4: Créer `src/interactions/modals/TicketModal.ts`** (implémenter `createTicket` dans `TicketService` avant)

### Task 7: Nettoyage de `index.ts`

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Initialiser l'InteractionManager et déléguer les événements**
```typescript
// ... imports
import { interactionManager } from './core/InteractionManager';

// ... client init

client.once(Events.ClientReady, async (c) => {
  await interactionManager.loadInteractions();
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isButton()) {
      await interactionManager.handleButton(interaction);
      return;
    }
    if (interaction.isModalSubmit()) {
      await interactionManager.handleModal(interaction);
      return;
    }
    // ... commands
  } catch (error) {
    // ... error handling
  }
});
```

- [ ] **Step 2: Commit**
```bash
git add src/index.ts
git commit -m "refactor: clean up index.ts by using InteractionManager"
```
