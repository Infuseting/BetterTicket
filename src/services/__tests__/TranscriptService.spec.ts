import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TranscriptService } from '../TranscriptService';
import { TextChannel, Collection, Message } from 'discord.js';

describe('TranscriptService', () => {
  let transcriptService: TranscriptService;

  beforeEach(() => {
    transcriptService = new TranscriptService();
  });

  it('should generate a transcript buffer for a given channel', async () => {
    const mockMessages = new Collection<string, any>([
      ['1', { content: 'Hello', author: { tag: 'User1#0001' }, createdAt: new Date(2024, 0, 1, 10, 0, 0) }],
      ['2', { content: 'World', author: { tag: 'User2#0002' }, createdAt: new Date(2024, 0, 1, 10, 0, 1) }],
    ]);

    const mockChannel = {
      name: 'test-channel',
      messages: {
        fetch: vi.fn().mockResolvedValue(mockMessages),
      },
    } as unknown as TextChannel;

    const result = await transcriptService.generate(mockChannel);

    expect(result).toBeInstanceOf(Buffer);
    const htmlContent = result.toString();
    expect(htmlContent).toContain('test-channel');
    expect(htmlContent).toContain('Hello');
    expect(htmlContent).toContain('World');
    expect(htmlContent).toContain('User1#0001');
    expect(htmlContent).toContain('User2#0002');
    expect(mockChannel.messages.fetch).toHaveBeenCalledWith({ limit: 100 });
  });

  it('should sort messages by creation date', async () => {
    const date1 = new Date(2024, 0, 1, 10, 0, 0);
    const date2 = new Date(2024, 0, 1, 10, 0, 1);
    const date3 = new Date(2024, 0, 1, 10, 0, 2);

    const mockMessages = new Collection<string, any>([
      ['2', { content: 'Second', author: { tag: 'U2' }, createdAt: date2 }],
      ['3', { content: 'Third', author: { tag: 'U3' }, createdAt: date3 }],
      ['1', { content: 'First', author: { tag: 'U1' }, createdAt: date1 }],
    ]);

    const mockChannel = {
      name: 'sort-test',
      messages: {
        fetch: vi.fn().mockResolvedValue(mockMessages),
      },
    } as unknown as TextChannel;

    const result = await transcriptService.generate(mockChannel);
    const htmlContent = result.toString();

    const firstIndex = htmlContent.indexOf('First');
    const secondIndex = htmlContent.indexOf('Second');
    const thirdIndex = htmlContent.indexOf('Third');

    expect(firstIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(thirdIndex);
  });
});
