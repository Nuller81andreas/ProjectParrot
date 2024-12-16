const { EmbedBuilder } = require('discord.js');

class ErrorHandler {
    static async handle(error, interaction, context = '') {
        console.error(`Error in ${context}:`, error);

        const errorEmbed = new EmbedBuilder()
            .setTitle('❌ Error Occurred')
            .setColor(0xFF0000)
            .setTimestamp();

        if (error.code) {
            switch (error.code) {
                case 50013: // Missing Permissions
                    errorEmbed.setDescription('I don\'t have the required permissions to perform this action.');
                    break;
                case 50001: // Missing Access
                    errorEmbed.setDescription('I don\'t have access to perform this action.');
                    break;
                case 10003: // Unknown Channel
                    errorEmbed.setDescription('The specified channel was not found.');
                    break;
                case 10011: // Unknown Role
                    errorEmbed.setDescription('The specified role was not found.');
                    break;
                case 50035: // Invalid Form Body
                    errorEmbed.setDescription('Invalid command parameters provided.');
                    break;
                default:
                    errorEmbed.setDescription('An unexpected error occurred. Please try again later.');
            }
        } else {
            errorEmbed.setDescription('An unexpected error occurred. Please try again later.');
        }

        try {
            if (interaction) {
                if (interaction.deferred) {
                    await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                } else if (!interaction.replied) {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        } catch (followUpError) {
            console.error('Error sending error message:', followUpError);
        }

        // Log to error channel if available
        try {
            if (interaction?.guild) {
                const errorChannel = interaction.guild.channels.cache.find(c => c.name === 'error-logs');
                if (errorChannel) {
                    const detailedErrorEmbed = new EmbedBuilder()
                        .setTitle('⚠️ Error Details')
                        .setDescription(`Error in ${context}`)
                        .addFields([
                            { name: 'Error Code', value: error.code?.toString() || 'None', inline: true },
                            { name: 'Error Message', value: error.message || 'No message', inline: true },
                            { name: 'Command', value: interaction?.commandName || 'N/A', inline: true },
                            { name: 'User', value: interaction?.user?.tag || 'N/A', inline: true },
                            { name: 'Channel', value: interaction?.channel?.name || 'N/A', inline: true }
                        ])
                        .setColor(0xFF0000)
                        .setTimestamp();

                    await errorChannel.send({ embeds: [detailedErrorEmbed] });
                }
            }
        } catch (logError) {
            console.error('Error logging to error channel:', logError);
        }
    }

    static async handleDatabase(error, context = '') {
        console.error(`Database error in ${context}:`, error);
        // Add database error handling logic here when you implement a database
    }

    static async handleAPI(error, context = '') {
        console.error(`API error in ${context}:`, error);
        // Add API error handling logic here for external API calls
    }
}

module.exports = ErrorHandler; 