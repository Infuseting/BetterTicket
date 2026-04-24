# Design Spec - Rotating Status System

Implementation of a dynamic presence management system for the BetterTicket bot to display real-time statistics and useful information to users.

## 1. Purpose
Enhance the bot's visibility and provide useful context (popularity, version, help commands) through a rotating status message in Discord.

## 2. Architecture
The system will be encapsulated in a dedicated service to follow SOLID principles and keep `index.ts` clean.

- **Service:** `PresenceService` (`src/services/PresenceService.ts`)
- **Trigger:** Initialized once in the `ClientReady` event.
- **Mechanism:** `setInterval` running every 15,000ms (15 seconds).

## 3. Data Sources
- **Guild Count:** `client.guilds.cache.size`
- **User Count:** `client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)`
- **Version:** Imported from `package.json`
- **Command Info:** Static string for `/setup`

## 4. Status Rotation
The service will cycle through the following messages:
1. `Playing {guildCount} servers`
2. `Watching {userCount} users`
3. `Playing v{version}`
4. `Listening /setup to start`

*Note: Types (Playing, Watching, Listening) will be adjusted to fit the content naturally.*

## 5. Implementation Details
- The service will handle potential errors during member count calculation.
- It will ensure the presence is updated immediately on start before the first interval.

## 6. Testing Strategy
- Verify the interval logic.
- Verify that statistics are correctly calculated from the client cache.
- Ensure the version is correctly read from `package.json`.
