const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createCaptcha } = require('../utils/captchaGenerator');

// Store verification attempts and timeouts
const verificationAttempts = new Map();
const MAX_ATTEMPTS = 3;
const TIMEOUT_DURATION = 1800000; // 30 minutes

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const { customId, member } = interaction;
        if (!customId.startsWith('verify_')) return;

        try {
            switch (customId) {
                case 'verify_rules':
                    await handleRulesVerification(interaction);
                    break;
                case 'verify_captcha':
                    await handleCaptchaVerification(interaction);
                    break;
                case 'verify_complete':
                    await completeVerification(interaction);
                    break;
            }
        } catch (error) {
            console.error('Error in verification handler:', error);
            await interaction.reply({
                content: '❌ An error occurred during verification.',
                ephemeral: true
            });
        }
    }
};

async function handleRulesVerification(interaction) {
    const rulesEmbed = new EmbedBuilder()
        .setTitle('Server Rules')
        .setDescription(`
            1. Be respectful to all members
            2. No spam or self-promotion
            3. No NSFW content
            4. Follow Discord's Terms of Service
            5. Listen to staff members
            
            By clicking "I Accept", you agree to follow these rules.
        `)
        .setColor('#2f3136');

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('verify_captcha')
                .setLabel('I Accept')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅')
        );

    await interaction.update({
        embeds: [rulesEmbed],
        components: [row],
        ephemeral: true
    });
}

async function handleCaptchaVerification(interaction) {
    const userId = interaction.user.id;
    const attempts = verificationAttempts.get(userId) || 0;

    if (attempts >= MAX_ATTEMPTS) {
        const timeoutEmbed = new EmbedBuilder()
            .setTitle('❌ Verification Timeout')
            .setDescription('You have exceeded the maximum verification attempts.\nPlease try again in 30 minutes.')
            .setColor('#ff0000');

        await interaction.update({
            embeds: [timeoutEmbed],
            components: [],
            ephemeral: true
        });
        return;
    }

    const captcha = createCaptcha();
    
    const captchaEmbed = new EmbedBuilder()
        .setTitle('Captcha Verification')
        .setDescription('Please enter the code shown below:\n' + captcha.image)
        .setColor('#2f3136')
        .setFooter({ text: 'Type the code exactly as shown' });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('verify_submit')
                .setLabel('Submit Code')
                .setStyle(ButtonStyle.Primary)
        );

    // Store captcha solution
    if (!interaction.client.captchas) {
        interaction.client.captchas = new Map();
    }
    
    interaction.client.captchas.set(userId, {
        solution: captcha.solution,
        attempts: attempts + 1,
        timestamp: Date.now()
    });

    await interaction.update({
        embeds: [captchaEmbed],
        components: [row],
        ephemeral: true
    });
}

async function completeVerification(interaction) {
    const member = interaction.member;
    const unverifiedRole = member.guild.roles.cache.find(role => role.name === 'Unverified');
    const memberRole = member.guild.roles.cache.find(role => role.name === 'Member');

    await member.roles.remove(unverifiedRole);
    if (memberRole) await member.roles.add(memberRole);

    // Clear verification attempts
    verificationAttempts.delete(interaction.user.id);

    const successEmbed = new EmbedBuilder()
        .setTitle('✅ Verification Successful')
        .setDescription('You now have full access to the server!')
        .setColor('#00ff00')
        .setTimestamp();

    await interaction.update({
        embeds: [successEmbed],
        components: [],
        ephemeral: true
    });

    // Log verification
    const logChannel = interaction.guild.channels.cache.find(ch => ch.name === 'mod-logs');
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setTitle('Member Verified')
            .setDescription(`${member.user.tag} has completed verification`)
            .setColor('#00ff00')
            .setTimestamp()
            .setFooter({ text: `ID: ${member.user.id}` });

        await logChannel.send({ embeds: [logEmbed] });
    }
} 