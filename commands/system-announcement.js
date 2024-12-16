const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send a system announcement')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Channel to send announcement to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('The announcement message')
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option
        .setName('ping')
        .setDescription('Whether to ping @everyone')
        .setRequired(false)
    ),

  async execute(interaction) {
    // Check permissions directly
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true
      });
    }

    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const shouldPing = interaction.options.getBoolean('ping') || false;

    try {
      // Send the announcement
      await channel.send({
        content: `${shouldPing ? '@everyone\n\n' : ''}**System Announcement**\n\n${message}\n\n- ${interaction.user.tag}`
      });

      // Confirm to the user
      await interaction.reply({
        content: `Announcement sent successfully to ${channel}!`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Error sending announcement:', error);
      await interaction.reply({
        content: 'Failed to send the announcement. Please check my permissions and try again.',
        ephemeral: true
      });
    }
  }
}; 