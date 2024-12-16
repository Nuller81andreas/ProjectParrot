const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('russianroulette')
        .setDescription('Play Russian Roulette - get timed out if you lose!')
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Timeout duration in minutes if you lose (default: 5)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(60)),

    async execute(interaction) {
        // Defer reply since we'll have a dramatic pause
        await interaction.deferReply();

        const duration = interaction.options.getInteger('duration') || 5; // Default 5 minutes
        const chamber = Math.floor(Math.random() * 6); // 0-5, representing 6 chambers
        
        await interaction.editReply('🔫 *Spinning the chamber...*');
        
        // Add dramatic pause
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (chamber === 0) { // Lost (1/6 chance)
            try {
                // Timeout the user
                await interaction.member.timeout(duration * 60 * 1000, 'Lost at Russian Roulette');
                await interaction.editReply(`💥 **BANG!** <@${interaction.user.id}> lost and got timed out for ${duration} minutes! Better luck next time!`);
            } catch (error) {
                await interaction.editReply('💥 **BANG!** You lost, but I don\'t have permission to timeout users!');
            }
        } else {
            // Won (5/6 chance)
            await interaction.editReply(`*click* 😅 <@${interaction.user.id}> lives to play another day!`);
        }
    },
}; 