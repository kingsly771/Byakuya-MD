const axios = require('axios');

module.exports = {
    name: 'anime-wallpapers',
    description: 'Fetches anime wallpapers',
    command: 'wallpaper',
    aliases: ['wp', 'wall'],
    usage: '.wallpaper [anime]',
    cooldown: 15,
    
    async execute(sock, message, args) {
        const anime = args.join(' ');
        
        try {
            // Using wallhaven.cc API (example)
            const response = await axios.get('https://wallhaven.cc/api/v1/search', {
                params: {
                    q: anime || 'anime',
                    categories: '100', // General
                    purity: '100', // SFW
                    sorting: 'random',
                    ratios: '16x9',
                    page: 1
                }
            });
            
            const wallpapers = response.data.data;
            
            if (!wallpapers || !wallpapers.length) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: '❌ No wallpapers found. Try a different search term.'
                }, { quoted: message });
                return;
            }
            
            // Get random wallpaper
            const randomWallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)];
            
            await sock.sendMessage(message.key.remoteJid, {
                image: { url: randomWallpaper.path },
                caption: anime ? `Wallpaper for ${anime}` : 'Random Anime Wallpaper'
            }, { quoted: message });
            
        } catch (error) {
            console.error('Error fetching wallpaper:', error);
            
            // Fallback to waifu.pics
            try {
                const response = await axios.get('https://api.waifu.pics/sfw/waifu');
                await sock.sendMessage(message.key.remoteJid, {
                    image: { url: response.data.url },
                    caption: anime ? `Wallpaper for ${anime}` : 'Random Anime Wallpaper'
                }, { quoted: message });
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                await sock.sendMessage(message.key.remoteJid, {
                    text: '❌ Failed to fetch wallpaper. Please try again later.'
                }, { quoted: message });
            }
        }
    }
};
