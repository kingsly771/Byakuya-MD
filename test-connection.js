const makeWASocket = require('@adiwajshing/baileys').default;
const { useMultiFileAuthState } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');

async function testConnection() {
    console.log('Testing WhatsApp connection...');
    
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        logger: { level: 'silent' }
    });

    sock.ev.on('connection.update', (update) => {
        console.log('Status:', update.connection);
        if (update.qr) {
            console.log('QR received!');
            qrcode.generate(update.qr, { small: true });
        }
        if (update.connection === 'open') {
            console.log('Connected successfully!');
            process.exit(0);
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

testConnection().catch(console.error);
