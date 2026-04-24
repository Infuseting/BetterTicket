import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { t } from '../i18n';
import { CommandHandler } from '../core/BaseHandler';

export default class SetupCommand implements CommandHandler {
	data = new SlashCommandBuilder()
		.setName('ticket-setup')
		.setDescription(t('ticket_setup_description', 'en'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

	async execute(interaction: ChatInputCommandInteraction) {
		const locale = interaction.locale || 'en';

		const embed = new EmbedBuilder()
			.setTitle(t('ticket_setup_embed_title', locale))
			.setDescription(t('ticket_setup_embed_description', locale))
			.setColor(0x00FF00);

		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('open_ticket')
					.setLabel(t('ticket_setup_button_label', locale))
					.setStyle(ButtonStyle.Primary),
			);

		await interaction.reply({ embeds: [embed], components: [row] });
	}
}
