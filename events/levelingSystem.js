const { Events } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

const cooldowns = new Map();

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const now = Date.now();
        const cooldownKey = `${message.guild.id}-${message.author.id}`;
        
        if (cooldowns.has(cooldownKey)) {
            const expirationTime = cooldowns.get(cooldownKey) + 60000; // 1 minute cooldown
            if (now < expirationTime) return;
        }

        cooldowns.set(cooldownKey, now);

        // Random XP between 15-25
        const xpToAdd = Math.floor(Math.random() * 11) + 15;
        const key = `xp_${message.guild.id}_${message.author.id}`;
        
        const currentXp = await db.get(key) || 0;
        const newXp = currentXp + xpToAdd;
        
        await db.set(key, newXp);

        // Calculate levels
        const currentLevel = Math.floor(0.1 * Math.sqrt(currentXp));
        const newLevel = Math.floor(0.1 * Math.sqrt(newXp));

        // Level up message
        if (newLevel > currentLevel) {
            message.channel.send(` Congratulations ${message.author}! You've reached level ${newLevel}!`)
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
        }
    },
}; 