// Create a new file to manage command premium requirements
const COMMAND_REQUIREMENTS = {
    // Security & Protection
    'antiraid': { tier: 'silver', feature: 'security' },
    'antinuke': { tier: 'gold', feature: 'security' },
    'antispam': { tier: 'silver', feature: 'security' },
    'securityscan': { tier: 'silver', feature: 'security' },
    'lockdown': { tier: 'silver', feature: 'security' },
    'unlock': { tier: 'silver', feature: 'security' },
    'raidmode': { tier: 'silver', feature: 'security' },
    'verification': { tier: 'silver', feature: 'security' },

    // Role Management
    'autorole': { tier: 'silver', feature: 'roles' },
    'reaction-roles': { tier: 'gold', feature: 'roles' },
    'rolerequest': { tier: 'silver', feature: 'roles' },
    'giveroles': { tier: 'gold', feature: 'roles' },
    'corerole': { tier: 'gold', feature: 'roles' },
    'whitelist': { tier: 'gold', feature: 'roles' },
    'blacklist-role': { tier: 'gold', feature: 'roles' },

    // Ticket System
    'ticket-setup': { tier: 'bronze', feature: 'tickets' },
    'ticket-custom': { tier: 'silver', feature: 'tickets' },
    'ticket-advanced': { tier: 'gold', feature: 'tickets' },
    'rolerequest-setup': { tier: 'silver', feature: 'tickets' },

    // Logging & Monitoring
    'logging': { tier: 'bronze', feature: 'logging' },
    'audit': { tier: 'silver', feature: 'logging' },
    'messageLogger': { tier: 'bronze', feature: 'logging' },
    'messageDeleteLogger': { tier: 'bronze', feature: 'logging' },

    // System Updates & Management
    'dev': { tier: 'gold', feature: 'system' },
    'globaldev': { tier: 'gold', feature: 'system' },
    'setup': { tier: 'bronze', feature: 'system' },
    'botinfo': { tier: 'bronze', feature: 'system' },

    // Backup & Recovery
    'backup-create': { tier: 'bronze', feature: 'backup' },
    'backup-load': { tier: 'silver', feature: 'backup' },
    'backup-auto': { tier: 'gold', feature: 'backup' },

    // Moderation
    'ban': { tier: 'bronze', feature: 'moderation' },
    'kick': { tier: 'bronze', feature: 'moderation' },
    'mute': { tier: 'bronze', feature: 'moderation' },
    'warn': { tier: 'bronze', feature: 'moderation' },
    'slowmode': { tier: 'bronze', feature: 'moderation' },

    // Premium Features
    'customization': { tier: 'gold', feature: 'premium' },
    'stats': { tier: 'gold', feature: 'premium' },
    'giveaways': { tier: 'gold', feature: 'premium' },
    'polls': { tier: 'gold', feature: 'premium' },
    'getinvite': { tier: 'gold', feature: 'premium' },

    // Welcome System
    'welcome-basic': { tier: 'bronze', feature: 'welcome' },
    'welcome-custom': { tier: 'silver', feature: 'welcome' },
    'welcome-premium': { tier: 'gold', feature: 'welcome' },

    // Exempt Commands (No Premium Required)
    'help': null,
    'ping': null,
    'invite': null,
    'premium': null,
    'support': null
};

// Feature categories for better organization
const FEATURE_CATEGORIES = {
    security: '🛡️ Security & Protection',
    roles: '👥 Role Management',
    tickets: '🎫 Ticket System',
    logging: '📝 Logging & Monitoring',
    system: '⚙️ System Management',
    backup: '💾 Backup & Recovery',
    moderation: '🔨 Moderation',
    premium: '💎 Premium Features',
    welcome: '👋 Welcome System'
};

// Tier benefits for display
const TIER_BENEFITS = {
    bronze: {
        description: 'Basic protection and management features',
        commandLimit: 50,
        backupLimit: 2,
        ticketsPerDay: 5
    },
    silver: {
        description: 'Advanced security and automation',
        commandLimit: 100,
        backupLimit: 5,
        ticketsPerDay: 15
    },
    gold: {
        description: 'Full access to all features',
        commandLimit: -1, // Unlimited
        backupLimit: -1, // Unlimited
        ticketsPerDay: -1 // Unlimited
    }
};

module.exports = { 
    COMMAND_REQUIREMENTS,
    FEATURE_CATEGORIES,
    TIER_BENEFITS
}; 