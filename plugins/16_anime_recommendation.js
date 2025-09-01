const apiClient = require('../utils/apiClient');

module.exports = {
    name: 'anime-recommendation',
    description: 'Recommends random anime',
    command: 'recommend',
    aliases: ['rec', 'suggest'],
    usage: '.recommend [genre]',
    cooldown: 10,
    
    async execute(sock, message, args) {
        const genre = args.join(' ');
        
        try {
            // Using AniList API for recommendations
            const query = `
                query ($genre: String, $page: Int, $perPage: Int) {
                    Page (page: $page, perPage: $perPage) {
                        media (type: ANIME, genre: $genre, sort: POPULARITY_DESC) {
                            id
                            title {
                                romaji
                                english
                                native
                            }
                            description
                            averageScore
                            episodes
                            genres
                            coverImage {
                                large
                            }
                            siteUrl
                        }
                    }
                }
            `;
            
            const variables = {
                genre: genre || undefined,
                page: 1,
                perPage: 1
            };
            
            const response = await apiClient.anilistQuery(query, variables);
            
            if (!response.data.Page.media || !response.data.Page.media.length) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: genre ? `❌ No anime found in genre "${genre}"` : '❌ No anime recommendations available.'
                }, { quoted: message });
                return;
            }
            
            const anime = response.data.Page.media[0];
            let description = anime.description || 'No description available.';
            
            // Limit description length
            if (description.length > 400) {
                description = description.substring(0, 400) + '...';
            }
            
            // Remove HTML tags from description
            description = description.replace(/<[^>]*>/g, '');
            
            let animeText = `📺 *${anime.title.romaji || anime.title.english}*`;
            
            if (anime.title.native) {
                animeText += ` (${anime.title.native})`;
            }
            
            animeText += `\n\n${description}\n\n`;
            animeText += `📊 Score: ${anime.averageScore || 'N/A'}/100\n`;
            animeText += `📺 Episodes: ${anime.episodes || 'Unknown'}\n`;
            
            if (anime.genres && anime.genres.length) {
                animeText += `🏷️ Genres: ${anime.genres.slice(0, 3).join(', ')}\n`;
            }
            
            animeText += `\n🔗 ${anime.siteUrl}`;
            
            // Send anime cover image if available
            if (anime.coverImage && anime.coverImage.large) {
                await sock.sendMessage(message.key.remoteJid, {
                    image: { url: anime.coverImage.large },
                    caption: animeText
                }, { quoted: message });
            } else {
                await sock.sendMessage(message.key.remoteJid, {
                    text: animeText
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('Error fetching anime recommendation:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Failed to get anime recommendation. Please try again later.'
            }, { quoted: message });
        }
    }
};
