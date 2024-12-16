const { 
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolerequest-setup')
    .setDescription('Sets up role request menu')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Channel to send role menu')
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    
    const embed = new EmbedBuilder()
      .setTitle('Role Selection')
      .setDescription('Select your roles below')
      .setColor('#00ff00');

    const roleSelect = new StringSelectMenuBuilder()
      .setCustomId('role-select')
      .setPlaceholder('Select your roles')
      .setMinValues(0)
      .setMaxValues(5) // Adjust based on your needs
      .addOptions([
        // Add your role options here
        {
          label: 'Role 1',
          value: 'role1_id',
          description: 'Description for Role 1'
        }
        // Add more roles as needed
      ]);

    const row = new ActionRowBuilder()
      .addComponents(roleSelect);

    await channel.send({
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: 'Role selection menu has been set up!',
      ephemeral: true
    });
  }
}; 