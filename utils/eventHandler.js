const fs = require('fs');
const path = require('path');

class EventHandler {
    static async loadEvents(client) {
        const eventsPath = path.join(__dirname, '..', 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            try {
                const filePath = path.join(eventsPath, file);
                const event = require(filePath);
                
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args));
                } else {
                    client.on(event.name, (...args) => event.execute(...args));
                }
                
                console.log(`✅ Loaded event: ${event.name}`);
            } catch (error) {
                console.error(`❌ Error loading event ${file}:`, error);
            }
        }
    }
}

module.exports = EventHandler; 