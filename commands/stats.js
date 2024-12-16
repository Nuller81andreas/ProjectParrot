const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkPermissions } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View server statistics'),

    async execute(interaction) {
        if (!checkPermissions(interaction, 'stats')) {
            return interaction.reply({
                content: 'This command can only be used by the bot owner.',
                ephemeral: true
            });
        }

        const guild = interaction.guild;
        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(m => m.presence?.status === 'online').size;
        const channels = guild.channels.cache;
        const roles = guild.roles.cache;

        const embed = new EmbedBuilder()
            .setTitle(`${guild.name} Statistics`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Total Members', value: totalMembers.toString(), inline: true },
                { name: 'Online Members', value: onlineMembers.toString(), inline: true },
                { name: 'Text Channels', value: channels.filter(c => c.type === 0).size.toString(), inline: true },
                { name: 'Voice Channels', value: channels.filter(c => c.type === 2).size.toString(), inline: true },
                { name: 'Roles', value: roles.size.toString(), inline: true },
                { name: 'Server Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setColor('#00FF00')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}; 