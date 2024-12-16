const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getinvite')
        .setDescription('⚠️ Get invites to all servers (Owner/Dev Only)')
        .setDefaultMemberPermissions(0), // Makes the command invisible to regular users
    ownerOnly: true,

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // Check if user is privileged
            if (interaction.user.id !== process.env.BOT_OWNER_ID && 
                interaction.user.id !== process.env.HEAD_DEVELOPER_ID && 
                interaction.user.id !== process.env.LEAD_DEVELOPER_ID) {
                return await interaction.editReply({
                    content: '❌ This command is restricted to Bot Owner and Developers.',
                    ephemeral: true
                });
            }

            const guilds = await interaction.client.guilds.fetch();
            const inviteResults = [];

            for (const [, guild] of guilds) {
                try {
                    // Fetch full guild data
                    const fullGuild = await guild.fetch();
                    
                    // Check if user is already in the server
                    const guildMember = await fullGuild.members.fetch(interaction.user.id).catch(() => null);
                    if (guildMember) {
                        inviteResults.push({
                            name: fullGuild.name,
                            id: fullGuild.id,
                            memberCount: fullGuild.memberCount,
                            status: 'Already Member',
                            invite: null
                        });
                        continue;
                    }

                    // Try to create invite from the first suitable channel
                    let invite = null;
                    const channels = await fullGuild.channels.fetch();
                    
                    for (const [, channel] of channels) {
                        if (channel.type === 0 && // Text channel
                            channel.permissionsFor(fullGuild.members.me).has(PermissionFlagsBits.CreateInstantInvite)) {
                            invite = await channel.createInvite({
                                maxAge: 3600, // 1 hour
                                maxUses: 1, // Single use
                                unique: true
                            }).catch(() => null);
                            
                            if (invite) break;
                        }
                    }

                    inviteResults.push({
                        name: fullGuild.name,
                        id: fullGuild.id,
                        memberCount: fullGuild.memberCount,
                        status: invite ? 'Invite Created' : 'Failed to Create Invite',
                        invite: invite?.url || null
                    });

                } catch (error) {
                    console.error(`Error processing guild ${guild.id}:`, error);
                    inviteResults.push({
                        name: guild.name || 'Unknown Server',
                        id: guild.id,
                        memberCount: '?',
                        status: 'Error',
                        invite: null
                    });
                }
            }

            // Create embeds for each server (max 25 fields per embed)
            const embeds = [];
            let currentEmbed = new EmbedBuilder()
                .setTitle('🎟️ Server Invites')
                .setColor(0x3498db)
                .setTimestamp();
            
            let fieldCount = 0;

            for (const result of inviteResults) {
                if (fieldCount === 25) {
                    embeds.push(currentEmbed);
                    currentEmbed = new EmbedBuilder()
                        .setTitle('🎟️ Server Invites (Continued)')
                        .setColor(0x3498db)
                        .setTimestamp();
                    fieldCount = 0;
                }

                currentEmbed.addFields({
                    name: `${result.name} (${result.memberCount} members)`,
                    value: result.invite ? 
                        `🔗 [Join Server](${result.invite})` :
                        `Status: ${result.status}`
                });
                fieldCount++;
            }

            embeds.push(currentEmbed);

            // Add summary footer
            const summary = new EmbedBuilder()
                .setDescription(`Total Servers: ${inviteResults.length}\nInvites Created: ${inviteResults.filter(r => r.invite).length}\nAlready Member: ${inviteResults.filter(r => r.status === 'Already Member').length}`)
                .setColor(0x3498db)
                .setFooter({ text: '⚠️ Invites expire in 1 hour and can only be used once' });

            embeds.push(summary);

            await interaction.editReply({ 
                embeds: embeds,
                ephemeral: true
            });

            // Log the invite generation
            const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('🎟️ Server Invites Generated')
                    .setDescription(`**User:** ${interaction.user.tag}\n**Total Servers:** ${inviteResults.length}\n**Invites Created:** ${inviteResults.filter(r => r.invite).length}`)
                    .setColor(0xFF0000)
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            }

        } catch (error) {
            console.error('Error in getinvite command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while generating invites.',
                ephemeral: true
            });
        }
    }
}; 