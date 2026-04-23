import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('ticket-setup')
	.setDescription('Setup the ticket system in this channel')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
	const embed = new EmbedBuilder()
		.setTitle('Open a Ticket')
		.setDescription('Click the button below to open a ticket.')
		.setColor(0x00FF00);

	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('open_ticket')
				.setLabel('Open Ticket')
				.setStyle(ButtonStyle.Primary),
		);

	await interaction.reply({ embeds: [embed], components: [row] });
}
