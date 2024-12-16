const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Safely shuts down the bot')
        .addBooleanOption(option =>
            option.setName('confirm')
                .setDescription('Confirm shutdown')
                .setRequired(true)),
    ownerOnly: true,
    
    async execute(interaction) {
        try {
            const confirm = interaction.options.getBoolean('confirm');
            
            if (!confirm) {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ 
                        content: '❌ Shutdown cancelled - confirmation was false', 
                        ephemeral: true 
                    });
                }
                return;
            }

            // Clear any intervals
            clearInterval(interaction.client.spamCleanupInterval);
            
            // Log to console
            console.log(`Bot shutdown initiated by ${interaction.user.tag} (${interaction.user.id})`);
            
            // Send shutdown message
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: '🔄 Shutting down...\nAll systems are being safely terminated.', 
                    ephemeral: true 
                });
            }

            // Perform cleanup
            try {
                // Set bot status to invisible before shutting down
                await interaction.client.user.setStatus('invisible');
                
                // Wait for status to update
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Destroy the client connection
                await interaction.client.destroy();
                
                // Exit process
                process.exit(0);
            } catch (error) {
                console.error('Error during shutdown cleanup:', error);
                process.exit(1); // Exit with error code
            }

        } catch (error) {
            console.error('Error in shutdown command:', error);
            
            // Try to notify about the error
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: '❌ An error occurred during shutdown. Check console for details.', 
                    ephemeral: true 
                });
            }
            
            throw error;
        }
    }
}; 