import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PresenceService } from '../PresenceService';
import { Client, ActivityType } from 'discord.js';

describe('PresenceService', () => {
  let presenceService: PresenceService;
  let mockClient: any;

  beforeEach(() => {
    presenceService = new PresenceService();
    mockClient = {
      user: {
        setPresence: vi.fn(),
      },
      guilds: {
        cache: {
          size: 5,
          reduce: vi.fn().mockReturnValue(100),
        },
      },
    };
    vi.useFakeTimers();
  });

  it('should start the rotation and set the first presence', () => {
    presenceService.start(mockClient as unknown as Client);
    expect(mockClient.user.setPresence).toHaveBeenCalled();
  });

  it('should change presence after 15 seconds', () => {
    presenceService.start(mockClient as unknown as Client);
    const firstCall = mockClient.user.setPresence.mock.calls[0][0];
    
    vi.advanceTimersByTime(15000);
    
    const secondCall = mockClient.user.setPresence.mock.calls[1][0];
    expect(firstCall).not.toEqual(secondCall);
  });
});
