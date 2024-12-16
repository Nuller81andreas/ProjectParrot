const { PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('./guildConfig');

class RoleManager {
    static async isAdmin(member) {
        if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
        
        const guildConfig = await GuildConfig.get(member.guild.id);
        return member.roles.cache.some(role => 
            guildConfig.permissions.adminRoles.includes(role.id)
        );
    }

    static async isModerator(member) {
        if (await this.isAdmin(member)) return true;
        
        const guildConfig = await GuildConfig.get(member.guild.id);
        return member.roles.cache.some(role => 
            guildConfig.permissions.modRoles.includes(role.id)
        );
    }

    static async hasPermission(member, permission) {
        if (await this.isAdmin(member)) return true;
        if (member.permissions.has(permission)) return true;
        
        const guildConfig = await GuildConfig.get(member.guild.id);
        return member.roles.cache.some(role => 
            guildConfig.permissions.modRoles.includes(role.id)
        );
    }
}

module.exports = RoleManager; 