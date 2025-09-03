// handlers/message.js
const antiSpam = require('../utils/antiSpam');
const logger = require('../utils/logger');
const config = require('../config');

async function messageHandler(sock, m, plugins, store) {
    if (!m.messages || m.messages.length === 0) return;
    
    const message = m.messages[0];
    if (message.key.remoteJid === 'status@broadcast') return;
    if (message.key.fromMe) return;
    
    const messageText = getMessageText(message);
    if (!messageText) return;
    
    const isAdminCommand = messageText.startsWith(config.adminPrefix);
    const isUserCommand = messageText.startsWith(config.prefix);
    
    if (!isAdminCommand && !isUserCommand) return;
    
    const sender = message.key.remoteJid;
    if (antiSpam.isSpamming(sender)) {
        await sock.sendMessage(sender, {
            text: '⏳ Please wait before sending another command.'
        });
        return;
    }
    
    const prefix = isAdminCommand ? config.adminPrefix : config.prefix;
    const [command, ...args] = messageText.slice(prefix.length).trim().split(' ');
    
    const plugin = plugins.find(p => 
        p.command === command || (p.aliases && p.aliases.includes(command))
    );
    
    if (!plugin) return;
    
    const isAdmin = config.adminNumbers.includes(sender.replace('@s.whatsapp.net', ''));
    if (plugin.adminOnly && !isAdmin) {
        await sock.sendMessage(sender, {
            text: '❌ This command is only available for admins.'
        }, { quoted: message });
        return;
    }
    
    antiSpam.trackCommand(sender);
    logger.command(command, sender);
    
    try {
        // Pass null instead of store to avoid issues
        await plugin.execute(sock, message, args, null);
    } catch (error) {
        logger.error(`Error executing command ${command}:`, error.message);
        await sock.sendMessage(sender, {
            text: '❌ An error occurred while executing this command.'
        }, { quoted: message });
    }
}

function getMessageText(message) {
    if (message.message?.conversation) return message.message.conversation;
    if (message.message?.extendedTextMessage?.text) return message.message.extendedTextMessage.text;
    if (message.message?.imageMessage?.caption) return message.message.imageMessage.caption;
    if (message.message?.videoMessage?.caption) return message.message.videoMessage.caption;
    return null;
}

module.exports = messageHandler;
