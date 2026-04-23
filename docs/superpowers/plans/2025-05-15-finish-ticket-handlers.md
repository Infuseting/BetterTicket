# Finish Ticket Management Handlers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `reopen_ticket` and `archive_ticket` button interaction handlers in `src/index.ts` to allow staff to reopen closed tickets or archive (delete) them.

**Architecture:** Extend the `InteractionCreate` event listener in `src/index.ts` to handle `reopen_ticket` and `archive_ticket` custom IDs. `reopen_ticket` will update the database, restore channel permissions for the author, and post a confirmation. `archive_ticket` will delete the channel.

**Tech Stack:** Discord.js, Prisma (SQLite)

---

### Task 1: Implement `reopen_ticket` Handler

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add the `reopen_ticket` handler logic**

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

- [ ] **Step 2: Commit Task 1**

```bash
git add src/index.ts
git commit -m "feat: implement reopen_ticket handler"
```

### Task 2: Implement `archive_ticket` Handler

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add the `archive_ticket` handler logic**

```typescript
    if (interaction.customId === 'archive_ticket') {
      await interaction.reply({ content: t('ticket_archiving', interaction.locale) });
      
      const channel = interaction.channel as TextChannel;
      
      // We don't necessarily need to delete from DB if we want history, 
      // but usually archive in this context means delete the channel.
      // The requirement says "Delete the channel".
      
      await channel.delete();
      return;
    }
```

- [ ] **Step 2: Commit Task 2**

```bash
git add src/index.ts
git commit -m "feat: implement archive_ticket handler"
```

### Task 3: Verification

- [ ] **Step 1: Run build to ensure no compilation errors**

Run: `npm run build` (or `npx tsc`)
Expected: Success

- [ ] **Step 2: Final Commit**

```bash
git add src/index.ts
git commit -m "feat: complete ticket management handlers (reopen and archive)"
```
