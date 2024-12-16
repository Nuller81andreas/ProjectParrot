const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const config = await db.get(`welcome_${member.guild.id}`);
        if (!config || !config.enabled) return;

        const channel = member.guild.channels.cache.get(config.channelId);
        if (!channel) return;

        const welcomeMessage = (config.message || 'Welcome {user} to our community!')
            .replace('{user}', member.toString());

        const welcomeEmbed = new EmbedBuilder()
            .setTitle('🏰 Welcome to The Haunting Grounds!')
            .setDescription(welcomeMessage)
            .addFields(
                {
                    name: '📜 Getting Started',
                    value: 'As you step into this enigmatic space, we kindly ask that you take a moment to familiarize yourself with our rules and regulations.'
                },
                {
                    name: '🤝 Community Values',
                    value: 'Respect for one another is paramount, ensuring a safe and enjoyable environment for all.'
                },
                {
                    name: '✨ Let\'s Begin',
                    value: 'Let\'s create memorable experiences together while keeping the spirit of The Haunting Grounds alive!'
                }
            )
            .setColor('#800080')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ 
                text: member.guild.name,
                iconURL: member.guild.iconURL({ dynamic: true })
            });

        await channel.send({
            content: config.useMention ? `${member} joined the server!` : null,
            embeds: config.useEmbed ? [welcomeEmbed] : []
        });
    }
}; 