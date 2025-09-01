const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    name: 'otaku-news',
    description: 'Fetches latest otaku news from AnimeNewsNetwork',
    command: 'news',
    aliases: ['ann'],
    usage: '.news',
    cooldown: 30,
    
    async execute(sock, message, args) {
        try {
            // Scrape AnimeNewsNetwork for latest news
            const response = await axios.get('https://www.animenewsnetwork.com/news/');
            const $ = cheerio.load(response.data);
            
            const newsItems = [];
            
            $('.news-story').each((i, element) => {
                if (i < 5) { // Get top 5 news items
                    const title = $(element).find('h3').text().trim();
                    const link = 'https://www.animenewsnetwork.com' + $(element).find('a').attr('href');
                    const preview = $(element).find('.preview').text().trim() || 'No preview available';
                    
                    if (title) {
                        newsItems.push({ title, link, preview });
                    }
                }
            });
            
            if (!newsItems.length) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: '❌ No news found at the moment.'
                }, { quoted: message });
                return;
            }
            
            let newsText = `📰 *Latest Otaku News*\n\n`;
            
            newsItems.forEach((item, index) => {
                newsText += `*${index + 1}. ${item.title}*\n`;
                newsText += `${item.preview}\n`;
                newsText += `🔗 ${item.link}\n\n`;
            });
            
            await sock.sendMessage(message.key.remoteJid, {
                text: newsText
            }, { quoted: message });
            
        } catch (error) {
            console.error('Error fetching otaku news:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Failed to fetch news. Please try again later.'
            }, { quoted: message });
        }
    }
};
