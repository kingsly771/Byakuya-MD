const axios = require('axios');

// Store active song quizzes
const songQuizzes = new Map();

// Sample anime openings data (in a real implementation, you'd have a proper database)
const animeOpenings = [
    { anime: "Naruto", title: "Haruka Kanata", artist: "Asian Kung-Fu Generation", url: "https://example.com/naruto_op2.mp3" },
    { anime: "Attack on Titan", title: "Guren no Yumiya", artist: "Linked Horizon", url: "https://example.com/aot_op1.mp3" },
    { anime: "One Piece", title: "We Are!", artist: "Hiroshi Kitadani", url: "https://example.com/onepiece_op1.mp3" },
    { anime: "Death Note", title: "the WORLD", artist: "Nightmare", url: "https://example.com/deathnote_op1.mp3" },
    { anime: "Fullmetal Alchemist", title: "Again", artist: "YUI", url: "https://example.com/fma_op1.mp3" },
    { anime: "Dragon Ball Z", title: "Cha-La Head-Cha-La", artist: "Hironobu Kageyama", url: "https://example.com/dbz_op1.mp3" },
    { anime: "My Hero Academia", title: "The Day", artist: "Porno Graffitti", url: "https://example.com/mha_op1.mp3" },
    { anime: "Tokyo Ghoul", title: "unravel", artist: "TK from Ling Tosite Sigure", url: "https://example.com/tokyoghoul_op1.mp3" },
    { anime: "Sword Art Online", title: "crossing field", artist: "LiSA", url: "https://example.com/sao_op1.mp3" },
    { anime: "Demon Slayer", title: "Gurenge", artist: "LiSA", url: "https://example.com/demonslayer_op1.mp3" }
];

module.exports = {
    name: 'anime-song-quiz',
    description: 'Guess the anime from song clips',
    command: 'guesssong',
    aliases: ['gs', 'songquiz'],
    usage: '.guesssong',
    cooldown: 20,
    
    async execute(sock, message, args) {
        const jid = message.key.remoteJid;
        
        // Check if there's an ongoing quiz
        if (songQuizzes.has(jid)) {
            await sock.sendMessage(jid, {
                text: '❌ There is already an ongoing song quiz in this chat!'
            }, { quoted: message });
            return;
        }
        
        try {
            // Select random anime opening
            const randomOpening = animeOpenings[Math.floor(Math.random() * animeOpenings.length)];
            
            // Store the answer
            songQuizzes.set(jid, {
                answer: randomOpening.anime,
                title: randomOpening.title,
                startTime: Date.now()
            });
            
            const quizText = `🎵 *Guess the Anime Song!*\n\n` +
                            `I'm playing an anime opening/ending theme.\n` +
                            `Can you guess which anime it's from?\n\n` +
                            `Reply with your answer!`;
            
            await sock.sendMessage(jid, {
                text: quizText
            }, { quoted: message });
            
            // In a real implementation, you would send an audio clip here
            // For now, we'll just simulate it with a text hint after a delay
            setTimeout(async () => {
                if (songQuizzes.has(jid)) {
                    await sock.sendMessage(jid, {
                        text: `💡 Hint: The song is "${randomOpening.title}" by ${randomOpening.artist}`
                    });
                }
            }, 10000);
            
            // End quiz after 1 minute
            setTimeout(() => {
                if (songQuizzes.has(jid)) {
                    const quiz = songQuizzes.get(jid);
                    songQuizzes.delete(jid);
                    
                    sock.sendMessage(jid, {
                        text: `⏰ Time's up! The answer was *${quiz.answer}* (${quiz.title})`
                    });
                }
            }, 60000);
            
        } catch (error) {
            console.error('Error starting song quiz:', error);
            await sock.sendMessage(jid, {
                text: '❌ Failed to start song quiz. Please try again later.'
            }, { quoted: message });
        }
    }
};

// Function to check song quiz answers
function checkSongAnswer(jid, answer) {
    const quiz = songQuizzes.get(jid);
    if (!quiz) return false;
    
    // Simple check - in a real implementation, you might use fuzzy matching
    const isCorrect = answer.toLowerCase().includes(quiz.answer.toLowerCase());
    
    if (isCorrect) {
        songQuizzes.delete(jid);
        return {
            isCorrect: true,
            answer: quiz.answer,
            title: quiz.title
        };
    }
    
    return { isCorrect: false };
}

module.exports.checkSongAnswer = checkSongAnswer;
