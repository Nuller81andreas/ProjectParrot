const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Handle select menu interaction
        if (interaction.isStringSelectMenu() && interaction.customId === 'dev_select') {
            try {
                if (!interaction.client.devSelections) {
                    interaction.client.devSelections = new Map();
                }
                interaction.client.devSelections.set(interaction.user.id, interaction.values);

                const selectionEmbed = new EmbedBuilder()
                    .setTitle('🛠 Selected Updates')
                    .setDescription('You selected:\n' + 
                        interaction.values.map(value => {
                            switch(value) {
                                case 'bugfix': return '🐛 Bug Fixes';
                                case 'core': return '⚡ Core Updates';
                                case 'system': return '🔄 System Updates';
                                case 'features': return '✨ New Features';
                                case 'ui': return '🎨 UI Updates';
                                case 'performance': return '🚀 Performance Updates';
                                case 'security': return '🔒 Security Updates';
                                case 'emergency': return '🚨 Emergency Fixes';
                                case 'antispam': return '🛡️ Anti-Spam Updates';
                                case 'commands': return '⚙️ Command Handler Updates';
                                case 'events': return '📡 Event System Updates';
                                case 'database': return '💾 Database Updates';
                                case 'permissions': return '🔒 Permission System Updates';
                                case 'errors': return '⚠️ Error Handling Updates';
                                default: return value;
                            }
                        }).join('\n'))
                    .setColor('#FF5555')
                    .setFooter({ text: 'Click "Apply Selected Updates" to proceed' });

                await interaction.update({
                    embeds: [selectionEmbed],
                    components: interaction.message.components
                });
            } catch (error) {
                console.error('Error handling dev selection:', error);
            }
        }

        // Handle button interactions
        if (interaction.isButton() && interaction.customId.startsWith('dev_')) {
            try {
                const selections = interaction.client.devSelections?.get(interaction.user.id);

                if (interaction.customId === 'dev_cancel') {
                    await interaction.update({
                        content: '❌ Update cancelled',
                        embeds: [],
                        components: [],
                        ephemeral: true
                    });
                    return;
                }

                if (interaction.customId === 'dev_confirm') {
                    if (!selections || selections.length === 0) {
                        await interaction.reply({
                            content: '⚠️ Please select at least one update type.',
                            ephemeral: true
                        });
                        return;
                    }

                    const updates = {
                        bugfix: '🐛 Bug Fixes: General improvements and fixes implemented',
                        core: '⚡ Core: Major system improvements implemented',
                        system: '🔄 System: General enhancements applied',
                        features: '✨ Features: New functionality added',
                        ui: '🎨 UI: Interface improvements implemented',
                        performance: '🚀 Performance: Speed and efficiency enhanced',
                        security: '🔒 Security: Security measures strengthened',
                        emergency: '🚨 Emergency: Critical fixes applied',
                        antispam: '🛡️ Anti-Spam: Spam protection system enhanced',
                        commands: '⚙️ Commands: Command handling system improved',
                        events: '📡 Events: Event management system optimized',
                        database: '💾 Database: Data management systems updated',
                        permissions: '🔒 Permissions: Permission handling system enhanced',
                        errors: '⚠️ Error Handling: System stability improvements implemented'
                    };

                    const selectedUpdates = selections.map(type => updates[type]);

                    const resultEmbed = new EmbedBuilder()
                        .setTitle('✅ Updates Applied')
                        .setDescription('The following updates have been applied:\n\n' + 
                            selectedUpdates.join('\n'))
                        .setColor('#00FF00')
                        .setTimestamp();

                    await interaction.update({
                        embeds: [resultEmbed],
                        components: [],
                        ephemeral: true
                    });

                    // Log the updates
                    const logChannel = interaction.guild.channels.cache.find(ch => ch.name === 'mod-logs');
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('🛠 Development Updates Applied')
                            .setDescription(`Updates applied by ${interaction.user.tag}:\n\n${selectedUpdates.join('\n')}`)
                            .setColor('#FF5555')
                            .setTimestamp()
                            .setFooter({ text: `Developer ID: ${interaction.user.id}` });

                        await logChannel.send({ embeds: [logEmbed] });
                    }
                }
            } catch (error) {
                console.error('Error handling dev button:', error);
                await interaction.reply({
                    content: '❌ An error occurred while processing the updates.',
                    ephemeral: true
                });
            }
        }
    }
}; 