const axios = require('axios');

module.exports = {
    name: 'anime-schedule',
    description: 'Shows anime airing schedule by weekday',
    command: 'schedule',
    aliases: ['as'],
    usage: '.schedule [day]',
    cooldown: 15,
    
    async execute(sock, message, args) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const day = args[0] && days.includes(args[0].toLowerCase()) 
            ? args[0].toLowerCase() 
            : days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]; // Default to current day
        
        try {
            const response = await axios.get(`https://api.jikan.moe/v4/schedules/${day}`);
            const schedule = response.data.data;
            
            if (!schedule.length) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: `❌ No anime found for ${day.charAt(0).toUpperCase() + day.slice(1)}`
                }, { quoted: message });
                return;
            }
            
            let scheduleText = `📺 Anime Schedule for ${day.charAt(0).toUpperCase() + day.slice(1)}:\n\n`;
            
            schedule.slice(0, 8).forEach((anime, index) => {
                scheduleText += `*${index + 1}. ${anime.title}*\n`;
                scheduleText += `⏰ Time: ${anime.broadcast.time || 'Unknown'}\n`;
                scheduleText += `📊 Score: ${anime.score || 'N/A'}\n`;
                scheduleText += `📺 Episodes: ${anime.episodes || 'Ongoing'}\n\n`;
            });
            
            if (schedule.length > 8) {
                scheduleText += `...and ${schedule.length - 8} more anime.\n`;
            }
            
            scheduleText += `\nUse '.schedule <day>' for other days (monday, tuesday, etc.)`;
            
            await sock.sendMessage(message.key.remoteJid, {
                text: scheduleText
            }, { quoted: message });
        } catch (error) {
            console.error('Error fetching anime schedule:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Failed to fetch anime schedule. Please try again later.'
            }, { quoted: message });
        }
    }
};
