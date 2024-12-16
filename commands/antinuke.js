const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isPrivilegedUser } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antinuke')
        .setDescription('Configure anti-nuke protection')
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable anti-nuke protection')
                .addStringOption(option =>
                    option.setName('level')
                        .setDescription('Protection level')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Low - Basic Protection', value: 'low' },
                            { name: 'Medium - Standard Protection', value: 'medium' },
                            { name: 'High - Maximum Protection', value: 'high' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable anti-nuke protection'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check anti-nuke status'))
        .setDefaultMemberPermissions(0),

    async execute(interaction) {
        if (!isPrivilegedUser(interaction.user.id)) {
            return interaction.reply({
                content: '❌ Only privileged users can use this command!',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'enable': {
                const level = interaction.options.getString('level');
                const protectionLevels = {
                    low: {
                        maxRolesPerMinute: 3,
                        maxChannelsPerMinute: 2,
                        maxBansPerMinute: 3,
                        maxKicksPerMinute: 5
                    },
                    medium: {
                        maxRolesPerMinute: 2,
                        maxChannelsPerMinute: 1,
                        maxBansPerMinute: 2,
                        maxKicksPerMinute: 3
                    },
                    high: {
                        maxRolesPerMinute: 1,
                        maxChannelsPerMinute: 1,
                        maxBansPerMinute: 1,
                        maxKicksPerMinute: 2
                    }
                };

                // Store settings in guild config
                // Implementation depends on your database setup

                const embed = new EmbedBuilder()
                    .setTitle('🛡️ Anti-Nuke Protection Enabled')
                    .setDescription(`Protection Level: ${level.toUpperCase()}`)
                    .addFields([
                        { name: 'Max Roles/min', value: protectionLevels[level].maxRolesPerMinute.toString(), inline: true },
                        { name: 'Max Channels/min', value: protectionLevels[level].maxChannelsPerMinute.toString(), inline: true },
                        { name: 'Max Bans/min', value: protectionLevels[level].maxBansPerMinute.toString(), inline: true },
                        { name: 'Max Kicks/min', value: protectionLevels[level].maxKicksPerMinute.toString(), inline: true }
                    ])
                    .setColor(0xFF0000)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }
            // ... rest of the command
        }
    }
}; 