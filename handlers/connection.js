// handlers/connection.js
const qrcode = require('qrcode-terminal');
const logger = require('../utils/logger');

function connectionHandler(sock, saveCreds, onSuccess) {
    // Handle connection updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr, isNewLogin, receivedPendingNotifications } = update;
        
        // Log the full update for debugging (optional)
        // logger.debug('Connection update:', JSON.stringify(update, null, 2));
        
        // Handle QR code generation
        if (qr) {
            handleQRCode(qr);
        }
        
        // Handle connection state changes
        switch (connection) {
            case 'open':
                handleConnectionOpen(sock, isNewLogin, receivedPendingNotifications, onSuccess);
                break;
                
            case 'close':
                handleConnectionClose(lastDisconnect, sock, saveCreds);
                break;
                
            case 'connecting':
                handleConnecting();
                break;
                
            default:
                if (connection) {
                    logger.connection(`Connection state: ${connection}`);
                }
        }
        
        // Handle pairing code (for multi-device)
        if (update.isNewLogin) {
            handleNewLogin();
        }
    });
    
    // Save credentials when updated
    sock.ev.on('creds.update', saveCreds);
    
    // Handle other connection-related events
    sock.ev.on('connection.update', (update) => {
        // Handle connection failures
        if (update.lastDisconnect?.error) {
            handleConnectionError(update.lastDisconnect.error);
        }
        
        // Handle receiving pending notifications
        if (update.receivedPendingNotifications) {
            handlePendingNotifications();
        }
    });
}

function handleQRCode(qr) {
    logger.connection('QR code generated! Scan with WhatsApp:');
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║               SCAN QR CODE BELOW              ║');
    console.log('╚══════════════════════════════════════════════╝\n');
    
    try {
        // Try to generate QR code with different options
        qrcode.generate(qr, { 
            small: false,
            scale: 2
        });
    } catch (qrError) {
        logger.error('Failed to generate QR code display:', qrError.message);
        // Fallback: show QR code as text (first part)
        console.log('QR code (text format):', qr.substring(0, 100) + '...');
    }
    
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║              HOW TO CONNECT                   ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log('║ 1. Open WhatsApp on your phone               ║');
    console.log('║ 2. Tap Menu → Linked Devices                 ║');
    console.log('║ 3. Tap "Link a Device"                       ║');
    console.log('║ 4. Scan the QR code above                    ║');
    console.log('║ 5. Wait for connection confirmation          ║');
    console.log('╚══════════════════════════════════════════════╝\n');
    
    logger.info('QR code will expire in approximately 20 seconds');
    logger.info('If it expires, a new one will be generated automatically');
}

function handleConnectionOpen(sock, isNewLogin, receivedPendingNotifications, onSuccess) {
    logger.success('✅ Successfully connected to WhatsApp!');
    
    if (isNewLogin) {
        logger.info('📱 New login detected');
    }
    
    if (receivedPendingNotifications) {
        logger.info('📨 Received pending notifications');
    }
    
    // Log connection information
    const connectionInfo = {
        platform: sock.authState.creds.platform,
        phone: sock.authState.creds.me?.id,
        device: sock.browser[0]
    };
    
    logger.debug('Connection info:', connectionInfo);
    logger.info('Bot is now ready to receive commands');
    
    // Execute success callback if provided
    if (typeof onSuccess === 'function') {
        onSuccess();
    }
}

function handleConnectionClose(lastDisconnect, sock, saveCreds) {
    const error = lastDisconnect?.error;
    
    if (error) {
        logger.error('Connection closed with error:', error.message);
        
        // Handle specific error codes
        const statusCode = error.output?.statusCode;
        switch (statusCode) {
            case 401:
                logger.fail('❌ Authentication failed - Invalid credentials');
                logger.info('Please delete the auth_info folder and restart the bot');
                break;
                
            case 403:
                logger.fail('❌ Access forbidden - Account may be banned');
                break;
                
            case 404:
                logger.warning('⚠️ Connection not found - Server issue');
                break;
                
            case 408:
                logger.warning('⚠️ Connection timeout');
                break;
                
            case 500:
                logger.warning('⚠️ Server error - WhatsApp server issue');
                break;
                
            default:
                logger.warning(`⚠️ Connection closed with status code: ${statusCode}`);
        }
    } else {
        logger.warning('Connection closed without error');
    }
    
    // Attempt to save credentials before exit if it was a fatal error
    if (error?.output?.statusCode === 401) {
        try {
            saveCreds(sock.authState.creds);
            logger.debug('Credentials saved before exit');
        } catch (saveError) {
            logger.error('Failed to save credentials:', saveError.message);
        }
        process.exit(1);
    }
}

function handleConnecting() {
    logger.loading('Connecting to WhatsApp servers...');
}

function handleNewLogin() {
    logger.info('🔐 New login detected - Pairing successful');
}

function handleConnectionError(error) {
    logger.error('Connection error:', error.message);
    
    // Handle specific error types
    if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
        logger.warning('Network timeout - Check your internet connection');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('EAI_AGAIN')) {
        logger.warning('DNS resolution failed - Check your network settings');
    } else if (error.message.includes('ECONNREFUSED')) {
        logger.warning('Connection refused - WhatsApp servers may be down');
    }
}

function handlePendingNotifications() {
    logger.info('Processing pending notifications...');
}

// Additional connection utilities
function checkConnectionHealth(sock) {
    if (!sock || !sock.user) {
        return { status: 'disconnected', healthy: false };
    }
    
    return {
        status: 'connected',
        healthy: true,
        user: sock.user,
        connection: sock.connection
    };
}

function getConnectionInfo(sock) {
    if (!sock || !sock.authState) {
        return null;
    }
    
    return {
        platform: sock.authState.creds.platform,
        phone: sock.authState.creds.me?.id,
        device: sock.browser[0],
        connection: sock.connection,
        isConnected: !!sock.user
    };
}

// Export the connection handler and utilities
module.exports = {
    connectionHandler,
    checkConnectionHealth,
    getConnectionInfo,
    
    // Helper functions for testing
    handleQRCode,
    handleConnectionOpen,
    handleConnectionClose,
    handleConnectionError
};
