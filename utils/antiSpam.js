// utils/antiSpam.js
const config = require('../config');

class AntiSpam {
    constructor() {
        this.userCooldowns = new Map();
        this.commandCounts = new Map();
        
        // Reset command counts every minute
        setInterval(() => {
            this.commandCounts.clear();
        }, 60000);
    }
    
    isSpamming(jid) {
        const lastCommandTime = this.userCooldowns.get(jid) || 0;
        const commandCount = this.commandCounts.get(jid) || 0;
        
        return Date.now() - lastCommandTime < config.commandCooldown || 
               commandCount >= config.maxCommandsPerMinute;
    }
    
    trackCommand(jid) {
        this.userCooldowns.set(jid, Date.now());
        
        // Track command count
        const currentCount = this.commandCounts.get(jid) || 0;
        this.commandCounts.set(jid, currentCount + 1);
    }
}

module.exports = new AntiSpam();
