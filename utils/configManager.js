require('dotenv').config();
const { Collection } = require('discord.js');

class ConfigManager {
    constructor() {
        this.configs = new Collection();
        this.validateEnv();
    }

    validateEnv() {
        const required = ['BOT_TOKEN', 'CLIENT_ID', 'HEAD_DEVELOPER_ID'];
        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }

    getConfig(guildId) {
        return this.configs.get(guildId) || this.initGuild(guildId);
    }

    initGuild(guildId) {
        const defaultConfig = {
            // Your default guild config here
        };
        this.configs.set(guildId, defaultConfig);
        return defaultConfig;
    }
}

module.exports = new ConfigManager(); 