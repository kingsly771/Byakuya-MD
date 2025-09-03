// index.js - Optimized for Katabump Terminal
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');
const logger = require('./utils/logger');
const messageHandler = require('./handlers/message');
const pluginLoader = require('./plugins/loader');
const path = require('path');
const fs = require('fs').promises;

require('dotenv').config();

class ByakuyaBot {
    constructor() {
        this.sock = null;
        this.isConnected = false;
        this.plugins = [];
        this.authInfoPath = 'auth_info';
        this.isKatabump = process.env.KATABUMP === 'true' || process.platform === 'linux';
    }

    async initialize() {
        try {
            logger.info('🚀 Starting Byakuya MD on Katabump Terminal...');
            
            if (this.isKatabump) {
                logger.info('📦 Environment: Katabump Terminal');
            }
            
            await this.ensureAuthDirectory();
            await this.loadPlugins();
            await this.connectToWhatsApp();
            
            logger.success('Bot initialization completed');

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
            
            this.sock = makeWASocket({
                printQRInTerminal: !this.isKatabump, // Disable terminal QR on Katabump
                auth: state,
                generateHighQualityLinkPreview: true,
                markOnlineOnConnect: true,
                logger: { level: 'silent' },
                browser: ['Byakuya MD', 'Chrome', '1.0.0'],
                connectTimeoutMs: 60000
            });

            this.sock.ev.on('creds.update', saveCreds);
            this.setupEventHandlers();

        } catch (error) {
            logger.fail('Connection failed: ' + error.message);
            throw error;
        }
    }

    setupEventHandlers() {
        this.sock.ev.on('connection.update', (update) => {
            this.handleConnectionUpdate(update);
        });
    }

    handleConnectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;

        // KATABUMP-FRIENDLY QR CODE HANDLING
        if (qr) {
            this.handleQRCodeForKatabump(qr);
        }

        switch (connection) {
            case 'open':
                this.handleConnectionOpen();
                break;
            case 'close':
                this.handleConnectionClose(lastDisconnect);
                break;
            case 'connecting':
                logger.loading('Connecting...');
                break;
        }
    }

    handleQRCodeForKatabump(qr) {
        logger.connection('🔐 AUTHENTICATION REQUIRED');
        logger.connection('📱 Scan QR code with WhatsApp');
        
        if (this.isKatabump) {
            // KATABUMP-SPECIFIC QR HANDLING
            console.log('\n╔══════════════════════════════════════════════╗');
            console.log('║           KATABUMP TERMINAL DETECTED          ║');
            console.log('║     QR code may not display properly         ║');
            console.log('╚══════════════════════════════════════════════╝');
            
            // Method 1: Try basic QR display
            try {
                console.log('\n📋 Attempting QR code display:');
                qrcode.generate(qr, { small: true });
            } catch (error) {
                console.log('❌ QR display failed, using alternative methods');
            }
            
            // Method 2: Show QR code as clickable link
            console.log('\n🌐 Alternative method:');
            console.log('1. Visit: https://qrcode.tec-it.com/en');
            console.log('2. Choose "Text" option');
            console.log('3. Paste the QR code text below:');
            console.log('\n📋 QR CODE TEXT (copy this):');
            console.log('═'.repeat(50));
            console.log(qr);
            console.log('═'.repeat(50));
            
            // Method 3: Provide direct instructions
            console.log('\n📱 QUICK SETUP:');
            console.log('1. Open WhatsApp → Linked Devices → Link a Device');
            console.log('2. Use another device to scan the QR code');
            console.log('3. Or manually enter the code above');
            
        } else {
            // Standard terminal QR display
            try {
                qrcode.generate(qr, { small: false });
            } catch (error) {
                logger.error('QR display failed:', error.message);
            }
        }
        
        console.log('\n⏰ QR code expires in 20 seconds');
    }

    handleConnectionOpen() {
        this.isConnected = true;
        logger.success('✅ CONNECTED TO WHATSAPP!');
        logger.info('🤖 Bot is now operational');
        
        // Start message handling
        this.sock.ev.on('messages.upsert', async (m) => {
            await this.handleMessages(m);
        });
        
        this.showBotStatus();
    }

    showBotStatus() {
        console.log('\n✨ BYAKUYA MD STATUS:');
        console.log('✅ Connected: Yes');
        console.log(`📦 Plugins: ${this.plugins.length} loaded`);
        console.log('🌐 Server: Katabump Terminal');
        console.log('⏰ Uptime: Just started');
        console.log('\n💡 Type .help for commands');
    }

    handleConnectionClose(lastDisconnect) {
        this.isConnected = false;
        const error = lastDisconnect?.error;

        if (error) {
            const statusCode = error.output?.statusCode;
            
            if (statusCode === DisconnectReason.loggedOut) {
                logger.fail('❌ Logged out. Please delete auth_info/ and restart');
            } else {
                logger.warning('Connection lost. Reconnecting in 5s...');
                setTimeout(() => this.reconnect(), 5000);
            }
        } else {
            logger.warning('Connection closed. Reconnecting...');
            setTimeout(() => this.reconnect(), 5000);
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
}

// Katabump-specific process handling
function setupKatabumpHandlers(bot) {
    process.on('SIGINT', () => {
        logger.info('Shutdown signal received');
        process.exit(0);
    });

    process.on('uncaughtException', (error) => {
        logger.error('Crash:', error.message);
        setTimeout(() => process.exit(1), 1000);
    });

    process.on('unhandledRejection', (reason) => {
        logger.warning('Unhandled rejection:', reason);
    });
}

// Main execution with Katabump optimizations
async function main() {
    try {
        console.log('\n'.repeat(2));
        console.log('╔══════════════════════════════════════════════╗');
        console.log('║           BYAKUYA MD - KATABUMP EDITION      ║');
        console.log('║            WhatsApp Bot Starting...          ║');
        console.log('╚══════════════════════════════════════════════╝');
        console.log('\n');

        const bot = new ByakuyaBot();
        setupKatabumpHandlers(bot);
        await bot.initialize();

    } catch (error) {
        console.error('FATAL ERROR:', error.message);
        process.exit(1);
    }
}

// Start with error protection
main().catch(console.error);
