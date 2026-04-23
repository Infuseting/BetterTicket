import { Client, GatewayIntentBits, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalActionRowComponentBuilder } from 'discord.js';
import dotenv from 'dotenv';
import * as ping from './commands/ping';
import * as config from './commands/config';
import * as setup from './commands/setup';
import { t } from './i18n';

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === 'open_ticket') {
      const modal = new ModalBuilder()
        .setCustomId('ticket_modal')
        .setTitle(t('ticket_modal_title', interaction.locale));

      const subjectInput = new TextInputBuilder()
        .setCustomId('ticket_subject')
        .setLabel(t('ticket_subject_label', interaction.locale))
        .setPlaceholder(t('ticket_subject_placeholder', interaction.locale))
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const descriptionInput = new TextInputBuilder()
        .setCustomId('ticket_description')
        .setLabel(t('ticket_description_label', interaction.locale))
        .setPlaceholder(t('ticket_description_placeholder', interaction.locale))
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(subjectInput);
      const secondActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(descriptionInput);

      modal.addComponents(firstActionRow, secondActionRow);

      await interaction.showModal(modal);
      return;
    }
  }

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
