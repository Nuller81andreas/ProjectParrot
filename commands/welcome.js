const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const GuildConfig = require('../utils/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Configure welcome message settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Set up the welcome channel and message')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel for welcome messages')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('Custom welcome message (use {user} for member mention)')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option
                        .setName('mention')
                        .setDescription('Whether to mention new members')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option
                        .setName('embed')
                        .setDescription('Whether to use embedded messages')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Test the welcome message'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable welcome messages')),

    async execute(interaction) {
        const guildConfig = await GuildConfig.get(interaction.guildId);
        
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'setup': {
                const channel = interaction.options.getChannel('channel');
                const customMessage = interaction.options.getString('message') || 'Welcome {user} to our community!';
                const useMention = interaction.options.getBoolean('mention') ?? true;
                const useEmbed = interaction.options.getBoolean('embed') ?? true;

                // Save configuration to database
                await db.set(`welcome_${interaction.guildId}`, {
                    channelId: channel.id,
                    message: customMessage,
                    useMention,
                    useEmbed,
                    enabled: true
                });

                const embed = new EmbedBuilder()
                    .setTitle('Welcome Configuration')
                    .setDescription('Welcome system has been configured successfully!')
                    .addFields([
                        { name: 'Channel', value: channel.toString(), inline: true },
                        { name: 'Mention Members', value: useMention ? '✅' : '❌', inline: true },
                        { name: 'Use Embeds', value: useEmbed ? '✅' : '❌', inline: true },
                        { name: 'Custom Message', value: customMessage }
                    ])
                    .setColor('#00FF00')
                    .setTimestamp();

                // Send example welcome message
                const exampleEmbed = new EmbedBuilder()
                    .setTitle('🏰 Welcome to The Haunting Grounds!')
                    .setDescription(customMessage.replace('{user}', interaction.user.toString()))
                    .addFields(
                        {
                            name: '📜 Getting Started',
                            value: 'As you step into this enigmatic space, we kindly ask that you take a moment to familiarize yourself with our rules and regulations.'
                        },
                        {
                            name: '🤝 Community Values',
                            value: 'Respect for one another is paramount, ensuring a safe and enjoyable environment for all.'
                        },
                        {
                            name: '✨ Let\'s Begin',
                            value: 'Let\'s create memorable experiences together while keeping the spirit of The Haunting Grounds alive!'
                        }
                    )
                    .setColor('#800080')
                    .setTimestamp()
                    .setFooter({ 
                        text: 'Example Welcome Message',
                        iconURL: interaction.guild.iconURL({ dynamic: true })
                    });

                await channel.send({ 
                    content: 'Example welcome message:',
                    embeds: [exampleEmbed]
                });

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }

            case 'test': {
                const config = await db.get(`welcome_${interaction.guildId}`);
                if (!config || !config.enabled) {
                    return interaction.reply({
                        content: 'Welcome system is not configured! Use `/welcome setup` first.',
                        ephemeral: true
                    });
                }

                const channel = interaction.guild.channels.cache.get(config.channelId);
                if (!channel) {
                    return interaction.reply({
                        content: 'Welcome channel not found! Please reconfigure the welcome system.',
                        ephemeral: true
                    });
                }

                const testEmbed = new EmbedBuilder()
                    .setTitle('🏰 Welcome to The Haunting Grounds!')
                    .setDescription(`Welcome ${interaction.user} to our community!`)
                    .addFields(
                        {
                            name: '📜 Getting Started',
                            value: 'As you step into this enigmatic space, we kindly ask that you take a moment to familiarize yourself with our rules and regulations.'
                        },
                        {
                            name: '🤝 Community Values',
                            value: 'Respect for one another is paramount, ensuring a safe and enjoyable environment for all.'
                        },
                        {
                            name: '✨ Let\'s Begin',
                            value: 'Let\'s create memorable experiences together while keeping the spirit of The Haunting Grounds alive!'
                        }
                    )
                    .setColor('#800080')
                    .setTimestamp()
                    .setFooter({ 
                        text: 'Test Welcome Message',
                        iconURL: interaction.guild.iconURL({ dynamic: true })
                    });

                await channel.send({
                    content: config.useMention ? `**TEST MESSAGE**\n${interaction.user} joined the server!` : '**TEST MESSAGE**',
                    embeds: config.useEmbed ? [testEmbed] : []
                });

                await interaction.reply({
                    content: 'Test welcome message sent!',
                    ephemeral: true
                });
                break;
            }

            case 'disable': {
                await db.set(`welcome_${interaction.guildId}.enabled`, false);
                
                await interaction.reply({
                    content: 'Welcome messages have been disabled.',
                    ephemeral: true
                });
                break;
            }
        }
    }
}; 