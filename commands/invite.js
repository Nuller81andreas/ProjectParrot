const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { botInvite, supportServer, requiredPermissions, botInfo } = require('../utils/inviteConfig.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get the bot\'s invite link'),

    async execute(interaction) {
        const inviteEmbed = new EmbedBuilder()
            .setTitle(`🤖 Invite ${botInfo.name}`)
            .setDescription('Click the button below to add me to your server!')
            .setColor(botInfo.mainColor)
            .addFields([
                { 
                    name: '⚠️ Required Permission', 
                    value: 'This bot requires the `Administrator` permission to function properly. This ensures all security and management features work correctly.'
                },
                {
                    name: 'Support',
                    value: `Join our [support server](${supportServer}) for help!`
                }
            ])
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp();

        const inviteButton = new ButtonBuilder()
            .setLabel('Invite Bot')
            .setStyle(ButtonStyle.Link)
            .setURL(botInvite);

        const supportButton = new ButtonBuilder()
            .setLabel('Support Server')
            .setStyle(ButtonStyle.Link)
            .setURL(supportServer);

        const row = new ActionRowBuilder()
            .addComponents(inviteButton, supportButton);

        await interaction.reply({
            embeds: [inviteEmbed],
            components: [row]
        });
    }
}; 