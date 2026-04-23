# Design Doc: Ticket Management Logic (Close, Reopen, Archive)

## Goal
Implement the lifecycle buttons within a ticket channel to allow closing, reopening, and archiving tickets.

## Requirements
1. **Close Ticket (`close_ticket`)**:
    - Update DB status to `CLOSED`.
    - Remove ticket author's `ViewChannel` permission.
    - Send a message in the channel with `reopen_ticket` and `archive_ticket` buttons.
2. **Reopen Ticket (`reopen_ticket`)**:
    - Update DB status to `OPEN`.
    - Restore ticket author's `ViewChannel` and `SendMessages` permissions.
    - Send a confirmation message.
3. **Archive Ticket (`archive_ticket`)**:
    - Delete the channel.
    - (Optional) Update DB status to `ARCHIVED`.

## Implementation Details

### Database Changes
No schema changes required. `Ticket.status` will transition between `OPEN`, `CLOSED`, and optionally `ARCHIVED`.

### Translation Keys
Add the following keys to `src/locales/en.json` and `src/locales/fr.json`:
- `ticket_closed_by`
- `ticket_reopen_button_label`
- `ticket_archive_button_label`
- `ticket_reopened_by`

### Logic in `src/index.ts`

#### Close Ticket Handler
```typescript
if (interaction.customId === 'close_ticket') {
    const ticket = await db.ticket.findUnique({ where: { channelId: interaction.channelId } });
    if (!ticket) return;

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
}
```

#### Reopen Ticket Handler
```typescript
if (interaction.customId === 'reopen_ticket') {
    const ticket = await db.ticket.findUnique({ where: { channelId: interaction.channelId } });
    if (!ticket) return;

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
}
```

#### Archive Ticket Handler
```typescript
if (interaction.customId === 'archive_ticket') {
    await interaction.reply(t('ticket_archiving', interaction.locale));
    await interaction.channel?.delete();
}
```

## Verification Plan
1. Check that translation keys are present in both locale files.
2. Verify that `src/index.ts` handles all three button `customId`s.
3. Ensure DB updates and permission changes are correctly implemented.
