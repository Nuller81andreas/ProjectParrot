const { Events, EmbedBuilder } = require('discord.js');

function truncateString(str, maxLength = 1024) {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        // Find the logging channel
        const logChannel = message.guild?.channels.cache.find(ch => 
            ch.name === 'message-logs' || 
            ch.name === 'mod-logs'
        );

        if (!logChannel) return;

        try {
            const logEmbed = new EmbedBuilder()
                .setTitle('Message Sent')
                .setColor('#00FF00')
                .setTimestamp()
                .setAuthor({
                    name: message.author.tag,
                    iconURL: message.author.displayAvatarURL()
                })
                .addFields(
                    {
                        name: 'Channel',
                        value: `<#${message.channel.id}>`,
                        inline: true
                    },
                    {
                        name: 'Author ID',
                        value: message.author.id,
                        inline: true
                    }
                );

            // Handle message content
            if (message.content) {
                const truncatedContent = truncateString(message.content);
                logEmbed.addFields({
                    name: 'Content',
                    value: truncatedContent,
                    inline: false
                });
            }

            // Handle attachments
            if (message.attachments.size > 0) {
                const attachmentList = message.attachments.map(a => a.url).join('\n');
                const truncatedAttachments = truncateString(attachmentList);
                logEmbed.addFields({
                    name: 'Attachments',
                    value: truncatedAttachments,
                    inline: false
                });
            }

            await logChannel.send({ embeds: [logEmbed] });
        } catch (error) {
            console.error('Error in message logger:', error);
        }
    }
};