import { ModalSubmitInteraction, MessageFlags } from 'discord.js';
import { ModalHandler } from '../../core/BaseHandler';
import { ticketService } from '../../services/TicketService';
import { t } from '../../i18n';

export default class TicketModal implements ModalHandler {
  customId = 'ticket_modal';

  async execute(interaction: ModalSubmitInteraction) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('Failed to defer modal interaction:', error);
      return;
    }

    const subject = interaction.fields.getTextInputValue('ticket_subject');
    const description = interaction.fields.getTextInputValue('ticket_description');
    const guild = interaction.guild;

    if (!guild) return;

    const channel = await ticketService.createTicket(
      interaction.user,
      guild,
      subject,
      description,
      interaction.locale
    );

    await interaction.editReply({
      content: t('ticket_created_success', interaction.locale, { channel: `<#${channel.id}>` })
    });
  }
}
