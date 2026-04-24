import { ButtonInteraction, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { ButtonHandler } from '../../core/BaseHandler';
import { db } from '../../db';
import { t } from '../../i18n';

export default class OpenTicket implements ButtonHandler {
  customId = 'open_ticket';

  async execute(interaction: ButtonInteraction) {
    const locale = interaction.locale;
    const categories = await db.category.findMany({
      where: { guildId: interaction.guildId! }
    });

    if (categories.length === 0) {
      await interaction.reply({
        content: t('no_categories', locale),
        ephemeral: true
      });
      return;
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId('category_select')
      .setPlaceholder('Select a category...')
      .addOptions(
        categories.map(cat => 
          new StringSelectMenuOptionBuilder()
            .setLabel(cat.name)
            .setValue(cat.id)
            .setEmoji(cat.emoji)
        )
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    await interaction.reply({
      content: 'Please select a category for your ticket:',
      components: [row],
      ephemeral: true
    });
  }
}
