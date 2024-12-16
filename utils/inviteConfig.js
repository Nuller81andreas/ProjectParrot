require('dotenv').config();

const inviteConfig = {
    // Main bot invite with all required scopes
    botInvite: `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20identify%20applications.commands%20applications.commands.permissions.update%20guilds%20guilds.join%20guilds.members.read`,
    
    // Support server invite
    supportServer: 'https://discord.gg/t8EhufqQvC',
    
    // Required scopes list (for display)
    requiredScopes: [
        'bot',                                          // Basic bot functionality
        'identify',                                     // Read user info
        'applications.commands',                        // Slash commands
        'applications.commands.permissions.update',      // Command permission management
        'guilds',                                      // Server info access
        'guilds.join',                                 // Join servers
        'guilds.members.read'                          // Read member info
    ],
    
    // Required permissions list (for display)
    requiredPermissions: [
        'Administrator',
        'Manage Server',
        'Manage Roles',
        'Manage Channels',
        'Kick Members',
        'Ban Members',
        'Create Instant Invite',
        'View Audit Log',
        'Manage Messages',
        'Read Messages/View Channels',
        'Send Messages',
        'Manage Nicknames',
        'Manage Webhooks',
        'Add Reactions',
        'Use External Emojis',
        'Moderate Members',
        'View Server Insights',
        'Mute Members',
        'Move Members'
    ],
    
    // Bot information
    botInfo: {
        name: 'Core Systems',
        description: 'Advanced Security & Management Bot',
        mainColor: 0x3498db,
        errorColor: 0xff0000,
        successColor: 0x00ff00
    }
};

module.exports = inviteConfig; 