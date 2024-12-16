const { PermissionFlagsBits } = require('discord.js');

class PermissionHandler {
    static async checkBotPermissions(guild) {
        const requiredPermissions = [
            PermissionFlagsBits.Administrator,
            PermissionFlagsBits.ManageRoles,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ViewAuditLog
        ];

        const missingPermissions = [];
        for (const permission of requiredPermissions) {
            if (!guild.members.me.permissions.has(permission)) {
                missingPermissions.push(permission);
            }
        }

        return missingPermissions;
    }

    static async validateHierarchy(guild, role) {
        const botRole = guild.members.me.roles.highest;
        return botRole.position > role.position;
    }
}

module.exports = PermissionHandler; 