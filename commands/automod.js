const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkPermissions } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Configure auto-moderation settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('spam')
                .setDescription('Configure spam protection')
                .addIntegerOption(option =>
                    option.setName('threshold')
                    .setDescription('Number of messages before trigger')
                    .setRequired(true)
                    .setMinValue(3)
                    .setMaxValue(10))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('links')
                .setDescription('Configure link filtering')
                .addBooleanOption(option =>
                    option.setName('enabled')
                    .setDescription('Enable/disable link filtering')
                    .setRequired(true))
        ),

    async execute(interaction) {
        if (!checkPermissions(interaction, 'automod')) {
            return interaction.reply({
                content: 'This command can only be used by the bot owner.',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'spam':
                const threshold = interaction.options.getInteger('threshold');
                // Implement spam protection logic
                await interaction.reply({
                    content: `Spam protection configured with threshold: ${threshold} messages`,
                    ephemeral: true
                });
                break;

            case 'links':
                const enabled = interaction.options.getBoolean('enabled');
                // Implement link filtering logic
                await interaction.reply({
                    content: `Link filtering ${enabled ? 'enabled' : 'disabled'}`,
                    ephemeral: true
                });
                break;
        }
    }
}; 