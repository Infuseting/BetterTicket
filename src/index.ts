import { Client, GatewayIntentBits, Events, MessageFlags } from 'discord.js';
import dotenv from 'dotenv';
import * as ping from './commands/ping';
import * as config from './commands/config';
import * as setup from './commands/setup';
import { interactionManager } from './core/InteractionManager';

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once(Events.ClientReady, async (c) => {
  await interactionManager.loadInteractions();
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isButton()) {
      await interactionManager.handleButton(interaction);
      return;
    }

    if (interaction.isModalSubmit()) {
      await interactionManager.handleModal(interaction);
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === ping.data.name) {
      await ping.execute(interaction);
    } else if (commandName === config.data.name) {
      await config.execute(interaction);
    } else if (commandName === setup.data.name) {
      await setup.execute(interaction);
    }
  } catch (error) {
    console.error('Interaction error:', error);
    
    // Don't crash the bot if error reporting fails
    try {
      if (interaction.isRepliable()) {
        const errorMessage = 'There was an error while executing this interaction!';
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral });
        } else {
          await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
        }
      }
    } catch (innerError) {
      console.error('Failed to send error message to user:', innerError);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
