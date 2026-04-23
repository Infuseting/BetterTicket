import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalActionRowComponentBuilder } from 'discord.js';
import { ButtonHandler } from '../../core/BaseHandler';
import { t } from '../../i18n';

export default class OpenTicket implements ButtonHandler {
  customId = 'open_ticket';

  async execute(interaction: ButtonInteraction) {
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
