const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolerequest')
        .setDescription('Request a role with approval')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role you want to request')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('approver')
                .setDescription('Staff member who can approve this request')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Why do you want this role?')
                .setRequired(true)),

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const approver = interaction.options.getUser('approver');
        const reason = interaction.options.getString('reason');
        const requester = interaction.user;

        // Check if user already has the role
        if (interaction.member.roles.cache.has(role.id)) {
            return interaction.reply({
                content: '❌ You already have this role!',
                ephemeral: true
            });
        }

        // Create unique ID for this request
        const requestId = `role_req_${Date.now()}_${interaction.user.id}`;

        // Create buttons
        const approveButton = new ButtonBuilder()
            .setCustomId(`approve_${requestId}`)
            .setLabel('Approve')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅');

        const denyButton = new ButtonBuilder()
            .setCustomId(`deny_${requestId}`)
            .setLabel('Deny')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('❌');

        const row = new ActionRowBuilder()
            .addComponents(approveButton, denyButton);

        // Create embed for request
        const requestEmbed = new EmbedBuilder()
            .setTitle('📋 Role Request')
            .setDescription(`A new role request has been submitted.`)
            .addFields([
                { name: 'Requested Role', value: role.toString(), inline: true },
                { name: 'Requester', value: requester.toString(), inline: true },
                { name: 'Approver', value: approver.toString(), inline: true },
                { name: 'Reason', value: reason }
            ])
            .setColor(0x3498db)
            .setTimestamp()
            .setFooter({ text: `Request ID: ${requestId}` });

        // Send request message
        const requestMsg = await interaction.reply({
            embeds: [requestEmbed],
            components: [row],
            fetchReply: true
        });

        // Create collector for buttons
        const collector = requestMsg.createMessageComponentCollector({
            filter: i => {
                // Allow bot owner or designated approver
                if (i.user.id === process.env.BOT_OWNER_ID || i.user.id === approver.id) {
                    return true;
                }
                i.reply({ 
                    content: '❌ Only the designated approver or bot owner can respond to this request.', 
                    ephemeral: true 
                });
                return false;
            },
            time: 24 * 60 * 60 * 1000 // 24 hours
        });

        collector.on('collect', async i => {
            await i.deferUpdate();

            const isApprove = i.customId === `approve_${requestId}`;
            const handler = i.user;
            const handlerText = i.user.id === process.env.BOT_OWNER_ID ? 'Bot Owner' : handler.tag;

            // Check bot permissions
            const botMember = interaction.guild.members.me;
            if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
                await requestMsg.edit({
                    content: '❌ Bot is missing Manage Roles permission!',
                    components: []
                });
                return;
            }

            // Check role hierarchy
            if (role.position >= botMember.roles.highest.position) {
                await requestMsg.edit({
                    content: '❌ Cannot assign this role - it is higher than or equal to bot\'s highest role!',
                    components: []
                });
                return;
            }

            const resultEmbed = new EmbedBuilder()
                .setTitle(isApprove ? '✅ Role Request Approved' : '❌ Role Request Denied')
                .setDescription(isApprove ? 
                    `Role request has been approved by ${handlerText} (${handler}).` :
                    `Role request has been denied by ${handlerText} (${handler}).`)
                .addFields([
                    { name: 'Requested Role', value: role.toString(), inline: true },
                    { name: 'Requester', value: requester.toString(), inline: true },
                    { name: 'Handled By', value: `${handlerText} (${handler})`, inline: true },
                    { name: 'Reason', value: reason }
                ])
                .setColor(isApprove ? 0x00ff00 : 0xff0000)
                .setTimestamp()
                .setFooter({ text: `Request ID: ${requestId}` });

            if (isApprove) {
                try {
                    const member = await interaction.guild.members.fetch(requester.id);
                    
                    // Additional permission check
                    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
                        throw new Error('Bot missing Manage Roles permission');
                    }

                    // Check role hierarchy again just before adding
                    if (role.position >= botMember.roles.highest.position) {
                        throw new Error('Role hierarchy prevents assignment');
                    }

                    await member.roles.add(role);
                } catch (error) {
                    console.error('Error adding role:', error);
                    
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Role Assignment Failed')
                        .setDescription(`Failed to assign role ${role} to ${requester}`)
                        .addFields([
                            { name: 'Error', value: error.message },
                            { name: 'Role Position', value: `${role.position}` },
                            { name: 'Bot\'s Highest Role', value: `${botMember.roles.highest.position}` }
                        ])
                        .setColor(0xFF0000)
                        .setTimestamp();

                    await requestMsg.edit({
                        content: `${requester}, there was an error assigning the role!`,
                        embeds: [errorEmbed],
                        components: []
                    });
                    return;
                }
            }

            await requestMsg.edit({
                content: `${requester}, your role request has been ${isApprove ? 'approved' : 'denied'} by ${handler}!`,
                embeds: [resultEmbed],
                components: []
            });

            // Log to mod-logs
            const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle(isApprove ? '✅ Role Request Approved' : '❌ Role Request Denied')
                    .setDescription(`**Role:** ${role}\n**Requester:** ${requester} (${requester.tag})\n**Handled By:** ${handlerText} (${handler})\n**Reason:** ${reason}`)
                    .setColor(isApprove ? 0x00ff00 : 0xff0000)
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            }

            // DM the requester
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle(isApprove ? '✅ Role Request Approved' : '❌ Role Request Denied')
                    .setDescription(`Your request for the role ${role.name} in ${interaction.guild.name} has been ${isApprove ? 'approved' : 'denied'} by ${handlerText} (${handler}).`)
                    .setColor(isApprove ? 0x00ff00 : 0xff0000)
                    .setTimestamp();

                await requester.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.error('Could not DM user:', error);
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle('⏰ Role Request Expired')
                    .setDescription(`This role request has expired without a response.`)
                    .addFields([
                        { name: 'Requested Role', value: role.toString(), inline: true },
                        { name: 'Requester', value: requester.toString(), inline: true },
                        { name: 'Approver', value: approver.toString(), inline: true },
                        { name: 'Reason', value: reason }
                    ])
                    .setColor(0x95a5a6)
                    .setTimestamp()
                    .setFooter({ text: `Request ID: ${requestId}` });

                await requestMsg.edit({
                    embeds: [timeoutEmbed],
                    components: []
                });
            }
        });

        // Initial permission check when creating request
        const botMember = interaction.guild.members.me;
        if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
            const warningEmbed = new EmbedBuilder()
                .setTitle('⚠️ Permission Warning')
                .setDescription('Bot is missing Manage Roles permission. Role assignment may fail.')
                .setColor(0xFFFF00)
                .setTimestamp();

            await interaction.followUp({
                embeds: [warningEmbed],
                ephemeral: true
            });
        }

        // Check role hierarchy
        if (role.position >= botMember.roles.highest.position) {
            const warningEmbed = new EmbedBuilder()
                .setTitle('⚠️ Role Hierarchy Warning')
                .setDescription('The requested role is higher than or equal to bot\'s highest role. Assignment may fail.')
                .setColor(0xFFFF00)
                .setTimestamp();

            await interaction.followUp({
                embeds: [warningEmbed],
                ephemeral: true
            });
        }
    }
}; 