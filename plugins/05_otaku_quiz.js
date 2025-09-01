const axios = require('axios');

// Store active quizzes
const activeQuizzes = new Map();

module.exports = {
    name: 'otaku-quiz',
    description: 'An otaku quiz game with anime questions',
    command: 'quiz',
    aliases: ['q'],
    usage: '.quiz',
    cooldown: 10,
    
    async execute(sock, message, args) {
        try {
            const response = await axios.get('https://opentdb.com/api.php?amount=1&category=31&difficulty=easy&type=multiple');
            const quizData = response.data.results[0];
            
            if (!quizData) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: '❌ Failed to fetch quiz question. Please try again later.'
                }, { quoted: message });
                return;
            }
            
            // Format question and options
            const question = decodeHTML(quizData.question);
            const correctAnswer = decodeHTML(quizData.correct_answer);
            const incorrectAnswers = quizData.incorrect_answers.map(decodeHTML);
            const allAnswers = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);
            
            let quizText = `🎯 Otaku Quiz:\n\n${question}\n\n`;
            
            allAnswers.forEach((answer, index) => {
                quizText += `${index + 1}. ${answer}\n`;
            });
            
            quizText += `\nReply with the number of your answer!`;
            
            await sock.sendMessage(message.key.remoteJid, {
                text: quizText
            }, { quoted: message });
            
            // Store the quiz data for this chat
            activeQuizzes.set(message.key.remoteJid, {
                correctAnswer: correctAnswer,
                options: allAnswers,
                timestamp: Date.now()
            });
            
            // Clear quiz after 2 minutes
            setTimeout(() => {
                if (activeQuizzes.has(message.key.remoteJid)) {
                    activeQuizzes.delete(message.key.remoteJid);
                }
            }, 120000);
            
        } catch (error) {
            console.error('Error fetching quiz question:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Failed to fetch quiz question. Please try again later.'
            }, { quoted: message });
        }
    }
};

// Helper function to check quiz answers
function checkQuizAnswer(jid, answerNumber) {
    const quiz = activeQuizzes.get(jid);
    if (!quiz) return null;
    
    const selectedAnswer = quiz.options[answerNumber - 1];
    const isCorrect = selectedAnswer === quiz.correctAnswer;
    
    // Remove quiz after answer
    activeQuizzes.delete(jid);
    
    return {
        isCorrect,
        correctAnswer: quiz.correctAnswer,
        selectedAnswer
    };
}

function decodeHTML(html) {
    return html.replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#039;/g, "'");
}

// Export for use in message handler
module.exports.checkQuizAnswer = checkQuizAnswer;
