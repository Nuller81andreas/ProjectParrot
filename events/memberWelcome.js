const { Events, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const welcomeConfig = await db.get(`welcome_${member.guild.id}`);
        if (!welcomeConfig) return;

        const channel = member.guild.channels.cache.get(welcomeConfig.channelId);
        if (!channel) return;

        const welcomeMessage = welcomeConfig.message
            .replace('{user}', member)
            .replace('{server}', member.guild.name);

        const welcomeEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('👋 Welcome!')
            .setDescription(welcomeMessage)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

        await channel.send({ embeds: [welcomeEmbed] });
    },
}; 