module.exports = {
    name: 'compatibility-test',
    description: 'Tests otaku compatibility between users',
    command: 'compatibility',
    aliases: ['comp', 'ship'],
    usage: '.compatibility [@user]',
    cooldown: 15,
    
    async execute(sock, message, args) {
        const jid = message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;
        
        // Check if user mentioned someone
        let partner = null;
        if (message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo) {
            partner = message.message.extendedTextMessage.contextInfo.participant;
        } else if (args[0] && args[0].startsWith('@')) {
            // Extract phone number from mention (simplified)
            const mentionedNumber = args[0].replace('@', '');
            partner = `${mentionedNumber}@s.whatsapp.net`;
        }
        
        if (!partner) {
            await sock.sendMessage(jid, {
                text: '❌ Please mention someone to test compatibility with!\nUsage: .compatibility @user'
            }, { quoted: message });
            return;
        }
        
        // Don't allow self-compatibility
        if (partner === sender) {
            await sock.sendMessage(jid, {
                text: '❌ You cannot test compatibility with yourself!'
            }, { quoted: message });
            return;
        }
        
        try {
            // Generate random compatibility percentage (with some fun logic)
            let compatibility = Math.floor(Math.random() * 101);
            
            // Increase chance of higher compatibility
            if (Math.random() > 0.7) {
                compatibility = Math.min(100, compatibility + 20);
            }
            
            // Generate fun message based on compatibility
            let messageText = '';
            let emoji = '';
            
            if (compatibility >= 90) {
                emoji = '💖';
                messageText = `Perfect match! You two are destined to be together! ${emoji}`;
            } else if (compatibility >= 70) {
                emoji = '❤️';
                messageText = `Great compatibility! You make a wonderful pair! ${emoji}`;
            } else if (compatibility >= 50) {
                emoji = '💕';
                messageText = `Good match! With some effort, this could work! ${emoji}`;
            } else if (compatibility >= 30) {
                emoji = '💔';
                messageText = `Not the best match... but opposites attract? ${emoji}`;
            } else {
                emoji = '🚫';
                messageText = `Poor compatibility... maybe try someone else? ${emoji}`;
            }
            
            // Get user names
            const senderName = `@${sender.split('@')[0]}`;
            const partnerName = `@${partner.split('@')[0]}`;
            
            const resultText = `❤️ *Otaku Compatibility Test* ❤️\n\n` +
                              `${senderName} + ${partnerName} = ${compatibility}%\n\n` +
                              `${messageText}\n\n` +
                              `Shared interests: ${getRandomAnimeInterest()}`;
            
            await sock.sendMessage(jid, {
                text: resultText
            }, { quoted: message });
            
        } catch (error) {
            console.error('Error with compatibility test:', error);
            await sock.sendMessage(jid, {
                text: '❌ Failed to calculate compatibility. Please try again later.'
            }, { quoted: message });
        }
    }
};

function getRandomAnimeInterest() {
    const interests = [
        "Both love Shonen anime",
        "Shared love for Isekai adventures",
        "Rom-com enthusiasts",
        "Mecha fans",
        "Slice of life appreciators",
        "Psychological thriller lovers",
        "Fantasy world explorers",
        "Sports anime rivals",
        "Magical girl enthusiasts",
        "Classic anime collectors"
    ];
    
    return interests[Math.floor(Math.random() * interests.length)];
}
