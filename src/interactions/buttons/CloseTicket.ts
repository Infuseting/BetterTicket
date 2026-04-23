import { ButtonInteraction, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { ButtonHandler } from '../../core/BaseHandler';
import { ticketService } from '../../services/TicketService';
import { t } from '../../i18n';

export default class CloseTicket implements ButtonHandler {
  customId = 'close_ticket';

  async execute(interaction: ButtonInteraction) {
    const ticket = await ticketService.getTicketByChannel(interaction.channelId);
    if (!ticket) {
      await interaction.reply({ content: 'Ticket not found in database.', flags: MessageFlags.Ephemeral });
      return;
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
