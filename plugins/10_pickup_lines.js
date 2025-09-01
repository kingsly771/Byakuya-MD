// Anime-themed pickup lines
const pickupLines = [
    "Are you an angel? Because your beauty is otherworldly, just like in Neon Genesis Evangelion.",
    "Is your name Zero Two? Because you're the only one who can pilot my heart.",
    "Are you from the Black Bulls? Because you've stolen my heart like Asta's grimoire.",
    "Is your name All Might? Because you're looking PLUS ULTRA today!",
    "Are you a Titan? Because I can't seem to escape your captivating presence.",
    "Is your name Saitama? Because you've defeated me with just one look.",
    "Are you from the Survey Corps? Because you've explored the depths of my heart.",
    "Is your name Levi? Because you've cleaned up all the mess in my life.",
    "Are you a Stand user? Because you've left me speechless, just like Star Platinum.",
    "Is your name Bulma? Because you've invented a way to make my heart race.",
    "Are you from the Holy Grail War? Because you're the only Servant I want.",
    "Is your name Light Yagami? Because you've written your name in my heart.",
    "Are you a Pokemon? Because I choose you!",
    "Is your name Goku? Because you've powered up my heart to Super Saiyan level.",
    "Are you from the world of Sword Art Online? Because being with you feels like a fantasy.",
    "Is your name Usagi? Because you've moonlit my world.",
    "Are you a Digimon? Because you've digivolved my feelings.",
    "Is your name Lelouch? Because you've commanded my heart to obey you.",
    "Are you from the world of My Hero Academia? Because you're my hero.",
    "Is your name Hinata? Because you've seen right through me."
];

module.exports = {
    name: 'pickup-lines',
    description: 'Shares otaku-themed pickup lines',
    command: 'pickup',
    aliases: ['pl'],
    usage: '.pickup',
    cooldown: 5,
    
    async execute(sock, message, args) {
        try {
            // Get random pickup line
            const randomLine = pickupLines[Math.floor(Math.random() * pickupLines.length)];
            
            const lineText = `💌 *Otaku Pickup Line*\n\n${randomLine}`;
            
            await sock.sendMessage(message.key.remoteJid, {
                text: lineText
            }, { quoted: message });
        } catch (error) {
            console.error('Error sending pickup line:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Failed to get pickup line. Please try again later.'
            }, { quoted: message });
        }
    }
};
