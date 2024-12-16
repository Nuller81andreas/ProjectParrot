const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkPermissions } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antiraid')
        .setDescription('Configure anti-raid settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable anti-raid mode')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable anti-raid mode')
        ),

    async execute(interaction) {
        // Check if user has permission to use this command
        if (!checkPermissions(interaction, 'antiraid')) {
            return interaction.reply({
                content: 'This command can only be used by the bot owner.',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'enable':
                    await interaction.reply({
                        content: '🛡️ Anti-raid mode has been enabled.',
                        ephemeral: true
                    });
                    break;

                case 'disable':
                    await interaction.reply({
                        content: '🛡️ Anti-raid mode has been disabled.',
                        ephemeral: true
                    });
                    break;
            }
        } catch (error) {
            console.error('Error in antiraid command:', error);
            await interaction.reply({
                content: 'There was an error executing the anti-raid command.',
                ephemeral: true
            });
        }
    }
}; 