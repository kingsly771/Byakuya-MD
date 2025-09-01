const axios = require('axios');

// Store battle data
const waifuBattles = new Map();

module.exports = {
    name: 'waifu-battle',
    description: 'Waifu/Husbando battle ranking system',
    command: 'battle',
    aliases: ['wb'],
    usage: '.battle [@user]',
    cooldown: 30,
    
    async execute(sock, message, args) {
        const jid = message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;
        
        // Check if there's an ongoing battle
        if (waifuBattles.has(jid)) {
            await sock.sendMessage(jid, {
                text: '❌ There is already an ongoing battle in this chat!'
            }, { quoted: message });
            return;
        }
        
        // Check if user mentioned someone to battle
        let opponent = null;
        if (message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo) {
            opponent = message.message.extendedTextMessage.contextInfo.participant;
        } else if (args[0] && args[0].startsWith('@')) {
            // Extract phone number from mention (simplified)
            const mentionedNumber = args[0].replace('@', '');
            opponent = `${mentionedNumber}@s.whatsapp.net`;
        }
        
        if (!opponent) {
            await sock.sendMessage(jid, {
                text: '❌ Please mention someone to battle with!\nUsage: .battle @user'
            }, { quoted: message });
            return;
        }
        
        // Get waifu images for both players
        try {
            const [waifu1Response, waifu2Response] = await Promise.all([
                axios.get('https://api.waifu.pics/sfw/waifu'),
                axios.get('https://api.waifu.pics/sfw/waifu')
            ]);
            
            const waifu1 = waifu1Response.data.url;
            const waifu2 = waifu2Response.data.url;
            
            // Create battle
            waifuBattles.set(jid, {
                player1: sender,
                player2: opponent,
                waifu1: waifu1,
                waifu2: waifu2,
                votes: new Map(),
                startTime: Date.now()
            });
            
            const battleText = `⚔️ *Waifu Battle Started!*\n\n` +
                              `Player 1: @${sender.split('@')[0]}\n` +
                              `Player 2: @${opponent.split('@')[0]}\n\n` +
                              `Vote by reacting with:\n` +
                              `❤️ for Player 1's Waifu\n` +
                              `👍 for Player 2's Waifu\n\n` +
                              `Battle ends in 2 minutes!`;
            
            // Send battle message with both images
            await sock.sendMessage(jid, {
                image: { url: waifu1 },
                caption: battleText
            });
            
            // Send second waifu
            await sock.sendMessage(jid, {
                image: { url: waifu2 },
                caption: "Player 2's Waifu"
            });
            
            // End battle after 2 minutes
            setTimeout(async () => {
                const battle = waifuBattles.get(jid);
                if (!battle) return;
                
                waifuBattles.delete(jid);
                
                const votes1 = Array.from(battle.votes.values()).filter(v => v === '❤️').length;
                const votes2 = Array.from(battle.votes.values()).filter(v => v === '👍').length;
                
                let resultText = `⚔️ *Battle Results!*\n\n` +
                                `@${battle.player1.split('@')[0]}: ${votes1} votes\n` +
                                `@${battle.player2.split('@')[0]}: ${votes2} votes\n\n`;
                
                if (votes1 > votes2) {
                    resultText += `🎉 @${battle.player1.split('@')[0]} wins the battle!`;
                } else if (votes2 > votes1) {
                    resultText += `🎉 @${battle.player2.split('@')[0]} wins the battle!`;
                } else {
                    resultText += `🤝 It's a tie!`;
                }
                
                await sock.sendMessage(jid, { text: resultText });
                
            }, 120000);
            
        } catch (error) {
            console.error('Error starting waifu battle:', error);
            await sock.sendMessage(jid, {
                text: '❌ Failed to start battle. Please try again later.'
            }, { quoted: message });
        }
    }
};

// Function to handle battle reactions
function handleBattleReaction(jid, userId, reaction) {
    const battle = waifuBattles.get(jid);
    if (!battle) return false;
    
    // Only allow ❤️ and 👍 reactions
    if (reaction !== '❤️' && reaction !== '👍') return false;
    
    // Record vote
    battle.votes.set(userId, reaction);
    return true;
}

module.exports.handleBattleReaction = handleBattleReaction;
