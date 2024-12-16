const { EventEmitter } = require('events');

class ConnectionManager extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.retryDelay = 5000;
    }

    async connect() {
        try {
            await this.client.login(process.env.BOT_TOKEN);
            this.retryCount = 0;
            console.log('Successfully connected to Discord');
        } catch (error) {
            console.error('Connection error:', error);
            
            if (error.code === 'ENOBUFS' && this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`Retrying connection in ${this.retryDelay/1000} seconds... (Attempt ${this.retryCount}/${this.maxRetries})`);
                setTimeout(() => this.connect(), this.retryDelay);
            } else {
                throw error;
            }
        }
    }

    async reconnect() {
        console.log('Attempting to reconnect...');
        try {
            await this.client.destroy();
            await this.connect();
        } catch (error) {
            console.error('Reconnection failed:', error);
        }
    }
}

module.exports = ConnectionManager; 