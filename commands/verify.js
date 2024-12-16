const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createCaptcha } = require('../utils/captchaGenerator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Start the verification process'),

    async execute(interaction) {
        try {
            const member = interaction.member;
            const unverifiedRole = member.guild.roles.cache.find(role => role.name === 'Unverified');
            
            if (!member.roles.cache.has(unverifiedRole?.id)) {
                if (!interaction.deferred && !interaction.replied) {
                    return await interaction.reply({
                        content: '✅ You are already verified!',
                        ephemeral: true
                    });
                }
                return;
            }

            // Create verification buttons
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('verify_captcha')
                        .setLabel('Captcha Verification')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🔒'),
                    new ButtonBuilder()
                        .setCustomId('verify_rules')
                        .setLabel('Read Rules')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('📜')
                );

            const verifyEmbed = new EmbedBuilder()
                .setTitle('Server Verification')
                .setDescription('Please complete the following steps to gain access:\n\n' +
                    '1. Click "Read Rules" to view server rules\n' +
                    '2. Complete the Captcha verification\n\n' +
                    'This helps us prevent bots and ensure server security.')
                .setColor('#2f3136')
                .setTimestamp();

            if (!interaction.deferred && !interaction.replied) {
                await interaction.reply({
                    embeds: [verifyEmbed],
                    components: [row],
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    embeds: [verifyEmbed],
                    components: [row],
                    ephemeral: true
                });
            }

        } catch (error) {
            console.error('Error in verify command:', error);
            if (!interaction.deferred && !interaction.replied) {
                await interaction.reply({
                    content: '❌ An error occurred. Please try again or contact a moderator.',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: '❌ An error occurred. Please try again or contact a moderator.',
                    ephemeral: true
                });
            }
        }
    }
}; 