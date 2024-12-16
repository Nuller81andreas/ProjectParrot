const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fun')
        .setDescription('Fun and interactive commands!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('8ball')
                .setDescription('Ask the magic 8ball a question')
                .addStringOption(option =>
                    option.setName('question')
                        .setDescription('Your question for the 8ball')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('coinflip')
                .setDescription('Flip a coin'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('roll')
                .setDescription('Roll a dice')
                .addIntegerOption(option =>
                    option.setName('sides')
                        .setDescription('Number of sides on the dice (default: 6)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rps')
                .setDescription('Play Rock, Paper, Scissors')
                .addStringOption(option =>
                    option.setName('choice')
                        .setDescription('Your choice')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Rock', value: 'rock' },
                            { name: 'Paper', value: 'paper' },
                            { name: 'Scissors', value: 'scissors' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('joke')
                .setDescription('Get a random joke'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('fact')
                .setDescription('Get a random fun fact'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('quote')
                .setDescription('Get an inspirational quote'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('emojify')
                .setDescription('Convert your text to emoji')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Text to convert')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case '8ball': {
                const question = interaction.options.getString('question');
                const responses = [
                    'It is certain.', 'It is decidedly so.', 'Without a doubt.',
                    'Yes definitely.', 'You may rely on it.', 'As I see it, yes.',
                    'Most likely.', 'Outlook good.', 'Yes.',
                    'Signs point to yes.', 'Reply hazy, try again.',
                    'Ask again later.', 'Better not tell you now.',
                    'Cannot predict now.', 'Concentrate and ask again.',
                    "Don't count on it.", 'My reply is no.',
                    'My sources say no.', 'Outlook not so good.',
                    'Very doubtful.'
                ];
                const response = responses[Math.floor(Math.random() * responses.length)];
                
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('🎱 Magic 8-Ball')
                    .addFields(
                        { name: 'Question', value: question },
                        { name: 'Answer', value: response }
                    );
                
                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'coinflip': {
                const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('🪙 Coin Flip')
                    .setDescription(`The coin landed on: **${result}**`);
                
                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'roll': {
                const sides = interaction.options.getInteger('sides') || 6;
                const result = Math.floor(Math.random() * sides) + 1;
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('🎲 Dice Roll')
                    .setDescription(`You rolled a **${result}** (d${sides})`);
                
                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'rps': {
                const choices = ['rock', 'paper', 'scissors'];
                const userChoice = interaction.options.getString('choice');
                const botChoice = choices[Math.floor(Math.random() * choices.length)];
                
                let result;
                if (userChoice === botChoice) result = "It's a tie!";
                else if (
                    (userChoice === 'rock' && botChoice === 'scissors') ||
                    (userChoice === 'paper' && botChoice === 'rock') ||
                    (userChoice === 'scissors' && botChoice === 'paper')
                ) result = 'You win!';
                else result = 'I win!';

                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('✂️ Rock, Paper, Scissors')
                    .addFields(
                        { name: 'Your Choice', value: userChoice, inline: true },
                        { name: 'My Choice', value: botChoice, inline: true },
                        { name: 'Result', value: result }
                    );
                
                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'joke': {
                const jokes = [
                    "Why don't scientists trust atoms? Because they make up everything!",
                    "What do you call a bear with no teeth? A gummy bear!",
                    "Why did the scarecrow win an award? Because he was outstanding in his field!",
                    "What do you call a fake noodle? An impasta!",
                    "Why did the cookie go to the doctor? Because it was feeling crumbly!"
                ];
                const joke = jokes[Math.floor(Math.random() * jokes.length)];
                
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('😄 Random Joke')
                    .setDescription(joke);
                
                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'fact': {
                const facts = [
                    "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible!",
                    "A day on Venus is longer than its year. It takes Venus 243 Earth days to rotate on its axis but only 225 Earth days to orbit the Sun.",
                    "The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after just 38 minutes.",
                    "The first oranges weren't orange! The original oranges from Southeast Asia were actually green.",
                    "A group of flamingos is called a 'flamboyance'."
                ];
                const fact = facts[Math.floor(Math.random() * facts.length)];
                
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('🤓 Random Fact')
                    .setDescription(fact);
                
                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'quote': {
                const quotes = [
                    "The only way to do great work is to love what you do. - Steve Jobs",
                    "Life is what happens when you're busy making other plans. - John Lennon",
                    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
                    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
                    "Be the change you wish to see in the world. - Mahatma Gandhi"
                ];
                const quote = quotes[Math.floor(Math.random() * quotes.length)];
                
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('💭 Inspirational Quote')
                    .setDescription(quote);
                
                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'emojify': {
                const text = interaction.options.getString('text');
                const emojiMap = {
                    'a': '🅰️', 'b': '🅱️', 'c': '©️', 'd': '🇩', 'e': '📧',
                    'f': '🎏', 'g': '🇬', 'h': '♓', 'i': 'ℹ️', 'j': '🗾',
                    'k': '🎋', 'l': '👢', 'm': 'Ⓜ️', 'n': '📈', 'o': '⭕',
                    'p': '🅿️', 'q': '🎯', 'r': '®️', 's': '💲', 't': '✝️',
                    'u': '⛎', 'v': '✌️', 'w': '〰️', 'x': '❌', 'y': '💴',
                    'z': '💤', ' ': '  '
                };

                const emojified = text.toLowerCase().split('')
                    .map(char => emojiMap[char] || char)
                    .join(' ');

                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('🔤 Emojified Text')
                    .addFields(
                        { name: 'Original', value: text },
                        { name: 'Emojified', value: emojified }
                    );
                
                await interaction.reply({ embeds: [embed] });
                break;
            }
        }
    },
}; 