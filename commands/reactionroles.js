const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionroles')
        .setDescription('Manage reaction roles')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a reaction role message')
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Title for the reaction roles message')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description for the reaction roles')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('style')
                        .setDescription('Style of reaction roles')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Buttons', value: 'buttons' },
                            { name: 'Dropdown Menu', value: 'menu' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a role to existing reaction message')
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('ID of the reaction role message')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to add')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('Emoji for the role')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description for this role')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'create': {
                    const title = interaction.options.getString('title');
                    const description = interaction.options.getString('description');
                    const style = interaction.options.getString('style');

                    const embed = new EmbedBuilder()
                        .setTitle(title)
                        .setDescription(description)
                        .setColor(0x3498db)
                        .setTimestamp()
                        .setFooter({ text: 'Click the buttons/menu below to get roles' });

                    // Store initial message with no components
                    const message = await interaction.channel.send({
                        embeds: [embed],
                        components: []
                    });

                    // Store message info in client for later use
                    if (!interaction.client.reactionRoles) {
                        interaction.client.reactionRoles = new Map();
                    }

                    interaction.client.reactionRoles.set(message.id, {
                        style,
                        roles: [],
                        messageId: message.id,
                        channelId: message.channel.id,
                        guildId: message.guild.id
                    });

                    await interaction.editReply({
                        content: `✅ Reaction role message created! Use \`/reactionroles add message_id:${message.id}\` to add roles.`,
                        ephemeral: true
                    });
                    break;
                }

                case 'add': {
                    const messageId = interaction.options.getString('message_id');
                    const role = interaction.options.getRole('role');
                    const emoji = interaction.options.getString('emoji');
                    const description = interaction.options.getString('description');

                    // Get stored reaction role data
                    const reactionRole = interaction.client.reactionRoles?.get(messageId);
                    if (!reactionRole) {
                        return interaction.editReply({
                            content: '❌ Reaction role message not found!',
                            ephemeral: true
                        });
                    }

                    // Add new role
                    reactionRole.roles.push({
                        id: role.id,
                        emoji,
                        description
                    });

                    // Update message with new components
                    const message = await interaction.channel.messages.fetch(messageId);
                    const embed = message.embeds[0];

                    if (reactionRole.style === 'buttons') {
                        // Create button rows (max 5 buttons per row)
                        const rows = [];
                        for (let i = 0; i < reactionRole.roles.length; i += 5) {
                            const row = new ActionRowBuilder();
                            const roles = reactionRole.roles.slice(i, i + 5);

                            roles.forEach(roleData => {
                                row.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`role_${roleData.id}`)
                                        .setLabel(interaction.guild.roles.cache.get(roleData.id).name)
                                        .setEmoji(roleData.emoji)
                                        .setStyle(ButtonStyle.Primary)
                                );
                            });

                            rows.push(row);
                        }

                        await message.edit({
                            embeds: [embed],
                            components: rows
                        });
                    } else {
                        // Create select menu
                        const menu = new StringSelectMenuBuilder()
                            .setCustomId('reaction_role_menu')
                            .setPlaceholder('Select roles...')
                            .setMinValues(0)
                            .setMaxValues(reactionRole.roles.length);

                        reactionRole.roles.forEach(roleData => {
                            menu.addOptions({
                                label: interaction.guild.roles.cache.get(roleData.id).name,
                                value: roleData.id,
                                description: roleData.description,
                                emoji: roleData.emoji
                            });
                        });

                        const row = new ActionRowBuilder().addComponents(menu);

                        await message.edit({
                            embeds: [embed],
                            components: [row]
                        });
                    }

                    // Update stored data
                    interaction.client.reactionRoles.set(messageId, reactionRole);

                    await interaction.editReply({
                        content: `✅ Added role ${role} with emoji ${emoji} to reaction roles!`,
                        ephemeral: true
                    });
                    break;
                }
            }
        } catch (error) {
            console.error('Error in reactionroles command:', error);
            await interaction.editReply({
                content: 'There was an error executing this command.',
                ephemeral: true
            });
        }
    }
}; 