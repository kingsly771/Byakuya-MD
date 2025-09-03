// index.js - Complete fixed version
const { default: makeWASocket } = require('@adiwajshing/baileys');
const { useMultiFileAuthState } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');
const logger = require('./utils/logger');
const messageHandler = require('./handlers/message');
const pluginLoader = require('./plugins/loader');
const config = require('./config');

require('dotenv').config();

// Create a simple mock store to avoid makeInMemoryStore issues
const mockStore = {
    bind: () => logger.debug('Store binding called'),
    readFromFile: () => logger.debug('Store read called'),
    writeToFile: () => logger.debug('Store write called'),
    messages: [],
    chats: [],
    contacts: []
};

// Create a silent logger for Baileys
const silentLogger = {
    trace: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: (error) => logger.error('Baileys Error:', error.message),
    fatal: (error) => logger.fail('Baileys Fatal:', error.message),
    child: () => silentLogger
};

class ByakuyaBot {
    constructor() {
        this.sock = null;
        this.isConnected = false;
        this.plugins = [];
    }

    async initialize() {
        try {
            logger.info('🚀 Starting Byakuya MD WhatsApp Bot...');
            
            // Load plugins first
            await this.loadPlugins();
            
            // Initialize WhatsApp connection
            await this.connectToWhatsApp();
            
            // Set up event handlers
            this.setupEventHandlers();
            
            logger.success('Bot initialization completed successfully');

        } catch (error) {
            logger.fail('Failed to initialize bot: ' + error.message);
            throw error;
        }
    }

    async loadPlugins() {
        try {
            logger.loading('Loading plugins...');
            this.plugins = await pluginLoader.loadPlugins('./plugins');
            logger.success(`Successfully loaded ${this.plugins.length} plugins`);
        } catch (error) {
            logger.error('Failed to load plugins:', error.message);
            throw error;
        }
    }

    async connectToWhatsApp() {
        try {
            logger.loading('Initializing WhatsApp connection...');
            
            const { state, saveCreds } = await useMultiFileAuthState('auth_info');
            
            this.sock = makeWASocket({
                printQRInTerminal: true,
                auth: state,
                generateHighQualityLinkPreview: true,
                markOnlineOnConnect: true,
                logger: silentLogger,
                browser: ['Byakuya MD', 'Chrome', '1.0.0'],
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 30000
            });

            // Save credentials when updated
            this.sock.ev.on('creds.update', saveCreds);

            logger.info('WhatsApp connection initialized. Waiting for QR code...');

        } catch (error) {
            logger.fail('Failed to connect to WhatsApp: ' + error.message);
            throw error;
        }
    }

    setupEventHandlers() {
        if (!this.sock) {
            throw new Error('Socket not initialized');
        }

        // Connection event handler
        this.sock.ev.on('connection.update', (update) => {
            this.handleConnectionUpdate(update);
        });

        // Message event handler
        this.sock.ev.on('messages.upsert', async (m) => {
            await this.handleMessages(m);
        });

        // Error handling
        this.sock.ev.on('connection.update', (update) => {
            if (update.lastDisconnect?.error) {
                logger.error('Connection error:', update.lastDisconnect.error.message);
            }
        });
    }

    handleConnectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;

        // Log connection status
        if (connection) {
            logger.connection(`Status: ${connection}`);
        }

        // Handle QR code generation
        if (qr) {
            this.handleQRCode(qr);
        }

        // Handle connection changes
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

    handleQRCode(qr) {
        logger.connection('QR code generated! Scan with WhatsApp:');
        console.log('\n╔══════════════════════════════════════════════╗');
        console.log('║               SCAN QR CODE BELOW              ║');
        console.log('╚══════════════════════════════════════════════╝\n');
        
        try {
            qrcode.generate(qr, { small: false });
        } catch (qrError) {
            logger.error('Failed to generate QR code:', qrError.message);
            console.log('QR code string (first 50 chars):', qr.substring(0, 50) + '...');
        }
        
        console.log('\n╔══════════════════════════════════════════════╗');
        console.log('║   1. Open WhatsApp on your phone              ║');
        console.log('║   2. Tap Menu → Linked Devices                ║');
        console.log('║   3. Tap "Link a Device"                      ║');
        console.log('║   4. Scan the QR code above                   ║');
        console.log('╚══════════════════════════════════════════════╝\n');
    }

    handleConnectionOpen() {
        this.isConnected = true;
        logger.success('✅ Successfully connected to WhatsApp!');
        logger.info('Bot is now ready to receive commands');
        
        // Send welcome message to console
        console.log('\n✨ Byakuya MD is now ONLINE!');
        console.log('📝 Available commands:');
        console.log('   .help       - Show all commands');
        console.log('   .quote      - Get anime quote');
        console.log('   .waifu      - Get waifu image');
        console.log('   .manga      - Search manga');
        console.log('   .fact       - Anime facts');
        console.log('   .pickup     - Otaku pickup lines');
        console.log('   ...and many more!');
        console.log('');
    }

    handleConnectionClose(lastDisconnect) {
        this.isConnected = false;
        
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
        
        if (shouldReconnect) {
            logger.warning('Connection closed. Attempting to reconnect in 5 seconds...');
            setTimeout(() => this.reconnect(), 5000);
        } else {
            logger.fail('Connection refused. Invalid credentials. Please restart the bot.');
            logger.info('Try deleting the auth_info folder and restarting');
            process.exit(1);
        }
    }

    async handleMessages(m) {
        if (!this.isConnected) return;
        if (!m.messages || m.messages.length === 0) return;

        try {
            await messageHandler(this.sock, m, this.plugins, mockStore);
        } catch (error) {
            logger.error('Error handling message:', error.message);
        }
    }

    async reconnect() {
        try {
            logger.loading('Attempting to reconnect...');
            await this.connectToWhatsApp();
            this.setupEventHandlers();
        } catch (error) {
            logger.error('Reconnection failed:', error.message);
            logger.warning('Will retry in 10 seconds...');
            setTimeout(() => this.reconnect(), 10000);
        }
    }

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

// Handle process signals
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
        logger.info('Initializing Byakuya MD...');
        logger.debug('Node.js:', process.version);
        logger.debug('Platform:', process.platform);
        logger.debug('Environment:', process.env.NODE_ENV || 'development');

        const bot = new ByakuyaBot();
        setupProcessHandlers(bot);
        
        await bot.initialize();

    } catch (error) {
        logger.fail('Failed to start bot: ' + error.message);
        logger.debug('Error stack:', error.stack);
        process.exit(1);
    }
}

// Start the bot
main().catch(error => {
    logger.fail('Fatal error during startup: ' + error.message);
    process.exit(1);
});

module.exports = ByakuyaBot;
