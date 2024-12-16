const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

class PremiumSystem {
    static async isPremium(guildId) {
        const premiumData = await db.get(`premium_${guildId}`);
        if (!premiumData) return false;
        
        return premiumData.active && premiumData.expiresAt > Date.now();
    }

    static async getPremiumData(guildId) {
        return await db.get(`premium_${guildId}`);
    }

    static async addPremium(guildId, duration, activatedBy) {
        const expiresAt = Date.now() + (duration * 24 * 60 * 60 * 1000); // Convert days to milliseconds
        
        const premiumData = {
            active: true,
            activatedAt: Date.now(),
            expiresAt: expiresAt,
            activatedBy: activatedBy,
            tier: 1,
            features: [
                'increased_limits',
                'custom_colors',
                'premium_support',
                'advanced_logging',
                'custom_embeds'
            ]
        };

        await db.set(`premium_${guildId}`, premiumData);
        return premiumData;
    }

    static async removePremium(guildId) {
        await db.delete(`premium_${guildId}`);
    }

    static async checkExpiry(client) {
        const guilds = client.guilds.cache;
        
        for (const [id, guild] of guilds) {
            const premiumData = await this.getPremiumData(id);
            if (!premiumData || !premiumData.active) continue;

            // Check if premium has expired
            if (premiumData.expiresAt <= Date.now()) {
                premiumData.active = false;
                await db.set(`premium_${id}`, premiumData);

                // Notify guild
                const systemChannel = guild.systemChannel;
                if (systemChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle('Premium Status Update')
                        .setDescription('⚠️ Your premium subscription has expired!')
                        .setColor('#FF0000')
                        .addFields([
                            { 
                                name: 'Want to renew?', 
                                value: 'Contact our support team or visit our website.' 
                            }
                        ])
                        .setTimestamp();

                    await systemChannel.send({ embeds: [embed] }).catch(() => {});
                }
            }
        }
    }

    static getPremiumFeatures() {
        return {
            'increased_limits': {
                name: 'Increased Limits',
                description: 'Higher limits for various bot features',
                tier: 1
            },
            'custom_colors': {
                name: 'Custom Colors',
                description: 'Use custom colors in embeds',
                tier: 1
            },
            'premium_support': {
                name: 'Priority Support',
                description: 'Get priority support in our support server',
                tier: 1
            },
            'advanced_logging': {
                name: 'Advanced Logging',
                description: 'Access to advanced logging features',
                tier: 1
            },
            'custom_embeds': {
                name: 'Custom Embeds',
                description: 'Create fully customized embeds',
                tier: 1
            }
        };
    }
}

module.exports = PremiumSystem; 