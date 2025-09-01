const axios = require('axios');

module.exports = {
    name: 'cosplay-images',
    description: 'Fetches SFW cosplay images',
    command: 'cosplay',
    aliases: ['cos'],
    usage: '.cosplay [character]',
    cooldown: 15,
    
    async execute(sock, message, args) {
        const character = args.join(' ');
        
        try {
            // Using a safe cosplay API (example using waifu.pics with sfw endpoint)
            let imageUrl;
            
            if (character) {
                // Try to search for specific character (simulated)
                const response = await axios.get('https://api.waifu.pics/sfw/waifu');
                imageUrl = response.data.url;
            } else {
                // Random cosplay
                const response = await axios.get('https://api.waifu.pics/sfw/waifu');
                imageUrl = response.data.url;
            }
            
            await sock.sendMessage(message.key.remoteJid, {
                image: { url: imageUrl },
                caption: character ? `Cosplay of ${character}` : 'Random Cosplay Image'
            }, { quoted: message });
            
        } catch (error) {
            console.error('Error fetching cosplay image:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Failed to fetch cosplay image. Please try again later.'
            }, { quoted: message });
        }
    }
};
