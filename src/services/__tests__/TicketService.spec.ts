import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ticketService } from '../TicketService';
import { db } from '../../db';
import { TextChannel } from 'discord.js';

vi.mock('../../db', () => ({
  db: {
    ticket: {
      findUnique: vi.fn(),
      update: vi.fn()
    }
  }
}));

describe('TicketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a ticket by channel ID', async () => {
    const mockTicket = { channelId: '123', authorId: '456' };
    (db.ticket.findUnique as any).mockResolvedValue(mockTicket);

    const result = await ticketService.getTicketByChannel('123');
    expect(db.ticket.findUnique).toHaveBeenCalledWith({ where: { channelId: '123' } });
    expect(result).toEqual(mockTicket);
  });

  it('should close a ticket', async () => {
    const mockChannel = {
      id: '123',
      permissionOverwrites: {
        edit: vi.fn()
      }
    } as unknown as TextChannel;
    const mockTicket = { authorId: '456' };

    await ticketService.closeTicket(mockChannel, mockTicket, '789');

    expect(db.ticket.update).toHaveBeenCalledWith({
      where: { channelId: '123' },
      data: { status: 'CLOSED' }
    });
    expect(mockChannel.permissionOverwrites.edit).toHaveBeenCalledWith('456', {
      ViewChannel: false,
      SendMessages: false
    });
  });

  it('should reopen a ticket', async () => {
    const mockChannel = {
      id: '123',
      permissionOverwrites: {
        edit: vi.fn()
      }
    } as unknown as TextChannel;
    const mockTicket = { authorId: '456' };

    await ticketService.reopenTicket(mockChannel, mockTicket);

    expect(db.ticket.update).toHaveBeenCalledWith({
      where: { channelId: '123' },
      data: { status: 'OPEN' }
    });
    expect(mockChannel.permissionOverwrites.edit).toHaveBeenCalledWith('456', {
      ViewChannel: true,
      SendMessages: true
    });
  });

  it('should archive a ticket', async () => {
    const mockChannel = {
      id: '123',
      delete: vi.fn()
    } as unknown as TextChannel;

    await ticketService.archiveTicket(mockChannel);

    expect(db.ticket.update).toHaveBeenCalledWith({
      where: { channelId: '123' },
      data: { status: 'ARCHIVED' }
    });
    expect(mockChannel.delete).toHaveBeenCalled();
  });
});
