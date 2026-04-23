import { ButtonInteraction, TextChannel, MessageFlags } from 'discord.js';
import { ButtonHandler } from '../../core/BaseHandler';
import { ticketService } from '../../services/TicketService';
import { t } from '../../i18n';

export default class ReopenTicket implements ButtonHandler {
  customId = 'reopen_ticket';

  async execute(interaction: ButtonInteraction) {
    const ticket = await ticketService.getTicketByChannel(interaction.channelId);

    if (!ticket) {
      await interaction.reply({ content: 'Ticket not found in database.', flags: MessageFlags.Ephemeral });
      return;
    }

    await ticketService.reopenTicket(interaction.channel as TextChannel, ticket);

    await interaction.reply({
      content: t('ticket_reopened_by', interaction.locale, { user: interaction.user.tag })
    });
  }
}
