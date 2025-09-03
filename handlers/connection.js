// handlers/connection.js
const qrcode = require('qrcode-terminal');
const logger = require('../utils/logger');

function connectionHandler(sock, saveCreds, onSuccess) {
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            qrcode.generate(qr, { small: true });
            logger.info('Scan the QR code above to connect');
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== 401;
            if (shouldReconnect) {
                logger.info('Connection closed. Reconnecting...');
                // The restart will be handled by the main index.js
            } else {
                logger.error('Connection refused. Please restart the bot.');
            }
        } else if (connection === 'open') {
            logger.info('Successfully connected to WhatsApp');
            if (onSuccess) onSuccess();
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
}

module.exports = connectionHandler;
