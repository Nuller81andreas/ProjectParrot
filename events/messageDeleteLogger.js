const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        // Ignore DMs and partial messages
        if (!message.guild || message.partial) return;

        // Find message-logs channel
        const logChannel = message.guild.channels.cache.find(c => c.name === 'message-logs');
        if (!logChannel) return;

        try {
            // Create delete log embed
            const logEmbed = new EmbedBuilder()
                .setTitle('🗑️ Message Deleted')
                .setDescription(`**Author:** ${message.author} (${message.author.tag})\n**Channel:** ${message.channel}`)
                .addFields([
                    {
                        name: 'Content',
                        value: message.content || 'No text content',
                    }
                ])
                .setColor(0xff0000)
                .setTimestamp();

            // Add attachments if any
            if (message.attachments.size > 0) {
                const attachmentsList = message.attachments.map(a => `[${a.name}](${a.url})`).join('\n');
                logEmbed.addFields([
                    {
                        name: '📎 Deleted Attachments',
                        value: attachmentsList
                    }
                ]);
            }

            // Try to fetch audit logs to find who deleted the message
            try {
                const auditLogs = await message.guild.fetchAuditLogs({
                    type: 72, // MESSAGE_DELETE
                    limit: 1
                });
                const deleteLog = auditLogs.entries.first();

                if (deleteLog && deleteLog.target.id === message.author.id && 
                    deleteLog.extra.channel.id === message.channel.id &&
                    Date.now() - deleteLog.createdTimestamp < 5000) {
                    logEmbed.addFields([
                        {
                            name: '🔨 Deleted By',
                            value: `${deleteLog.executor} (${deleteLog.executor.tag})`
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching audit logs:', error);
            }

            // Send log
            await logChannel.send({ embeds: [logEmbed] });

        } catch (error) {
            console.error('Error logging message deletion:', error);
        }
    }
}; 