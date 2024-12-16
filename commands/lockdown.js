const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('Lockdown the server or a specific channel')
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Lockdown the entire server')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for lockdown')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Lockdown a specific channel')
                .addChannelOption(option =>
                    option.setName('target')
                        .setDescription('Channel to lockdown')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for lockdown')
                        .setRequired(false)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (subcommand === 'server') {
            const channels = interaction.guild.channels.cache;
            const results = [];

            for (const channel of channels.values()) {
                if (channel.isTextBased()) {
                    try {
                        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                            SendMessages: false,
                            AddReactions: false
                        });
                        results.push(`✅ ${channel.name}`);
                    } catch (error) {
                        results.push(`❌ ${channel.name} (Error: ${error.message})`);
                        console.error(`Error locking channel ${channel.name}:`, error);
                    }
                }
            }

            const logEmbed = new EmbedBuilder()
                .setTitle('🔒 Server Lockdown')
                .setDescription(`**Moderator:** ${interaction.user}\n**Reason:** ${reason}`)
                .addFields([
                    {
                        name: 'Channel Status',
                        value: results.join('\n').slice(0, 1024)
                    }
                ])
                .setColor(0xff0000)
                .setTimestamp();

            const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
            if (logChannel) {
                await logChannel.send({ embeds: [logEmbed] });
            }

            const replyEmbed = new EmbedBuilder()
                .setTitle('🔒 Server Lockdown')
                .setDescription(`Server has been locked down.\n**Reason:** ${reason}`)
                .addFields([
                    {
                        name: 'Channels Affected',
                        value: `Success: ${results.filter(r => r.startsWith('✅')).length}\nFailed: ${results.filter(r => r.startsWith('❌')).length}`
                    }
                ])
                .setColor(0xff0000)
                .setTimestamp();

            await interaction.editReply({ embeds: [replyEmbed] });

        } else if (subcommand === 'channel') {
            const channel = interaction.options.getChannel('target');

            try {
                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    SendMessages: false,
                    AddReactions: false
                });

                const logEmbed = new EmbedBuilder()
                    .setTitle('🔒 Channel Lockdown')
                    .setDescription(`**Channel:** ${channel}\n**Moderator:** ${interaction.user}\n**Reason:** ${reason}`)
                    .addFields([
                        {
                            name: 'Status',
                            value: `✅ Successfully locked ${channel.name}`
                        }
                    ])
                    .setColor(0xff0000)
                    .setTimestamp();

                const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
                if (logChannel) {
                    await logChannel.send({ embeds: [logEmbed] });
                }

                const replyEmbed = new EmbedBuilder()
                    .setTitle('🔒 Channel Lockdown')
                    .setDescription(`${channel} has been locked down.\n**Reason:** ${reason}`)
                    .setColor(0xff0000)
                    .setTimestamp();

                await interaction.editReply({ embeds: [replyEmbed] });
            } catch (error) {
                console.error('Error in lockdown command:', error);
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Lockdown Failed')
                    .setDescription(`Failed to lock ${channel}\n**Error:** ${error.message}`)
                    .setColor(0xff0000)
                    .setTimestamp();

                await interaction.editReply({ embeds: [errorEmbed] });
            }
        }
    }
}; 