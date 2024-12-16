const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const guildConfig = require('../utils/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist-role')
        .setDescription('Manage blacklisted roles')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a role to the blacklist')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to blacklist')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for blacklisting')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a role from the blacklist')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to remove from blacklist')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all blacklisted roles'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    ownerOnly: true,

    async execute(interaction) {
        // Check if user is privileged
        if (interaction.user.id !== process.env.BOT_OWNER_ID && 
            interaction.user.id !== process.env.HEAD_DEVELOPER_ID && 
            interaction.user.id !== process.env.LEAD_DEVELOPER_ID) {
            return interaction.reply({
                content: '❌ Only the bot owner and developers can use this command!',
                ephemeral: true
            });
        }

        const config = guildConfig.getConfig(interaction.guildId);
        if (!config.blacklistedRoles) {
            config.blacklistedRoles = [];
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add': {
                const role = interaction.options.getRole('role');
                const reason = interaction.options.getString('reason');

                // Check if role is already blacklisted
                if (config.blacklistedRoles.some(r => r.id === role.id)) {
                    return interaction.reply({
                        content: '❌ This role is already blacklisted!',
                        ephemeral: true
                    });
                }

                // Add role to blacklist
                config.blacklistedRoles.push({
                    id: role.id,
                    name: role.name,
                    reason: reason,
                    addedBy: interaction.user.tag,
                    addedAt: Date.now()
                });

                guildConfig.updateConfig(interaction.guildId, config);

                const embed = new EmbedBuilder()
                    .setTitle('⛔ Role Blacklisted')
                    .setDescription(`The role ${role} has been blacklisted.`)
                    .addFields([
                        { name: 'Role', value: role.name, inline: true },
                        { name: 'Added By', value: interaction.user.tag, inline: true },
                        { name: 'Reason', value: reason }
                    ])
                    .setColor(0xFF0000)
                    .setTimestamp();

                // Log to mod-logs
                const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
                if (logChannel) {
                    await logChannel.send({ embeds: [embed] });
                }

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }

            case 'remove': {
                const role = interaction.options.getRole('role');

                // Check if role is blacklisted
                const roleIndex = config.blacklistedRoles.findIndex(r => r.id === role.id);
                if (roleIndex === -1) {
                    return interaction.reply({
                        content: '❌ This role is not blacklisted!',
                        ephemeral: true
                    });
                }

                // Remove role from blacklist
                config.blacklistedRoles.splice(roleIndex, 1);
                guildConfig.updateConfig(interaction.guildId, config);

                const embed = new EmbedBuilder()
                    .setTitle('✅ Role Removed from Blacklist')
                    .setDescription(`The role ${role} has been removed from the blacklist.`)
                    .addFields([
                        { name: 'Role', value: role.name, inline: true },
                        { name: 'Removed By', value: interaction.user.tag, inline: true }
                    ])
                    .setColor(0x00FF00)
                    .setTimestamp();

                // Log to mod-logs
                const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
                if (logChannel) {
                    await logChannel.send({ embeds: [embed] });
                }

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }

            case 'list': {
                if (config.blacklistedRoles.length === 0) {
                    return interaction.reply({
                        content: '📋 No roles are currently blacklisted.',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setTitle('📋 Blacklisted Roles')
                    .setColor(0x3498db)
                    .setTimestamp();

                const roleFields = config.blacklistedRoles.map(role => ({
                    name: role.name,
                    value: `**Added By:** ${role.addedBy}\n**Reason:** ${role.reason}\n**Added:** <t:${Math.floor(role.addedAt / 1000)}:R>`
                }));

                embed.addFields(roleFields);

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }
        }
    }
}; 