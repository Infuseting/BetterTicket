import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalActionRowComponentBuilder } from 'discord.js';
import { ButtonHandler } from '../../core/BaseHandler';
import { t } from '../../i18n';

export default class OpenTicket implements ButtonHandler {
  customId = 'open_ticket';

  async execute(interaction: ButtonInteraction) {
    const locale = interaction.locale;
    
    // Create inputs first (minimal logic)
    const subjectInput = new TextInputBuilder()
      .setCustomId('ticket_subject')
      .setLabel(t('ticket_subject_label', locale))
      .setPlaceholder(t('ticket_subject_placeholder', locale))
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const descriptionInput = new TextInputBuilder()
      .setCustomId('ticket_description')
      .setLabel(t('ticket_description_label', locale))
      .setPlaceholder(t('ticket_description_placeholder', locale))
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const modal = new ModalBuilder()
      .setCustomId('ticket_modal')
      .setTitle(t('ticket_modal_title', locale))
      .addComponents(
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(subjectInput),
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(descriptionInput)
      );

    // Show modal immediately
    await interaction.showModal(modal);
  }
}
