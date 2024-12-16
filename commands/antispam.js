const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isPrivilegedUser } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antispam')
        .setDescription('Configure anti-spam protection')
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable anti-spam protection')
                .addIntegerOption(option =>
                    option.setName('messages')
                        .setDescription('Messages per timeframe')
                        .setRequired(true)
                        .setMinValue(3)
                        .setMaxValue(10))
                .addIntegerOption(option =>
                    option.setName('seconds')
                        .setDescription('Timeframe in seconds')
                        .setRequired(true)
                        .setMinValue(5)
                        .setMaxValue(30))
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Action to take on spam detection')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Delete Messages', value: 'delete' },
                            { name: 'Warn User', value: 'warn' },
                            { name: 'Timeout User', value: 'timeout' },
                            { name: 'Kick User', value: 'kick' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable anti-spam protection'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check anti-spam status'))
        .setDefaultMemberPermissions(0),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            if (!isPrivilegedUser(interaction.user.id)) {
                return interaction.editReply({
                    content: '❌ Only privileged users can use this command!',
                    ephemeral: true
                });
            }

            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'enable': {
                    const messages = interaction.options.getInteger('messages');
                    const seconds = interaction.options.getInteger('seconds');
                    const action = interaction.options.getString('action');

                    // Store in memory (you might want to use a database instead)
                    interaction.client.antispam = {
                        enabled: true,
                        messages,
                        seconds,
                        action,
                        guildId: interaction.guild.id,
                        userMessages: new Map()
                    };

                    const embed = new EmbedBuilder()
                        .setTitle('🛡️ Anti-Spam Protection Enabled')
                        .setDescription('Spam protection has been configured.')
                        .addFields([
                            { name: 'Message Limit', value: messages.toString(), inline: true },
                            { name: 'Time Window', value: `${seconds} seconds`, inline: true },
                            { name: 'Action', value: action.charAt(0).toUpperCase() + action.slice(1), inline: true },
                            { name: 'Enabled By', value: interaction.user.tag }
                        ])
                        .setColor(0xFF0000)
                        .setTimestamp();

                    // Log to mod-logs
                    const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
                    if (logChannel) {
                        await logChannel.send({ embeds: [embed] });
                    }

                    await interaction.editReply({ embeds: [embed], ephemeral: true });
                    break;
                }

                case 'disable': {
                    interaction.client.antispam = {
                        enabled: false,
                        guildId: interaction.guild.id
                    };

                    const embed = new EmbedBuilder()
                        .setTitle('🛡️ Anti-Spam Protection Disabled')
                        .setDescription('Spam protection has been disabled.')
                        .addFields([
                            { name: 'Disabled By', value: interaction.user.tag }
                        ])
                        .setColor(0x00FF00)
                        .setTimestamp();

                    // Log to mod-logs
                    const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
                    if (logChannel) {
                        await logChannel.send({ embeds: [embed] });
                    }

                    await interaction.editReply({ embeds: [embed], ephemeral: true });
                    break;
                }

                case 'status': {
                    const status = interaction.client.antispam || { enabled: false };
                    
                    const embed = new EmbedBuilder()
                        .setTitle('🛡️ Anti-Spam Status')
                        .setDescription(`Anti-Spam is currently ${status.enabled ? 'enabled' : 'disabled'}`)
                        .setColor(status.enabled ? 0xFF0000 : 0x00FF00)
                        .setTimestamp();

                    if (status.enabled) {
                        embed.addFields([
                            { name: 'Message Limit', value: status.messages.toString(), inline: true },
                            { name: 'Time Window', value: `${status.seconds} seconds`, inline: true },
                            { name: 'Action', value: status.action.charAt(0).toUpperCase() + status.action.slice(1), inline: true }
                        ]);
                    }

                    await interaction.editReply({ embeds: [embed], ephemeral: true });
                    break;
                }
            }
        } catch (error) {
            console.error('Error in antispam command:', error);
            await interaction.editReply({
                content: 'There was an error executing this command.',
                ephemeral: true
            });
        }
    }
}; 