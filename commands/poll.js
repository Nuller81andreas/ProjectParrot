const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkPermissions } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll')
        .addStringOption(option =>
            option.setName('question')
            .setDescription('The poll question')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('options')
            .setDescription('Poll options (separate with commas)')
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
            .setDescription('Poll duration in minutes')
            .setRequired(false)),

    async execute(interaction) {
        if (!checkPermissions(interaction, 'poll')) {
            return interaction.reply({
                content: 'This command can only be used by the bot owner.',
                ephemeral: true
            });
        }

        const question = interaction.options.getString('question');
        const options = interaction.options.getString('options').split(',').map(opt => opt.trim());
        const duration = interaction.options.getInteger('duration') || 60; // Default 60 minutes

        if (options.length < 2 || options.length > 10) {
            return interaction.reply({
                content: 'Please provide between 2 and 10 options.',
                ephemeral: true
            });
        }

        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        const pollOptions = options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n\n');

        const embed = new EmbedBuilder()
            .setTitle('📊 ' + question)
            .setDescription(pollOptions)
            .setColor('#FF9300')
            .setFooter({ text: `Poll ends in ${duration} minutes` })
            .setTimestamp();

        const pollMessage = await interaction.reply({
            embeds: [embed],
            fetchReply: true
        });

        // Add reaction options
        for (let i = 0; i < options.length; i++) {
            await pollMessage.react(emojis[i]);
        }

        // End the poll after duration
        setTimeout(async () => {
            const fetchedMessage = await interaction.channel.messages.fetch(pollMessage.id);
            const results = options.map((opt, i) => {
                const reaction = fetchedMessage.reactions.cache.get(emojis[i]);
                return {
                    option: opt,
                    votes: reaction ? reaction.count - 1 : 0 // Subtract 1 to exclude bot's reaction
                };
            });

            const resultsEmbed = new EmbedBuilder()
                .setTitle('📊 Poll Results: ' + question)
                .setDescription(results.map(r => `${r.option}: ${r.votes} votes`).join('\n'))
                .setColor('#00FF00')
                .setTimestamp();

            await interaction.channel.send({ embeds: [resultsEmbed] });
        }, duration * 60000);
    }
}; 