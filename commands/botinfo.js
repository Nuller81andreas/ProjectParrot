const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const { version: botVersion } = require('../package.json');
const os = require('os');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Shows detailed information about the bot'),

    async execute(interaction) {
        const bot = interaction.client;
        
        // Calculate uptime
        const days = Math.floor(bot.uptime / 86400000);
        const hours = Math.floor(bot.uptime / 3600000) % 24;
        const minutes = Math.floor(bot.uptime / 60000) % 60;
        const uptime = `${days}d ${hours}h ${minutes}m`;

        // Get memory usage
        const memoryUsage = process.memoryUsage();
        const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMemory = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const usedMemory = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);

        // Developer information
        const developers = [
            {
                role: 'Owner',
                id: process.env.OWNER_ID,
                tag: await bot.users.fetch(process.env.OWNER_ID).then(user => user.tag)
            },
            {
                role: 'Head Developer',
                id: process.env.HEAD_DEVELOPER_ID,
                tag: await bot.users.fetch(process.env.HEAD_DEVELOPER_ID).then(user => user.tag)
            },
            {
                role: 'Lead Developer',
                id: process.env.LEAD_DEVELOPER_ID,
                tag: await bot.users.fetch(process.env.LEAD_DEVELOPER_ID).then(user => user.tag)
            }
        ].filter(dev => dev.id); // Filter out undefined developers

        const embed = new EmbedBuilder()
            .setTitle(`${bot.user.username} Information`)
            .setThumbnail(bot.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor('#0099ff')
            .addFields([
                {
                    name: '🤖 Bot Information',
                    value: [
                        `**Name:** ${bot.user.tag}`,
                        `**ID:** ${bot.user.id}`,
                        `**Created:** <t:${Math.floor(bot.user.createdTimestamp / 1000)}:R>`,
                        `**Version:** ${botVersion}`,
                        `**Discord.js:** v${version}`,
                        `**Node.js:** ${process.version}`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '👥 Development Team',
                    value: developers.map(dev => 
                        `**${dev.role}:** ${dev.tag} (${dev.id})`
                    ).join('\n'),
                    inline: false
                },
                {
                    name: '📊 Statistics',
                    value: [
                        `**Servers:** ${bot.guilds.cache.size}`,
                        `**Users:** ${bot.users.cache.size}`,
                        `**Channels:** ${bot.channels.cache.size}`,
                        `**Commands:** ${bot.commands.size}`,
                        `**Ping:** ${bot.ws.ping}ms`,
                        `**Uptime:** ${uptime}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '💻 System',
                    value: [
                        `**Platform:** ${os.platform()} ${os.release()}`,
                        `**CPU:** ${os.cpus()[0].model}`,
                        `**Memory Usage:** ${usedMemory} MB`,
                        `**Total Memory:** ${totalMemory} GB`,
                        `**Free Memory:** ${freeMemory} GB`,
                        `**Node Heap:** ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🔗 Links',
                    value: [
                        `[Support Server](${process.env.SUPPORT_SERVER})`,
                        `[Invite Bot](https://discord.com/oauth2/authorize?client_id=${bot.user.id}&permissions=8&scope=bot%20applications.commands)`,
                        `[GitHub](https://github.com/yourusername/your-repo)`
                    ].join(' • '),
                    inline: false
                }
            ])
            .setFooter({ 
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        // Add server-specific information if command is used in a guild
        if (interaction.guild) {
            embed.addFields({
                name: '🏠 Server Information',
                value: [
                    `**Server:** ${interaction.guild.name}`,
                    `**Server ID:** ${interaction.guild.id}`,
                    `**Joined:** <t:${Math.floor(interaction.guild.joinedTimestamp / 1000)}:R>`,
                    `**Member Count:** ${interaction.guild.memberCount}`,
                    `**Bot Prefix:** /`
                ].join('\n'),
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
}; 