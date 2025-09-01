const axios = require('axios');

// Store anime facts
const animeFacts = [
    "The longest-running anime is Sazae-san, which has been airing since 1969 with over 2500 episodes.",
    "Dragon Ball Z was originally going to be called Dragon Ball 2.",
    "The name 'Pokémon' is a portmanteau of 'Pocket Monsters'.",
    "Studio Ghibli was almost named Studio Daiichi (Number One Studio).",
    "In Japan, more paper is used to print manga than toilet paper.",
    "The first anime ever created was Katsudō Shashin in 1907.",
    "One Piece holds the Guinness World Record for the most copies published for the same comic book series by a single author.",
    "The popular anime Attack on Titan was initially rejected by multiple publishers.",
    "Naruto's favorite food, ramen, is actually a real-life popular dish in Japan.",
    "The anime industry is worth over $19 billion globally.",
    "The term 'anime' is derived from the English word 'animation'.",
    "Sailor Moon was one of the first anime to popularize the magical girl genre worldwide.",
    "The famous Gundam series has life-sized statues in Japan.",
    "Anime accounts for 60% of the world's animated television shows.",
    "The voice actor for Pikachu has been the same since 1997.",
    "Death Note was almost called 'The White Note' during development.",
    "The popular catchphrase 'It's over 9000!' from Dragon Ball Z is actually a mistranslation.",
    "The anime movie Your Name became the highest-grossing anime film worldwide.",
    "The creator of One Punch Man originally published it as a webcomic.",
    "In Japan, there are over 130 voice acting schools."
];

module.exports = {
    name: 'anime-facts',
    description: 'Shares random anime facts',
    command: 'fact',
    aliases: ['af'],
    usage: '.fact',
    cooldown: 5,
    
    async execute(sock, message, args) {
        try {
            // Get random fact
            const randomFact = animeFacts[Math.floor(Math.random() * animeFacts.length)];
            
            const factText = `🤯 *Anime Fact*\n\n${randomFact}`;
            
            await sock.sendMessage(message.key.remoteJid, {
                text: factText
            }, { quoted: message });
        } catch (error) {
            console.error('Error sending anime fact:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Failed to get anime fact. Please try again later.'
            }, { quoted: message });
        }
    }
};
