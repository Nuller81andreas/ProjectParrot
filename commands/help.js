const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { isPrivilegedUser } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands')
        .addStringOption(option => 
            option
                .setName('command')
                .setDescription('Get info about a specific command')
                .setRequired(false)),

    async execute(interaction) {
        const isPrivileged = await isPrivilegedUser(interaction.user.id);
        
        const categories = {
            'Moderation': ['ban', 'kick', 'tempban', 'mute', 'warn'],
            'Administration': ['announce', 'shutdown', 'setup'],
            'Configuration': ['logging', 'automod', 'welcome', 'settings'],
            'Security': ['antiraid', 'verification', 'lockdown'],
            'Support': ['ticket', 'report'],
            'Information': ['help', 'ping', 'stats', 'botinfo'],
            'Management': ['role', 'channel', 'permissions'],
            'Templates': ['template']
        };

        // Add privileged commands if user is privileged
        if (isPrivileged) {
            categories['Owner'] = ['eval', 'reload', 'maintenance'];
        }

        const commandName = interaction.options.getString('command');

        if (commandName) {
            const command = interaction.client.commands.get(commandName);
            if (!command || (!isPrivileged && command.privileged)) {
                return interaction.reply({ 
                    content: 'That command does not exist or you don\'t have permission to view it.', 
                    ephemeral: true 
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`Command: ${command.data.name}`)
                .setDescription(command.data.description)
                .setColor('#0099ff');

            if (command.data.options?.length) {
                embed.addFields({
                    name: 'Options',
                    value: command.data.options.map(opt => 
                        `\`${opt.name}\`: ${opt.description}`
                    ).join('\n')
                });
            }

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('📚 Command List')
            .setDescription('Use `/help <command>` for more details about a command')
            .setColor('#0099ff')
            .setTimestamp();

        for (const [category, commands] of Object.entries(categories)) {
            const available = commands
                .filter(name => {
                    const cmd = interaction.client.commands.get(name);
                    return cmd && (isPrivileged || !cmd.privileged);
                })
                .map(name => `\`${name}\``);

            if (available.length) {
                embed.addFields({
                    name: category,
                    value: available.join(', '),
                    inline: false
                });
            }
        }

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};