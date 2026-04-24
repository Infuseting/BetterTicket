# Rotating Status System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a dynamic presence management system for the BetterTicket bot that rotates through various statistics and help messages every 15 seconds.

**Architecture:** Encapsulate the presence logic in a `PresenceService` class. Initialize it in the `ClientReady` event. Use `setInterval` for the rotation.

**Tech Stack:** discord.js, TypeScript, vitest

---

### Task 1: Create PresenceService

**Files:**
- Create: `src/services/PresenceService.ts`
- Create: `src/services/__tests__/PresenceService.spec.ts`

- [ ] **Step 1: Write the failing test for PresenceService**

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/services/__tests__/PresenceService.spec.ts`
Expected: FAIL (File not found or class not defined)

- [ ] **Step 3: Implement PresenceService**

```typescript
import { Client, ActivityType } from 'discord.js';
import packageJson from '../../package.json';

export class PresenceService {
  private interval: NodeJS.Timeout | null = null;
  private currentIndex = 0;

  start(client: Client) {
    this.updatePresence(client);
    this.interval = setInterval(() => {
      this.currentIndex++;
      this.updatePresence(client);
    }, 15000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private updatePresence(client: Client) {
    if (!client.user) return;

    const guildCount = client.guilds.cache.size;
    const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const version = packageJson.version;

    const activities = [
      { name: `${guildCount} servers`, type: ActivityType.Playing },
      { name: `${userCount} users`, type: ActivityType.Watching },
      { name: `v${version}`, type: ActivityType.Playing },
      { name: `/setup to start`, type: ActivityType.Listening },
    ];

    const activity = activities[this.currentIndex % activities.length];
    client.user.setPresence({
      activities: [activity],
      status: 'online',
    });
  }
}

export const presenceService = new PresenceService();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/services/__tests__/PresenceService.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/PresenceService.ts src/services/__tests__/PresenceService.spec.ts
git commit -m "feat: add PresenceService with rotating status"
```

---

### Task 2: Integrate PresenceService in index.ts

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Import and start PresenceService in ClientReady event**

```typescript
// Add import
import { presenceService } from './services/PresenceService';

// In client.once(Events.ClientReady, ...)
client.once(Events.ClientReady, async (c) => {
  await interactionManager.loadInteractions();
  presenceService.start(c); // Add this
  console.log(`Ready! Logged in as ${c.user.tag}`);
});
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: Success

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: integrate PresenceService in index.ts"
```
