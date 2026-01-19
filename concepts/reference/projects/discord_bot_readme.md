# Geoguessr Leaderboard Discord Bot

Parses messages from a configured channel to track Geoguessr user stats, saving to a JSON file. Provides slash commands to view leaderboards, user stats, and manage data backups.

## Setup

1. Node.js 18+ is required.
2. Enable "Message Content Intent" in your Discord application settings.
3. Edit `src/bot.js` and configure the hardwired secrets:
   - `token`: Bot token from Discord Developer Portal
   - `clientId`: Application client ID
   - `guildId`: Guild ID for command registration
   - `CHANNEL_ID`: Channel ID where the tampermonkey script posts messages
   - Webhook URLs (optional): For alerts and logging
4. Install dependencies:

```bash
npm install
```

5. Start the bot:

```bash
npm start
```

The bot will automatically register slash commands on startup.

## Message Format

Expected message content:
```
19:45 / 12.01.2026
L-ID: user_j6r403i6zk
User: Player
Game Mode: /multiplayer
Feature: discordWebhook
https://www.geoguessr.com/en/user/69569caeb0408fc716479b87
```

Supported game mode mappings:
- `/game/` → singleplayer
- `/challenge/` → singleplayer
- `/operagx/` → singleplayer
- `/battle-royale/` → multiplayer
- `/duels/` → multiplayer
- `/team-duels/` → multiplayer
- `/live-challenge/` → multiplayer
- `/multiplayer` → multiplayer

## Commands

### Public Commands

- `/top` – Show top 5 overall users (sorted by total mode counts). Displays Singleplayer, Multiplayer, Favorite Feature, and Last Use. Supports pagination.
- `/stats query:<username|L-ID>` – Show stats for a user. If multiple users share the same name, the bot will prompt with a dropdown to select `Name | L-ID`. Shows modes, features, and usage details.
- `/feature feature:<openGM|openPlonkIT|locationDisplay|tts|discordWebhook>` – Show top 5 users for a specific feature count. Supports pagination.
- `/mode mode:<classic|challenge|operagx|battle-royale|duels|team-duels|live-challenge|multiplayer>` – Show top 5 users for the chosen sub-mode. Supports pagination.
- `/info` – Show bot statistics: total users, total uses, singleplayer/multiplayer totals, data file size, and bot ping.
Features

- **Automatic Message Processing**: Watches configured channel for webhook messages and parses user data automatically
- **Multi-Account Detection**: Tracks GeoGuessr UUIDs and L-IDs to identify account networks and shared accounts
- **Auto-Backup System**: Creates backups every 30 minutes with differential tracking
- **Reset Detection**: Automatically detects data resets and restores from backup
- **Webhook Alerts**: Sends alerts for:
  - Alt accounts (shared UUIDs)
  - Account switches (same L-ID, different UUID)
  - New users
  - Command usage
  - Backup operations
- **Pagination**: All leaderboard commands support multi-page navigation
- **Flexible Search**: Query users by name or L-ID with disambiguation for duplicate names

## Data Files

Stats are stored in `data/leaderboard.json` with automatic backups in `data/leaderboard-backup.json`.

Structure per user:
```json
{
  "id": "user_j6r403i6zk",
  "name": "Player",
  "modes": { "singleplayer": 0, "multiplayer": 0 },
  "subModes": {
    "game": 0,
    "challenge": 0,
    "operagx": 0,. Command registration happens automatically on bot startup.
- The bot processes messages from the configured `CHANNEL_ID` only.
- Webhook messages are accepted; regular bot messages are ignored.
- Messages are automatically marked with ✅ when processed successfully.
- Backups run every 30 minutes and include differential tracking.
- All admin commands are restricted to users with Administrator permissions.

## Architecture

- `src/bot.js` - Main bot logic, command handlers, and event listeners
- `src/dataStore.js` - Data persistence, backup management, webhook alerts
- `src/parser.js` - Message parsing and data extraction
- `data/leaderboard.json` - Main data file
- `data/leaderboard-backup.json` - Auto-backup file01-12T19:45:00.000Z" }
  ]iplayer": 0 },
  "subModes": {
    "game": 0,
    "challenge": 0,
    "operagx": 0,
    "battle-royale": 0,
    "duels": 0,
    "team-duels": 0,
    "live-challenge": 0,
    "multiplayer": 0
  },
  "features": { "discordWebhook": 3 },
  "profileUrl": "https://www.geoguessr.com/en/user/...",
  "lastUpdateAt": "2026-01-12T19:45:00.000Z"
}
```

## Notes

- Commands are registered to a single guild for development. Switch to global registration in `src/register.js` if needed (propagation may take up to an hour).
- The bot only parses messages from the configured `CHANNEL_ID`.

## Hosting on fps.ms

Adjust these steps to your fps.ms plan:

- Ensure Node.js 18+ is available.
- Set environment variables (`DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, `CHANNEL_ID`).
- Install dependencies and run the bot as a persistent service.

Example run commands:
```bash
npm ci
npm run register
npm start
```

If fps.ms supports process managers, use one to keep the bot running (e.g., `pm2 start npm --name geoguessr-bot -- start`). Ensure the `data/` folder is writable and persisted across restarts.