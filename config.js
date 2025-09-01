module.exports = {
    // Bot configuration
    name: "Byakuya MD",
    prefix: ".", // Command prefix
    adminPrefix: "/", // Admin command prefix
    adminNumbers: process.env.ADMIN_NUMBERS ? process.env.ADMIN_NUMBERS.split(',') : [],
    
    // API Keys (should be set in environment variables)
    malClientId: process.env.MAL_CLIENT_ID,
    anilistToken: process.env.ANILIST_TOKEN,
    giphyApiKey: process.env.GIPHY_API_KEY,
    tenorApiKey: process.env.TENOR_API_KEY,
    
    // Rate limiting
    commandCooldown: 2000, // 2 seconds between commands per user
    maxCommandsPerMinute: 15,
    
    // Feature toggles
    enableAutoUpdates: true,
    enablePluginHotReload: true
};
