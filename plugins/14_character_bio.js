const apiClient = require('../utils/apiClient');

module.exports = {
    name: 'character-bio',
    description: 'Looks up character biographies',
    command: 'character',
    aliases: ['char', 'cb'],
    usage: '.character <name>',
    cooldown: 10,
    
    async execute(sock, message, args) {
        if (!args.length) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Please provide a character name.\nUsage: .character <name>'
            }, { quoted: message });
            return;
        }
        
        const characterName = args.join(' ');
        
        try {
            // Using AniList API
            const query = `
                query ($search: String) {
                    Character (search: $search) {
                        id
                        name {
                            full
                            native
                            alternative
                        }
                        image {
                            large
                        }
                        description
                        media {
                            nodes {
                                title {
                                    romaji
                                    english
                                    native
                                }
                                type
                            }
                        }
                        siteUrl
                    }
                }
            `;
            
            const response = await apiClient.anilistQuery(query, { search: characterName });
            
            if (!response.data.Character) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: `❌ No character found for "${characterName}"`
                }, { quoted: message });
                return;
            }
            
            const character = response.data.Character;
            let description = character.description || 'No description available.';
            
            // Limit description length
            if (description.length > 500) {
                description = description.substring(0, 500) + '...';
            }
            
            // Remove HTML tags from description
            description = description.replace(/<[^>]*>/g, '');
            
            let characterText = `🧙‍♂️ *${character.name.full}*`;
            
            if (character.name.native) {
                characterText += ` (${character.name.native})`;
            }
            
            characterText += `\n\n${description}\n\n`;
            
            // Add media appearances
            if (character.media && character.media.nodes.length) {
                characterText += `Appears in:\n`;
                character.media.nodes.slice(0, 3).forEach(media => {
                    characterText += `• ${media.title.romaji || media.title.english} (${media.type})\n`;
                });
            }
            
            characterText += `\n🔗 ${character.siteUrl}`;
            
            // Send character image if available
            if (character.image && character.image.large) {
                await sock.sendMessage(message.key.remoteJid, {
                    image: { url: character.image.large },
                    caption: characterText
                }, { quoted: message });
            } else {
                await sock.sendMessage(message.key.remoteJid, {
                    text: characterText
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('Error fetching character info:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Failed to fetch character information. Please try again later.'
            }, { quoted: message });
        }
    }
};
