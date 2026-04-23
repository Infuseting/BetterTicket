import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { db } from '../db';
import { t } from '../i18n';

export const data = new SlashCommandBuilder()
	.setName('config-staff')
	.setDescription(t('config_staff_description', 'en'))
	.addRoleOption(option => 
		option.setName('role')
			.setDescription('The staff role')
			.setRequired(true))
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
	const role = interaction.options.getRole('role', true);
	const guildId = interaction.guildId;
	const locale = interaction.locale || 'en';

	if (!guildId) {
		await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
		return;
	}

	await db.guildConfig.upsert({
		where: { guildId },
		update: { staffRoleId: role.id },
		create: { guildId, staffRoleId: role.id },
	});

	await interaction.reply({ 
		content: t('config_staff_success', locale, { roleName: role.name }), 
		ephemeral: true 
	});
}
