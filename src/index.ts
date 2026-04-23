import { Client, GatewayIntentBits, Events } from 'discord.js';
import dotenv from 'dotenv';
import * as ping from './commands/ping';
import * as config from './commands/config';
import * as setup from './commands/setup';

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    if (commandName === ping.data.name) {
      await ping.execute(interaction);
    } else if (commandName === config.data.name) {
      await config.execute(interaction);
    } else if (commandName === setup.data.name) {
      await setup.execute(interaction);
    }
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
