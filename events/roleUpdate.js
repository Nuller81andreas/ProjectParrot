const { Events } = require('discord.js');
const guildConfig = require('../utils/guildConfig');

module.exports = {
    name: Events.GuildMemberRoleAdd,
    async execute(member, role) {
        const config = guildConfig.getConfig(member.guild.id);
        
        // Check if role is blacklisted
        if (config.blacklistedRoles?.some(r => r.id === role.id)) {
            // Check if the user adding the role is privileged
            const auditLogs = await member.guild.fetchAuditLogs({
                type: 'MEMBER_ROLE_UPDATE',
                limit: 1
            });
            
            const log = auditLogs.entries.first();
            if (!log) return;

            const { executor } = log;

            // Allow privileged users to add the role
            if (executor.id === process.env.BOT_OWNER_ID ||
                executor.id === process.env.HEAD_DEVELOPER_ID ||
                executor.id === process.env.LEAD_DEVELOPER_ID) {
                return;
            }

            // Remove the role if added by non-privileged user
            await member.roles.remove(role);

            // Log the attempt
            const logChannel = member.guild.channels.cache.find(c => c.name === 'mod-logs');
            if (logChannel) {
                await logChannel.send({
                    embeds: [{
                        title: '⚠️ Blacklisted Role Assignment Prevented',
                        description: `An attempt was made to assign a blacklisted role.`,
                        fields: [
                            { name: 'Role', value: role.name, inline: true },
                            { name: 'Member', value: member.user.tag, inline: true },
                            { name: 'Attempted By', value: executor.tag, inline: true }
                        ],
                        color: 0xFF0000,
                        timestamp: new Date()
                    }]
                });
            }
        }
    }
}; 