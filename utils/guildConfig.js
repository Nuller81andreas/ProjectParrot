const { QuickDB } = require('quick.db');
const db = new QuickDB();

class GuildConfig {
    static async get(guildId) {
        return await db.get(`guild_${guildId}`) || await this.create(guildId);
    }

    static async create(guildId) {
        const defaultConfig = {
            prefix: '/',
            welcome: {
                enabled: false,
                channelId: null,
                message: 'Welcome {user} to our server!',
                useEmbed: true
            },
            logging: {
                enabled: false,
                channelId: null,
                events: ['message', 'member', 'mod']
            },
            automod: {
                enabled: false,
                filters: []
            },
            permissions: {
                adminRoles: [],
                modRoles: []
            }
        };

        await db.set(`guild_${guildId}`, defaultConfig);
        return defaultConfig;
    }

    static async update(guildId, updates) {
        const current = await this.get(guildId);
        const updated = { ...current, ...updates };
        await db.set(`guild_${guildId}`, updated);
        return updated;
    }

    static async delete(guildId) {
        await db.delete(`guild_${guildId}`);
    }
}

module.exports = GuildConfig; 