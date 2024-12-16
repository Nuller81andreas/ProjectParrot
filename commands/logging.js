const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../utils/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logging')
        .setDescription('Configure server logging')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Set up logging channels')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Main logging channel')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('messages')
                        .setDescription('Log message events')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('members')
                        .setDescription('Log member events')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('moderation')
                        .setDescription('Log moderation events')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable logging')),

    async execute(interaction) {
        const guildConfig = await GuildConfig.get(interaction.guildId);
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'setup': {
                const channel = interaction.options.getChannel('channel');
                const logMessages = interaction.options.getBoolean('messages') ?? true;
                const logMembers = interaction.options.getBoolean('members') ?? true;
                const logModeration = interaction.options.getBoolean('moderation') ?? true;

                const updatedConfig = {
                    ...guildConfig,
                    logging: {
                        enabled: true,
                        channelId: channel.id,
                        events: [
                            ...(logMessages ? ['message'] : []),
                            ...(logMembers ? ['member'] : []),
                            ...(logModeration ? ['mod'] : [])
                        ]
                    }
                };

                await GuildConfig.update(interaction.guildId, updatedConfig);

                const embed = new EmbedBuilder()
                    .setTitle('Logging Configuration')
                    .setDescription('Logging has been set up successfully!')
                    .addFields([
                        { name: 'Channel', value: channel.toString(), inline: true },
                        { name: 'Message Logs', value: logMessages ? '✅' : '❌', inline: true },
                        { name: 'Member Logs', value: logMembers ? '✅' : '❌', inline: true },
                        { name: 'Mod Logs', value: logModeration ? '✅' : '❌', inline: true }
                    ])
                    .setColor('#00FF00')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });

                // Send test log
                const testEmbed = new EmbedBuilder()
                    .setTitle('Logging System Active')
                    .setDescription('The logging system has been configured and is now active.')
                    .setColor('#0099ff')
                    .setTimestamp();

                await channel.send({ embeds: [testEmbed] });
                break;
            }

            case 'disable': {
                const updatedConfig = {
                    ...guildConfig,
                    logging: {
                        enabled: false,
                        channelId: null,
                        events: []
                    }
                };

                await GuildConfig.update(interaction.guildId, updatedConfig);

                await interaction.reply({
                    content: 'Logging has been disabled.',
                    ephemeral: true
                });
                break;
            }
        }
    }
}; 