const apiClient = require('../utils/apiClient');
const config = require('../config');

module.exports = {
    name: 'manga-search',
    description: 'Searches for manga on MyAnimeList/AniList',
    command: 'manga',
    aliases: ['ms'],
    usage: '.manga <title>',
    cooldown: 10,
    
    async execute(sock, message, args) {
        if (!args.length) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Please provide a manga title to search for.\nUsage: .manga <title>'
            }, { quoted: message });
            return;
        }
        
        const query = args.join(' ');
        
        try {
            // Try MAL first
            let resultText = '';
            
            if (config.malClientId && config.malClientId !== 'DEMO_KEY') {
                const response = await apiClient.searchManga(query, 3);
                
                if (!response.data.length) {
                    await sock.sendMessage(message.key.remoteJid, {
                        text: `❌ No manga found for "${query}"`
                    }, { quoted: message });
                    return;
                }
                
                resultText = `🔍 Manga Search Results for "${query}":\n\n`;
                
                response.data.forEach((manga, index) => {
                    const item = manga.node;
                    resultText += `*${index + 1}. ${item.title}*\n`;
                    resultText += `📊 Score: ${item.mean || 'N/A'}\n`;
                    resultText += `📚 Type: ${item.media_type || 'Unknown'}\n`;
                    resultText += `📖 Chapters: ${item.num_chapters || 'Ongoing'}\n`;
                    resultText += `🔗 https://myanimelist.net/manga/${item.id}\n\n`;
                });
            } else {
                // Fallback to AniList
                const anilistQuery = `
                    query ($search: String) {
                        Page (perPage: 3) {
                            media (search: $search, type: MANGA) {
                                id
                                title {
                                    romaji
                                    english
                                    native
                                }
                                averageScore
                                format
                                chapters
                                status
                                siteUrl
                            }
                        }
                    }
                `;
                
                const response = await apiClient.anilistQuery(anilistQuery, { search: query });
                
                if (!response.data.Page.media.length) {
                    await sock.sendMessage(message.key.remoteJid, {
                        text: `❌ No manga found for "${query}"`
                    }, { quoted: message });
                    return;
                }
                
                resultText = `🔍 Manga Search Results for "${query}":\n\n`;
                
                response.data.Page.media.forEach((manga, index) => {
                    resultText += `*${index + 1}. ${manga.title.romaji || manga.title.english}*\n`;
                    resultText += `📊 Score: ${manga.averageScore || 'N/A'}\n`;
                    resultText += `📚 Format: ${manga.format || 'Unknown'}\n`;
                    resultText += `📖 Chapters: ${manga.chapters || 'Ongoing'}\n`;
                    resultText += `🔗 ${manga.siteUrl}\n\n`;
                });
            }
            
            await sock.sendMessage(message.key.remoteJid, {
                text: resultText
            }, { quoted: message });
        } catch (error) {
            console.error('Error searching manga:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Failed to search manga. Please try again later.'
            }, { quoted: message });
        }
    }
};
