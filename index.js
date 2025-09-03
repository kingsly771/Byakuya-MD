// index.js - Complete fixed version with proper logger handling
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
        
        // Create a proper silent logger for Baileys
        this.silentLogger = this.createSilentLogger();
    }

    createSilentLogger() {
        // Create a complete silent logger that has all required methods
        const silentLogger = {
            trace: () => {},
            debug: () => {},
            info: () => {},
            warn: () => {},
            error: () => {},
            fatal: () => {},
            // The crucial fix: child() method must return a logger with the same structure
            child: () => this.createSilentLogger()
        };
        return silentLogger;
    }

    async initialize() {
        try {
            logger.info('🚀 Starting Byakuya MD WhatsApp Bot...');
            logger.debug('Initialization started');
            
            await this.ensureAuthDirectory();
            await this.loadPlugins();
            await this.connectToWhatsApp();
            
            logger.success('Bot initialization completed successfully');

        } catch (error) {
            logger.fail('Failed to initialize bot: ' + error.message);
            logger.debug('Error stack:', error.stack);
            process.exit(1);
        }
    }

    async ensureAuthDirectory() {
        try {
            await fs.access(this.authInfoPath);
            logger.debug('Auth directory exists');
        } catch {
            await fs.mkdir(this.authInfoPath, { recursive: true });
            logger.info('Created auth directory');
        }
    }

    async loadPlugins() {
        try {
            logger.loading('Loading plugins...');
            this.plugins = await pluginLoader.loadPlugins('./plugins');
            
            if (this.plugins.length === 0) {
                logger.warning('No plugins loaded');
            } else {
                logger.success(`Successfully loaded ${this.plugins.length} plugins`);
            }
        } catch (error) {
            logger.error('Failed to load plugins:', error.message);
        }
    }

    async connectToWhatsApp() {
        try {
            logger.loading('Initializing WhatsApp connection...');
            
            const { state, saveCreds } = await useMultiFileAuthState(this.authInfoPath);
            
            this.sock = makeWASocket({
                printQRInTerminal: false, // We'll handle pairing codes manually
                auth: state,
                generateHighQualityLinkPreview: true,
                markOnlineOnConnect: true,
                logger: this.silentLogger, // Use the fixed silent logger
                browser: ['Byakuya MD', 'Chrome', '1.0.0'],
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 20000,
                // WhatsApp connection options
                syncFullHistory: false,
                linkPreviewImageThumbnailWidth: 192,
                transactionOpts: {
                    maxCommitRetries: 10,
                    delayBetweenTriesMs: 3000
                }
            });

            // Handle credentials saving
            this.sock.ev.on('creds.update', saveCreds);

            // Set up all event handlers
            this.setupEventHandlers();

            logger.info('Waiting for pairing code...');

        } catch (error) {
            logger.fail('Failed to connect to WhatsApp: ' + error.message);
            throw error;
        }
    }

    setupEventHandlers() {
        // Connection event handler
        this.sock.ev.on('connection.update', (update) => {
            this.handleConnectionUpdate(update);
        });

        // Message event handler (only when connected)
        this.sock.ev.on('connection.update', (update) => {
            if (update.connection === 'open' && !this.isConnected) {
                this.handleConnectionOpen();
                
                // Start handling messages only after connection is open
                this.sock.ev.on('messages.upsert', async (m) => {
                    await this.handleMessages(m);
                });
            }
        });

        // Handle errors
        this.sock.ev.on('connection.update', (update) => {
            if (update.lastDisconnect?.error) {
                this.handleConnectionError(update.lastDisconnect.error);
            }
        });
    }

    handleConnectionUpdate(update) {
        const { connection, lastDisconnect, qr, pairingCode } = update;

        logger.debug('Connection update:', {
            connection: connection,
            hasPairingCode: !!pairingCode,
            hasQR: !!qr,
            lastDisconnect: lastDisconnect ? lastDisconnect.error?.message : 'none'
        });

        // Handle pairing code
        if (pairingCode) {
            this.handlePairingCode(pairingCode);
        }

        // Handle QR code (fallback)
        if (qr) {
            this.handleQRCode(qr);
        }

        // Handle connection states
        switch (connection) {
            case 'open':
                if (!this.isConnected) {
                    this.handleConnectionOpen();
                }
                break;
                
            case 'close':
                this.handleConnectionClose(lastDisconnect);
                break;
                
            case 'connecting':
                logger.loading('Connecting to WhatsApp servers...');
                break;
                
            case 'connecting':
                logger.connection('Reconnecting...');
                break;
                
            default:
                if (connection) {
                    logger.connection(`Status: ${connection}`);
                }
        }
    }

    handlePairingCode(pairingCode) {
        this.pairingCode = pairingCode;
        
        logger.connection('🔐 PAIRING CODE GENERATED');
        logger.connection('📱 Use this code to link your device');
        
        console.log('\n╔══════════════════════════════════════════════╗');
        console.log('║              WHATSAPP PAIRING CODE            ║');
        console.log('╠══════════════════════════════════════════════╣');
        console.log('║                                              ║');
        console.log(`║               ${pairingCode}                 ║`);
        console.log('║                                              ║');
        console.log('╚══════════════════════════════════════════════╝');
        
        console.log('\n📋 HOW TO USE:');
        console.log('1. Open WhatsApp → Settings → Linked Devices');
        console.log('2. Tap "Link a Device" → "Use pairing code instead"');
        console.log('3. Enter the code above');
        console.log('4. Wait for confirmation');
        
        console.log('\n⏰ Code expires in 20 seconds');
    }

    handleQRCode(qr) {
        // Fallback if pairing code isn't available
        logger.connection('QR code received (fallback)');
        console.log('QR code string:', qr.substring(0, 50) + '...');
    }

    handleConnectionOpen() {
        this.isConnected = true;
        logger.success('✅ SUCCESSFULLY CONNECTED TO WHATSAPP!');
        logger.info('🤖 Bot is now ready to receive commands');
        
        this.showBotStatus();
    }

    showBotStatus() {
        console.log('\n✨ BYAKUYA MD STATUS:');
        console.log('✅ Connected: Yes');
        console.log(`📦 Plugins: ${this.plugins.length} loaded`);
        console.log('🌐 Mode: Pairing Code');
        console.log('⏰ Status: Operational');
        console.log('\n💡 Type .help for available commands');
    }

    handleConnectionClose(lastDisconnect) {
        this.isConnected = false;
        const error = lastDisconnect?.error;

        if (error) {
            logger.error('Connection closed with error:', error.message);
            
            const statusCode = error.output?.statusCode;
            switch (statusCode) {
                case DisconnectReason.loggedOut:
                    logger.fail('❌ Logged out from WhatsApp');
                    this.clearAuthAndRestart();
                    break;
                    
                case DisconnectReason.connectionLost:
                case DisconnectReason.connectionClosed:
                    logger.warning('Connection lost. Reconnecting in 5s...');
                    setTimeout(() => this.reconnect(), 5000);
                    break;
                    
                case DisconnectReason.restartRequired:
                    logger.warning('Restart required. Reconnecting...');
                    setTimeout(() => this.reconnect(), 2000);
                    break;
                    
                default:
                    logger.warning(`Disconnect reason: ${statusCode}. Reconnecting in 10s...`);
                    setTimeout(() => this.reconnect(), 10000);
            }
        } else {
            logger.warning('Connection closed. Reconnecting in 5s...');
            setTimeout(() => this.reconnect(), 5000);
        }
    }

    handleConnectionError(error) {
        logger.error('Connection error:', error.message);
        
        if (error.message.includes('timeout')) {
            logger.warning('Network timeout - check your internet connection');
        } else if (error.message.includes('ENOTFOUND')) {
            logger.warning('DNS error - cannot connect to WhatsApp servers');
        }
    }

    async handleMessages(m) {
        if (!this.isConnected || !m.messages) return;
        
        try {
            await messageHandler(this.sock, m, this.plugins, {});
        } catch (error) {
            logger.error('Error handling message:', error.message);
        }
    }

    async clearAuthAndRestart() {
        try {
            logger.info('Clearing authentication data...');
            await fs.rm(this.authInfoPath, { recursive: true, force: true });
            logger.info('Auth data cleared. Restarting in 3 seconds...');
            setTimeout(() => {
                logger.info('Restarting bot...');
                this.initialize();
            }, 3000);
        } catch (error) {
            logger.error('Failed to clear auth data:', error.message);
        }
    }

    async reconnect() {
        try {
            logger.loading('🔄 Attempting to reconnect...');
            // Close existing connection if any
            if (this.sock) {
                await this.sock.end();
            }
            await this.connectToWhatsApp();
        } catch (error) {
            logger.error('Reconnection failed:', error.message);
            logger.warning('Retrying in 10 seconds...');
            setTimeout(() => this.reconnect(), 10000);
        }
    }

    // Clean shutdown
    async shutdown() {
        logger.info('Shutting down bot gracefully...');
        this.isConnected = false;
        
        if (this.sock) {
            try {
                await this.sock.end();
                logger.success('WhatsApp connection closed');
            } catch (error) {
                logger.error('Error closing connection:', error.message);
            }
        }
        
        process.exit(0);
    }
}

// Process signal handlers
function setupProcessHandlers(bot) {
    process.on('SIGINT', async () => {
        logger.info('Received SIGINT. Shutting down...');
        await bot.shutdown();
    });

    process.on('SIGTERM', async () => {
        logger.info('Received SIGTERM. Shutting down...');
        await bot.shutdown();
    });

    process.on('uncaughtException', (error) => {
        logger.fail('Uncaught Exception: ' + error.message);
        logger.debug('Exception stack:', error.stack);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        logger.fail('Unhandled Rejection at:', promise);
        logger.debug('Reason:', reason);
        process.exit(1);
    });
}

// Main execution
async function main() {
    try {
        console.log('\n╔══════════════════════════════════════════════╗');
        console.log('║           BYAKUYA MD WHATSAPP BOT             ║');
        console.log('║               Pairing Code Edition            ║');
        console.log('╚══════════════════════════════════════════════╝');
        console.log('\n');

        const bot = new ByakuyaBot();
        setupProcessHandlers(bot);
        
        await bot.initialize();

    } catch (error) {
        logger.fail('Fatal error during startup: ' + error.message);
        process.exit(1);
    }
}

// Start the bot with error handling
main().catch(error => {
    console.error('CRITICAL ERROR:', error.message);
    process.exit(1);
});

module.exports = ByakuyaBot;
