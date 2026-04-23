import { TextChannel } from 'discord.js';
import { db } from '../db';

export class TicketService {
  async getTicketByChannel(channelId: string) {
    return db.ticket.findUnique({ where: { channelId } });
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
