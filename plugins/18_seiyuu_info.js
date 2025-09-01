const apiClient = require('../utils/apiClient');

module.exports = {
    name: 'seiyuu-info',
    description: 'Looks up voice actor information',
    command: 'seiyuu',
    aliases: ['va', 'voiceactor'],
    usage: '.seiyuu <name>',
    cooldown: 10,
    
    async execute(sock, message, args) {
        if (!args.length) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Please provide a voice actor name.\nUsage: .seiyuu <name>'
            }, { quoted: message });
            return;
        }
        
        const seiyuuName = args.join(' ');
        
        try {
            // Using AniList API for voice actor information
            const query = `
                query ($search: String) {
                    Staff (search: $search) {
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
                        characters {
                            nodes {
                                name {
                                    full
                                }
                                media {
                                    nodes {
                                        title {
                                            romaji
                                            english
                                        }
                                    }
                                }
                            }
                        }
                        siteUrl
                    }
                }
            `;
            
            const response = await apiClient.anilistQuery(query, { search: seiyuuName });
            
            if (!response.data.Staff) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: `❌ No voice actor found for "${seiyuuName}"`
                }, { quoted: message });
                return;
            }
            
            const seiyuu = response.data.Staff;
            let description = seiyuu.description || 'No description available.';
            
            // Limit description length
            if (description.length > 500) {
                description = description.substring(0, 500) + '...';
            }
            
            // Remove HTML tags from description
            description = description.replace(/<[^>]*>/g, '');
            
            let seiyuuText = `🎤 *${seiyuu.name.full}*`;
            
            if (seiyuu.name.native) {
                seiyuuText += ` (${seiyuu.name.native})`;
            }
            
            seiyuuText += `\n\n${description}\n\n`;
            
            // Add notable roles
            if (seiyuu.characters && seiyuu.characters.nodes.length) {
                seiyuuText += `Notable Roles:\n`;
                seiyuu.characters.nodes.slice(0, 5).forEach(character => {
                    const media = character.media.nodes[0];
                    if (media) {
                        seiyuuText += `• ${character.name.full} in ${media.title.romaji || media.title.english}\n`;
                    }
                });
            }
            
            seiyuuText += `\n🔗 ${seiyuu.siteUrl}`;
            
            // Send seiyuu image if available
            if (seiyuu.image && seiyuu.image.large) {
                await sock.sendMessage(message.key.remoteJid, {
                    image: { url: seiyuu.image.large },
                    caption: seiyuuText
                }, { quoted: message });
            } else {
                await sock.sendMessage(message.key.remoteJid, {
                    text: seiyuuText
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('Error fetching seiyuu info:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Failed to fetch voice actor information. Please try again later.'
            }, { quoted: message });
        }
    }
};
