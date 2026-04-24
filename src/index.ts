import { Client, GatewayIntentBits, Events, MessageFlags } from 'discord.js';
import dotenv from 'dotenv';
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
    if (interaction.isChatInputCommand()) {
      await interactionManager.handleCommand(interaction);
    } else if (interaction.isButton()) {
      await interactionManager.handleButton(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await interactionManager.handleSelect(interaction);
    }
  } catch (error) {
    console.error('Interaction error:', error);
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
