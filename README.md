<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Byakuya MD - WhatsApp Otaku Bot</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #24292e;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        h1, h2, h3 {
            color: #8a2be2;
            border-bottom: 1px solid #eaecef;
            padding-bottom: 0.3em;
            margin-top: 1.5em;
        }
        
        h1 {
            font-size: 2em;
        }
        
        h2 {
            font-size: 1.5em;
        }
        
        code {
            background-color: #f6f8fa;
            border-radius: 3px;
            padding: 0.2em 0.4em;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        }
        
        pre {
            background-color: #f6f8fa;
            border-radius: 3px;
            padding: 16px;
            overflow: auto;
        }
        
        pre code {
            padding: 0;
            background: transparent;
        }
        
        blockquote {
            padding: 0 1em;
            color: #6a737d;
            border-left: 0.25em solid #dfe2e5;
            margin: 0;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 16px;
        }
        
        table th, table td {
            padding: 6px 13px;
            border: 1px solid #dfe2e5;
        }
        
        table th {
            background-color: #f6f8fa;
            font-weight: 600;
        }
        
        table tr:nth-child(even) {
            background-color: #f6f8fa;
        }
        
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
            margin-right: 6px;
            margin-bottom: 6px;
        }
        
        .badge-node {
            background-color: #339933;
            color: white;
        }
        
        .badge-md {
            background-color: #8a2be2;
            color: white;
        }
        
        .badge-plugins {
            background-color: #ff6b6b;
            color: white;
        }
        
        .badge-baileys {
            background-color: #6c5ce7;
            color: white;
        }
        
        .plugin-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 16px;
            margin: 20px 0;
        }
        
        .plugin-card {
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            padding: 16px;
            background-color: #f6f8fa;
        }
        
        .plugin-title {
            font-weight: 600;
            margin-bottom: 8px;
            color: #8a2be2;
        }
        
        .plugin-command {
            font-family: monospace;
            background-color: #e1e4e8;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.9em;
        }
        
        .deploy-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
            margin: 20px 0;
        }
        
        .deploy-card {
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            padding: 16px;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .plugin-grid, .deploy-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <h1>Byakuya MD - WhatsApp Otaku Bot</h1>

    <p>
        <span class="badge badge-node">Node.js</span>
        <span class="badge badge-md">Multi-Device</span>
        <span class="badge badge-plugins">20+ Plugins</span>
        <span class="badge badge-baileys">Baileys</span>
    </p>

    <p>A feature-rich, multi-device WhatsApp bot built with Node.js and Baileys, specifically designed for otaku culture with 20+ anime and manga-themed plugins.</p>

    <h2>✨ Features</h2>

    <ul>
        <li><strong>Multi-device Support</strong>: Works with QR code and pairing code authentication</li>
        <li><strong>20 Otaku-themed Plugins</strong>: Comprehensive anime/manga functionality</li>
        <li><strong>Modular Architecture</strong>: Easy to extend with new plugins</li>
        <li><strong>Anti-spam Protection</strong>: Rate limiting and cooldown system</li>
        <li><strong>Admin Controls</strong>: Special commands for bot administrators</li>
        <li><strong>Cross-platform</strong>: Deploy on Heroku, Railway, VPS, or Docker</li>
    </ul>

    <h2>🎌 Plugin Overview</h2>

    <div class="plugin-grid">
        <div class="plugin-card">
            <div class="plugin-title">Anime Quotes <span class="plugin-command">.quote</span></div>
            <p>Fetches random anime quotes from various series.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Waifu Generator <span class="plugin-command">.waifu</span></div>
            <p>Generates random waifu/husbando images.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Manga Search <span class="plugin-command">.manga</span></div>
            <p>Searches manga on MyAnimeList/AniList.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Anime Schedule <span class="plugin-command">.schedule</span></div>
            <p>Shows anime airing schedule by weekday.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Otaku Quiz <span class="plugin-command">.quiz</span></div>
            <p>Anime trivia quiz game with multiple choices.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Waifu Battle <span class="plugin-command">.battle</span></div>
            <p>Waifu/husbando ranking battles between users.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Anime Facts <span class="plugin-command">.fact</span></div>
            <p>Shares interesting anime facts and trivia.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Cosplay Images <span class="plugin-command">.cosplay</span></div>
            <p>Fetches SFW cosplay images of anime characters.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Anime Song Quiz <span class="plugin-command">.guesssong</span></div>
            <p>Guess anime from song clips (OP/ED).</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Pickup Lines <span class="plugin-command">.pickup</span></div>
            <p>Otaku-themed pickup lines for anime fans.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Anime Memes <span class="plugin-command">.meme</span></div>
            <p>Fetches anime memes from various sources.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Emoji Quiz <span class="plugin-command">.emoji</span></div>
            <p>Guess anime from emoji representations.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Anime Wallpapers <span class="plugin-command">.wallpaper</span></div>
            <p>Fetches high-quality anime wallpapers.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Character Bio <span class="plugin-command">.character</span></div>
            <p>Looks up character biographies and information.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Compatibility Test <span class="plugin-command">.compatibility</span></div>
            <p>Tests otaku compatibility between users.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Anime Recommendation <span class="plugin-command">.recommend</span></div>
            <p>Recommends random anime based on preferences.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Otaku News <span class="plugin-command">.news</span></div>
            <p>Fetches latest otaku news from AnimeNewsNetwork.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Seiyuu Info <span class="plugin-command">.seiyuu</span></div>
            <p>Looks up voice actor information and roles.</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Music Download <span class="plugin-command">.download</span></div>
            <p>Downloads anime OPs/EDs from YouTube (admin only).</p>
        </div>
        <div class="plugin-card">
            <div class="plugin-title">Anime Roleplay <span class="plugin-command">.roleplay</span></div>
            <p>AI-powered anime character roleplay conversations.</p>
        </div>
    </div>

    <h2>🚀 Quick Start</h2>

    <h3>Prerequisites</h3>

    <ul>
        <li>Node.js 16 or higher</li>
        <li>npm or yarn</li>
        <li>WhatsApp account</li>
        <li>FFmpeg (for audio processing)</li>
    </ul>

    <h3>Installation</h3>

    <pre><code># Clone the repository
git clone https://github.com/your-username/byakuya-md.git
cd byakuya-md

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the bot
npm start

# Scan the QR code with WhatsApp to link your device
</code></pre>

    <h2>⚙️ Configuration</h2>

    <h3>Environment Variables</h3>

    <table>
        <thead>
            <tr>
                <th>Variable</th>
                <th>Description</th>
                <th>Required</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>ADMIN_NUMBERS</code></td>
                <td>Comma-separated admin numbers with country code</td>
                <td>Yes</td>
            </tr>
            <tr>
                <td><code>MAL_CLIENT_ID</code></td>
                <td>MyAnimeList API client ID</td>
                <td>No</td>
            </tr>
            <tr>
                <td><code>ANILIST_TOKEN</code></td>
                <td>AniList API token</td>
                <td>No</td>
            </tr>
            <tr>
                <td><code>GIPHY_API_KEY</code></td>
                <td>Giphy API key for GIFs</td>
                <td>No</td>
            </tr>
            <tr>
                <td><code>TENOR_API_KEY</code></td>
                <td>Tenor API key for GIFs</td>
                <td>No</td>
            </tr>
            <tr>
                <td><code>LOG_LEVEL</code></td>
                <td>Logging level (info, debug, error)</td>
                <td>No</td>
            </tr>
        </tbody>
    </table>

    <h2>📦 Deployment</h2>

    <div class="deploy-grid">
        <div class="deploy-card">
            <h3>Heroku</h3>
            <pre><code>heroku create your-app-name
heroku config:set ADMIN_NUMBERS=1234567890
git push heroku main</code></pre>
        </div>
        <div class="deploy-card">
            <h3>Railway</h3>
            <pre><code>railway login
railway init
railway add
railway deploy</code></pre>
        </div>
        <div class="deploy-card">
            <h3>VPS (PM2)</h3>
            <pre><code>npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save</code></pre>
        </div>
        <div class="deploy-card">
            <h3>Docker</h3>
            <pre><code>docker build -t byakuya-md .
docker run -d --name byakuya-md \
  -v $(pwd)/auth_info:/app/auth_info \
  byakuya-md</code></pre>
        </div>
    </div>

    <h2>🎯 Usage Examples</h2>

    <h3>Basic Commands</h3>

    <pre><code>.quote       - Get a random anime quote
.waifu       - Get a random waifu image
.manga naruto - Search for Naruto manga
.schedule monday - Show Monday's anime schedule</code></pre>

    <h3>Interactive Features</h3>

    <pre><code>.battle @friend - Start a waifu battle with a friend
.quiz          - Start an anime trivia quiz
.emoji         - Guess the anime from emojis
.roleplay luffy - Roleplay as Luffy from One Piece</code></pre>

    <h3>Admin Commands</h3>

    <pre><code>/restart     - Restart the bot
/reload all  - Reload all plugins
/broadcast   - Send message to all users</code></pre>

    <h2>🛠️ Plugin Development</h2>

    <h3>Creating New Plugins</h3>

    <p>Create a new file in the <code>plugins/</code> directory with the following structure:</p>

    <pre><code>module.exports = {
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
};</code></pre>

    <h3>Plugin Hot Reload</h3>

    <p>Admin users can reload plugins without restarting the bot:</p>

    <pre><code>/reload pluginName</code></pre>

    <h2>🤝 Contributing</h2>

    <p>We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.</p>

    <ol>
        <li>Fork the repository</li>
        <li>Create a feature branch (<code>git checkout -b feature/amazing-feature</code>)</li>
        <li>Commit your changes (<code>git commit -m 'Add amazing feature'</code>)</li>
        <li>Push to the branch (<code>git push origin feature/amazing-feature</code>)</li>
        <li>Open a Pull Request</li>
    </ol>

    <h2>📝 License</h2>

    <p>This project is licensed under the MIT License - see the <a href="LICENSE">LICENSE</a> file for details.</p>

    <h2>🙏 Acknowledgments</h2>

    <ul>
        <li><a href="https://github.com/adiwajshing/Baileys">Baileys</a> - WhatsApp Web API library</li>
        <li><a href="https://myanimelist.net">MyAnimeList</a> - Anime and manga database</li>
        <li><a href="https://anilist.co">AniList</a> - Anime tracking platform</li>
        <li><a href="https://waifu.pics">Waifu.pics</a> - Waifu image API</li>
    </ul>

    <hr>

    <p><strong>Disclaimer:</strong> This bot is not affiliated with, maintained, sponsored, or endorsed by WhatsApp or any anime/manga publishers. Use at your own risk.</p>

</body>
</html>
