const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Manage whitelisted roles')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a role to the whitelist')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to whitelist')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('level')
                        .setDescription('Access level for the role')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Level 1 (Member)', value: 'level1' },
                            { name: 'Level 2 (Helper)', value: 'level2' },
                            { name: 'Level 3 (Moderator)', value: 'level3' },
                            { name: 'Level 4 (Admin)', value: 'level4' },
                            { name: 'Level 5 (Head Admin)', value: 'level5' },
                            { name: 'Bot Owner', value: 'owner' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a role from the whitelist')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to remove')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all whitelisted roles'))
        .setDefaultMemberPermissions(0),
    ownerOnly: true,

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // Direct bot owner check
            if (interaction.user.id !== process.env.BOT_OWNER_ID) {
                return await interaction.editReply({
                    content: '❌ Only the bot owner can use this command!',
                    ephemeral: true
                });
            }

            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'add': {
                    const role = interaction.options.getRole('role');
                    const level = interaction.options.getString('level');

                    // Define base permissions for each level
                    const basePermissions = {
                        level1: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ],
                        level2: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.MuteMembers,
                            PermissionFlagsBits.ViewAuditLog
                        ],
                        level3: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.MuteMembers,
                            PermissionFlagsBits.ViewAuditLog,
                            PermissionFlagsBits.KickMembers,
                            PermissionFlagsBits.BanMembers,
                            PermissionFlagsBits.ManageChannels
                        ],
                        level4: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.MuteMembers,
                            PermissionFlagsBits.ViewAuditLog,
                            PermissionFlagsBits.KickMembers,
                            PermissionFlagsBits.BanMembers,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ManageGuild,
                            PermissionFlagsBits.ManageRoles,
                            PermissionFlagsBits.ManageWebhooks
                        ],
                        level5: [PermissionFlagsBits.Administrator],
                        owner: [PermissionFlagsBits.Administrator]
                    };

                    try {
                        await role.setPermissions(basePermissions[level]);

                        const levelNames = {
                            level1: 'Level 1 (Member)',
                            level2: 'Level 2 (Helper)',
                            level3: 'Level 3 (Moderator)',
                            level4: 'Level 4 (Admin)',
                            level5: 'Level 5 (Head Admin)',
                            owner: 'Bot Owner'
                        };

                        const embed = new EmbedBuilder()
                            .setTitle('✅ Role Whitelisted')
                            .setDescription(`**Role:** ${role}\n**Level:** ${levelNames[level]}\n**Added By:** ${interaction.user.tag}`)
                            .addFields([
                                { 
                                    name: 'Permissions', 
                                    value: `This role has been granted ${level === 'owner' || level === 'level5' ? 'all' : 'level-appropriate'} permissions.`
                                }
                            ])
                            .setColor(role.color)
                            .setTimestamp();

                        // Log to mod-logs
                        const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
                        if (logChannel) await logChannel.send({ embeds: [embed] });

                        await interaction.editReply({ embeds: [embed], ephemeral: true });
                    } catch (error) {
                        console.error('Error setting permissions:', error);
                        await interaction.editReply({
                            content: `❌ Failed to set permissions: ${error.message}`,
                            ephemeral: true
                        });
                    }
                    break;
                }

                case 'remove': {
                    const role = interaction.options.getRole('role');
                    
                    try {
                        await role.setPermissions([]);

                        const embed = new EmbedBuilder()
                            .setTitle('🗑️ Role Removed from Whitelist')
                            .setDescription(`**Role:** ${role}\n**Removed By:** ${interaction.user.tag}`)
                            .setColor(0xFF0000)
                            .setTimestamp();

                        const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
                        if (logChannel) await logChannel.send({ embeds: [embed] });

                        await interaction.editReply({ embeds: [embed], ephemeral: true });
                    } catch (error) {
                        console.error('Error removing permissions:', error);
                        await interaction.editReply({
                            content: `❌ Failed to remove permissions: ${error.message}`,
                            ephemeral: true
                        });
                    }
                    break;
                }

                case 'list': {
                    const roles = interaction.guild.roles.cache;
                    const embed = new EmbedBuilder()
                        .setTitle('📋 Whitelisted Roles')
                        .setColor(0x3498db)
                        .setTimestamp();

                    const leveledRoles = {
                        'Level 5 (Head Admin)': roles.filter(r => r.permissions.has(PermissionFlagsBits.Administrator)),
                        'Level 4 (Admin)': roles.filter(r => r.permissions.has(PermissionFlagsBits.ManageGuild) && !r.permissions.has(PermissionFlagsBits.Administrator)),
                        'Level 3 (Moderator)': roles.filter(r => r.permissions.has(PermissionFlagsBits.BanMembers) && !r.permissions.has(PermissionFlagsBits.ManageGuild)),
                        'Level 2 (Helper)': roles.filter(r => r.permissions.has(PermissionFlagsBits.ManageMessages) && !r.permissions.has(PermissionFlagsBits.BanMembers)),
                        'Level 1 (Member)': roles.filter(r => r.permissions.has(PermissionFlagsBits.SendMessages) && !r.permissions.has(PermissionFlagsBits.ManageMessages))
                    };

                    for (const [level, levelRoles] of Object.entries(leveledRoles)) {
                        if (levelRoles.size > 0) {
                            embed.addFields({
                                name: level,
                                value: levelRoles.map(r => r.toString()).join('\n') || 'None',
                                inline: false
                            });
                        }
                    }

                    await interaction.editReply({ embeds: [embed], ephemeral: true });
                    break;
                }
            }
        } catch (error) {
            console.error('Error in whitelist command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while executing the command.',
                ephemeral: true
            });
        }
    }
}; 