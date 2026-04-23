import { Client, GatewayIntentBits, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalActionRowComponentBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import dotenv from 'dotenv';
import * as ping from './commands/ping';
import * as config from './commands/config';
import * as setup from './commands/setup';
import { t } from './i18n';
import { db } from './db';

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

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'ticket_modal') {
      await interaction.deferReply({ ephemeral: true });

      const subject = interaction.fields.getTextInputValue('ticket_subject');
      const description = interaction.fields.getTextInputValue('ticket_description');
      const guild = interaction.guild;

      if (!guild) return;

      // Get staff role from DB
      const config = await db.guildConfig.findUnique({
        where: { guildId: guild.id }
      });

      const staffRoleId = config?.staffRoleId;

      // Permissions
      const permissionOverwrites: any[] = [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        }
      ];

      if (staffRoleId) {
        permissionOverwrites.push({
          id: staffRoleId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        });
      }

      // Create channel
      const channel = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites
      });

      // Save to DB
      await db.ticket.create({
        data: {
          channelId: channel.id,
          authorId: interaction.user.id,
          guildId: guild.id,
          subject,
          description,
          status: 'OPEN',
          locale: interaction.locale
        }
      });

      // Send Welcome Message
      const welcomeEmbed = new EmbedBuilder()
        .setTitle(t('ticket_welcome_title', interaction.locale, { subject }))
        .addFields(
          { name: t('ticket_subject_label', interaction.locale), value: subject },
          { name: t('ticket_description_label', interaction.locale), value: description }
        )
        .setColor(0x00FF00);

      const closeButton = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel(t('ticket_close_button_label', interaction.locale))
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);

      await channel.send({
        content: `<@${interaction.user.id}> ${staffRoleId ? `<@&${staffRoleId}>` : ''}`,
        embeds: [welcomeEmbed],
        components: [row]
      });

      await interaction.editReply({
        content: t('ticket_created_success', interaction.locale, { channel: `<#${channel.id}>` })
      });
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
