const { GuildConfig } = require('../utils/guildConfig');
const fs = require('fs').promises;
const path = require('path');

async function backupConfigs() {
    const backupDir = path.join(__dirname, '../backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}`);

    try {
        // Create backup directory
        await fs.mkdir(backupPath, { recursive: true });

        // Backup guild configurations
        const guildConfigs = await GuildConfig.getAllConfigs();
        await fs.writeFile(
            path.join(backupPath, 'guild-configs.json'),
            JSON.stringify(guildConfigs, null, 2)
        );

        console.log(`Backup created at: ${backupPath}`);
    } catch (error) {
        console.error('Backup failed:', error);
    }
}

backupConfigs(); 