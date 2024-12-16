const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageDelete',
    async execute(message, client) {
        if (message.author?.bot) return;

        // Get log channel from config/database
        const logChannel = message.guild.channels.cache.get('LOG_CHANNEL_ID');
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle('Message Deleted')
            .setColor('#FF0000')
            .addFields(
                { name: 'Author', value: message.author?.tag ?? 'Unknown' },
                { name: 'Channel', value: message.channel.toString() },
                { name: 'Content', value: message.content || 'No content' }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    }
}; 