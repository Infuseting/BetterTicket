import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CommandHandler } from '../core/BaseHandler';

export default class PingCommand implements CommandHandler {
	data = new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!');

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('Pong!');
	}
}
