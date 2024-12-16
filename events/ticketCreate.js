const { Events, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('ticket_')) return;

        const ticketType = interaction.customId.split('_')[1];
        const guild = interaction.guild;
        const member = interaction.member;

        // Create ticket channel
        const ticketChannel = await guild.channels.create({
            name: `ticket-${member.user.username}-${ticketType}`,
            type: ChannelType.GuildText,
            parent: interaction.channel.parent,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: member.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                },
                {
                    id: guild.members.me.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ]
                }
            ]
        });

        // Add specific permissions based on ticket type
        if (ticketType === 'management') {
            const staffRole = guild.roles.cache.find(r => r.name === 'Staff');
            if (staffRole) {
                await ticketChannel.permissionOverwrites.create(staffRole, {
                    ViewChannel: true,
                    SendMessages: true
                });
            }
        } else if (ticketType === 'owner') {
            const ownerRole = guild.roles.cache.find(r => r.name === 'Owner');
            if (ownerRole) {
                await ticketChannel.permissionOverwrites.create(ownerRole, {
                    ViewChannel: true,
                    SendMessages: true
                });
            }
        }

        // Send initial message in ticket
        await ticketChannel.send({
            embeds: [{
                title: `${ticketType.charAt(0).toUpperCase() + ticketType.slice(1)} Ticket`,
                description: `Welcome ${member}! Please describe your issue.`,
                color: 0x3498db
            }],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 4,
                        label: 'Close Ticket',
                        custom_id: 'close_ticket',
                        emoji: '🔒'
                    },
                    {
                        type: 2,
                        style: 2,
                        label: 'Transcript',
                        custom_id: 'transcript_ticket',
                        emoji: '📑'
                    }
                ]
            }]
        });

        await interaction.reply({ 
            content: `Ticket created! ${ticketChannel}`, 
            ephemeral: true 
        });
    }
}; 