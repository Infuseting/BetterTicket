import { ButtonInteraction, TextChannel } from 'discord.js';
import { ButtonHandler } from '../../core/BaseHandler';
import { ticketService } from '../../services/TicketService';
import { t } from '../../i18n';

export default class ArchiveTicket implements ButtonHandler {
  customId = 'archive_ticket';

  async execute(interaction: ButtonInteraction) {
    await interaction.reply({ content: t('ticket_archiving', interaction.locale) });
    await ticketService.archiveTicket(interaction.channel as TextChannel);
  }
}
