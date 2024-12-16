const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveroles')
        .setDescription('🔒 Bot Owner Only - Give all assignable roles to a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to give roles to')
                .setRequired(true))
        .setDefaultMemberPermissions(0),
    ownerOnly: true,

    async execute(interaction) {
        // Check if user is bot owner
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            return interaction.reply({
                content: '❌ This command is restricted to the bot owner only!',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const targetUser = interaction.options.getUser('user');
            const member = await interaction.guild.members.fetch(targetUser.id);
            const botMember = interaction.guild.members.me;

            // Get all assignable roles
            const assignableRoles = interaction.guild.roles.cache.filter(role => 
                // Exclude @everyone role
                role.id !== interaction.guild.id &&
                // Exclude managed roles (bot roles, integration roles)
                !role.managed &&
                // Only include roles lower than bot's highest role
                role.position < botMember.roles.highest.position &&
                // Exclude roles the user already has
                !member.roles.cache.has(role.id) &&
                // Exclude specific roles you want to protect
                !['Core Systems Override', 'Core Systems', 'Security Bot'].includes(role.name)
            ).sort((a, b) => b.position - a.position);

            if (assignableRoles.size === 0) {
                return interaction.editReply({
                    content: '❌ No assignable roles found or user already has all roles.',
                    ephemeral: true
                });
            }

            // Track success and failures
            const results = {
                success: [],
                failed: []
            };

            // Add roles one by one
            for (const [, role] of assignableRoles) {
                try {
                    await member.roles.add(role);
                    results.success.push(role.name);
                } catch (error) {
                    console.error(`Error adding role ${role.name}:`, error);
                    results.failed.push(`${role.name} (${error.message})`);
                }

                // Add a small delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Create result embed
            const resultEmbed = new EmbedBuilder()
                .setTitle('👑 Bot Owner - Mass Role Assignment')
                .setDescription(`Results for ${targetUser.tag}`)
                .addFields([
                    {
                        name: `✅ Successfully Added (${results.success.length})`,
                        value: results.success.length > 0 ? 
                            results.success.slice(0, 1024).join('\n') : 
                            'None',
                        inline: false
                    }
                ])
                .setColor(results.failed.length === 0 ? 0x00FF00 : 0xFFFF00)
                .setTimestamp()
                .setFooter({ text: 'Bot Owner Command' });

            if (results.failed.length > 0) {
                resultEmbed.addFields([
                    {
                        name: `❌ Failed to Add (${results.failed.length})`,
                        value: results.failed.slice(0, 1024).join('\n'),
                        inline: false
                    }
                ]);
            }

            // Log to mod-logs
            const logChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('👑 Bot Owner - Mass Role Assignment')
                    .setDescription(`**Target:** ${targetUser.tag}\n**Bot Owner:** ${interaction.user.tag}`)
                    .addFields([
                        {
                            name: 'Results',
                            value: `✅ Added: ${results.success.length}\n❌ Failed: ${results.failed.length}`
                        }
                    ])
                    .setColor(0x3498db)
                    .setTimestamp()
                    .setFooter({ text: 'Bot Owner Action' });

                await logChannel.send({ embeds: [logEmbed] });
            }

            // Send result to user
            await interaction.editReply({
                embeds: [resultEmbed],
                ephemeral: true
            });

            // Send notification to target user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('✅ Roles Added')
                    .setDescription(`The bot owner has added ${results.success.length} roles to you in ${interaction.guild.name}.`)
                    .setColor(0x00FF00)
                    .setTimestamp();

                await targetUser.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.error('Could not DM user:', error);
            }

        } catch (error) {
            console.error('Error in giveroles command:', error);
            await interaction.editReply({
                content: 'There was an error executing this command. Check the logs for details.',
                ephemeral: true
            });
        }
    }
}; 