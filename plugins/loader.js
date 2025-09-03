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
            } catch (err) {
                logger.error(`Plugins directory ${pluginsDir} does not exist`);
                return this.plugins;
            }
            
            const files = await fs.readdir(pluginsDir);
            
            for (const file of files) {
                if (file.endsWith('.js') && file !== 'loader.js') {
                    try {
                        const pluginPath = path.join(pluginsDir, file);
                        const plugin = require(pluginPath);
                        
                        if (this.validatePlugin(plugin)) {
                            this.plugins.push(plugin);
                            logger.success(`Loaded plugin: ${plugin.name}`);
                        } else {
                            logger.warning(`Invalid plugin structure in: ${file}`);
                        }
                    } catch (err) {
                        logger.error(`Failed to load plugin ${file}: ${err.message}`);
                    }
                }
            }
        } catch (err) {
            logger.error(`Error reading plugins directory: ${err.message}`);
        }
        
        logger.info(`Total plugins loaded: ${this.plugins.length}`);
        return this.plugins;
    }
    
    validatePlugin(plugin) {
        return plugin.name && plugin.command && plugin.execute && typeof plugin.execute === 'function';
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
        return this.plugins.find(p => p.command === command || (p.aliases && p.aliases.includes(command)));
    }
    
    getAllPlugins() {
        return this.plugins.map(p => ({
            name: p.name,
            command: p.command,
            description: p.description,
            adminOnly: p.adminOnly || false
        }));
    }
}

module.exports = new PluginLoader();
