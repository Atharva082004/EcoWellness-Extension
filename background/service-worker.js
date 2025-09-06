// EcoWellness Background Service Worker - INTEGRATED VERSION
class EcoWellnessBackground {
    constructor() {
        this.carbonCalculator = null;
        this.wellnessTracker = null;
        this.carbonFactors = {
            dataTransfer: 0.5, // grams CO2 per KB
            cpuUsage: 0.1, // grams CO2 per minute active
            screenBrightness: 0.05, // grams CO2 per minute
            serverRequest: 0.25 // grams CO2 per request
        };
        this.wellnessTimers = new Map();
        this.sessionData = {
            startTime: Date.now(),
            totalCarbon: 0,
            screenTime: 0,
            breaksTaken: 0
        };
        this.init();
    }

    init() {
        this.initializeUtilities();
        this.setupListeners();
        this.setupWellnessAlarms();
        this.loadStoredData();
    }

    async initializeUtilities() {
        // Initialize carbon calculator with real-time monitoring
        try {
            if (typeof CarbonCalculator !== 'undefined') {
                this.carbonCalculator = new CarbonCalculator();
            }
            if (typeof WellnessTracker !== 'undefined') {
                this.wellnessTracker = new WellnessTracker();
            }
        } catch (error) {
            console.error('Failed to initialize utilities:', error);
        }
    }

    setupListeners() {
        // Tab activity monitoring
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.trackTabSwitch(activeInfo);
        });

        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete') {
                this.trackPageLoad(tab);
            }
        });

        // Web request monitoring for carbon calculation
        chrome.webRequest.onCompleted.addListener(
            (details) => this.trackNetworkRequest(details),
            { urls: ["<all_urls>"] },
            ["responseHeaders"]
        );

        // Idle state monitoring
        chrome.idle.onStateChanged.addListener((newState) => {
            this.handleIdleStateChange(newState);
        });

        // Alarm listeners for wellness breaks
        chrome.alarms.onAlarm.addListener((alarm) => {
            this.handleAlarm(alarm);
        });

        // Message handling from popup and content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });
    }

    setupWellnessAlarms() {
        // 20-20-20 rule reminder (every 20 minutes)
        chrome.alarms.create('eyeBreak', { delayInMinutes: 20, periodInMinutes: 20 });
        // Hourly movement reminder
        chrome.alarms.create('movementBreak', { delayInMinutes: 60, periodInMinutes: 60 });
        // Hydration reminder (every 90 minutes)
        chrome.alarms.create('hydrationBreak', { delayInMinutes: 90, periodInMinutes: 90 });
    }

    async trackPageLoad(tab) {
        if (!tab.url || tab.url.startsWith('chrome://')) return;

        try {
            // Enhanced page tracking with carbon calculator integration
            const pageData = {
                url: tab.url,
                sizeKB: await this.estimatePageSize(tab),
                isFirstVisit: await this.isFirstVisit(tab.url),
                hasImages: true, // Assume true for now
                hasVideo: tab.url.includes('youtube') || tab.url.includes('video'),
                hasThirdPartyScripts: true
            };

            let carbonImpact = 2.5; // Default fallback
            
            if (this.carbonCalculator) {
                carbonImpact = this.carbonCalculator.calculatePageLoadCO2(pageData);
            } else {
                // Fallback calculation
                carbonImpact = this.calculatePageCarbon({
                    sizeKB: pageData.sizeKB,
                    requests: 1,
                    timeMinutes: 0.1
                });
            }

            await this.updateCarbonFootprint(carbonImpact);
            await this.logPageVisit(tab.url, pageData.sizeKB, carbonImpact);
            
            // Check for high carbon emission alert
            if (carbonImpact > 50) { // High threshold
                this.sendToPopup({
                    action: 'showCarbonAlert',
                    data: {
                        title: '⚠️ High Carbon Page Detected',
                        message: `This page generated ${carbonImpact.toFixed(1)}g CO₂. Consider lighter alternatives.`
                    }
                });
            }

        } catch (error) {
            console.warn('Could not track page load:', error);
            // Fallback estimation
            await this.updateCarbonFootprint(2.5);
        }
    }

    async estimatePageSize(tab) {
        try {
            const response = await fetch(tab.url, { method: 'HEAD' });
            const contentLength = response.headers.get('content-length');
            return contentLength ? parseInt(contentLength) / 1024 : 50; // Default 50KB
        } catch (error) {
            return 50; // Fallback
        }
    }

    async isFirstVisit(url) {
        const visitHistory = await this.getStoredData('visitHistory') || {};
        const domain = new URL(url).hostname;
        const isFirst = !visitHistory[domain];
        
        visitHistory[domain] = Date.now();
        await this.saveData('visitHistory', visitHistory);
        
        return isFirst;
    }

    trackNetworkRequest(details) {
        if (details.type === 'main_frame') {
            const estimatedSize = 50; // KB estimate for main frame
            const carbonImpact = this.carbonFactors.serverRequest +
                (estimatedSize * this.carbonFactors.dataTransfer);
            this.updateCarbonFootprint(carbonImpact);
        }
    }

    calculatePageCarbon(pageData) {
        const transferCarbon = pageData.sizeKB * this.carbonFactors.dataTransfer;
        const timeCarbon = pageData.timeMinutes * this.carbonFactors.cpuUsage;
        const requestCarbon = pageData.requests * this.carbonFactors.serverRequest;
        return transferCarbon + timeCarbon + requestCarbon;
    }

    async updateCarbonFootprint(carbonGrams) {
        this.sessionData.totalCarbon += carbonGrams;
        
        // Store daily totals
        const today = new Date().toISOString().split('T')[0];
        const dailyData = await this.getStoredData('dailyStats') || {};
        
        if (!dailyData[today]) {
            dailyData[today] = { carbon: 0, screenTime: 0, breaksTaken: 0, sitesVisited: 0 };
        }

        dailyData[today].carbon += carbonGrams;
        await this.saveData('dailyStats', dailyData);
        
        // Check for high emission alerts (500g in 10 seconds threshold)
        if (this.sessionData.totalCarbon > 500) {
            this.triggerHighCarbonAlert(this.sessionData.totalCarbon);
        }
    }

    triggerHighCarbonAlert(totalCarbon) {
        const alertData = {
            title: '🆘 CRITICAL: Extreme Carbon Footprint!',
            message: `Your session has generated ${totalCarbon.toFixed(1)}g CO₂! Take immediate action to reduce emissions.`,
            urgency: 'critical',
            recommendations: [
                '🚫 Close unnecessary tabs immediately',
                '📹 Pause video streaming',
                '🔌 Take a digital break',
                '💡 Switch to lightweight websites'
            ]
        };

        this.sendToPopup({
            action: 'showCarbonAlert',
            data: alertData
        });

        // Show browser notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/icons/icon48.png',
            title: alertData.title,
            message: alertData.message,
            priority: 2
        });
    }

    async trackTabSwitch(activeInfo) {
        // Update screen time tracking
        const currentTime = Date.now();
        const activeTab = await chrome.tabs.get(activeInfo.tabId);
        
        if (activeTab.url && !activeTab.url.startsWith('chrome://')) {
            this.sessionData.screenTime += 1; // Increment active time
            await this.updateScreenTime();
        }
    }

    async updateScreenTime() {
        const today = new Date().toISOString().split('T')[0];
        const dailyData = await this.getStoredData('dailyStats') || {};
        
        if (!dailyData[today]) {
            dailyData[today] = { carbon: 0, screenTime: 0, breaksTaken: 0, sitesVisited: 0 };
        }

        dailyData[today].screenTime += 1;
        dailyData[today].sitesVisited += 1;
        await this.saveData('dailyStats', dailyData);
    }

    handleIdleStateChange(newState) {
        if (newState === 'idle' || newState === 'locked') {
            this.pauseTracking();
        } else if (newState === 'active') {
            this.resumeTracking();
        }
    }

    async handleAlarm(alarm) {
        const settings = await this.getStoredData('settings') || { breakReminders: true };
        if (!settings.breakReminders) return;

        let alertData;
        
        switch (alarm.name) {
            case 'eyeBreak':
                alertData = {
                    title: '👀 Eye Break Time!',
                    message: 'Look at something 20 feet away for 20 seconds',
                    type: 'eye-break'
                };
                break;
            case 'movementBreak':
                alertData = {
                    title: '🏃 Movement Break!',
                    message: 'Time to stand up and stretch for better health',
                    type: 'movement-break'
                };
                break;
            case 'hydrationBreak':
                alertData = {
                    title: '💧 Hydration Reminder!',
                    message: 'Remember to drink some water',
                    type: 'hydration-break'
                };
                break;
        }

        if (alertData) {
            await this.showBreakNotification(alertData.title, alertData.message, alertData.type);
            this.sendToPopup({
                action: 'showWellnessAlert',
                data: alertData
            });
        }
    }

    async showBreakNotification(title, message, type) {
        await chrome.notifications.create(type, {
            type: 'basic',
            iconUrl: 'assets/icons/icon48.png',
            title: title,
            message: message,
            buttons: [
                { title: 'Take Break Now' },
                { title: 'Remind Later' }
            ]
        });
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'getDashboardData':
                    const data = await this.getDashboardData();
                    sendResponse(data);
                    break;
                case 'takeBreak':
                    await this.recordBreakTaken();
                    sendResponse({ success: true });
                    break;
                case 'getSettings':
                    const settings = await this.getStoredData('settings');
                    sendResponse(settings || {});
                    break;
                case 'updateSettings':
                    await this.saveData('settings', message.settings);
                    sendResponse({ success: true });
                    break;
                case 'exportData':
                    const exportData = await this.exportUserData();
                    sendResponse(exportData);
                    break;
                case 'clearData':
                    await this.clearAllData();
                    sendResponse({ success: true });
                    break;
                default:
                    sendResponse({ error: 'Unknown action' });
            }
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }

    async getDashboardData() {
        const today = new Date().toISOString().split('T')[0];
        const dailyData = await this.getStoredData('dailyStats') || {};
        const todayStats = dailyData[today] || { carbon: 0, screenTime: 0, breaksTaken: 0, sitesVisited: 0 };
        const achievements = await this.getStoredData('achievements') || {};
        const settings = await this.getStoredData('settings') || {};

        // Calculate next break time
        const nextBreakMinutes = await this.getNextBreakTime();

        return {
            environmental: {
                todayCarbon: Math.round(todayStats.carbon * 10) / 10,
                carbonTarget: settings.carbonTarget || 50,
                sitesVisited: todayStats.sitesVisited,
                recommendations: await this.getEcoRecommendations(todayStats.carbon)
            },
            wellness: {
                screenTime: this.formatTime(todayStats.screenTime),
                breaksTaken: todayStats.breaksTaken,
                breakScore: this.calculateBreakScore(todayStats),
                nextBreakMinutes: nextBreakMinutes,
                wellnessTips: await this.getWellnessTips()
            },
            achievements: await this.checkAchievements(todayStats, achievements),
            weeklyStats: await this.getWeeklyStats()
        };
    }

    async getEcoRecommendations(carbonFootprint) {
        const recommendations = [
    "Switch to dark mode to reduce screen energy consumption",
    "Close unused tabs – each tab uses ~25MB RAM and CPU",
    "Use ad blockers to reduce data transfer by up to 40%",
    "Choose lightweight alternatives: DuckDuckGo vs Google",
    "Enable browser compression to reduce data usage",
    "Use bookmarks instead of keeping tabs open",
    "Clear cache regularly to improve efficiency",
    "Lower your screen brightness or use adaptive brightness",
    "Set browsers and monitors to sleep mode when idle",
    "Unplug laptops and chargers when not needed to reduce 'vampire' power draw",
    "Turn off autoplay for videos and heavy sites",
    "Limit cloud sync frequency to save bandwidth and energy",
    "Prefer websites optimized for speed (AMP, mobile versions)",
    "Use smart power strips for your workspace equipment",
    "Disable browser notifications from unnecessary sites",
    "Switch to energy-efficient search engines like Ecosia",
    "Block auto-loading social media/video feeds",
    "Regularly audit and remove non-essential extensions",
    "Batch download files and updates instead of separate single transfers",
    "Use a laptop instead of a desktop when possible – they consume less power"
];


        if (carbonFootprint > 300) {
            return recommendations.slice(0, 7); // High carbon recommendations
        } else if (carbonFootprint > 150) {
            return recommendations.slice(7, 14); // Medium recommendations
        } else {
            return ["Great job keeping your carbon footprint low! 🌱"];
        }
    }

    async getWellnessTips() {
        const tips = [
    // Eye Care & Strain Prevention
    "Take a 2-minute breathing exercise to reduce stress",
    "Do some neck rolls to prevent stiffness",
    "Blink consciously 20 times to lubricate your eyes",
    "Stretch your wrists and fingers",
    "Look out the window to rest your eyes",
    "Take 5 deep breaths to improve focus",
    
    // 20-20-20 Rule & Break Management
    "Follow the 20-20-20 rule: Every 20 minutes, look 20 feet away for 20 seconds",
    "Take a 5-minute walk away from all screens",
    "Close your eyes and gently palm them for 1 minute",
    "Do shoulder blade squeezes to improve posture",
    
    // Hydration & Physical Wellness
    "Drink a glass of water to stay hydrated",
    "Stand up and do 10 gentle stretches",
    "Adjust your chair height and screen position",
    "Take deep belly breaths to oxygenate your body",
    
    // Eye Exercises & Vision Care
    "Practice figure-8 eye movements to exercise eye muscles",
    "Focus on distant objects to relax focusing muscles",
    "Roll your eyes slowly in circles (5 times each direction)",
    "Massage your temples gently to relieve tension",
    
    // Mental & Physical Reset
    "Step outside for fresh air and natural light",
    "Do a quick mindfulness meditation (2-3 minutes)"
];


        return tips[Math.floor(Math.random() * tips.length)];
    }

    async getNextBreakTime() {
        const alarms = await chrome.alarms.getAll();
        const eyeBreakAlarm = alarms.find(alarm => alarm.name === 'eyeBreak');
        
        if (eyeBreakAlarm) {
            const now = Date.now();
            const timeUntilAlarm = eyeBreakAlarm.scheduledTime - now;
            return Math.max(0, Math.round(timeUntilAlarm / 60000)); // Convert to minutes
        }

        return 20; // Default
    }

    calculateBreakScore(stats) {
        const expectedBreaks = Math.floor(stats.screenTime / 20); // Every 20 minutes
        const breakRatio = expectedBreaks > 0 ? stats.breaksTaken / expectedBreaks : 1;
        return Math.min(10, Math.round(breakRatio * 10));
    }

    async checkAchievements(todayStats, userAchievements) {
        const achievements = [
            {
                id: 'green_surfer',
                name: 'Green Surfer',
                description: 'Browse with <500g CO₂ today',
                icon: '🌱',
                unlocked: todayStats.carbon < 500
            },
            {
                id: 'break_master',
                name: 'Break Master',
                description: 'Take 5+ wellness breaks today',
                icon: '🧘',
                unlocked: todayStats.breaksTaken >= 5
            },
            {
                id: 'eco_warrior',
                name: 'Eco Warrior',
                description: 'Keep carbon footprint under target for 7 days',
                icon: '🛡️',
                unlocked: await this.checkWeeklyTarget()
            },
            {
                id: 'mindful_browser',
                name: 'Mindful Browser',
                description: 'Perfect break score for the day',
                icon: '🎯',
                unlocked: this.calculateBreakScore(todayStats) >= 9
            }
        ];

        // Save newly unlocked achievements
        for (const achievement of achievements) {
            if (achievement.unlocked && !userAchievements[achievement.id]) {
                userAchievements[achievement.id] = {
                    unlockedAt: Date.now(),
                    ...achievement
                };
            }
        }

        await this.saveData('achievements', userAchievements);
        return achievements;
    }

    async checkWeeklyTarget() {
        const weeklyStats = await this.getWeeklyStats();
        const target = (await this.getStoredData('settings') || {}).carbonTarget || 50;
        return weeklyStats.every(day => day.carbon < target);
    }

    async getWeeklyStats() {
        const dailyData = await this.getStoredData('dailyStats') || {};
        const stats = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            stats.push({
                date: dateStr,
                carbon: dailyData[dateStr]?.carbon || 0,
                screenTime: dailyData[dateStr]?.screenTime || 0,
                breaksTaken: dailyData[dateStr]?.breaksTaken || 0
            });
        }

        return stats;
    }

    async recordBreakTaken() {
        const today = new Date().toISOString().split('T')[0];
        const dailyData = await this.getStoredData('dailyStats') || {};
        
        if (!dailyData[today]) {
            dailyData[today] = { carbon: 0, screenTime: 0, breaksTaken: 0, sitesVisited: 0 };
        }

        dailyData[today].breaksTaken += 1;
        await this.saveData('dailyStats', dailyData);
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    sendToPopup(message) {
        // Send message to popup if it's open
        chrome.runtime.sendMessage(message).catch(() => {
            // Popup might not be open, ignore error
        });
    }

    pauseTracking() {
        // Implementation for pausing tracking when idle
        console.log('Tracking paused');
    }

    resumeTracking() {
        // Implementation for resuming tracking when active
        console.log('Tracking resumed');
    }

    async logPageVisit(url, size, carbon) {
        // Log page visit for analytics (optional)
        const visitLog = await this.getStoredData('visitLog') || [];
        visitLog.push({
            url: url,
            size: size,
            carbon: carbon,
            timestamp: Date.now()
        });

        // Keep only last 100 visits
        if (visitLog.length > 100) {
            visitLog.splice(0, visitLog.length - 100);
        }

        await this.saveData('visitLog', visitLog);
    }

    async exportUserData() {
        const allData = {
            dailyStats: await this.getStoredData('dailyStats'),
            achievements: await this.getStoredData('achievements'),
            settings: await this.getStoredData('settings'),
            visitLog: await this.getStoredData('visitLog'),
            exportDate: new Date().toISOString()
        };
        return allData;
    }

    async clearAllData() {
        await chrome.storage.local.clear();
        this.sessionData = {
            startTime: Date.now(),
            totalCarbon: 0,
            screenTime: 0,
            breaksTaken: 0
        };
    }

    async saveData(key, data) {
        await chrome.storage.local.set({ [key]: data });
    }

    async getStoredData(key) {
        const result = await chrome.storage.local.get(key);
        return result[key];
    }

    async loadStoredData() {
        // Initialize default settings if not present
        const settings = await this.getStoredData('settings');
        if (!settings) {
            await this.saveData('settings', {
                breakReminders: true,
                carbonTarget: 50,
                notificationStyle: 'gentle',
                darkMode: false
            });
        }
    }
}

// Initialize the background service
new EcoWellnessBackground();
