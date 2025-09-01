const qrcode = require('qrcode-terminal');
const logger = require('../utils/logger');

function connectionHandler(sock, saveCreds, onSuccess) {
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            // Display QR code in terminal
            qrcode.generate(qr, { small: true });
            logger.info('Scan the QR code above to connect');
        }
        
        if (connection === 'close') {
            const shouldReconnect = 
                lastDisconnect.error?.output?.statusCode !== 401; // Don't reconnect if logged out
                
            if (shouldReconnect) {
                logger.info('Connection closed. Reconnecting...');
                startBot();
            } else {
                logger.error('Connection refused. Please restart the bot.');
            }
        } else if (connection === 'open') {
            logger.info('Successfully connected to WhatsApp');
            if (onSuccess) onSuccess();
        }
        
        // Handle pairing code
        if (update.isNewLogin) {
            logger.info('New login detected');
        }
        
        if (update.qr) {
            // If using pairing code instead of QR
            logger.info(`Pairing code: ${update.qr}`);
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
}

module.exports = connectionHandler;
