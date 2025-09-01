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
const store = makeInMemoryStore({ logger: logger.pino() });
store.readFromFile('./baileys_store.json');
setInterval(() => {
    store.writeToFile('./baileys_store.json');
}, 10_000);

async function startBot() {
    // Load plugins
    const plugins = await pluginLoader.loadPlugins('./plugins');
    logger.info(`Loaded ${plugins.length} plugins`);

    // Initialize WhatsApp connection
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        printQRInTerminal: false,
        auth: state,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: false,
        logger: logger.pino({ level: 'silent' }),
        browser: ['Byakuya MD', 'Chrome', '1.0.0']
    });

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
}

startBot().catch(err => {
    logger.error('Failed to start bot:', err);
    process.exit(1);
});
