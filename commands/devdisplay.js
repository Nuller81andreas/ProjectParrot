const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { isDeveloper, setDevDisplay } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('devdisplay')
        .setDescription('Set your developer display preference')
        .addStringOption(option =>
            option.setName('display')
                .setDescription('Choose how to display your developer status')
                .setRequired(true)
                .addChoices(
                    { name: 'Core Developer', value: 'Core Developer' },
                    { name: 'System Developer', value: 'System Developer' },
                    { name: 'Lead Developer', value: 'Lead Developer' },
                    { name: 'Head Developer', value: 'Head Developer' },
                    { name: 'Bot Developer', value: 'Bot Developer' }
                )),
    developerOnly: true,

    async execute(interaction) {
        try {
            const displayType = interaction.options.getString('display');
            
            if (await setDevDisplay(interaction.user.id, displayType)) {
                const embed = new EmbedBuilder()
                    .setTitle('✅ Display Preference Updated')
                    .setDescription(`Your developer status will now display as: **${displayType}**`)
                    .setColor('#00FF00')
                    .setTimestamp();

                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: '❌ You do not have permission to use this command.',
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error in devdisplay command:', error);
            await interaction.reply({
                content: '❌ An error occurred while updating your display preference.',
                ephemeral: true
            });
        }
    }
}; 