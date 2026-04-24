import { TextChannel, Guild, User, PermissionFlagsBits, ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Locale } from 'discord.js';
import { db } from '../db';
import { t } from '../i18n';

export class TicketService {
  async getTicketByChannel(channelId: string) {
    return db.ticket.findUnique({ where: { channelId } });
  }

  async createTicket(user: User, guild: Guild, subject: string, description: string, locale: Locale, categoryId: string) {
    const category = await db.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const permissionOverwrites: any[] = [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
      {
        id: category.roleId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      }
    ];

    const channel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites
    });

    await db.ticket.create({
      data: {
        channelId: channel.id,
        authorId: user.id,
        guildId: guild.id,
        subject,
        description,
        status: 'OPEN',
        locale,
        categoryId: category.id
      }
    });

    const welcomeEmbed = new EmbedBuilder()
      .setTitle(t('ticket_welcome_title', locale, { subject }))
      .addFields(
        { name: t('ticket_subject_label', locale), value: subject },
        { name: t('ticket_description_label', locale), value: description }
      )
      .setColor(0x00FF00);

    const closeButton = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel(t('ticket_close_button_label', locale))
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);
    const staffPing = `<@&${category.roleId}>`;

    await channel.send({
      content: `<@${user.id}> ${staffPing}`,
      embeds: [welcomeEmbed],
      components: [row]
    });

    return channel;
  }

  async closeTicket(channel: TextChannel, ticket: any, closedBy: string) {
    await db.ticket.update({
      where: { channelId: channel.id },
      data: { status: 'CLOSED' }
    });

    await channel.permissionOverwrites.edit(ticket.authorId, {
      ViewChannel: false,
      SendMessages: false
    });
  }

  async reopenTicket(channel: TextChannel, ticket: any) {
    await db.ticket.update({
      where: { channelId: channel.id },
      data: { status: 'OPEN' }
    });

    await channel.permissionOverwrites.edit(ticket.authorId, {
      ViewChannel: true,
      SendMessages: true
    });
  }

  async archiveTicket(channel: TextChannel) {
    await db.ticket.update({
      where: { channelId: channel.id },
      data: { status: 'ARCHIVED' }
    });
    await channel.delete();
  }
}

export const ticketService = new TicketService();
