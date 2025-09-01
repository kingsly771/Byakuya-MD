const axios = require('axios');

module.exports = {
    name: 'waifu-generator',
    description: 'Generates a random waifu/husbando image',
    command: 'waifu',
    aliases: ['husbando', 'wg'],
    usage: '.waifu [category]',
    cooldown: 10,
    
    async execute(sock, message, args) {
        const categories = ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'awoo'];
        const category = args[0] && categories.includes(args[0]) ? args[0] : 'waifu';
        
        try {
            const response = await axios.get(`https://api.waifu.pics/sfw/${category}`);
            const imageUrl = response.data.url;
            
            await sock.sendMessage(message.key.remoteJid, {
                image: { url: imageUrl },
                caption: `✨ Here's your ${category}!`
            }, { quoted: message });
        } catch (error) {
            console.error('Error fetching waifu image:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Failed to fetch waifu image. Please try again later.'
            }, { quoted: message });
        }
    }
};
