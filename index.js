// index.js - Fixed version
const { Boom } = require('@hapi/boom');
const makeWASocket = require('@adiwajshing/baileys').default;
const { useMultiFileAuthState, makeInMemoryStore } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');
const logger = require('./utils/logger');
const messageHandler = require('./handlers/message');
const connectionHandler = require('./handlers/connection');
const pluginLoader = require('./plugins/loader');
const config = require('./config');

require('dotenv').config();

// Initialize store for message handling - FIXED: Removed invalid logger parameter
const store = makeInMemoryStore();

// Try to read existing store, but don't crash if it doesn't exist
try {
    store.readFromFile('./baileys_store.json');
    logger.info('Loaded existing message store');
} catch (error) {
    logger.warning('No existing message store found, creating new one');
}

// Save store to file every 10 seconds
setInterval(() => {
    try {
        store.writeToFile('./baileys_store.json');
    } catch (error) {
        logger.error('Failed to save message store:', error.message);
    }
}, 10000);

async function startBot() {
    try {
        logger.info('🚀 Starting Byakuya MD WhatsApp Bot...');
        logger.debug('Loading configuration...');

        // Load plugins
        logger.loading('Loading plugins...');
        const plugins = await pluginLoader.loadPlugins('./plugins');
        logger.success(`Successfully loaded ${plugins.length} plugins`);

        // Initialize WhatsApp connection
        logger.loading('Initializing WhatsApp connection...');
        const { state, saveCreds } = await useMultiFileAuthState('auth_info');
        
        const sock = makeWASocket({
            printQRInTerminal: false, // We'll handle QR display ourselves
            auth: state,
            generateHighQualityLinkPreview: true,
            markOnlineOnConnect: false,
            // Use minimal logging for Baileys to avoid issues
            logger: {
                trace: () => {},
                debug: () => {},
                info: () => {},
                warn: () => {},
                error: (error) => logger.error('Baileys Error:', error),
                fatal: (error) => logger.fail('Baileys Fatal:', error)
            },
            browser: ['Byakuya MD', 'Chrome', '1.0.0']
        });

        // Bind store to socket events
        store.bind(sock.ev);

        // Handle connection events
        connectionHandler(sock, saveCreds, () => {
            logger.success('✅ WhatsApp connection established successfully');
            
            // Success callback - start message handling
            sock.ev.on('messages.upsert', async (m) => {
                try {
                    await messageHandler(sock, m, plugins, store);
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
                    logger.warning('Connection closed. Reconnecting...');
                    setTimeout(startBot, 5000); // Reconnect after 5 seconds
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
        logger.debug('Error details:', error);
        process.exit(1);
    }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
    logger.info('Shutting down Byakuya MD gracefully...');
    try {
        store.writeToFile('./baileys_store.json');
        logger.success('Message store saved successfully');
    } catch (error) {
        logger.error('Failed to save message store:', error.message);
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM. Shutting down...');
    try {
        store.writeToFile('./baileys_store.json');
    } catch (error) {
        logger.error('Failed to save message store:', error.message);
    }
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logger.fail('Uncaught Exception: ' + error.message);
    logger.debug('Exception details:', error);
    try {
        store.writeToFile('./baileys_store.json');
    } catch (saveError) {
        logger.error('Failed to save message store:', saveError.message);
    }
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.fail('Unhandled Rejection at:', promise);
    logger.debug('Reason:', reason);
    try {
        store.writeToFile('./baileys_store.json');
    } catch (error) {
        logger.error('Failed to save message store:', error.message);
    }
    process.exit(1);
});

// Start the bot
logger.info('Initializing Byakuya MD...');
logger.debug('Node.js version:', process.version);
logger.debug('Platform:', process.platform);

startBot().catch(error => {
    logger.fail('Failed to start bot: ' + error.message);
    logger.debug('Startup error details:', error);
    process.exit(1);
});
