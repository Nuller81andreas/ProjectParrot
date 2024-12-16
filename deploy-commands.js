require('dotenv').config();
const { Client, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const client = new Client({ intents: [] });

async function deployCommands() {
    try {
        console.log('Starting command deployment...');
        const commands = [];
        const foldersPath = path.join(__dirname, 'commands');
        
        console.log('Loading command files...');
        
        // Handle files in the root commands directory
        const rootFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));
        for (const file of rootFiles) {
            const filePath = path.join(foldersPath, file);
            if (fs.statSync(filePath).isFile()) {
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                    console.log(`Loaded command: ${command.data.name}`);
                }
            }
        }

        // Handle commands in subdirectories
        const commandFolders = fs.readdirSync(foldersPath).filter(folder => 
            fs.statSync(path.join(foldersPath, folder)).isDirectory()
        );

        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                    console.log(`Loaded command: ${command.data.name}`);
                }
            }
        }

        const rest = new REST().setToken(process.env.BOT_TOKEN);
        
        console.log(`Deploying ${commands.length} commands...`);
        
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log(`Successfully deployed ${data.length} commands!`);
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
}

deployCommands(); 