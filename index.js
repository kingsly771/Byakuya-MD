// index.js - Simplified version
const { Boom } = require('@hapi/boom');
const makeWASocket = require('@adiwajshing/baileys').default;
const { useMultiFileAuthState } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');
const logger = require('./utils/logger');
const messageHandler = require('./handlers/message');
const connectionHandler = require('./handlers/connection');
const pluginLoader = require('./plugins/loader');
const config = require('./config');

require('dotenv').config();

// Create a simple mock store
const mockStore = {
    bind: () => logger.debug('Store binding called (mock)'),
    readFromFile: () => logger.debug('Store read called (mock)'),
    writeToFile: () => logger.debug('Store write called (mock)'),
};

async function startBot() {
    try {
        logger.info('🚀 Starting Byakuya MD WhatsApp Bot...');

        // Load plugins
        logger.loading('Loading plugins...');
        const plugins = await pluginLoader.loadPlugins('./plugins');
        logger.success(`Successfully loaded ${plugins.length} plugins`);

        // Initialize WhatsApp connection
        logger.loading('Initializing WhatsApp connection...');
        const { state, saveCreds } = await useMultiFileAuthState('auth_info');
        
        // Create a minimal logger for Baileys that won't cause issues
        const baileysLogger = logger.child();
        
        const sock = makeWASocket({
            printQRInTerminal: false,
            auth: state,
            generateHighQualityLinkPreview: true,
            markOnlineOnConnect: false,
            logger: baileysLogger, // Use our child logger
            browser: ['Byakuya MD', 'Chrome', '1.0.0']
        });

        // Handle connection events
        connectionHandler(sock, saveCreds, () => {
            logger.success('✅ WhatsApp connection established successfully');
            
            // Success callback - start message handling
            sock.ev.on('messages.upsert', async (m) => {
                try {
                    await messageHandler(sock, m, plugins, mockStore);
                } catch (error) {
                    logger.error('Error in message handler:', error.message);
                }
            });
        });

        // Save credentials whenever updated
        sock.ev.on('creds.update', saveCreds);

        // Handle connection errors
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                logger.connection('QR code received, please scan to connect');
                qrcode.generate(qr, { small: true });
            }
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
                if (shouldReconnect) {
                    logger.warning('Connection closed. Reconnecting in 5 seconds...');
                    setTimeout(startBot, 5000);
                } else {
                    logger.fail('Connection refused. Invalid credentials. Please restart the bot.');
                    process.exit(1);
                }
            } else if (connection === 'open') {
                logger.success('Connection established successfully');
            }
        });

    } catch (error) {
        logger.fail('Failed to start bot: ' + error.message);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    logger.info('Shutting down Byakuya MD gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM. Shutting down...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logger.fail('Uncaught Exception: ' + error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.fail('Unhandled Rejection at:', promise);
    process.exit(1);
});

// Start the bot
logger.info('Initializing Byakuya MD...');
startBot().catch(error => {
    logger.fail('Failed to start bot: ' + error.message);
    process.exit(1);
});
