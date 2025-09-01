const axios = require('axios');

module.exports = {
    name: 'anime-quotes',
    description: 'Fetches random anime quotes',
    command: 'quote',
    aliases: ['aq'],
    usage: '.quote',
    cooldown: 5,
    
    async execute(sock, message, args) {
        try {
            const response = await axios.get('https://animechan.xyz/api/random');
            const quote = response.data;
            
            const quoteText = `
🎭 *${quote.anime}* - ${quote.character}
            
"${quote.quote}"
            `;
            
            await sock.sendMessage(message.key.remoteJid, {
                text: quoteText
            }, { quoted: message });
        } catch (error) {
            console.error('Error fetching anime quote:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Failed to fetch anime quote. Please try again later.'
            }, { quoted: message });
        }
    }
};
