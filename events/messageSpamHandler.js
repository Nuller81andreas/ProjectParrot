const { Events, EmbedBuilder, Collection } = require('discord.js');

// Store user messages
const userMessages = new Collection();

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore bot messages and DMs
        if (message.author.bot || !message.guild) return;

        // Get anti-spam settings
        const antispam = message.client.antispam;
        if (!antispam?.enabled || antispam.guildId !== message.guild.id) return;

        const { messages: maxMessages, seconds: timeframe, action } = antispam;

        // Get user's message history
        const userData = userMessages.get(message.author.id) || { messages: [], warned: false };
        const now = Date.now();

        // Clean old messages outside timeframe
        userData.messages = userData.messages.filter(msg => 
            now - msg.createdTimestamp < timeframe * 1000
        );

        // Add new message
        userData.messages.push(message);
        userMessages.set(message.author.id, userData);

        // Check for spam
        if (userData.messages.length >= maxMessages) {
            try {
                // Collect messages to delete
                const messagesToDelete = userData.messages.map(msg => msg.id);
                
                // Create log embed before deleting messages
                const logEmbed = new EmbedBuilder()
                    .setTitle('🛡️ Anti-Spam Action Taken')
                    .setDescription(`Spam detected from ${message.author.tag} (${message.author.id})`)
                    .addFields([
                        { name: 'Channel', value: `${message.channel}` || 'Unknown Channel', inline: true },
                        { name: 'Messages Deleted', value: messagesToDelete.length.toString(), inline: true },
                        { name: 'Action Taken', value: action.charAt(0).toUpperCase() + action.slice(1), inline: true },
                        { 
                            name: 'Message Content Sample', 
                            value: message.content.slice(0, 1000) || 'No text content available'
                        }
                    ])
                    .setColor(0xFF0000)
                    .setTimestamp();

                // Bulk delete messages
                await message.channel.bulkDelete(userData.messages, true)
                    .catch(error => console.error('Error deleting spam messages:', error));

                // Take additional action based on configuration
                switch (action) {
                    case 'warn':
                        if (!userData.warned) {
                            await message.channel.send({
                                content: `⚠️ ${message.author}, please stop spamming! Your messages have been removed.`
                            });
                            userData.warned = true;
                        }
                        break;

                    case 'timeout':
                        await message.member.timeout(timeframe * 1000, 'Spam Detection')
                            .catch(error => console.error('Error timing out member:', error));
                        logEmbed.addFields([{ 
                            name: 'Timeout Duration', 
                            value: `${timeframe} seconds` 
                        }]);
                        break;

                    case 'kick':
                        await message.member.kick('Spam Detection')
                            .catch(error => console.error('Error kicking member:', error));
                        break;
                }

                // Log to mod-logs
                const logChannel = message.guild.channels.cache.find(c => c.name === 'mod-logs');
                if (logChannel) {
                    await logChannel.send({ embeds: [logEmbed] });
                }

                // Clear user's message history
                userData.messages = [];
                userMessages.set(message.author.id, userData);

                // Send notification in channel
                const notificationEmbed = new EmbedBuilder()
                    .setTitle('🛡️ Spam Detected')
                    .setDescription(`Anti-spam measures have been taken against ${message.author.tag}`)
                    .setColor(0xFF0000)
                    .setTimestamp();

                await message.channel.send({ embeds: [notificationEmbed] })
                    .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

            } catch (error) {
                console.error('Error handling spam:', error);
            }
        }

        // Cleanup old entries every minute
        if (!message.client.spamCleanupInterval) {
            message.client.spamCleanupInterval = setInterval(() => {
                userMessages.sweep(userData => 
                    now - userData.messages[userData.messages.length - 1]?.createdTimestamp > timeframe * 1000
                );
            }, 60000);
        }
    }
}; 