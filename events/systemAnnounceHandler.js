const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;
        if (!interaction.customId.startsWith('systemannounce_')) return;

        if (interaction.replied || interaction.deferred) {
            console.error('Interaction has already been acknowledged.');
            return;
        }

        try {
            if (interaction.isStringSelectMenu() && interaction.customId === 'systemannounce_select') {
                const selectedValues = interaction.values;
                const updatesList = selectedValues.map(value => {
                    const info = getUpdateInfo(value);
                    return `• ${info.emoji} ${info.title}`;
                }).join('\n');

                await interaction.update({
                    content: `🌐 **Selected Updates**\nThe following updates will be announced:\n\n${updatesList}\n\nPress Send System Announcement to confirm`,
                    components: interaction.message.components
                });
                return;
            }

            if (interaction.isButton()) {
                if (interaction.customId === 'systemannounce_confirm') {
                    const message = interaction.message;
                    const selectedMenu = message.components[0]?.components[0];
                    
                    if (!selectedMenu?.options?.length) {
                        await interaction.update({
                            content: '❌ No updates were selected.',
                            components: []
                        });
                        return;
                    }

                    const selectedValues = selectedMenu.options
                        .filter(opt => opt.selected)
                        .map(opt => opt.value);

                    if (!selectedValues?.length) {
                        await interaction.update({
                            content: '❌ Please select at least one update type.',
                            components: message.components
                        });
                        return;
                    }

                    // Create the announcement message
                    const updatesList = selectedValues.map(value => {
                        const info = getUpdateInfo(value);
                        return `${info.emoji} **${info.title}**\n${info.description}`;
                    }).join('\n\n');

                    const announcementMessage = `🌐 **System Update Announcement**\n\nThe following system updates have been implemented:\n\n${updatesList}\n\n*Update by ${interaction.user.tag}*`;

                    // Send to all guilds
                    let successCount = 0;
                    let failCount = 0;

                    const guilds = interaction.client.guilds.cache;
                    for (const [, guild] of guilds) {
                        const systemChannel = guild.channels.cache.find(ch => 
                            ch.name === 'system-updates' || 
                            ch.name === 'updates' || 
                            ch.name === 'announcements' || 
                            ch.name === 'mod-logs'
                        );
                        
                        if (systemChannel) {
                            try {
                                await systemChannel.send(announcementMessage);
                                successCount++;
                            } catch (error) {
                                console.error(`Failed to send to guild ${guild.name}:`, error);
                                failCount++;
                            }
                        }
                    }

                    await interaction.update({
                        content: `✅ Global update announced successfully!\nSent to ${successCount} servers${failCount > 0 ? `\nFailed to send to ${failCount} servers` : ''}`,
                        components: []
                    });
                    return;
                }

                if (interaction.customId === 'systemannounce_cancel') {
                    await interaction.update({
                        content: '❌ System announcement cancelled.',
                        components: []
                    });
                    return;
                }
            }
        } catch (error) {
            console.error('Error in system announce handler:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.update({
                    content: '❌ An error occurred while processing the announcement.',
                    components: []
                }).catch(console.error);
            }
        }
    }
};

function getUpdateInfo(value) {
    const updates = {
        bugfix: {
            title: 'Bug Fixes',
            description: 'Various bug fixes and improvements have been implemented.',
            emoji: '🐛'
        },
        core: {
            title: 'Core Updates',
            description: 'Core system components have been updated and improved.',
            emoji: '⚡'
        },
        system: {
            title: 'System Updates',
            description: 'General system improvements and optimizations.',
            emoji: '🔄'
        },
        features: {
            title: 'New Features',
            description: 'New features and functionality have been added.',
            emoji: '✨'
        },
        ui: {
            title: 'UI Updates',
            description: 'User interface elements have been improved.',
            emoji: '🎨'
        },
        performance: {
            title: 'Performance Updates',
            description: 'Performance optimizations have been implemented.',
            emoji: '🚀'
        },
        security: {
            title: 'Security Updates',
            description: 'Security measures have been enhanced.',
            emoji: '🔒'
        },
        emergency: {
            title: 'Emergency Fixes',
            description: 'Critical system issues have been addressed.',
            emoji: '🚨'
        },
        antispam: {
            title: 'Anti-Spam Updates',
            description: 'Anti-spam systems have been improved.',
            emoji: '🛡️'
        },
        commands: {
            title: 'Command Updates',
            description: 'Command handling system has been updated.',
            emoji: '⚙️'
        },
        events: {
            title: 'Event Updates',
            description: 'Event handling system has been improved.',
            emoji: '📡'
        },
        database: {
            title: 'Database Updates',
            description: 'Database systems have been optimized.',
            emoji: '💾'
        },
        permissions: {
            title: 'Permission Updates',
            description: 'Permission handling has been updated.',
            emoji: '🔐'
        },
        errors: {
            title: 'Error Handling',
            description: 'Error handling systems have been improved.',
            emoji: '⚠️'
        },
        api: {
            title: 'API Updates',
            description: 'API systems have been updated and improved.',
            emoji: '🔌'
        }
    };

    return updates[value] || {
        title: 'System Update',
        description: 'System components have been updated.',
        emoji: '🔄'
    };
} 