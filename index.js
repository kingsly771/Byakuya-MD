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

// Initialize store for message handling
const store = makeInMemoryStore({ logger: pino({ level: 'silent' }) });
store.readFromFile('./baileys_store.json');

// Save store to file every 10 seconds
setInterval(() => {
    store.writeToFile('./baileys_store.json');
}, 10000);

async function startBot() {
    try {
        logger.info('Starting Byakuya MD WhatsApp Bot...');

        // Load plugins
        const plugins = await pluginLoader.loadPlugins('./plugins');
        logger.info(`✅ Loaded ${plugins.length} plugins`);

        // Initialize WhatsApp connection
        const { state, saveCreds } = await useMultiFileAuthState('auth_info');
        
        const sock = makeWASocket({
            printQRInTerminal: false, // We'll handle QR display ourselves
            auth: state,
            generateHighQualityLinkPreview: true,
            markOnlineOnConnect: false,
            logger: pino({ level: 'silent' }), // Keep Baileys logging silent
            browser: ['Byakuya MD', 'Chrome', '1.0.0']
        });

        // Bind store to socket events
        store.bind(sock.ev);

        // Handle connection events
        connectionHandler(sock, saveCreds, () => {
            // Success callback - start message handling
            sock.ev.on('messages.upsert', async (m) => {
                await messageHandler(sock, m, plugins, store);
            });
        });

        // Save credentials whenever updated
        sock.ev.on('creds.update', saveCreds);

        // Handle connection errors
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect.error?.output?.statusCode !== 401;
                if (shouldReconnect) {
                    logger.info('Connection closed. Reconnecting...');
                    startBot();
                } else {
                    logger.error('Connection refused. Invalid credentials. Please restart the bot.');
                }
            }
        });

        // Handle unexpected errors
        sock.ev.on('connection.update', (update) => {
            if (update.qr) {
                logger.info('QR code received. Please scan to connect.');
            }
        });

    } catch (error) {
        logger.error('Failed to start bot:', error);
        process.exit(1);
    }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
    logger.info('Shutting down Byakuya MD...');
    store.writeToFile('./baileys_store.json');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM. Shutting down...');
    store.writeToFile('./baileys_store.json');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    store.writeToFile('./baileys_store.json');
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    store.writeToFile('./baileys_store.json');
    process.exit(1);
});

// Start the bot
startBot().catch(error => {
    logger.error('Failed to start bot:', error);
    process.exit(1);
});
