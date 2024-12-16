const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { isPrivilegedUser } = require('../utils/permissions');
const PremiumSystem = require('../utils/premiumSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium')
        .setDescription('Manage premium features')
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check premium status'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('activate')
                .setDescription('Activate premium (Owner only)')
                .addStringOption(option =>
                    option
                        .setName('guild')
                        .setDescription('Guild ID to activate premium for')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option
                        .setName('duration')
                        .setDescription('Duration in days')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(365)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('features')
                .setDescription('View premium features')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'status': {
                const isPremium = await PremiumSystem.isPremium(interaction.guildId);
                const premiumData = await PremiumSystem.getPremiumData(interaction.guildId);

                const embed = new EmbedBuilder()
                    .setTitle('Premium Status')
                    .setColor(isPremium ? '#00FF00' : '#FF0000');

                if (isPremium && premiumData) {
                    embed
                        .setDescription('✅ This server has premium access!')
                        .addFields([
                            { 
                                name: 'Status', 
                                value: 'Active', 
                                inline: true 
                            },
                            { 
                                name: 'Expires', 
                                value: `<t:${Math.floor(premiumData.expiresAt / 1000)}:R>`, 
                                inline: true 
                            },
                            { 
                                name: 'Activated By', 
                                value: `<@${premiumData.activatedBy}>`, 
                                inline: true 
                            }
                        ]);
                } else {
                    embed
                        .setDescription('❌ This server does not have premium access.')
                        .addFields([
                            { 
                                name: 'Want Premium?', 
                                value: 'Contact our support team or visit our website!' 
                            }
                        ]);
                }

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }

            case 'activate': {
                if (!await isPrivilegedUser(interaction.user.id)) {
                    return interaction.reply({
                        content: 'Only bot owners can activate premium status.',
                        ephemeral: true
                    });
                }

                const guildId = interaction.options.getString('guild');
                const duration = interaction.options.getInteger('duration');

                try {
                    const premiumData = await PremiumSystem.addPremium(
                        guildId,
                        duration,
                        interaction.user.id
                    );

                    const embed = new EmbedBuilder()
                        .setTitle('Premium Activated')
                        .setDescription(`✅ Premium has been activated for guild: ${guildId}`)
                        .addFields([
                            { 
                                name: 'Duration', 
                                value: `${duration} days`, 
                                inline: true 
                            },
                            { 
                                name: 'Expires', 
                                value: `<t:${Math.floor(premiumData.expiresAt / 1000)}:R>`, 
                                inline: true 
                            }
                        ])
                        .setColor('#00FF00')
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    console.error('Error activating premium:', error);
                    await interaction.reply({
                        content: 'Failed to activate premium status.',
                        ephemeral: true
                    });
                }
                break;
            }

            case 'features': {
                const features = PremiumSystem.getPremiumFeatures();
                const isPremium = await PremiumSystem.isPremium(interaction.guildId);

                const embed = new EmbedBuilder()
                    .setTitle('Premium Features')
                    .setDescription(isPremium ? 
                        '✨ Your server has access to these premium features!' : 
                        '⭐ Upgrade to premium to access these features!')
                    .setColor(isPremium ? '#00FF00' : '#FF9900');

                for (const [key, feature] of Object.entries(features)) {
                    embed.addFields({
                        name: feature.name,
                        value: `${feature.description}\n${isPremium ? '✅ Unlocked' : '🔒 Locked'}`,
                        inline: true
                    });
                }

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }
        }
    }
}; 