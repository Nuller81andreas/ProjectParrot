const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionFlagsBits, 
    ComponentType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const { isPrivilegedUser } = require('../utils/permissions');
const GuildConfig = require('../utils/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('systemannounce')
        .setDescription('Send a system announcement to all servers')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The announcement message')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('Title for the announcement')
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName('color')
                .setDescription('Color for the embed (hex code)')
                .setRequired(false))
        .addBooleanOption(option =>
            option
                .setName('embed')
                .setDescription('Send as embed')
                .setRequired(false))
        .addBooleanOption(option =>
            option
                .setName('ping')
                .setDescription('Ping @everyone')
                .setRequired(false))
        .addBooleanOption(option =>
            option
                .setName('timestamp')
                .setDescription('Include timestamp')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!await isPrivilegedUser(interaction.user.id)) {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true
            });
        }

        const message = interaction.options.getString('message');
        const title = interaction.options.getString('title') || 'System Announcement';
        const color = interaction.options.getString('color') || '#FF0000';
        const useEmbed = interaction.options.getBoolean('embed') ?? true;
        const pingEveryone = interaction.options.getBoolean('ping') ?? false;
        const includeTimestamp = interaction.options.getBoolean('timestamp') ?? true;

        // Create confirmation embed
        const confirmEmbed = new EmbedBuilder()
            .setTitle('System Announcement Confirmation')
            .setDescription('Are you sure you want to send this announcement to all servers?')
            .addFields([
                { name: 'Title', value: title, inline: true },
                { name: 'Color', value: color, inline: true },
                { name: 'Format', value: useEmbed ? 'Embed' : 'Plain Text', inline: true },
                { name: 'Ping @everyone', value: pingEveryone ? '✅' : '❌', inline: true },
                { name: 'Include Timestamp', value: includeTimestamp ? '✅' : '❌', inline: true },
                { name: 'Message', value: message }
            ])
            .setColor('#FFA500')
            .setTimestamp();

        // Create buttons instead of reactions
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌')
            );

        const response = await interaction.reply({
            embeds: [confirmEmbed],
            components: [row],
            ephemeral: true,
            fetchReply: true
        });

        try {
            const confirmation = await response.awaitMessageComponent({ 
                filter: i => i.user.id === interaction.user.id,
                time: 30000 
            });

            if (confirmation.customId === 'confirm') {
                // Prepare announcement
                const announcementEmbed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(message)
                    .setColor(color);

                if (includeTimestamp) {
                    announcementEmbed.setTimestamp();
                }

                announcementEmbed.setFooter({
                    text: `Announced by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                });

                // Update confirmation message
                await confirmation.update({
                    content: 'Sending announcements...',
                    embeds: [],
                    components: []
                });

                // Get all guilds
                const guilds = interaction.client.guilds.cache;
                const results = [];

                // Send to each guild
                for (const [id, guild] of guilds) {
                    try {
                        const guildConfig = await GuildConfig.get(id);
                        const systemChannel = guild.systemChannel || 
                            guild.channels.cache.find(channel => 
                                channel.name.includes('announcement') || 
                                channel.name.includes('system')
                            );

                        if (systemChannel) {
                            if (useEmbed) {
                                await systemChannel.send({
                                    content: pingEveryone ? '@everyone' : null,
                                    embeds: [announcementEmbed]
                                });
                            } else {
                                const plainMessage = [
                                    pingEveryone ? '@everyone' : '',
                                    `**${title}**`,
                                    message,
                                    includeTimestamp ? `\n_${new Date().toLocaleString()}_` : '',
                                    `\n- ${interaction.user.tag}`
                                ].filter(Boolean).join('\n\n');

                                await systemChannel.send({ content: plainMessage });
                            }
                            results.push(`✅ Sent to ${guild.name}`);
                        } else {
                            results.push(`❌ No suitable channel found in ${guild.name}`);
                        }
                    } catch (error) {
                        console.error(`Failed to send to guild ${guild.name}:`, error);
                        results.push(`❌ Failed to send to ${guild.name}: ${error.message}`);
                    }
                }

                // Send results
                const resultEmbed = new EmbedBuilder()
                    .setTitle('Announcement Results')
                    .setDescription(results.join('\n'))
                    .setColor(results.every(r => r.startsWith('✅')) ? '#00FF00' : '#FFA500')
                    .setTimestamp();

                await interaction.followUp({
                    embeds: [resultEmbed],
                    ephemeral: true
                });
            } else {
                await confirmation.update({
                    content: 'Announcement cancelled.',
                    embeds: [],
                    components: [],
                    ephemeral: true
                });
            }
        } catch (error) {
            await interaction.editReply({
                content: 'Confirmation timed out or an error occurred.',
                embeds: [],
                components: [],
                ephemeral: true
            });
        }
    }
}; 