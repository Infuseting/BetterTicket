import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, MessageFlags } from 'discord.js';
import { db } from '../db';
import { t } from '../i18n';
import { CommandHandler } from '../core/BaseHandler';

export default class ConfigCategoryCommand implements CommandHandler {
	data = new SlashCommandBuilder()
		.setName('config-category')
		.setDescription('Manage ticket categories')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a new ticket category')
				.addStringOption(option => 
					option.setName('name')
						.setDescription('The name of the category')
						.setRequired(true)
				)
				.addStringOption(option =>
					option.setName('emoji')
						.setDescription('The emoji for the category')
						.setRequired(true)
				)
				.addRoleOption(option =>
					option.setName('role')
						.setDescription('The staff role for this category')
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Remove a ticket category')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('The name of the category to remove')
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List all ticket categories')
		);

	async execute(interaction: ChatInputCommandInteraction) {
		const subcommand = interaction.options.getSubcommand();
		const guildId = interaction.guildId;
		const locale = interaction.locale || 'en';

		if (!guildId) {
			await interaction.reply({ content: 'This command can only be used in a server.', flags: MessageFlags.Ephemeral });
			return;
		}

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		try {
			if (subcommand === 'add') {
				const name = interaction.options.getString('name', true);
				const emoji = interaction.options.getString('emoji', true);
				const role = interaction.options.getRole('role', true);

				await db.category.create({
					data: {
						name,
						emoji,
						roleId: role.id,
						guildId
					}
				});

				await interaction.editReply({
					content: t('category_added', locale, { name })
				});
			} else if (subcommand === 'remove') {
				const name = interaction.options.getString('name', true);

				const category = await db.category.findFirst({
					where: { guildId, name }
				});

				if (!category) {
					await interaction.editReply({
						content: t('category_not_found', locale)
					});
					return;
				}

				await db.category.delete({
					where: { id: category.id }
				});

				await interaction.editReply({
					content: t('category_removed', locale, { name })
				});
			} else if (subcommand === 'list') {
				const categories = await db.category.findMany({
					where: { guildId }
				});

				if (categories.length === 0) {
					await interaction.editReply({
						content: t('no_categories', locale)
					});
					return;
				}

				const embed = new EmbedBuilder()
					.setTitle(t('category_list_title', locale))
					.setColor(0x0099FF)
					.setDescription(
						categories.map(c => `${c.emoji} **${c.name}** - Staff: <@&${c.roleId}>`).join('\n')
					);

				await interaction.editReply({
					embeds: [embed]
				});
			}
		} catch (error) {
			console.error('Error in config-category command:', error);
			await interaction.editReply({
				content: 'An error occurred while executing the command.'
			});
		}
	}
}
