import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, MessageFlags } from 'discord.js';
import { db } from '../db';
import { t } from '../i18n';
import { CommandHandler } from '../core/BaseHandler';

export default class ConfigStaffCommand implements CommandHandler {
	data = new SlashCommandBuilder()
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
		) as SlashCommandBuilder;

	async execute(interaction: ChatInputCommandInteraction) {
		const action = interaction.options.getString('action', true);
		const role = interaction.options.getRole('role');
		const guildId = interaction.guildId;
		const locale = interaction.locale || 'en';

		if (!guildId) {
			await interaction.reply({ content: 'This command can only be used in a server.', flags: MessageFlags.Ephemeral });
			return;
		}

		// Defer immediately to give us more time (3s -> 15min)
		try {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		} catch (error) {
			console.error('Failed to defer config command:', error);
			return;
		}

		try {
			if (action === 'add') {
				if (!role) {
					await interaction.editReply({ content: 'Please specify a role to add.' });
					return;
				}
				
				const existing = await db.staffRole.findFirst({
					where: { guildId, roleId: role.id }
				});

				if (existing) {
					await interaction.editReply({ 
						content: t('config_staff_already_exists', locale, { roleName: role.name })
					});
					return;
				}

				await db.staffRole.create({
					data: { guildId, roleId: role.id }
				});

				await interaction.editReply({ 
					content: t('config_staff_add_success', locale, { roleName: role.name })
				});
			} else if (action === 'remove') {
				if (!role) {
					await interaction.editReply({ content: 'Please specify a role to remove.' });
					return;
				}

				const existing = await db.staffRole.findFirst({
					where: { guildId, roleId: role.id }
				});

				if (!existing) {
					await interaction.editReply({ 
						content: t('config_staff_not_found', locale, { roleName: role.name })
					});
					return;
				}

				await db.staffRole.delete({
					where: { id: existing.id }
				});

				await interaction.editReply({ 
					content: t('config_staff_remove_success', locale, { roleName: role.name })
				});
			} else if (action === 'list') {
				const roles = await db.staffRole.findMany({
					where: { guildId }
				});

				if (roles.length === 0) {
					await interaction.editReply({ 
						content: t('config_staff_list_empty', locale)
					});
					return;
				}

				const roleList = roles.map(r => `<@&${r.roleId}>`).join('\n');
				
				const embed = new EmbedBuilder()
					.setTitle(t('config_staff_list_title', locale))
					.setDescription(roleList)
					.setColor(0x0099FF);

				await interaction.editReply({
					embeds: [embed]
				});
			}
		} catch (error) {
			console.error('Error in config-staff command:', error);
			try {
				await interaction.editReply({ content: 'An error occurred while executing the command.' });
			} catch (innerError) {
				console.error('Failed to send error message:', innerError);
			}
		}
	}
}
