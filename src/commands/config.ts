import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, MessageFlags } from 'discord.js';
import { db } from '../db';
import { t } from '../i18n';

export const data = new SlashCommandBuilder()
	.setName('config-staff')
	.setDescription('Manage staff roles for tickets')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addStringOption(option =>
		option.setName('action')
			.setDescription('The action to perform')
			.setRequired(true)
			.addChoices(
				{ name: 'Add', value: 'add' },
				{ name: 'Remove', value: 'remove' },
				{ name: 'List', value: 'list' }
			)
	)
	.addRoleOption(option => 
		option.setName('role')
			.setDescription('The role to add or remove (not needed for list)')
			.setRequired(false)
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	const action = interaction.options.getString('action', true);
	const role = interaction.options.getRole('role');
	const guildId = interaction.guildId;
	const locale = interaction.locale || 'en';

	if (!guildId) {
		await interaction.reply({ content: 'This command can only be used in a server.', flags: MessageFlags.Ephemeral });
		return;
	}

	try {
		if (action === 'add') {
			if (!role) {
				await interaction.reply({ content: 'Please specify a role to add.', flags: MessageFlags.Ephemeral });
				return;
			}
			
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
		} else if (action === 'remove') {
			if (!role) {
				await interaction.reply({ content: 'Please specify a role to remove.', flags: MessageFlags.Ephemeral });
				return;
			}

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
		} else if (action === 'list') {
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
	} catch (error) {
		console.error('Error in config-staff command:', error);
		await interaction.reply({ content: 'An error occurred while executing the command.', flags: MessageFlags.Ephemeral });
	}
}
