import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import * as ping from './commands/ping';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
	console.error('Missing DISCORD_TOKEN or CLIENT_ID in environment variables');
	process.exit(1);
}

const commands = [
	ping.data.toJSON(),
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();
