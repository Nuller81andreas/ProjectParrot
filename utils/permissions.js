require('dotenv').config();

const privilegedUsers = [
    process.env.OWNER_ID,
    process.env.HEAD_DEVELOPER_ID,
    process.env.LEAD_DEVELOPER_ID
].filter(Boolean); // Remove any undefined values

function isPrivilegedUser(userId) {
    return privilegedUsers.includes(userId);
}

function isDeveloper(userId) {
    return isPrivilegedUser(userId) || process.env.BOT_DEVELOPER_ID === userId;
}

function checkPermissions(interaction, commandName) {
    // Owner/Developer commands
    if (isPrivilegedUser(interaction.user.id)) return true;

    // Admin commands
    const adminCommands = ['announce', 'config', 'setup'];
    if (adminCommands.includes(commandName)) {
        return interaction.member.permissions.has(PermissionFlagsBits.Administrator);
    }

    // Mod commands
    const modCommands = ['ban', 'kick', 'mute', 'warn'];
    if (modCommands.includes(commandName)) {
        return interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers);
    }

    return true;
}

module.exports = {
    isPrivilegedUser,
    isDeveloper,
    checkPermissions
}; 