import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { Player } from 'discord-player';
import { YouTubeExtractor } from 'discord-player-youtubei';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        // Add other intents you need
    ]
});

const player = new Player(client);
player.extractors.register(YouTubeExtractor, {});

// ... rest of your bot code ...

client.login(process.env.BOT_TOKEN); 