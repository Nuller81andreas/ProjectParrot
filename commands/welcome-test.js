const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { checkPermissions } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-test')
        .setDescription('Test the welcome message (Staff only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const member = interaction.member;
        const guild = interaction.guild;

        const welcomeEmbed = new EmbedBuilder()
            .setTitle('🏰 Welcome to The Haunting Grounds!')
            .setDescription(`Welcome ${member} to our community!`)
            .addFields(
                {
                    name: '📜 Getting Started',
                    value: 'As you step into this enigmatic space, we kindly ask that you take a moment to familiarize yourself with our rules and regulations.'
                },
                {
                    name: '🤝 Community Values',
                    value: 'Respect for one another is paramount, ensuring a safe and enjoyable environment for all.'
                },
                {
                    name: '✨ Let\'s Begin',
                    value: 'Let\'s create memorable experiences together while keeping the spirit of The Haunting Grounds alive!'
                },
                {
                    name: '📊 Server Information',
                    value: [
                        `🎮 Member Count: ${guild.memberCount}`,
                        `🎯 You are member #${guild.memberCount}`,
                        `📅 Account Created: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`
                    ].join('\n')
                }
            )
            .setColor('#800080')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setImage(guild.bannerURL({ size: 1024 }) || null)
            .setTimestamp()
            .setFooter({ 
                text: `${guild.name} • Test Message`,
                iconURL: guild.iconURL({ dynamic: true })
            });

        try {
            // Send preview to the channel where command was used
            await interaction.reply({
                content: '**🔍 Welcome Message Test Preview:**\nThis is how the welcome message will appear for new members:',
                embeds: [welcomeEmbed],
                ephemeral: true
            });

            // Send a non-ephemeral version if requested
            const followUpMessage = await interaction.followUp({
                content: 'Would you like to see how this looks in the channel? React with ✅ to send a non-ephemeral test message.',
                ephemeral: true
            });

            // Add reaction
            await followUpMessage.react('✅');

            // Create collector
            const filter = (reaction, user) => {
                return reaction.emoji.name === '✅' && user.id === interaction.user.id;
            };

            const collector = followUpMessage.createReactionCollector({ filter, time: 30000, max: 1 });

            collector.on('collect', async () => {
                await interaction.channel.send({
                    content: `**TEST MESSAGE**\n${member} just joined the server!`,
                    embeds: [welcomeEmbed.setFooter({ 
                        text: `${guild.name} • Test Join Simulation`,
                        iconURL: guild.iconURL({ dynamic: true })
                    })]
                });
                await followUpMessage.edit({
                    content: '✅ Test message sent to channel!',
                    ephemeral: true
                });
            });

            collector.on('end', async collected => {
                if (collected.size === 0) {
                    await followUpMessage.edit({
                        content: '⏱️ Test message preview expired.',
                        ephemeral: true
                    });
                }
            });

        } catch (error) {
            console.error('Error sending welcome test message:', error);
            await interaction.reply({
                content: 'Failed to generate welcome message preview.',
                ephemeral: true
            });
        }
    }
}; 