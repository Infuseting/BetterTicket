# Ticket Opening Logic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Handle the "Open Ticket" button and Modal submission to create a ticket channel.

**Architecture:** Update `src/index.ts` to handle button and modal interactions. Use `discord.js` for channel creation and permissions. Use Prisma for database operations.

**Tech Stack:** TypeScript, Discord.js, Prisma, SQLite.

---

### Task 1: Update Translations

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Add English translations**
```json
{
  "ticket_created": "Your ticket has been created: {channelId}",
  "role_assigned": "Role {roleId} has been assigned to you.",
  "config_staff_description": "Configure the staff role for this server",
  "config_staff_success": "Staff role set to {roleName}",
  "ticket_setup_description": "Setup the ticket system in this channel",
  "ticket_setup_embed_title": "Open a Ticket",
  "ticket_setup_embed_description": "Click the button below to open a ticket.",
  "ticket_setup_button_label": "Open Ticket",
  "ticket_modal_title": "Open a Ticket",
  "ticket_subject_label": "Subject",
  "ticket_subject_placeholder": "Briefly describe your issue",
  "ticket_description_label": "Description",
  "ticket_description_placeholder": "Provide more details about your issue",
  "ticket_welcome_title": "Ticket: {subject}",
  "ticket_welcome_author": "Author: {author}",
  "ticket_welcome_description": "Description: {description}",
  "ticket_close_button_label": "Close Ticket",
  "ticket_created_success": "Ticket created in {channel}"
}
```

- [ ] **Step 2: Add French translations**
```json
{
  "ticket_created": "Votre ticket a été créé : {channelId}",
  "role_assigned": "Le rôle {roleId} vous a été attribué.",
  "config_staff_description": "Configurer le rôle du personnel pour ce serveur",
  "config_staff_success": "Rôle du personnel défini sur {roleName}",
  "ticket_setup_description": "Configurer le système de tickets dans ce salon",
  "ticket_setup_embed_title": "Ouvrir un Ticket",
  "ticket_setup_embed_description": "Cliquez sur le bouton ci-dessous pour ouvrir un ticket.",
  "ticket_setup_button_label": "Ouvrir un Ticket",
  "ticket_modal_title": "Ouvrir un Ticket",
  "ticket_subject_label": "Sujet",
  "ticket_subject_placeholder": "Décrivez brièvement votre problème",
  "ticket_description_label": "Description",
  "ticket_description_placeholder": "Donnez plus de détails sur votre problème",
  "ticket_welcome_title": "Ticket : {subject}",
  "ticket_welcome_author": "Auteur : {author}",
  "ticket_welcome_description": "Description : {description}",
  "ticket_close_button_label": "Fermer le Ticket",
  "ticket_created_success": "Ticket créé dans {channel}"
}
```

- [ ] **Step 3: Commit**
```bash
git add src/locales/*.json
git commit -m "i18n: add ticket modal and welcome message translations"
```

---

### Task 2: Implement "Open Ticket" Button Handler

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Import necessary components from discord.js**
- [ ] **Step 2: Add button interaction handling in the `InteractionCreate` listener**

```typescript
// Add these imports
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalActionRowComponentBuilder } from 'discord.js';
import { t } from './i18n';

// Inside client.on(Events.InteractionCreate, ...)
if (interaction.isButton()) {
  if (interaction.customId === 'open_ticket') {
    const modal = new ModalBuilder()
      .setCustomId('ticket_modal')
      .setTitle(t('ticket_modal_title', interaction.locale));

    const subjectInput = new TextInputBuilder()
      .setCustomId('ticket_subject')
      .setLabel(t('ticket_subject_label', interaction.locale))
      .setPlaceholder(t('ticket_subject_placeholder', interaction.locale))
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const descriptionInput = new TextInputBuilder()
      .setCustomId('ticket_description')
      .setLabel(t('ticket_description_label', interaction.locale))
      .setPlaceholder(t('ticket_description_placeholder', interaction.locale))
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(subjectInput);
    const secondActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(descriptionInput);

    modal.addComponents(firstActionRow, secondActionRow);

    await interaction.showModal(modal);
  }
}
```

- [ ] **Step 3: Commit**
```bash
git add src/index.ts
git commit -m "feat: handle open_ticket button to show modal"
```

---

### Task 3: Implement Modal Submission Handler

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add imports for DB and other utilities**
- [ ] **Step 2: Add modal submission handling**

```typescript
// Add these imports if not present
import { ChannelType, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { db } from './db';

// Inside client.on(Events.InteractionCreate, ...)
if (interaction.isModalSubmit()) {
  if (interaction.customId === 'ticket_modal') {
    await interaction.deferReply({ ephemeral: true });

    const subject = interaction.fields.getTextInputValue('ticket_subject');
    const description = interaction.fields.getTextInputValue('ticket_description');
    const guild = interaction.guild;

    if (!guild) return;

    // Get staff role from DB
    const config = await db.guildConfig.findUnique({
      where: { guildId: guild.id }
    });

    const staffRoleId = config?.staffRoleId;

    // Permissions
    const permissionOverwrites: any[] = [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      }
    ];

    if (staffRoleId) {
      permissionOverwrites.push({
        id: staffRoleId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      });
    }

    // Create channel
    const channel = await guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites
    });

    // Save to DB
    await db.ticket.create({
      data: {
        channelId: channel.id,
        authorId: interaction.user.id,
        guildId: guild.id,
        subject,
        description,
        status: 'OPEN',
        locale: interaction.locale
      }
    });

    // Send Welcome Message
    const welcomeEmbed = new EmbedBuilder()
      .setTitle(t('ticket_welcome_title', interaction.locale, { subject }))
      .addFields(
        { name: t('ticket_subject_label', interaction.locale), value: subject },
        { name: t('ticket_description_label', interaction.locale), value: description }
      )
      .setColor(0x00FF00);

    const closeButton = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel(t('ticket_close_button_label', interaction.locale))
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);

    await channel.send({
      content: `<@${interaction.user.id}> ${staffRoleId ? `<@&${staffRoleId}>` : ''}`,
      embeds: [welcomeEmbed],
      components: [row]
    });

    await interaction.editReply({
      content: t('ticket_created_success', interaction.locale, { channel: `<#${channel.id}>` })
    });
  }
}
```

- [ ] **Step 3: Commit**
```bash
git add src/index.ts
git commit -m "feat: implement ticket modal submission logic"
```
