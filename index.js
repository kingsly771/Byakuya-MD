// index.js - Pairing Code Version for Katabump Terminal
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const logger = require('./utils/logger');
const messageHandler = require('./handlers/message');
const pluginLoader = require('./plugins/loader');
const fs = require('fs').promises;

require('dotenv').config();

class ByakuyaBot {
    constructor() {
        this.sock = null;
        this.isConnected = false;
        this.plugins = [];
        this.authInfoPath = 'auth_info';
        this.pairingCode = null;
    }

    async initialize() {
        try {
            logger.info('🚀 Starting Byakuya MD with Pairing Code...');
            
            await this.ensureAuthDirectory();
            await this.loadPlugins();
            await this.connectToWhatsApp();
            
        } catch (error) {
            logger.fail('Failed to initialize: ' + error.message);
            throw error;
        }
    }

    async ensureAuthDirectory() {
        try {
            await fs.access(this.authInfoPath);
        } catch {
            await fs.mkdir(this.authInfoPath, { recursive: true });
            logger.info('Created auth directory');
        }
    }

    async loadPlugins() {
        try {
            logger.loading('Loading plugins...');
            this.plugins = await pluginLoader.loadPlugins('./plugins');
            logger.success(`Loaded ${this.plugins.length} plugins`);
        } catch (error) {
            logger.error('Plugin loading error:', error.message);
        }
    }

    async connectToWhatsApp() {
        try {
            logger.loading('Connecting to WhatsApp...');
            
            const { state, saveCreds } = await useMultiFileAuthState(this.authInfoPath);
            
            // Generate pairing code
            this.pairingCode = await this.generatePairingCode();
            
            this.sock = makeWASocket({
                printQRInTerminal: false, // Disable QR code
                auth: state,
                generateHighQualityLinkPreview: true,
                markOnlineOnConnect: true,
                logger: { level: 'silent' },
                browser: ['Byakuya MD', 'Chrome', '1.0.0'],
                connectTimeoutMs: 60000,
                // Enable pairing code
                shouldIgnoreJid: (jid) => jid === 'status@broadcast'
            });

            this.sock.ev.on('creds.update', saveCreds);
            this.setupEventHandlers();

        } catch (error) {
            logger.fail('Connection failed: ' + error.message);
            throw error;
        }
    }

    async generatePairingCode() {
        return new Promise((resolve) => {
            // Generate a random 6-digit pairing code
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            resolve(code);
        });
    }

    setupEventHandlers() {
        this.sock.ev.on('connection.update', (update) => {
            this.handleConnectionUpdate(update);
        });

        // Handle pairing code events
        this.sock.ev.on('connection.update', (update) => {
            if (update.pairingCode) {
                this.handlePairingCode(update.pairingCode);
            }
        });
    }

    handleConnectionUpdate(update) {
        const { connection, lastDisconnect } = update;

        switch (connection) {
            case 'open':
                this.handleConnectionOpen();
                break;
            case 'close':
                this.handleConnectionClose(lastDisconnect);
                break;
            case 'connecting':
                logger.loading('Connecting to WhatsApp...');
                break;
        }
    }

    handlePairingCode(pairingCode) {
        logger.connection('🔐 PAIRING CODE GENERATED');
        logger.connection('📱 Use this code to link your device');
        
        console.log('\n╔══════════════════════════════════════════════╗');
        console.log('║              WHATSAPP PAIRING CODE            ║');
        console.log('╠══════════════════════════════════════════════╣');
        console.log('║                                              ║');
        console.log(`║               ${pairingCode}                 ║`);
        console.log('║                                              ║');
        console.log('╚══════════════════════════════════════════════╝');
        
        console.log('\n📋 HOW TO USE PAIRING CODE:');
        console.log('1. Open WhatsApp on your phone');
        console.log('2. Go to Settings → Linked Devices');
        console.log('3. Tap "Link a Device"');
        console.log('4. Tap "Use pairing code instead"');
        console.log('5. Enter the code above');
        console.log('6. Wait for connection confirmation');
        
        console.log('\n⏰ Code will expire in 20 seconds');
        console.log('🔄 New code will be generated if needed');
    }

    handleConnectionOpen() {
        this.isConnected = true;
        logger.success('✅ SUCCESSFULLY PAIRED WITH WHATSAPP!');
        logger.info('🤖 Bot is now ready to receive commands');
        
        // Start message handling
        this.sock.ev.on('messages.upsert', async (m) => {
            await this.handleMessages(m);
        });
        
        this.showBotStatus();
    }

    showBotStatus() {
        console.log('\n✨ BYAKUYA MD STATUS:');
        console.log('✅ Connected: Yes');
        console.log('🔐 Auth: Paired with code');
        console.log(`📦 Plugins: ${this.plugins.length} loaded`);
        console.log('🌐 Status: Operational');
        console.log('\n💡 Type .help for commands');
    }

    handleConnectionClose(lastDisconnect) {
        this.isConnected = false;
        const error = lastDisconnect?.error;

        if (error) {
            const statusCode = error.output?.statusCode;
            
            if (statusCode === DisconnectReason.loggedOut) {
                logger.fail('❌ Logged out. Please restart the bot');
                // Clear auth and generate new pairing code
                this.clearAuthAndRestart();
            } else {
                logger.warning('Connection lost. Reconnecting in 5s...');
                setTimeout(() => this.reconnect(), 5000);
            }
        } else {
            logger.warning('Connection closed. Reconnecting...');
            setTimeout(() => this.reconnect(), 5000);
        }
    }

    async clearAuthAndRestart() {
        try {
            logger.info('Clearing authentication data...');
            await fs.rm(this.authInfoPath, { recursive: true, force: true });
            logger.info('Auth data cleared. Restarting...');
            setTimeout(() => this.initialize(), 2000);
        } catch (error) {
            logger.error('Failed to clear auth data:', error.message);
        }
    }

    async handleMessages(m) {
        if (!this.isConnected || !m.messages) return;
        
        try {
            await messageHandler(this.sock, m, this.plugins, {});
        } catch (error) {
            logger.error('Message error:', error.message);
        }
    }

    async reconnect() {
        try {
            logger.loading('🔄 Reconnecting...');
            await this.connectToWhatsApp();
        } catch (error) {
            logger.error('Reconnect failed:', error.message);
            setTimeout(() => this.reconnect(), 10000);
        }
    }

    // Method to manually generate new pairing code
    async generateNewPairingCode() {
        try {
            this.pairingCode = await this.generatePairingCode();
            this.handlePairingCode(this.pairingCode);
            return this.pairingCode;
        } catch (error) {
            logger.error('Failed to generate pairing code:', error.message);
            return null;
        }
    }
}

// Pairing code command handler (add to your message handler)
function handlePairingCommand(sock, message, bot) {
    const text = message.message?.conversation || '';
    
    if (text.toLowerCase() === '/pairingcode') {
        bot.generateNewPairingCode().then(code => {
            if (code) {
                sock.sendMessage(message.key.remoteJid, {
                    text: `🔐 New pairing code: ${code}\n\nUse this in WhatsApp → Linked Devices → Link a Device → Use pairing code`
                }, { quoted: message });
            }
        });
        return true;
    }
    
    return false;
}

// Update your message handler to include pairing commands
async function enhancedMessageHandler(sock, m, plugins, store, bot) {
    if (!m.messages || m.messages.length === 0) return;
    
    const message = m.messages[0];
    
    // Check for pairing commands first
    if (handlePairingCommand(sock, message, bot)) {
        return;
    }
    
    // Then handle normal messages
    // ... your existing message handling code
}

// Main execution
async function main() {
    try {
        console.log('\n╔══════════════════════════════════════════════╗');
        console.log('║           BYAKUYA MD - PAIRING CODE           ║');
        console.log('║            WhatsApp Bot Starting...           ║');
        console.log('╚══════════════════════════════════════════════╝');
        console.log('\n');

        const bot = new ByakuyaBot();
        await bot.initialize();

    } catch (error) {
        console.error('FATAL ERROR:', error.message);
        process.exit(1);
    }
}

// Enhanced process handling
process.on('SIGINT', () => {
    logger.info('Shutdown signal received');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logger.error('Crash:', error.message);
    process.exit(1);
});

// Start the bot
main().catch(console.error);

module.exports = ByakuyaBot;
