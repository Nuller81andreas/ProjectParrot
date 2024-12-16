const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { checkPermissions } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticket system management')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup the ticket system')
                .addChannelOption(option =>
                    option.setName('channel')
                    .setDescription('Channel to create ticket panel in')
                    .setRequired(true))
                .addRoleOption(option =>
                    option.setName('support-role')
                    .setDescription('Role for ticket support')
                    .setRequired(true))
        ),

    async execute(interaction) {
        if (!checkPermissions(interaction, 'ticket')) {
            return interaction.reply({
                content: 'This command can only be used by the bot owner.',
                ephemeral: true
            });
        }

        const channel = interaction.options.getChannel('channel');
        const supportRole = interaction.options.getRole('support-role');

        const embed = new EmbedBuilder()
            .setTitle('🎫 Support Tickets')
            .setDescription('Click the button below to create a support ticket')
            .setColor('#0099ff');

        const button = new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('Create Ticket')
            .setEmoji('🎫')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({
            content: 'Ticket system has been set up successfully!',
            ephemeral: true
        });
    }
}; 