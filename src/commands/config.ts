import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { db } from '../db';

export const data = new SlashCommandBuilder()
	.setName('config-staff')
	.setDescription('Configure the staff role for this server')
	.addRoleOption(option => 
		option.setName('role')
			.setDescription('The staff role')
			.setRequired(true))
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
	const role = interaction.options.getRole('role', true);
	const guildId = interaction.guildId;

	if (!guildId) {
		await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
		return;
	}

	await db.guildConfig.upsert({
		where: { guildId },
		update: { staffRoleId: role.id },
		create: { guildId, staffRoleId: role.id },
	});

	await interaction.reply({ content: `Staff role set to ${role.name}`, ephemeral: true });
}
