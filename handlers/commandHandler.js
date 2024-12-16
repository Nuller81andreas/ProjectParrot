const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function registerCommands(client) {
    try {
        const commands = [];
        const commandsPath = path.join(__dirname, '..', 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        console.log('Loading commands...');
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                client.commands.set(command.data.name, command);
                console.log(`✅ Loaded command: ${command.data.name}`);
            } else {
                console.log(`⚠️ Command at ${filePath} missing required properties!`);
            }
        }

        const rest = new REST().setToken(process.env.BOT_TOKEN);

        console.log('Started refreshing application (/) commands...');

        // Delete old commands first
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: [] }
        );

        // Register new commands
        const data = await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );

        console.log(`Successfully registered ${data.length} commands:`);
        data.forEach(cmd => console.log(`- ${cmd.name}`));

        return true;
    } catch (error) {
        console.error('Error registering commands:', error);
        return false;
    }
}

module.exports = { registerCommands }; 