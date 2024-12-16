const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('audit')
        .setDescription('View recent audit log entries')
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of entries to show')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(25))
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog),

    async execute(interaction) {
        const limit = interaction.options.getInteger('limit') || 10;
        await interaction.deferReply();

        try {
            const auditLogs = await interaction.guild.fetchAuditLogs({ limit });
            const entries = auditLogs.entries.map(entry => {
                return {
                    executor: entry.executor?.tag || 'Unknown',
                    action: entry.action,
                    target: entry.target?.tag || entry.target?.name || 'Unknown',
                    reason: entry.reason || 'No reason provided',
                    timestamp: entry.createdAt
                };
            });

            const chunks = [];
            for (let i = 0; i < entries.length; i += 5) {
                const chunk = entries.slice(i, i + 5);
                chunks.push({
                    embeds: [{
                        title: `📜 Audit Log Entries (${i + 1}-${Math.min(i + 5, entries.length)})`,
                        fields: chunk.map(entry => ({
                            name: `${entry.action}`,
                            value: `**Executor:** ${entry.executor}\n**Target:** ${entry.target}\n**Reason:** ${entry.reason}\n**Time:** <t:${Math.floor(entry.timestamp.getTime() / 1000)}:R>`
                        })),
                        color: 0x3498db,
                        timestamp: new Date()
                    }]
                });
            }

            await interaction.editReply(chunks[0]);
            
            // Send additional chunks if any
            for (let i = 1; i < chunks.length; i++) {
                await interaction.followUp(chunks[i]);
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'Failed to fetch audit logs.', ephemeral: true });
        }
    }
}; 