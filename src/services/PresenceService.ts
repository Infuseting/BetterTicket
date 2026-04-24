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
