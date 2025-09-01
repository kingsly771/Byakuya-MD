const axios = require('axios');

// Store roleplay conversations
const roleplaySessions = new Map();

// Anime character personas
const characterPersonas = {
    'luffy': {
        name: 'Monkey D. Luffy',
        anime: 'One Piece',
        personality: 'Energetic, adventurous, and loves meat. Wants to become the Pirate King.',
        greeting: 'I'm gonna be the King of the Pirates! Want to join my crew?'
    },
    'naruto': {
        name: 'Naruto Uzumaki',
        anime: 'Naruto',
        personality: 'Determined, loud, and never gives up. Dreams of becoming Hokage.',
        greeting: 'Believe it! I'm gonna be the greatest Hokage!'
    },
    'goku': {
        name: 'Son Goku',
        anime: 'Dragon Ball',
        personality: 'Innocent, powerful, and loves to fight strong opponents.',
        greeting: 'I'm Goku! Let's train together!'
    },
    'saitama': {
        name: 'Saitama',
        anime: 'One Punch Man',
        personality: 'Bored and uninterested due to being too powerful.',
        greeting: 'Okay...'
    },
    'levi': {
        name: 'Levi Ackerman',
        anime: 'Attack on Titan',
        personality: 'Serious, clean freak, and the strongest soldier.',
        greeting: 'Tch. Make this quick.'
    },
    'asuna': {
        name: 'Asuna Yuuki',
        anime: 'Sword Art Online',
        personality: 'Kind, skilled fighter, and known as the Flash.',
        greeting: 'Hello, I'm Asuna. How can I help you?'
    }
};

module.exports = {
    name: 'anime-roleplay',
    description: 'AI-powered anime character roleplay',
    command: 'roleplay',
    aliases: ['rp'],
    usage: '.roleplay <character>',
    cooldown: 5,
    
    async execute(sock, message, args) {
        const jid = message.key.remoteJid;
        const user = message.key.participant || message.key.remoteJid;
        
        if (!args.length) {
            // Show available characters
            let characterList = `🎭 *Available Characters for Roleplay:*\n\n`;
            
            Object.keys(characterPersonas).forEach((key, index) => {
                const character = characterPersonas[key];
                characterList += `${index + 1}. ${character.name} (${character.anime})\n`;
            });
            
            characterList += `\nUsage: .roleplay <character_name>\nExample: .roleplay luffy`;
            
            await sock.sendMessage(jid, {
                text: characterList
            }, { quoted: message });
            return;
        }
        
        const characterKey = args[0].toLowerCase();
        
        if (!characterPersonas[characterKey]) {
            await sock.sendMessage(jid, {
                text: `❌ Character "${args[0]}" not found. Use .roleplay to see available characters.`
            }, { quoted: message });
            return;
        }
        
        const character = characterPersonas[characterKey];
        
        // Check if there's an existing session
        if (roleplaySessions.has(user)) {
            const session = roleplaySessions.get(user);
            
            if (session.character !== characterKey) {
                // Switch character
                roleplaySessions.set(user, {
                    character: characterKey,
                    lastActivity: Date.now()
                });
                
                await sock.sendMessage(jid, {
                    text: `🎭 Now roleplaying as ${character.name} from ${character.anime}!\n\n${character.greeting}`
                }, { quoted: message });
            } else {
                // Continue conversation
                const userMessage = args.slice(1).join(' ');
                
                if (!userMessage) {
                    await sock.sendMessage(jid, {
                        text: `❌ Please provide a message for ${character.name} to respond to.`
                    }, { quoted: message });
                    return;
                }
                
                // Generate response based on character personality
                const response = generateCharacterResponse(character, userMessage);
                
                await sock.sendMessage(jid, {
                    text: `*${character.name}:* ${response}`
                }, { quoted: message });
                
                // Update session
                roleplaySessions.set(user, {
                    character: characterKey,
                    lastActivity: Date.now()
                });
            }
        } else {
            // Start new session
            roleplaySessions.set(user, {
                character: characterKey,
                lastActivity: Date.now()
            });
            
            await sock.sendMessage(jid, {
                text: `🎭 Now roleplaying as ${character.name} from ${character.anime}!\n\n${character.greeting}`
            }, { quoted: message });
        }
        
        // Clean up old sessions periodically
        if (Math.random() < 0.1) { // 10% chance to clean up
            const now = Date.now();
            for (const [key, value] of roleplaySessions.entries()) {
                if (now - value.lastActivity > 3600000) { // 1 hour inactivity
                    roleplaySessions.delete(key);
                }
            }
        }
    }
};

function generateCharacterResponse(character, userMessage) {
    // Simple response generation based on character personality
    // In a real implementation, you would use an AI API
    
    const responses = {
        'luffy': [
            "Meat! Where's the meat?",
            "I'm gonna be the Pirate King!",
            "Shishishi! That's funny!",
            "Let's go on an adventure!",
            "I want to eat meat!",
            "My friends are important to me!",
            "Gum Gum Pistol!"
        ],
        'naruto': [
            "Believe it!",
            "I'm gonna be Hokage someday!",
            "Dattebayo!",
            "I never go back on my word!",
            "Rasengan!",
            "I have to protect my friends!",
            "I'm not gonna run away anymore!"
        ],
        'goku': [
            "I'm getting hungry!",
            "Let's fight!",
            "I need to get stronger!",
            "Kamehameha!",
            "I sense a powerful energy!",
            "I want to eat!",
            "This is getting exciting!"
        ],
        'saitama': [
            "Okay.",
            "Meh.",
            "Whatever.",
            "I'm bored.",
            "Serious Series: Serious Punch.",
            "I'm just a hero for fun.",
            "There's a sale at the supermarket."
        ],
        'levi': [
            "Tch.",
            "Clean this up.",
            "You're disgusting.",
            "Make it quick.",
            "I don't have time for this.",
            "Do it properly.",
            "The world is a cruel place."
        ],
        'asuna': [
            "I'll protect everyone!",
            "Let's do our best!",
            "Kirito-kun...",
            "I'm the Flash!",
            "We can overcome this together!",
            "I believe in you!",
            "Let's have a meal together!"
        ]
    };
    
    const characterResponses = responses[character.name.toLowerCase().split(' ')[0]] || responses['luffy'];
    return characterResponses[Math.floor(Math.random() * characterResponses.length)];
}

// End roleplay session function
function endRoleplaySession(user) {
    if (roleplaySessions.has(user)) {
        roleplaySessions.delete(user);
        return true;
    }
    return false;
}

module.exports.endRoleplaySession = endRoleplaySession;
