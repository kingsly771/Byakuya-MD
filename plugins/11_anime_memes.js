const axios = require('axios');

module.exports = {
    name: 'anime-memes',
    description: 'Fetches anime memes',
    command: 'meme',
    aliases: ['am'],
    usage: '.meme',
    cooldown: 10,
    
    async execute(sock, message, args) {
        try {
            // Using a meme API (example using https://api.imgflip.com)
            const response = await axios.get('https://api.imgflip.com/get_memes');
            const memes = response.data.data.memes;
            
            if (!memes || !memes.length) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: '❌ No memes found at the moment.'
                }, { quoted: message });
                return;
            }
            
            // Get random meme
            const randomMeme = memes[Math.floor(Math.random() * memes.length)];
            
            await sock.sendMessage(message.key.remoteJid, {
                image: { url: randomMeme.url },
                caption: randomMeme.name
            }, { quoted: message });
            
        } catch (error) {
            console.error('Error fetching anime meme:', error);
            
            // Fallback to text meme
            const textMemes = [
                "When you realize the anime filler arc is longer than the actual story: 🤡",
                "Anime protagonist: *gets power up*\nMe: I too have the power to procrastinate!",
                "That moment when you finish an anime and don't know what to do with your life...",
                "Sub vs Dub debates be like:\nSub watchers: 🤓\nDub watchers: 😎",
                "When someone says anime is for kids:\nMe: *shows them Berserk*",
                "Anime logic: \nNormal person: I'm tired after walking 5km\nAnime character: *runs 50km then fights a god*",
                "That feeling when your favorite character dies: 💔",
                "When the plot twist hits harder than One Punch Man: 😵",
                "Anime fans waiting for new season: \n⌛ Year 1: Patient\n⌛ Year 5: Coping\n⌛ Year 10: Delusional",
                "When you accidentally spoil an anime:\nYou: 😬\nYour friend: 🔪"
            ];
            
            const randomTextMeme = textMemes[Math.floor(Math.random() * textMemes.length)];
            
            await sock.sendMessage(message.key.remoteJid, {
                text: `😂 *Anime Meme*\n\n${randomTextMeme}`
            }, { quoted: message });
        }
    }
};
