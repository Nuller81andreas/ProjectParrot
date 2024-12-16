const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

        // Handle button roles
        if (interaction.isButton() && interaction.customId.startsWith('role_')) {
            const roleId = interaction.customId.replace('role_', '');
            const member = interaction.member;
            const role = interaction.guild.roles.cache.get(roleId);

            if (!role) return;

            try {
                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(role);
                    await interaction.reply({
                        content: `Removed role: ${role.name}`,
                        ephemeral: true
                    });
                } else {
                    await member.roles.add(role);
                    await interaction.reply({
                        content: `Added role: ${role.name}`,
                        ephemeral: true
                    });
                }
            } catch (error) {
                console.error('Error handling reaction role button:', error);
                await interaction.reply({
                    content: 'There was an error updating your roles.',
                    ephemeral: true
                });
            }
        }

        // Handle menu roles
        if (interaction.isStringSelectMenu() && interaction.customId === 'reaction_role_menu') {
            const member = interaction.member;
            const selectedRoles = interaction.values;
            const changes = { added: [], removed: [] };

            try {
                // Remove roles that were unselected
                const currentRoles = member.roles.cache
                    .filter(role => interaction.component.options.some(option => option.value === role.id))
                    .map(role => role.id);

                for (const roleId of currentRoles) {
                    if (!selectedRoles.includes(roleId)) {
                        const role = interaction.guild.roles.cache.get(roleId);
                        await member.roles.remove(role);
                        changes.removed.push(role.name);
                    }
                }

                // Add newly selected roles
                for (const roleId of selectedRoles) {
                    if (!member.roles.cache.has(roleId)) {
                        const role = interaction.guild.roles.cache.get(roleId);
                        await member.roles.add(role);
                        changes.added.push(role.name);
                    }
                }

                // Create response message
                let response = '';
                if (changes.added.length > 0) {
                    response += `Added roles: ${changes.added.join(', ')}\n`;
                }
                if (changes.removed.length > 0) {
                    response += `Removed roles: ${changes.removed.join(', ')}`;
                }
                if (!response) {
                    response = 'No role changes made.';
                }

                await interaction.reply({
                    content: response,
                    ephemeral: true
                });

            } catch (error) {
                console.error('Error handling reaction role menu:', error);
                await interaction.reply({
                    content: 'There was an error updating your roles.',
                    ephemeral: true
                });
            }
        }
    }
}; 