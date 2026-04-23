import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, MessageFlags } from 'discord.js';
import { db } from '../db';
import { t } from '../i18n';

export const data = new SlashCommandBuilder()
	.setName('config-staff')
	.setDescription(t('config_staff_description', 'en'))
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addSubcommand(subcommand =>
		subcommand
			.setName('add')
			.setDescription(t('config_staff_add_description', 'en'))
			.addRoleOption(option => option.setName('role').setDescription('The role to add').setRequired(true))
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('remove')
			.setDescription(t('config_staff_remove_description', 'en'))
			.addRoleOption(option => option.setName('role').setDescription('The role to remove').setRequired(true))
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('list')
			.setDescription(t('config_staff_list_description', 'en'))
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	const subcommand = interaction.options.getSubcommand();
	const guildId = interaction.guildId;
	const locale = interaction.locale || 'en';

	if (!guildId) {
		await interaction.reply({ content: 'This command can only be used in a server.', flags: MessageFlags.Ephemeral });
		return;
	}

	if (subcommand === 'add') {
		const role = interaction.options.getRole('role', true);
		
		const existing = await db.staffRole.findFirst({
			where: { guildId, roleId: role.id }
		});

		if (existing) {
			await interaction.reply({ 
				content: t('config_staff_already_exists', locale, { roleName: role.name }), 
				flags: MessageFlags.Ephemeral 
			});
			return;
		}

		await db.staffRole.create({
			data: { guildId, roleId: role.id }
		});

		await interaction.reply({ 
			content: t('config_staff_add_success', locale, { roleName: role.name }), 
			flags: MessageFlags.Ephemeral 
		});
	} else if (subcommand === 'remove') {
		const role = interaction.options.getRole('role', true);

		const existing = await db.staffRole.findFirst({
			where: { guildId, roleId: role.id }
		});

		if (!existing) {
			await interaction.reply({ 
				content: t('config_staff_not_found', locale, { roleName: role.name }), 
				flags: MessageFlags.Ephemeral 
			});
			return;
		}

		await db.staffRole.delete({
			where: { id: existing.id }
		});

		await interaction.reply({ 
			content: t('config_staff_remove_success', locale, { roleName: role.name }), 
			flags: MessageFlags.Ephemeral 
		});
	} else if (subcommand === 'list') {
		const roles = await db.staffRole.findMany({
			where: { guildId }
		});

		if (roles.length === 0) {
			await interaction.reply({ 
				content: t('config_staff_list_empty', locale), 
				flags: MessageFlags.Ephemeral 
			});
			return;
		}

		const roleList = roles.map(r => `<@&${r.roleId}>`).join('\n');
		
		const embed = new EmbedBuilder()
			.setTitle(t('config_staff_list_title', locale))
			.setDescription(roleList)
			.setColor(0x0099FF);

		await interaction.reply({
			embeds: [embed],
			flags: MessageFlags.Ephemeral
		});
	}
}
