const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkPermissions } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempban')
        .setDescription('Temporarily ban a user')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to ban')
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
            .setDescription('Ban duration in hours')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(720)) // Max 30 days
        .addStringOption(option =>
            option.setName('reason')
            .setDescription('Reason for the ban')
            .setRequired(false)),

    async execute(interaction) {
        if (!checkPermissions(interaction, 'tempban')) {
            return interaction.reply({
                content: 'This command can only be used by the bot owner.',
                ephemeral: true
            });
        }

        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            await interaction.guild.members.ban(user, { reason });

            // Schedule unban
            setTimeout(async () => {
                try {
                    await interaction.guild.members.unban(user);
                    await interaction.channel.send(`${user.tag} has been automatically unbanned.`);
                } catch (error) {
                    console.error('Error unbanning user:', error);
                }
            }, duration * 3600000); // Convert hours to milliseconds

            await interaction.reply({
                content: `Successfully banned ${user.tag} for ${duration} hours.\nReason: ${reason}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in tempban:', error);
            await interaction.reply({
                content: 'Failed to ban user. Please check my permissions and try again.',
                ephemeral: true
            });
        }
    }
}; 