const { Events, EmbedBuilder, PermissionFlagsBits, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        // Handle ticket creation buttons
        if (interaction.customId.startsWith('ticket_')) {
            try {
                // Defer the reply immediately
                await interaction.deferReply({ ephemeral: true });

                const ticketType = interaction.customId.split('_')[1];
                const guild = interaction.guild;
                const member = interaction.member;

                // Configure ticket settings based on type
                const ticketConfig = {
                    general: {
                        name: '❓-general-',
                        color: 0x3498db,
                        description: 'General Support Ticket'
                    },
                    technical: {
                        name: '🛠️-technical-',
                        color: 0xe74c3c,
                        description: 'Technical Support Ticket'
                    },
                    management: {
                        name: '👥-management-',
                        color: 0x2ecc71,
                        description: 'Management Ticket'
                    },
                    transfer: {
                        name: '🔄-transfer-',
                        color: 0xf1c40f,
                        description: 'Transfer/Merge Request'
                    },
                    owner: {
                        name: '👑-owner-',
                        color: 0x9b59b6,
                        description: 'Owner Contact Ticket'
                    }
                };

                const config = ticketConfig[ticketType];
                if (!config) {
                    return await interaction.editReply({
                        content: 'Invalid ticket type selected.',
                        ephemeral: true
                    });
                }

                // Check for existing ticket
                const existingTicket = guild.channels.cache.find(
                    channel => channel.name.includes(member.user.username.toLowerCase()) &&
                    channel.parent === interaction.channel.parent
                );

                if (existingTicket) {
                    return await interaction.editReply({
                        content: `You already have an open ticket: ${existingTicket}`,
                        ephemeral: true
                    });
                }

                // Create ticket channel
                const ticketChannel = await guild.channels.create({
                    name: `${config.name}${member.user.username}`.toLowerCase(),
                    type: ChannelType.GuildText,
                    parent: interaction.channel.parent,
                    permissionOverwrites: [
                        {
                            id: guild.id, // @everyone role
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: member.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        },
                        {
                            id: guild.members.me.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ManageChannels,
                                PermissionFlagsBits.ManageMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        }
                    ]
                });

                // Create ticket embed
                const ticketEmbed = new EmbedBuilder()
                    .setTitle(`${config.description}`)
                    .setDescription(`Ticket created by ${member}`)
                    .addFields([
                        { name: 'Type', value: config.description, inline: true },
                        { name: 'Created', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                    ])
                    .setColor(config.color)
                    .setTimestamp();

                // Create ticket control buttons
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`close_${ticketChannel.id}`)
                            .setLabel('Close Ticket')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('🔒'),
                        new ButtonBuilder()
                            .setCustomId(`claim_${ticketChannel.id}`)
                            .setLabel('Claim Ticket')
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('✋'),
                        new ButtonBuilder()
                            .setCustomId(`transcript_${ticketChannel.id}`)
                            .setLabel('Save Transcript')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('📑')
                    );

                await ticketChannel.send({
                    content: `${member} Welcome to your ticket!`,
                    embeds: [ticketEmbed],
                    components: [row]
                });

                // Send success message
                await interaction.editReply({
                    content: `Your ticket has been created: ${ticketChannel}`,
                    ephemeral: true
                });

                // Log ticket creation
                const logChannel = guild.channels.cache.find(c => c.name === 'mod-logs');
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('🎫 Ticket Created')
                        .setDescription(`**User:** ${member.user.tag}\n**Type:** ${config.description}\n**Channel:** ${ticketChannel}`)
                        .setColor(config.color)
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] });
                }

            } catch (error) {
                console.error('Error creating ticket:', error);
                
                // If the interaction hasn't been replied to yet
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'There was an error creating your ticket. Please try again.',
                        ephemeral: true
                    });
                } else {
                    await interaction.editReply({
                        content: 'There was an error creating your ticket. Please try again.',
                        ephemeral: true
                    });
                }
            }
        }
    }
}; 