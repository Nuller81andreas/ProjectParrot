const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock the server or a specific channel')
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Unlock the entire server')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for unlock')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Unlock a specific channel')
                .addChannelOption(option =>
                    option.setName('target')
                        .setDescription('Channel to unlock')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for unlock')
                        .setRequired(false)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (subcommand === 'server') {
            const channels = interaction.guild.channels.cache;
            
            await interaction.deferReply();

            const results = [];
            for (const channel of channels.values()) {
                if (channel.isTextBased()) {
                    try {
                        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                            SendMessages: null,
                            AddReactions: null
                        });
                        results.push(`✅ ${channel.name}`);
                    } catch (error) {
                        results.push(`❌ ${channel.name} (Error: ${error.message})`);
                        console.error(`Error unlocking channel ${channel.name}:`, error);
                    }
                }
            }

            const logEmbed = new EmbedBuilder()
                .setTitle('🔓 Server Unlock')
                .setDescription(`**Moderator:** ${interaction.user}\n**Reason:** ${reason}`)
                .addFields([
                    {
                        name: 'Channel Status',
                        value: results.join('\n')
                    }
                ])
                .setColor(0x00ff00)
                .setTimestamp();

            const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
            if (logChannel) {
                await logChannel.send({ embeds: [logEmbed] });
            }

            const replyEmbed = new EmbedBuilder()
                .setTitle('🔓 Server Unlock')
                .setDescription(`Server has been unlocked.\n**Reason:** ${reason}`)
                .addFields([
                    {
                        name: 'Channels Affected',
                        value: `Success: ${results.filter(r => r.startsWith('✅')).length}\nFailed: ${results.filter(r => r.startsWith('❌')).length}`
                    }
                ])
                .setColor(0x00ff00)
                .setTimestamp();

            await interaction.editReply({ embeds: [replyEmbed] });

        } else if (subcommand === 'channel') {
            const channel = interaction.options.getChannel('target');

            try {
                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    SendMessages: null,
                    AddReactions: null
                });

                const logEmbed = new EmbedBuilder()
                    .setTitle('🔓 Channel Unlock')
                    .setDescription(`**Channel:** ${channel}\n**Moderator:** ${interaction.user}\n**Reason:** ${reason}`)
                    .addFields([
                        {
                            name: 'Status',
                            value: `✅ Successfully unlocked ${channel.name}`
                        }
                    ])
                    .setColor(0x00ff00)
                    .setTimestamp();

                const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
                if (logChannel) {
                    await logChannel.send({ embeds: [logEmbed] });
                }

                const replyEmbed = new EmbedBuilder()
                    .setTitle('🔓 Channel Unlock')
                    .setDescription(`${channel} has been unlocked.\n**Reason:** ${reason}`)
                    .setColor(0x00ff00)
                    .setTimestamp();

                await interaction.reply({ embeds: [replyEmbed] });
            } catch (error) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Unlock Failed')
                    .setDescription(`Failed to unlock ${channel}\n**Error:** ${error.message}`)
                    .setColor(0xff0000)
                    .setTimestamp();

                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
}; 