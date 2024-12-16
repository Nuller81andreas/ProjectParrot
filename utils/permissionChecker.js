const { PermissionFlagsBits } = require('discord.js');

class PermissionChecker {
    static async checkBotPermissions(guild, requiredPermissions) {
        const botMember = guild.members.me;
        const missingPermissions = [];

        for (const permission of requiredPermissions) {
            if (!botMember.permissions.has(permission)) {
                missingPermissions.push(permission);
            }
        }

        return missingPermissions;
    }

    static async checkUserPermissions(member, requiredPermissions) {
        const missingPermissions = [];

        for (const permission of requiredPermissions) {
            if (!member.permissions.has(permission)) {
                missingPermissions.push(permission);
            }
        }

        return missingPermissions;
    }

    static formatPermission(permission) {
        return permission
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    static getRequiredPermissions(commandName) {
        const permissionMap = {
            setup: [
                PermissionFlagsBits.Administrator,
                PermissionFlagsBits.ManageRoles,
                PermissionFlagsBits.ManageChannels
            ],
            lockdown: [
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.ManageRoles
            ],
            // Add more commands and their required permissions
        };

        return permissionMap[commandName] || [];
    }
}

module.exports = PermissionChecker; 