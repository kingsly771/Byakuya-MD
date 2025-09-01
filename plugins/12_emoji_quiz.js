// Anime emoji quizzes
const emojiQuizzes = [
    { emoji: "🐒🍑👒⚔️", answer: "One Piece", hint: "Monkey, Peach, Hat, Sword" },
    { emoji: "👓🍎📓☠️", answer: "Death Note", hint: "Glasses, Apple, Notebook, Death" },
    { emoji: "🔺👨‍👦🔬🐍", answer: "Fullmetal Alchemist", hint: "Triangle, Father-Son, Science, Snake" },
    { emoji: "👦🌀👹🔴", answer: "Naruto", hint: "Boy, Swirl, Demon, Red" },
    { emoji: "👦⚡🔨🇺🇸", answer: "Captain America", hint: "Boy, Lightning, Hammer, USA" },
    { emoji: "👦🔴👹⚔️", answer: "Demon Slayer", hint: "Boy, Red, Demon, Sword" },
    { emoji: "👦🦸‍♂️💥👊", answer: "My Hero Academia", hint: "Boy, Hero, Explosion, Punch" },
    { emoji: "👧🐱🐾✨", answer: "Sailor Moon", hint: "Girl, Cat, Paw, Magic" },
    { emoji: "👦👁️🔴👹", answer: "Tokyo Ghoul", hint: "Boy, Eye, Red, Ghoul" },
    { emoji: "👦🤖🔫🎮", answer: "Sword Art Online", hint: "Boy, Robot, Gun, Game" },
    { emoji: "👦🐉🌪️🥋", answer: "Dragon Ball", hint: "Boy, Dragon, Whirlwind, Martial Arts" },
    { emoji: "👦👻🔫😎", answer: "Bleach", hint: "Boy, Ghost, Gun, Cool" },
    { emoji: "👦🧢🏀⛹️", answer: "Kuroko's Basketball", hint: "Boy, Cap, Basketball, Player" },
    { emoji: "👦🍥👺🍜", answer: "Naruto", hint: "Boy, Fish Cake, Demon, Noodles" },
    { emoji: "👦👑🤴⚔️", answer: "Seven Deadly Sins", hint: "Boy, Crown, King, Sword" }
];

// Store active emoji quizzes
const activeEmojiQuizzes = new Map();

module.exports = {
    name: 'emoji-quiz',
    description: 'Guess the anime from emojis',
    command: 'emoji',
    aliases: ['eq', 'guess'],
    usage: '.emoji',
    cooldown: 15,
    
    async execute(sock, message, args) {
        const jid = message.key.remoteJid;
        
        // Check if there's an ongoing quiz
        if (activeEmojiQuizzes.has(jid)) {
            await sock.sendMessage(jid, {
                text: '❌ There is already an ongoing emoji quiz in this chat!'
            }, { quoted: message });
            return;
        }
        
        try {
            // Select random emoji quiz
            const randomQuiz = emojiQuizzes[Math.floor(Math.random() * emojiQuizzes.length)];
            
            // Store the answer
            activeEmojiQuizzes.set(jid, {
                answer: randomQuiz.answer,
                emoji: randomQuiz.emoji,
                hint: randomQuiz.hint,
                startTime: Date.now()
            });
            
            const quizText = `🧩 *Emoji Anime Quiz!*\n\n` +
                            `Guess the anime from these emojis:\n\n` +
                            `${randomQuiz.emoji}\n\n` +
                            `Reply with your answer!`;
            
            await sock.sendMessage(jid, {
                text: quizText
            }, { quoted: message });
            
            // Provide hint after 30 seconds
            setTimeout(async () => {
                if (activeEmojiQuizzes.has(jid)) {
                    const quiz = activeEmojiQuizzes.get(jid);
                    await sock.sendMessage(jid, {
                        text: `💡 Hint: ${quiz.hint}`
                    });
                }
            }, 30000);
            
            // End quiz after 2 minutes
            setTimeout(() => {
                if (activeEmojiQuizzes.has(jid)) {
                    const quiz = activeEmojiQuizzes.get(jid);
                    activeEmojiQuizzes.delete(jid);
                    
                    sock.sendMessage(jid, {
                        text: `⏰ Time's up! The answer was *${quiz.answer}*`
                    });
                }
            }, 120000);
            
        } catch (error) {
            console.error('Error starting emoji quiz:', error);
            await sock.sendMessage(jid, {
                text: '❌ Failed to start emoji quiz. Please try again later.'
            }, { quoted: message });
        }
    }
};

// Function to check emoji quiz answers
function checkEmojiAnswer(jid, answer) {
    const quiz = activeEmojiQuizzes.get(jid);
    if (!quiz) return false;
    
    // Simple check - in a real implementation, you might use fuzzy matching
    const isCorrect = answer.toLowerCase().includes(quiz.answer.toLowerCase());
    
    if (isCorrect) {
        activeEmojiQuizzes.delete(jid);
        return {
            isCorrect: true,
            answer: quiz.answer,
            emoji: quiz.emoji
        };
    }
    
    return { isCorrect: false };
}

module.exports.checkEmojiAnswer = checkEmojiAnswer;
