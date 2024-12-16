const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the security and logging system')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;
            const botMember = guild.members.me;

            // Create Security Category
            const securityCategory = await guild.channels.create({
                name: '🛡️ Security Logs',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: botMember.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.EmbedLinks
                        ]
                    }
                ]
            });

            // Create Log Channels
            const channels = {
                'mod-logs': '👮 Moderation logs',
                'member-logs': '👥 Member logs',
                'message-logs': '💬 Message logs',
                'server-logs': '🔧 Server logs'
            };

            for (const [channelName, channelDescription] of Object.entries(channels)) {
                await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: securityCategory,
                    topic: channelDescription,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: botMember.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ManageMessages,
                                PermissionFlagsBits.EmbedLinks
                            ]
                        }
                    ]
                });
            }

            // Create Bot System Category
            const botCategory = await guild.channels.create({
                name: '🤖 Bot System',
                type: ChannelType.GuildCategory
            });

            // Create System Updates Channel
            await guild.channels.create({
                name: 'system-updates',
                type: ChannelType.GuildText,
                parent: botCategory,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        allow: [PermissionFlagsBits.ViewChannel],
                        deny: [PermissionFlagsBits.SendMessages]
                    },
                    {
                        id: botMember.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.EmbedLinks
                        ]
                    }
                ]
            });

            const setupEmbed = new EmbedBuilder()
                .setTitle('✅ Setup Complete')
                .setDescription('Security and logging systems have been set up successfully!')
                .addFields([
                    { name: 'Security Category', value: '✅ Created with logging channels', inline: true },
                    { name: 'Bot System', value: '✅ Created with system updates', inline: true },
                    { name: 'Next Steps', value: 'Use `/ticketsetup` to set up the ticket system' }
                ])
                .setColor(0x00FF00)
                .setTimestamp();

            await interaction.editReply({
                embeds: [setupEmbed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Setup error:', error);
            await interaction.editReply({
                content: `An error occurred: ${error.message}\nPlease check my permissions and try again.`,
                ephemeral: true
            });
        }
    }
}; 