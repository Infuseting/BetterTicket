import { StringSelectMenuInteraction } from 'discord.js';
import { SelectMenuHandler } from '../../core/BaseHandler';
import { db } from '../../db';
import { ticketService } from '../../services/TicketService';
import { t } from '../../i18n';

export default class CategorySelect implements SelectMenuHandler {
  customId = 'category_select';

  async execute(interaction: StringSelectMenuInteraction) {
    const categoryId = interaction.values[0];
    const category = await db.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      await interaction.reply({
        content: t('category_not_found', interaction.locale),
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const channel = await ticketService.createTicket(
        interaction.user,
        interaction.guild!,
        category.name,
        "No description provided",
        interaction.locale,
        category.id
      );

      await interaction.editReply({
        content: t('ticket_created_success', interaction.locale, { channel: `<#${channel.id}>` })
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      await interaction.editReply({
        content: 'An error occurred while creating your ticket.'
      });
    }
  }
}
