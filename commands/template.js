const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { checkPermissions } = require('../utils/permissions');
const fs = require('fs/promises');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('template')
        .setDescription('Server template management')
        .addSubcommand(subcommand =>
            subcommand
                .setName('save')
                .setDescription('Save current server as a template')
                .addStringOption(option =>
                    option.setName('name')
                    .setDescription('Name of the template')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('load')
                .setDescription('Load a server template')
                .addStringOption(option =>
                    option.setName('name')
                    .setDescription('Name of the template to load')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all saved templates')),

    async execute(interaction) {
        if (!checkPermissions(interaction, 'template')) {
            return interaction.reply({
                content: 'This command can only be used by the bot owner.',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();
        const templatesDir = path.join(__dirname, '../templates');

        // Ensure templates directory exists
        try {
            await fs.mkdir(templatesDir, { recursive: true });
        } catch (error) {
            console.error('Error creating templates directory:', error);
        }

        switch (subcommand) {
            case 'save': {
                const templateName = interaction.options.getString('name');
                const guild = interaction.guild;
                
                const template = {
                    name: templateName,
                    channels: [],
                    roles: [],
                    settings: {}
                };

                // Save channels
                const channels = await guild.channels.fetch();
                for (const [id, channel] of channels) {
                    template.channels.push({
                        name: channel.name,
                        type: channel.type,
                        position: channel.position,
                        parent: channel.parent?.name,
                        permissions: channel.permissionOverwrites.cache.map(perm => ({
                            id: perm.id,
                            type: perm.type,
                            allow: perm.allow.toArray(),
                            deny: perm.deny.toArray()
                        }))
                    });
                }

                // Save roles
                const roles = await guild.roles.fetch();
                for (const [id, role] of roles) {
                    if (role.managed) continue; // Skip managed roles
                    template.roles.push({
                        name: role.name,
                        color: role.color,
                        hoist: role.hoist,
                        position: role.position,
                        permissions: role.permissions.toArray()
                    });
                }

                // Save server settings
                template.settings = {
                    name: guild.name,
                    verificationLevel: guild.verificationLevel,
                    explicitContentFilter: guild.explicitContentFilter,
                    defaultMessageNotifications: guild.defaultMessageNotifications
                };

                // Save template to file
                const templatePath = path.join(templatesDir, `${templateName}.json`);
                await fs.writeFile(templatePath, JSON.stringify(template, null, 2));

                const embed = new EmbedBuilder()
                    .setTitle('Template Saved')
                    .setDescription(`Server template "${templateName}" has been saved successfully!`)
                    .setColor('#00FF00')
                    .addFields(
                        { name: 'Channels Saved', value: template.channels.length.toString(), inline: true },
                        { name: 'Roles Saved', value: template.roles.length.toString(), inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }

            case 'load': {
                const templateName = interaction.options.getString('name');
                const templatePath = path.join(templatesDir, `${templateName}.json`);

                try {
                    const templateData = JSON.parse(await fs.readFile(templatePath, 'utf8'));
                    const guild = interaction.guild;

                    await interaction.reply({
                        content: 'Starting template application...',
                        ephemeral: true
                    });

                    // Create roles (from bottom to top)
                    const sortedRoles = templateData.roles.sort((a, b) => a.position - b.position);
                    for (const roleData of sortedRoles) {
                        try {
                            await guild.roles.create({
                                name: roleData.name,
                                color: roleData.color,
                                hoist: roleData.hoist,
                                permissions: roleData.permissions
                            });
                        } catch (error) {
                            console.error(`Error creating role ${roleData.name}:`, error);
                        }
                    }

                    // Create channels
                    // First create categories
                    const categories = templateData.channels.filter(ch => ch.type === 4);
                    for (const categoryData of categories) {
                        try {
                            await guild.channels.create({
                                name: categoryData.name,
                                type: categoryData.type
                            });
                        } catch (error) {
                            console.error(`Error creating category ${categoryData.name}:`, error);
                        }
                    }

                    // Then create other channels
                    const channels = templateData.channels.filter(ch => ch.type !== 4);
                    for (const channelData of channels) {
                        try {
                            const parent = guild.channels.cache.find(ch => 
                                ch.type === 4 && ch.name === channelData.parent
                            );

                            await guild.channels.create({
                                name: channelData.name,
                                type: channelData.type,
                                parent: parent?.id
                            });
                        } catch (error) {
                            console.error(`Error creating channel ${channelData.name}:`, error);
                        }
                    }

                    const embed = new EmbedBuilder()
                        .setTitle('Template Loaded')
                        .setDescription(`Server template "${templateName}" has been applied successfully!`)
                        .setColor('#00FF00')
                        .setTimestamp();

                    await interaction.followUp({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    console.error('Error loading template:', error);
                    await interaction.reply({
                        content: `Failed to load template "${templateName}". Please check if the template exists.`,
                        ephemeral: true
                    });
                }
                break;
            }

            case 'list': {
                const templates = await fs.readdir(templatesDir);
                const templateList = templates
                    .filter(file => file.endsWith('.json'))
                    .map(file => file.replace('.json', ''));

                const embed = new EmbedBuilder()
                    .setTitle('Server Templates')
                    .setDescription(templateList.length > 0 
                        ? templateList.map(name => `• ${name}`).join('\n')
                        : 'No templates found.')
                    .setColor('#0099FF')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }
        }
    }
}; 