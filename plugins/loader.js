const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const config = require('../config');

class PluginLoader {
    constructor() {
        this.plugins = [];
        this.pluginDir = '';
    }
    
    async loadPlugins(pluginsDir) {
        this.pluginDir = pluginsDir;
        this.plugins = [];
        
        try {
            const files = await fs.readdir(pluginsDir);
            
            for (const file of files) {
                if (file.endsWith('.js') && file !== 'loader.js') {
                    try {
                        const pluginPath = path.join(pluginsDir, file);
                        const plugin = require(pluginPath);
                        
                        if (this.validatePlugin(plugin)) {
                            this.plugins.push(plugin);
                            logger.info(`✅ Loaded plugin: ${plugin.name}`);
                        } else {
                            logger.warn(`❌ Invalid plugin structure in: ${file}`);
                        }
                    } catch (err) {
                        logger.error(`❌ Failed to load plugin ${file}: ${err.message}`);
                    }
                }
            }
        } catch (err) {
            logger.error('❌ Error reading plugins directory:', err.message);
        }
        
        return this.plugins;
    }
    
    validatePlugin(plugin) {
        return plugin.name && plugin.command && plugin.execute && typeof plugin.execute === 'function';
    }
    
    async reloadPlugin(pluginName) {
        try {
            // Clear require cache
            const pluginPath = require.resolve(path.join(this.pluginDir, `${pluginName}.js`));
            delete require.cache[pluginPath];
            
            // Reload plugin
            const plugin = require(pluginPath);
            
            if (this.validatePlugin(plugin)) {
                // Replace the plugin in the array
                const index = this.plugins.findIndex(p => p.name === pluginName);
                if (index !== -1) {
                    this.plugins[index] = plugin;
                } else {
                    this.plugins.push(plugin);
                }
                
                logger.info(`✅ Reloaded plugin: ${plugin.name}`);
                return plugin;
            } else {
                logger.warn(`❌ Invalid plugin structure after reload: ${pluginName}`);
                return null;
            }
        } catch (err) {
            logger.error(`❌ Failed to reload plugin ${pluginName}: ${err.message}`);
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
