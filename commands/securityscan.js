const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('securityscan')
        .setDescription('Scan server for security vulnerabilities')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();

        const guild = interaction.guild;
        const issues = [];

        // Check role permissions
        const roles = await guild.roles.fetch();
        roles.forEach(role => {
            if (role.permissions.has(PermissionFlagsBits.Administrator) && 
                role.name !== '@everyone' && 
                role.name !== 'Security Bot' && 
                role.name !== 'Core Systems') {
                issues.push(`⚠️ Role "${role.name}" has Administrator permissions`);
            }
            if (role.permissions.has(PermissionFlagsBits.MentionEveryone)) {
                issues.push(`⚠️ Role "${role.name}" can mention @everyone`);
            }
        });

        // Split issues into chunks of 15 for multiple embeds
        const chunks = [];
        for (let i = 0; i < issues.length; i += 15) {
            chunks.push(issues.slice(i, i + 15));
        }

        // Create embeds for each chunk
        const embeds = chunks.map((chunk, index) => {
            return new EmbedBuilder()
                .setTitle(`🔍 Security Scan Results ${index + 1}/${chunks.length}`)
                .setDescription(chunk.join('\n'))
                .setColor(0xff0000)
                .setTimestamp();
        });

        // Add summary embed
        const summaryEmbed = new EmbedBuilder()
            .setTitle('📊 Security Scan Summary')
            .addFields([
                {
                    name: 'Issues Found',
                    value: `Total: ${issues.length}\nAdmin Roles: ${issues.filter(i => i.includes('Administrator')).length}\nMention Everyone: ${issues.filter(i => i.includes('mention')).length}`
                },
                {
                    name: 'Server Settings',
                    value: `Verification Level: ${guild.verificationLevel}\nExplicit Content Filter: ${guild.explicitContentFilter}`
                }
            ])
            .setColor(issues.length > 0 ? 0xff0000 : 0x00ff00)
            .setTimestamp();

        embeds.push(summaryEmbed);

        // Send results
        await interaction.editReply({ embeds: [embeds[0]] });

        // Send additional embeds as follow-ups if there are more
        for (let i = 1; i < embeds.length; i++) {
            await interaction.followUp({ embeds: [embeds[i]], ephemeral: true });
        }

        // Log to mod-logs
        const logChannel = guild.channels.cache.find(c => c.name === 'mod-logs');
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle('🔍 Security Scan Performed')
                .setDescription(`**Performed by:** ${interaction.user.tag}\n**Issues found:** ${issues.length}`)
                .setColor(issues.length > 0 ? 0xff0000 : 0x00ff00)
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
        }
    }
}; 