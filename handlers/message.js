const antiSpam = require('../utils/antiSpam');
const logger = require('../utils/logger');
const config = require('../config');

async function messageHandler(sock, m, plugins, store) {
    if (!m.messages || m.messages.length === 0) return;
    
    const message = m.messages[0];
    if (message.key.remoteJid === 'status@broadcast') return;
    
    // Ignore if message is from the bot itself
    if (message.key.fromMe) return;
    
    const messageText = getMessageText(message);
    if (!messageText) return;
    
    // Check for command prefix
    const isAdminCommand = messageText.startsWith(config.adminPrefix);
    const isUserCommand = messageText.startsWith(config.prefix);
    
    if (!isAdminCommand && !isUserCommand) return;
    
    // Anti-spam check
    const sender = message.key.remoteJid;
    if (antiSpam.isSpamming(sender)) {
        await sock.sendMessage(sender, {
            text: '⏳ Please wait before sending another command.'
        });
        return;
    }
    
    // Parse command and arguments
    const prefix = isAdminCommand ? config.adminPrefix : config.prefix;
    const [command, ...args] = messageText.slice(prefix.length).trim().split(' ');
    
    // Find matching plugin
    const plugin = plugins.find(p => 
        p.command === command || (p.aliases && p.aliases.includes(command))
    );
    
    if (!plugin) return;
    
    // Check if user is admin for admin-only commands
    const isAdmin = config.adminNumbers.includes(sender.replace('@s.whatsapp.net', ''));
    if (plugin.adminOnly && !isAdmin) {
        await sock.sendMessage(sender, {
            text: '❌ This command is only available for admins.'
        }, { quoted: message });
        return;
    }
    
    // Add to spam tracking
    antiSpam.trackCommand(sender);
    
    // Log command usage
    logger.info(`Command used: ${command} by ${sender}`);
    
    // Execute plugin
    try {
        await plugin.execute(sock, message, args, store);
    } catch (error) {
        console.error(`Error executing command ${command}:`, error);
        await sock.sendMessage(sender, {
            text: '❌ An error occurred while executing this command.'
        }, { quoted: message });
    }
}

function getMessageText(message) {
    if (message.message?.conversation) {
        return message.message.conversation;
    }
    if (message.message?.extendedTextMessage?.text) {
        return message.message.extendedTextMessage.text;
    }
    if (message.message?.imageMessage?.caption) {
        return message.message.imageMessage.caption;
    }
    if (message.message?.videoMessage?.caption) {
        return message.message.videoMessage.caption;
    }
    return null;
}

module.exports = messageHandler;
