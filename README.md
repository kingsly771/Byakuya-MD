Byakuya MD - WhatsApp Otaku Bot
https://img.shields.io/badge/Byakuya-MD-blueviolet https://img.shields.io/badge/Node.js-18-green https://img.shields.io/badge/Baileys-Multi--Device-yellow https://img.shields.io/badge/Plugins-20-orange

A feature-rich, multi-device WhatsApp bot built with Node.js and Baileys, specifically designed for otaku culture with 20+ anime and manga-themed plugins.

✨ Features
Multi-device Support: Works with QR code and pairing code authentication

20 Otaku-themed Plugins: Comprehensive anime/manga functionality

Modular Architecture: Easy to extend with new plugins

Anti-spam Protection: Rate limiting and cooldown system

Admin Controls: Special commands for bot administrators

Cross-platform: Deploy on Heroku, Railway, VPS, or Docker

🎌 Plugin Overview
Plugin	Command	Description
Anime Quotes	.quote	Fetches random anime quotes
Waifu Generator	.waifu	Generates random waifu/husbando images
Manga Search	.manga	Searches manga on MyAnimeList/AniList
Anime Schedule	.schedule	Shows anime airing schedule by weekday
Otaku Quiz	.quiz	Anime trivia quiz game
Waifu Battle	.battle	Waifu/husbando ranking battles
Anime Facts	.fact	Shares interesting anime facts
Cosplay Images	.cosplay	Fetches SFW cosplay images
Anime Song Quiz	.guesssong	Guess anime from song clips
Pickup Lines	.pickup	Otaku-themed pickup lines
Anime Memes	.meme	Fetches anime memes
Emoji Quiz	.emoji	Guess anime from emojis
Anime Wallpapers	.wallpaper	Fetches anime wallpapers
Character Bio	.character	Looks up character biographies
Compatibility Test	.compatibility	Tests otaku compatibility between users
Anime Recommendation	.recommend	Recommends random anime
Otaku News	.news	Fetches latest otaku news
Seiyuu Info	.seiyuu	Looks up voice actor information
Music Download	.download	Downloads anime OPs/EDs (admin)
Anime Roleplay	.roleplay	AI-powered character roleplay
🚀 Quick Start
Prerequisites
Node.js 16 or higher

npm or yarn

WhatsApp account

FFmpeg (for audio processing)

Installation
Clone the repository

bash
git clone https://github.com/your-username/byakuya-md.git
cd byakuya-md
Install dependencies

bash
npm install
Set up environment variables

bash
cp .env.example .env
Edit .env with your configuration.

Run the bot

bash
npm start
Scan the QR code with WhatsApp to link your device

⚙️ Configuration
Environment Variables
Variable	Description	Required
ADMIN_NUMBERS	Comma-separated admin numbers with country code	Yes
MAL_CLIENT_ID	MyAnimeList API client ID	No
ANILIST_TOKEN	AniList API token	No
GIPHY_API_KEY	Giphy API key for GIFs	No
TENOR_API_KEY	Tenor API key for GIFs	No
LOG_LEVEL	Logging level (info, debug, error)	No
📦 Deployment
Heroku Deployment
Create Heroku app

bash
heroku create your-app-name
Set environment variables

bash
heroku config:set ADMIN_NUMBERS=1234567890 MAL_CLIENT_ID=your_id ANILIST_TOKEN=your_token
Deploy

bash
git push heroku main
Railway Deployment
Login to Railway

bash
railway login
Initialize project

bash
railway init
Set environment variables in Railway dashboard

Deploy

bash
railway deploy
VPS Deployment (Ubuntu with PM2)
Install Node.js and PM2

bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
Clone and setup

bash
git clone https://github.com/your-username/byakuya-md.git
cd byakuya-md
npm install --production
Start with PM2

bash
pm2 start ecosystem.config.js
pm2 startup
pm2 save
Docker Deployment
Build the image

bash
docker build -t byakuya-md .
Run the container

bash
docker run -d --name byakuya-md \
  -v $(pwd)/auth_info:/app/auth_info \
  -v $(pwd)/baileys_store.json:/app/baileys_store.json \
  byakuya-md
🎯 Usage Examples
Basic Commands
text
.quote       - Get a random anime quote
.waifu       - Get a random waifu image
.manga naruto - Search for Naruto manga
.schedule monday - Show Monday's anime schedule
Interactive Features
text
.battle @friend - Start a waifu battle with a friend
.quiz          - Start an anime trivia quiz
.emoji         - Guess the anime from emojis
.roleplay luffy - Roleplay as Luffy from One Piece
Admin Commands
text
/restart     - Restart the bot
/reload all  - Reload all plugins
/broadcast   - Send message to all users
🛠️ Plugin Development
Creating New Plugins
Create a new file in the plugins/ directory

Follow the plugin structure:

javascript
module.exports = {
  name: 'plugin-name',
  description: 'Plugin description',
  command: 'command',
  aliases: ['alias1', 'alias2'],
  usage: '.command [args]',
  cooldown: 5,
  adminOnly: false,
  
  async execute(sock, message, args, store) {
    // Your plugin logic here
  }
};
The bot will automatically load the plugin on restart

Plugin Hot Reload
Admin users can reload plugins without restarting the bot:

text
/reload pluginName
🤝 Contributing
We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

Plugin Guidelines
Follow the existing plugin structure

Include proper error handling

Add cooldown protection for resource-intensive plugins

Ensure API usage complies with terms of service

Include documentation comments

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Baileys - WhatsApp Web API library

MyAnimeList - Anime and manga database

AniList - Anime tracking platform

Waifu.pics - Waifu image API

📞 Support
If you need help or have questions:

Check the FAQ document

Open an issue

Join our Discord community

Disclaimer: This bot is not affiliated with, maintained, sponsored, or endorsed by WhatsApp or any anime/manga publishers. Use at your own risk.

