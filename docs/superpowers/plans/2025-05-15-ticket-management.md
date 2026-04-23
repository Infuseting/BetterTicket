# Ticket Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Close, Reopen, and Archive logic for tickets.

**Architecture:** Add button interaction handlers in `src/index.ts` and update status in Prisma DB.

**Tech Stack:** TypeScript, Discord.js, Prisma.

---

### Task 1: Add Translation Keys

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Add English translations**
Add the following keys to `src/locales/en.json`:
```json
  "ticket_closed_by": "Ticket closed by {user}",
  "ticket_reopen_button_label": "Reopen Ticket",
  "ticket_archive_button_label": "Archive Ticket",
  "ticket_reopened_by": "Ticket reopened by {user}",
  "ticket_archiving": "Archiving ticket..."
```

- [ ] **Step 2: Add French translations**
Add the following keys to `src/locales/fr.json`:
```json
  "ticket_closed_by": "Ticket fermé par {user}",
  "ticket_reopen_button_label": "Réouvrir le Ticket",
  "ticket_archive_button_label": "Archiver le Ticket",
  "ticket_reopened_by": "Ticket réouvert par {user}",
  "ticket_archiving": "Archivage du ticket..."
```

- [ ] **Step 3: Commit**
```bash
git add src/locales/*.json
git commit -m "intl: add ticket management translations"
```

### Task 2: Implement Close Ticket Logic

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add necessary imports**
Ensure `TextChannel` is imported from `discord.js`.

- [ ] **Step 2: Add `close_ticket` button handler**
Add the logic to handle `interaction.customId === 'close_ticket'`.

```typescript
    if (interaction.customId === 'close_ticket') {
      const ticket = await db.ticket.findUnique({
        where: { channelId: interaction.channelId }
      });

      if (!ticket) {
        await interaction.reply({ content: 'Ticket not found in database.', ephemeral: true });
        return;
      }

      await db.ticket.update({
        where: { channelId: interaction.channelId },
        data: { status: 'CLOSED' }
      });

      const channel = interaction.channel as TextChannel;
      await channel.permissionOverwrites.edit(ticket.authorId, {
        ViewChannel: false
      });

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
      return;
    }
```

- [ ] **Step 3: Commit**
```bash
git add src/index.ts
git commit -m "feat: implement close ticket logic"
```

### Task 3: Implement Reopen Ticket Logic

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add `reopen_ticket` button handler**
Add the logic to handle `interaction.customId === 'reopen_ticket'`.

```typescript
    if (interaction.customId === 'reopen_ticket') {
      const ticket = await db.ticket.findUnique({
        where: { channelId: interaction.channelId }
      });

      if (!ticket) {
        await interaction.reply({ content: 'Ticket not found in database.', ephemeral: true });
        return;
      }

      await db.ticket.update({
        where: { channelId: interaction.channelId },
        data: { status: 'OPEN' }
      });

      const channel = interaction.channel as TextChannel;
      await channel.permissionOverwrites.edit(ticket.authorId, {
        ViewChannel: true,
        SendMessages: true
      });

      await interaction.reply({
        content: t('ticket_reopened_by', interaction.locale, { user: interaction.user.tag })
      });
      return;
    }
```

- [ ] **Step 2: Commit**
```bash
git add src/index.ts
git commit -m "feat: implement reopen ticket logic"
```

### Task 4: Implement Archive Ticket Logic

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add `archive_ticket` button handler**
Add the logic to handle `interaction.customId === 'archive_ticket'`.

```typescript
    if (interaction.customId === 'archive_ticket') {
      await interaction.reply({ content: t('ticket_archiving', interaction.locale) });
      
      // Optional: update DB
      await db.ticket.update({
        where: { channelId: interaction.channelId },
        data: { status: 'ARCHIVED' }
      });

      await interaction.channel?.delete();
      return;
    }
```

- [ ] **Step 2: Commit**
```bash
git add src/index.ts
git commit -m "feat: implement archive ticket logic"
```
