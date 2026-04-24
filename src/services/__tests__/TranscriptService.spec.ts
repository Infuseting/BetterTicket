import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TranscriptService } from '../TranscriptService';
import { TextChannel, Collection } from 'discord.js';

describe('TranscriptService', () => {
  let transcriptService: TranscriptService;

  beforeEach(() => {
    transcriptService = new TranscriptService();
  });

  it('should generate a transcript buffer for a given channel', async () => {
    const mockMessages = new Collection<string, any>([
      ['1', { 
        id: '1',
        content: 'Hello', 
        author: { tag: 'User1#0001' }, 
        createdAt: new Date(2024, 0, 1, 10, 0, 0),
        attachments: new Collection()
      }],
      ['2', { 
        id: '2',
        content: 'World', 
        author: { tag: 'User2#0002' }, 
        createdAt: new Date(2024, 0, 1, 10, 0, 1),
        attachments: new Collection()
      }],
    ]);

    const mockChannel = {
      name: 'test-channel',
      messages: {
        fetch: vi.fn().mockResolvedValueOnce(mockMessages),
      },
    } as unknown as TextChannel;

    const result = await transcriptService.generate(mockChannel);

    expect(result).toBeInstanceOf(Buffer);
    const htmlContent = result.toString();
    expect(htmlContent).toContain('Transcript for #test-channel');
    expect(htmlContent).toContain('Hello');
    expect(htmlContent).toContain('World');
    expect(htmlContent).toContain('User1#0001');
    expect(htmlContent).toContain('User2#0002');
  });

  it('should escape HTML content', async () => {
    const mockMessages = new Collection<string, any>([
      ['1', { 
        id: '1',
        content: '<script>alert("xss")</script>', 
        author: { tag: 'Attacker#0001' }, 
        createdAt: new Date(),
        attachments: new Collection()
      }],
    ]);

    const mockChannel = {
      name: 'xss-channel',
      messages: {
        fetch: vi.fn().mockResolvedValueOnce(mockMessages),
      },
    } as unknown as TextChannel;

    const result = await transcriptService.generate(mockChannel);
    const htmlContent = result.toString();

    expect(htmlContent).not.toContain('<script>');
    expect(htmlContent).toContain('&lt;script&gt;');
  });

  it('should parse mentions', async () => {
    const mockMessages = new Collection<string, any>([
      ['1', { 
        id: '1',
        content: 'Hello <@123>, <@&456>, <#789>', 
        author: { tag: 'User#0001' }, 
        createdAt: new Date(),
        attachments: new Collection()
      }],
    ]);

    const mockChannel = {
      name: 'mention-channel',
      messages: {
        fetch: vi.fn().mockResolvedValueOnce(mockMessages),
      },
    } as unknown as TextChannel;

    const result = await transcriptService.generate(mockChannel);
    const htmlContent = result.toString();

    expect(htmlContent).toContain('bg-[#5865F2]/10'); // User mention style
    expect(htmlContent).toContain('@123');
    expect(htmlContent).toContain('bg-[#43B581]/10'); // Role mention style
    expect(htmlContent).toContain('@456');
    expect(htmlContent).toContain('#789');
  });

  it('should render image attachments', async () => {
    const mockAttachments = new Collection<string, any>([
      ['a1', { 
        url: 'https://example.com/image.png', 
        contentType: 'image/png',
        name: 'image.png'
      }],
    ]);

    const mockMessages = new Collection<string, any>([
      ['1', { 
        id: '1',
        content: 'Look at this!', 
        author: { tag: 'User#0001' }, 
        createdAt: new Date(),
        attachments: mockAttachments
      }],
    ]);

    const mockChannel = {
      name: 'image-channel',
      messages: {
        fetch: vi.fn().mockResolvedValueOnce(mockMessages),
      },
    } as unknown as TextChannel;

    const result = await transcriptService.generate(mockChannel);
    const htmlContent = result.toString();

    expect(htmlContent).toContain('<img src="https://example.com/image.png"');
  });

  it('should fetch more than 100 messages (pagination)', async () => {
    const firstBatch = new Collection<string, any>();
    for (let i = 0; i < 100; i++) {
      firstBatch.set(`id-${i}`, { 
        id: `id-${i}`, 
        content: `Msg ${i}`, 
        author: { tag: 'User' }, 
        createdAt: new Date(i * 1000),
        attachments: new Collection()
      });
    }

    const secondBatch = new Collection<string, any>([
      ['id-100', { 
        id: 'id-100', 
        content: 'Msg 100', 
        author: { tag: 'User' }, 
        createdAt: new Date(100 * 1000),
        attachments: new Collection()
      }]
    ]);

    const mockChannel = {
      name: 'pagination-channel',
      messages: {
        fetch: vi.fn()
          .mockResolvedValueOnce(firstBatch)
          .mockResolvedValueOnce(secondBatch)
          .mockResolvedValueOnce(new Collection()), // End of messages
      },
    } as unknown as TextChannel;

    const result = await transcriptService.generate(mockChannel);
    const htmlContent = result.toString();

    expect(htmlContent).toContain('Msg 0');
    expect(htmlContent).toContain('Msg 99');
    expect(htmlContent).toContain('Msg 100');
    expect(mockChannel.messages.fetch).toHaveBeenCalledTimes(2);
  });
});
