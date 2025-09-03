// plugins/loader.js
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class PluginLoader {
    constructor() {
        this.plugins = [];
        this.pluginDir = '';
    }
    
    async loadPlugins(pluginsDir) {
        this.pluginDir = pluginsDir;
        this.plugins = [];
        
        try {
            // Check if plugins directory exists
            try {
                await fs.access(pluginsDir);
                logger.debug(`Plugins directory found: ${pluginsDir}`);
            } catch (err) {
                logger.error(`Plugins directory ${pluginsDir} does not exist`);
                await fs.mkdir(pluginsDir, { recursive: true });
                logger.info(`Created plugins directory: ${pluginsDir}`);
                return this.plugins;
            }
            
            // Read all files in plugins directory
            const files = await fs.readdir(pluginsDir);
            logger.debug(`Found ${files.length} files in plugins directory`);
            
            let loadedCount = 0;
            
            for (const file of files) {
                // Only load .js files and ignore loader.js
                if (file.endsWith('.js') && file !== 'loader.js') {
                    try {
                        const pluginPath = path.join(pluginsDir, file);
                        logger.debug(`Attempting to load: ${file}`);
                        
                        // Clear require cache to ensure fresh load
                        delete require.cache[require.resolve(pluginPath)];
                        
                        const plugin = require(pluginPath);
                        
                        if (this.validatePlugin(plugin)) {
                            this.plugins.push(plugin);
                            loadedCount++;
                            logger.success(`✅ Loaded plugin: ${plugin.name} (${file})`);
                        } else {
                            logger.warning(`❌ Invalid plugin structure in: ${file}`);
                        }
                    } catch (err) {
                        logger.error(`Failed to load plugin ${file}: ${err.message}`);
                        logger.debug(`Error details:`, err.stack);
                    }
                }
            }
            
            if (loadedCount === 0) {
                logger.warning('No valid plugins found in plugins directory');
                logger.debug('Files found:', files);
            } else {
                logger.info(`Total plugins loaded: ${loadedCount}`);
            }
            
        } catch (err) {
            logger.error(`Error reading plugins directory: ${err.message}`);
        }
        
        return this.plugins;
    }
    
    validatePlugin(plugin) {
        const isValid = plugin.name && 
                       plugin.command && 
                       plugin.execute && 
                       typeof plugin.execute === 'function';
        
        if (!isValid) {
            logger.debug('Plugin validation failed - missing required properties');
        }
        
        return isValid;
    }
    
    async reloadPlugin(pluginName) {
        try {
            const pluginPath = require.resolve(path.join(this.pluginDir, `${pluginName}.js`));
            delete require.cache[pluginPath];
            
            const plugin = require(pluginPath);
            
            if (this.validatePlugin(plugin)) {
                const index = this.plugins.findIndex(p => p.name === pluginName);
                if (index !== -1) {
                    this.plugins[index] = plugin;
                } else {
                    this.plugins.push(plugin);
                }
                
                logger.success(`Reloaded plugin: ${plugin.name}`);
                return plugin;
            } else {
                logger.warning(`Invalid plugin structure after reload: ${pluginName}`);
                return null;
            }
        } catch (err) {
            logger.error(`Failed to reload plugin ${pluginName}: ${err.message}`);
            return null;
        }
    }
    
    getPlugin(command) {
        return this.plugins.find(p => 
            p.command === command || (p.aliases && p.aliases.includes(command))
        );
    }
    
    getAllPlugins() {
        return this.plugins.map(p => ({
            name: p.name,
            command: p.command,
            description: p.description || 'No description',
            adminOnly: p.adminOnly || false,
            cooldown: p.cooldown || 0
        }));
    }
    
    // Helper to list all available plugin files
    async listPluginFiles() {
        try {
            const files = await fs.readdir(this.pluginDir);
            return files.filter(file => file.endsWith('.js') && file !== 'loader.js');
        } catch (err) {
            logger.error(`Error listing plugin files: ${err.message}`);
            return [];
        }
    }
}

module.exports = new PluginLoader();
