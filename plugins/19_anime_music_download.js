const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'anime-music-download',
    description: 'Downloads anime OPs/EDs from YouTube',
    command: 'download',
    aliases: ['dl', 'music'],
    usage: '.download <song name>',
    cooldown: 30,
    adminOnly: true, // This command might require admin due to download capabilities
    
    async execute(sock, message, args) {
        if (!args.length) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Please provide a song name to download.\nUsage: .download <song name>'
            }, { quoted: message });
            return;
        }
        
        const songName = args.join(' ');
        const jid = message.key.remoteJid;
        
        try {
            // Search for the song on YouTube
            await sock.sendMessage(jid, {
                text: `🔍 Searching for "${songName}" on YouTube...`
            }, { quoted: message });
            
            const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songName + ' anime OP ED')}`;
            const response = await axios.get(searchUrl);
            
            // Extract video ID from search results (simplified)
            const videoIdMatch = response.data.match(/"videoId":"([^"]+)"/);
            
            if (!videoIdMatch) {
                await sock.sendMessage(jid, {
                    text: `❌ No results found for "${songName}"`
                }, { quoted: message });
                return;
            }
            
            const videoId = videoIdMatch[1];
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            
            // Get video info
            const info = await ytdl.getInfo(videoUrl);
            const title = info.videoDetails.title;
            
            await sock.sendMessage(jid, {
                text: `📥 Downloading: ${title}`
            }, { quoted: message });
            
            // Create temp directory if it doesn't exist
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            const fileName = `anime_music_${Date.now()}.mp3`;
            const filePath = path.join(tempDir, fileName);
            
            // Download and convert to MP3
            const audioStream = ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' })
                .pipe(fs.createWriteStream(filePath));
            
            await new Promise((resolve, reject) => {
                audioStream.on('finish', resolve);
                audioStream.on('error', reject);
            });
            
            // Send the audio file
            await sock.sendMessage(jid, {
                audio: { url: filePath },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            }, { quoted: message });
            
            // Clean up temp file
            fs.unlinkSync(filePath);
            
        } catch (error) {
            console.error('Error downloading anime music:', error);
            await sock.sendMessage(jid, {
                text: '❌ Failed to download music. Please try again later.'
            }, { quoted: message });
        }
    }
};
