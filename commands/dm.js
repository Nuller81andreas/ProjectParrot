const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Send a DM to a user')
        .setDefaultMemberPermissions(0)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to send the DM to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('embed')
                .setDescription('Send as an embed?')
                .setRequired(false)),
    developerOnly: true,

    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user');
            const message = interaction.options.getString('message');
            const useEmbed = interaction.options.getBoolean('embed') ?? false;

            // Create thinking embed
            const thinkingEmbed = new EmbedBuilder()
                .setTitle('Chill Bot Systems')
                .setDescription('is thinking...')
                .setColor('#FF5555')
                .setTimestamp();

            await interaction.reply({
                embeds: [thinkingEmbed],
                ephemeral: true
            });

            try {
                if (useEmbed) {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle('Message from Developer')
                        .setDescription(message)
                        .setColor('#FF5555')
                        .setTimestamp()
                        .setFooter({ text: `Sent by ${interaction.user.tag}` });

                    await targetUser.send({ embeds: [dmEmbed] });
                } else {
                    await targetUser.send(`**Message from ${interaction.user.tag}:**\n${message}`);
                }

                // Success embed
                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ Message Sent')
                    .setDescription(`Successfully sent message to ${targetUser.tag}`)
                    .addFields([
                        { name: 'Message', value: message.length > 1024 ? message.slice(0, 1021) + '...' : message },
                        { name: 'Format', value: useEmbed ? 'Embed' : 'Plain Text' }
                    ])
                    .setColor('#00FF00')
                    .setTimestamp();

                await interaction.editReply({
                    embeds: [successEmbed],
                    ephemeral: true
                });

                // Log the DM
                const logChannel = interaction.guild.channels.cache.find(ch => ch.name === 'mod-logs');
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('📨 Developer DM Sent')
                        .setDescription(`Message sent to ${targetUser.tag} (${targetUser.id})`)
                        .addFields([
                            { name: 'Sent By', value: interaction.user.tag },
                            { name: 'Message', value: message.length > 1024 ? message.slice(0, 1021) + '...' : message },
                            { name: 'Format', value: useEmbed ? 'Embed' : 'Plain Text' }
                        ])
                        .setColor('#FF5555')
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] });
                }

            } catch (error) {
                // Handle DM failure
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Message Failed')
                    .setDescription(`Could not send message to ${targetUser.tag}`)
                    .addFields([
                        { name: 'Error', value: 'User might have DMs disabled or has blocked the bot' },
                        { name: 'Message', value: message.length > 1024 ? message.slice(0, 1021) + '...' : message }
                    ])
                    .setColor('#FF0000')
                    .setTimestamp();

                await interaction.editReply({
                    embeds: [errorEmbed],
                    ephemeral: true
                });
            }

        } catch (error) {
            console.error('Error in dm command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('An error occurred while processing the command.')
                .setColor('#FF0000')
                .setTimestamp();

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    embeds: [errorEmbed],
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    embeds: [errorEmbed],
                    ephemeral: true
                });
            }
        }
    }
}; 