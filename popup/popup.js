// EcoWellness Popup Dashboard - INTEGRATED VERSION
class EcoWellnessDashboard {
    constructor() {
        this.carbonCalculator = null;
        this.wellnessTracker = null;
        this.dashboardData = null;
        this.breakTimer = null;
        this.isDarkMode = false;
        this.currentData = {
            carbon: 0,
            screenTime: 0,
            breakScore: 10,
            sitesVisited: 0
        };
        this.init();
    }

    async init() {
        // Load utilities
        await this.loadUtilities();
        await this.loadSettings();
        await this.loadDashboardData();
        this.setupEventListeners();
        this.updateUI();
        this.setupAutoRefresh();
        this.applyDarkMode(); // Apply saved dark mode
    }

    async loadUtilities() {
        // Initialize carbon calculator and wellness tracker
        if (typeof CarbonCalculator !== 'undefined') {
            this.carbonCalculator = new CarbonCalculator();
        }
        if (typeof WellnessTracker !== 'undefined') {
            this.wellnessTracker = new WellnessTracker();
        }
    }

    // FIXED: Load settings including dark mode persistence
    async loadSettings() {
        try {
            const result = await this.getStoredData('settings');
            const settings = result || {};
            this.isDarkMode = settings.darkMode || false;
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.isDarkMode = false;
        }
    }

    // FIXED: Apply dark mode immediately and persistently
    applyDarkMode() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    async loadDashboardData() {
        try {
            const response = await this.sendMessage({ action: 'getDashboardData' });
            if (response && !response.error) {
                this.dashboardData = response;
                this.currentData = {
                    carbon: response.environmental?.todayCarbon || 0,
                    screenTime: response.wellness?.screenTime || '0h 0m',
                    breakScore: response.wellness?.breakScore || 10,
                    sitesVisited: response.environmental?.sitesVisited || 0
                };
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showError('Failed to load data. Please try again.');
        }
    }

    setupEventListeners() {
        // Eco recommendations
        const ecoTipBtn = document.getElementById('getEcoTip');
        if (ecoTipBtn) {
            ecoTipBtn.addEventListener('click', () => this.showEcoRecommendation());
        }

        // Wellness actions
        const takeBreakBtn = document.getElementById('takeBreakNow');
        if (takeBreakBtn) {
            takeBreakBtn.addEventListener('click', () => this.takeBreakNow());
        }

        const wellnessTipBtn = document.getElementById('getWellnessTip');
        if (wellnessTipBtn) {
            wellnessTipBtn.addEventListener('click', () => this.showWellnessTip());
        }

        // Settings modal
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showModal('settingsModal'));
        }

        const closeSettings = document.getElementById('closeSettings');
        if (closeSettings) {
            closeSettings.addEventListener('click', () => this.hideModal('settingsModal'));
        }

        const saveSettingsBtn = document.getElementById('saveSettings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }

        // Dark mode toggle - FIXED
        const darkModeToggle = document.getElementById('darkMode');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                this.toggleDarkMode(e.target.checked);
            });
        }

        // Report modal
        const reportBtn = document.getElementById('reportBtn');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => this.showWeeklyReport());
        }

        const closeReport = document.getElementById('closeReport');
        if (closeReport) {
            closeReport.addEventListener('click', () => this.hideModal('reportModal'));
        }

        // Share functionality
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareProgress());
        }

        // Data management
        const exportData = document.getElementById('exportData');
        if (exportData) {
            exportData.addEventListener('click', () => this.exportData());
        }

        const clearData = document.getElementById('clearData');
        if (clearData) {
            clearData.addEventListener('click', () => this.clearAllData());
        }

        // Break overlay
        const startBreakTimer = document.getElementById('startBreakTimer');
        if (startBreakTimer) {
            startBreakTimer.addEventListener('click', () => this.startBreakTimer());
        }

        const skipBreak = document.getElementById('skipBreak');
        if (skipBreak) {
            skipBreak.addEventListener('click', () => this.hideBreakOverlay());
        }

        const postponeBreak = document.getElementById('postponeBreak');
        if (postponeBreak) {
            postponeBreak.addEventListener('click', () => this.postponeBreak());
        }

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Listen for messages from service worker
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.onMessage.addListener((message) => {
                this.handleMessage(message);
            });
        }
    }

    handleMessage(message) {
        if (message.action === 'showCarbonAlert') {
            this.showCarbonAlert(message.data);
        } else if (message.action === 'showWellnessAlert') {
            this.showWellnessAlert(message.data);
        } else if (message.action === 'updateDashboard') {
            this.loadDashboardData();
        }
    }

    updateUI() {
        if (!this.dashboardData) return;

        const { environmental, wellness, achievements, weeklyStats } = this.dashboardData;

        // Update environmental section
        this.updateCarbonMeter(environmental?.todayCarbon || 0, environmental?.carbonTarget || 500);
        
        const carbonValue = document.getElementById('carbonValue');
        if (carbonValue) {
            carbonValue.textContent = `${environmental?.todayCarbon || 0}g CO₂`;
        }

        const carbonTarget = document.getElementById('carbonTarget');
        if (carbonTarget) {
            carbonTarget.textContent = `Target: ${environmental?.carbonTarget || 500}g`;
        }

        const sitesVisited = document.getElementById('sitesVisited');
        if (sitesVisited) {
            sitesVisited.textContent = environmental?.sitesVisited || 0;
        }

        const browseTime = document.getElementById('browseTime');
        if (browseTime) {
            browseTime.textContent = wellness?.screenTime || '0h 0m';
        }

        // Update wellness section
        const screenTimeValue = document.getElementById('screenTimeValue');
        if (screenTimeValue) {
            screenTimeValue.textContent = wellness?.screenTime || '0h 0m';
        }

        const breakTimer = document.getElementById('breakTimer');
        if (breakTimer) {
            breakTimer.textContent = `Next break in: ${wellness?.nextBreakMinutes || 20}m`;
        }

        const breakScore = document.getElementById('breakScore');
        if (breakScore) {
            breakScore.textContent = wellness?.breakScore || 10;
        }

        this.updateBreakScore(wellness?.breakScore || 10);
        this.updateAchievements(achievements || []);
        this.updateUserLevel(achievements || []);
    }

    updateCarbonMeter(current, target) {
        const percentage = Math.min((current / target) * 100, 100);
        const circumference = 2 * Math.PI * 40; // radius = 40
        const strokeDashoffset = circumference - (percentage / 100) * circumference;
        
        const progressCircle = document.getElementById('carbonProgress');
        if (progressCircle) {
            progressCircle.style.strokeDashoffset = strokeDashoffset;

            // Change color based on percentage
            if (percentage > 80) {
                progressCircle.style.stroke = '#f44336'; // Red
            } else if (percentage > 60) {
                progressCircle.style.stroke = '#ff9800'; // Orange
            } else {
                progressCircle.style.stroke = '#4caf50'; // Green
            }
        }
    }

    updateBreakScore(score) {
        const scoreFill = document.getElementById('scoreFill');
        if (scoreFill) {
            scoreFill.style.width = `${(score / 10) * 100}%`;
            
            if (score >= 8) {
                scoreFill.style.background = '#4caf50'; // Green
            } else if (score >= 5) {
                scoreFill.style.background = '#ff9800'; // Orange
            } else {
                scoreFill.style.background = '#f44336'; // Red
            }
        }
    }

    updateAchievements(achievements) {
        const grid = document.getElementById('achievementGrid');
        if (!grid) return;

        grid.innerHTML = '';
        achievements.slice(0, 4).forEach(achievement => {
            const achievementEl = document.createElement('div');
            achievementEl.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            achievementEl.innerHTML = `
                <div class="badge">${achievement.icon}</div>
                <div class="title">${achievement.name}</div>
                <div class="description">${achievement.description}</div>
            `;
            
            if (achievement.unlocked) {
                achievementEl.addEventListener('click', () => {
                    this.showAchievementDetails(achievement);
                });
            }
            
            grid.appendChild(achievementEl);
        });
    }

    updateUserLevel(achievements) {
        const unlockedCount = achievements.filter(a => a.unlocked).length;
        let level = 1;
        let title = 'Eco Explorer';

        if (unlockedCount >= 8) {
            level = 5;
            title = 'Eco Master';
        } else if (unlockedCount >= 6) {
            level = 4;
            title = 'Eco Warrior';
        } else if (unlockedCount >= 4) {
            level = 3;
            title = 'Eco Guardian';
        } else if (unlockedCount >= 2) {
            level = 2;
            title = 'Eco Advocate';
        }

        const userLevel = document.getElementById('userLevel');
        if (userLevel) {
            userLevel.textContent = `Level ${level} ${title}`;
        }
    }

    // FIXED: Dark mode toggle with persistence
    toggleDarkMode(enabled) {
        this.isDarkMode = enabled;
        this.applyDarkMode();
        this.saveSettings(); // Save immediately
    }

    showEcoRecommendation() {
        if (!this.dashboardData?.environmental?.recommendations) return;

        const recommendations = this.dashboardData.environmental.recommendations;
        const randomTip = recommendations[Math.floor(Math.random() * recommendations.length)];
        
        const tipElement = document.getElementById('ecoTipText');
        if (tipElement) {
            tipElement.textContent = randomTip;
            tipElement.classList.add('show');
            
            setTimeout(() => {
                tipElement.classList.remove('show');
            }, 5000);
        }
    }

    showWellnessTip() {
        if (!this.dashboardData?.wellness?.wellnessTips) return;

        const tip = this.dashboardData.wellness.wellnessTips;
        const tipElement = document.getElementById('wellnessTipText');
        if (tipElement) {
            tipElement.textContent = tip;
            tipElement.classList.add('show');
            
            setTimeout(() => {
                tipElement.classList.remove('show');
            }, 5000);
        }
    }

    async takeBreakNow() {
        try {
            await this.sendMessage({ action: 'takeBreak' });
            this.showBreakOverlay('🧘 Break Time!', 'Take a moment to relax and recharge');
            await this.loadDashboardData();
            this.updateUI();
        } catch (error) {
            console.error('Failed to record break:', error);
        }
    }

    showBreakOverlay(title = '👀 Eye Break Time!', message = 'Look at something 20 feet away for 20 seconds') {
        const breakTitle = document.getElementById('breakTitle');
        const breakMessage = document.getElementById('breakMessage');
        const breakOverlay = document.getElementById('breakOverlay');
        
        if (breakTitle) breakTitle.textContent = title;
        if (breakMessage) breakMessage.textContent = message;
        if (breakOverlay) breakOverlay.classList.remove('hidden');
    }

    hideBreakOverlay() {
        const breakOverlay = document.getElementById('breakOverlay');
        if (breakOverlay) {
            breakOverlay.classList.add('hidden');
        }
        
        if (this.breakTimer) {
            clearInterval(this.breakTimer);
            this.breakTimer = null;
        }
    }

    startBreakTimer() {
        let countdown = 20;
        const countdownElement = document.getElementById('breakCountdown');
        if (!countdownElement) return;

        this.breakTimer = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(this.breakTimer);
                this.breakTimer = null;
                this.showBreakComplete();
            }
        }, 1000);
    }

    showBreakComplete() {
        const breakTitle = document.getElementById('breakTitle');
        const breakMessage = document.getElementById('breakMessage');
        const breakCountdown = document.getElementById('breakCountdown');
        
        if (breakTitle) breakTitle.textContent = '✅ Great Job!';
        if (breakMessage) breakMessage.textContent = 'Break completed successfully';
        if (breakCountdown) breakCountdown.textContent = '✓';
        
        setTimeout(() => {
            this.hideBreakOverlay();
        }, 2000);
    }

    postponeBreak() {
        this.hideBreakOverlay();
        // Could implement postpone logic here
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            
            if (modalId === 'settingsModal') {
                this.loadSettingsModal();
            }
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    async loadSettingsModal() {
        try {
            const settings = await this.sendMessage({ action: 'getSettings' });
            
            const breakReminders = document.getElementById('breakReminders');
            const carbonTargetInput = document.getElementById('carbonTargetInput');
            const notificationStyle = document.getElementById('notificationStyle');
            const darkMode = document.getElementById('darkMode');
            
            if (breakReminders) breakReminders.checked = settings.breakReminders !== false;
            if (carbonTargetInput) carbonTargetInput.value = settings.carbonTarget || 500;
            if (notificationStyle) notificationStyle.value = settings.notificationStyle || 'gentle';
            if (darkMode) darkMode.checked = this.isDarkMode;
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    // FIXED: Save settings with proper dark mode persistence
    async saveSettings() {
        const breakReminders = document.getElementById('breakReminders');
        const carbonTargetInput = document.getElementById('carbonTargetInput');
        const notificationStyle = document.getElementById('notificationStyle');
        const darkMode = document.getElementById('darkMode');
        
        const settings = {
            breakReminders: breakReminders ? breakReminders.checked : true,
            carbonTarget: carbonTargetInput ? parseInt(carbonTargetInput.value) : 500,
            notificationStyle: notificationStyle ? notificationStyle.value : 'gentle',
            darkMode: this.isDarkMode
        };

        try {
            await this.sendMessage({ action: 'updateSettings', settings });
            this.hideModal('settingsModal');
            this.showSuccessMessage('Settings saved successfully!');
            
            // Refresh data to reflect new settings
            await this.loadDashboardData();
            this.updateUI();
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showError('Failed to save settings');
        }
    }

    async showWeeklyReport() {
        this.showModal('reportModal');
        if (!this.dashboardData?.weeklyStats) return;

        this.renderWeeklyChart();
        this.renderWeeklyStats();
    }

    renderWeeklyChart() {
        const canvas = document.getElementById('weeklyChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const stats = this.dashboardData.weeklyStats;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Simple line chart for carbon footprint
        const maxCarbon = Math.max(...stats.map(s => s.carbon), 1);
        const chartHeight = canvas.height - 40;
        const chartWidth = canvas.width - 40;
        const stepX = chartWidth / (stats.length - 1);

        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        ctx.beginPath();

        stats.forEach((stat, index) => {
            const x = 20 + index * stepX;
            const y = canvas.height - 20 - (stat.carbon / maxCarbon) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();

        // Add data points
        ctx.fillStyle = '#4CAF50';
        stats.forEach((stat, index) => {
            const x = 20 + index * stepX;
            const y = canvas.height - 20 - (stat.carbon / maxCarbon) * chartHeight;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Add labels
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        
        stats.forEach((stat, index) => {
            const x = 20 + index * stepX;
            const date = new Date(stat.date);
            const label = date.toLocaleDateString('en-US', { weekday: 'short' });
            ctx.fillText(label, x, canvas.height - 5);
        });
    }

    renderWeeklyStats() {
        const statsContainer = document.getElementById('reportStats');
        if (!statsContainer) return;

        const stats = this.dashboardData.weeklyStats;
        const totalCarbon = stats.reduce((sum, day) => sum + day.carbon, 0);
        const totalBreaks = stats.reduce((sum, day) => sum + day.breaksTaken, 0);
        const averageCarbon = totalCarbon / stats.length;
        const averageScreenTime = stats.reduce((sum, day) => sum + day.screenTime, 0) / stats.length;

        statsContainer.innerHTML = `
            <div class="report-stat">
                <span class="value">${totalCarbon.toFixed(1)}g</span>
                <span class="label">Total Carbon</span>
            </div>
            <div class="report-stat">
                <span class="value">${averageCarbon.toFixed(1)}g</span>
                <span class="label">Daily Average</span>
            </div>
            <div class="report-stat">
                <span class="value">${totalBreaks}</span>
                <span class="label">Total Breaks</span>
            </div>
            <div class="report-stat">
                <span class="value">${this.formatTime(averageScreenTime)}</span>
                <span class="label">Avg Screen Time</span>
            </div>
        `;
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    async shareProgress() {
    try {
        // Get comprehensive usage data
        const usageData = await this.getDetailedUsageData();
        
        // Create detailed usage text
        const usageDetails = this.formatUsageContent(usageData);
        
        const shareData = {
            title: 'EcoWellness Usage Report',
            text: usageDetails,
            url: 'https://chrome.google.com/webstore/detail/ecowellness'
        };

        // Try Web Share API first
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
            this.showSuccessMessage('Usage report shared successfully!');
        } else {
            // Enhanced fallback with multiple options
            await this.showShareFallback(usageDetails, shareData);
        }
    } catch (error) {
        console.error('Failed to share:', error);
        
        // Final fallback - just copy basic text
        try {
            const basicText = `I saved ${this.currentData.carbon.toFixed(1)}g CO₂ today with EcoWellness! 🌱`;
            await navigator.clipboard.writeText(basicText);
            this.showSuccessMessage('Basic progress copied to clipboard!');
        } catch (clipboardError) {
            this.showError('Sharing not available on this device');
        }
    }
}

// NEW: Get comprehensive usage data
async getDetailedUsageData() {
    try {
        const dashboardData = await this.sendMessage({ action: 'getDashboardData' });
        const weeklyStats = dashboardData?.weeklyStats || [];
        
        // Calculate additional metrics
        const weeklyCarbon = weeklyStats.reduce((sum, day) => sum + (day.carbon || 0), 0);
        const weeklyBreaks = weeklyStats.reduce((sum, day) => sum + (day.breaksTaken || 0), 0);
        const averageDaily = weeklyCarbon / Math.max(weeklyStats.length, 1);
        
        return {
            today: {
                carbon: this.currentData.carbon || 0,
                screenTime: this.currentData.screenTime || '0h 0m',
                sitesVisited: this.currentData.sitesVisited || 0,
                breakScore: this.currentData.breakScore || 10,
                breaksTaken: dashboardData?.wellness?.breaksTaken || 0
            },
            weekly: {
                totalCarbon: weeklyCarbon,
                totalBreaks: weeklyBreaks,
                averageDaily: averageDaily,
                daysTracked: weeklyStats.length
            },
            environmental: dashboardData?.environmental || {},
            wellness: dashboardData?.wellness || {}
        };
    } catch (error) {
        console.error('Error getting detailed usage data:', error);
        return {
            today: {
                carbon: this.currentData.carbon || 0,
                screenTime: this.currentData.screenTime || '0h 0m',
                sitesVisited: this.currentData.sitesVisited || 0,
                breakScore: this.currentData.breakScore || 10,
                breaksTaken: 0
            },
            weekly: { totalCarbon: 0, totalBreaks: 0, averageDaily: 0, daysTracked: 0 }
        };
    }
}

// NEW: Format comprehensive usage content
formatUsageContent(usageData) {
    const { today, weekly } = usageData;
    const currentDate = new Date().toLocaleDateString();
    
    return `🌱 EcoWellness Usage Report - ${currentDate}

📊 TODAY'S IMPACT:
• Carbon Footprint: ${today.carbon.toFixed(1)}g CO₂
• Screen Time: ${today.screenTime}
• Sites Visited: ${today.sitesVisited}
• Wellness Breaks: ${today.breaksTaken}
• Break Score: ${today.breakScore}/10

📈 WEEKLY SUMMARY:
• Total Carbon Saved: ${weekly.totalCarbon.toFixed(1)}g CO₂
• Daily Average: ${weekly.averageDaily.toFixed(1)}g CO₂
• Total Breaks Taken: ${weekly.totalBreaks}
• Days Tracked: ${weekly.daysTracked}

🎯 ENVIRONMENTAL IMPACT:
${this.getCarbonEquivalent(today.carbon)}

💡 Making sustainable browsing habits with EcoWellness!

Get EcoWellness: https://chrome.google.com/webstore/detail/ecowellness

#EcoWellness #SustainableBrowsing #DigitalWellness #CarbonFootprint`;
}

// NEW: Enhanced fallback with multiple sharing options
async showShareFallback(usageDetails, shareData) {
    const fallbackModal = document.createElement('div');
    fallbackModal.className = 'share-fallback-modal';
    fallbackModal.innerHTML = `
        <div class="share-fallback-content">
            <div class="share-fallback-header">
                <h3>📤 Share Your Progress</h3>
                <button class="close-fallback-btn">&times;</button>
            </div>
            <div class="share-fallback-body">
                <p>Choose how to share your EcoWellness progress:</p>
                
                <div class="share-options">
                    <button class="share-option-btn" data-action="copy">
                        📋 Copy to Clipboard
                    </button>
                    <button class="share-option-btn" data-action="email">
                        📧 Share via Email
                    </button>
                    <button class="share-option-btn" data-action="twitter">
                        🐦 Share on Twitter
                    </button>
                    <button class="share-option-btn" data-action="linkedin">
                        💼 Share on LinkedIn
                    </button>
                </div>
                
                <div class="share-preview">
                    <h4>Preview:</h4>
                    <textarea readonly class="share-text-preview">${usageDetails}</textarea>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    fallbackModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    `;
    
    document.body.appendChild(fallbackModal);
    
    // Handle sharing options
    fallbackModal.addEventListener('click', async (e) => {
        const action = e.target.dataset.action;
        
        if (action === 'copy') {
            await navigator.clipboard.writeText(usageDetails);
            this.showSuccessMessage('Usage report copied to clipboard!');
            this.closeFallbackModal(fallbackModal);
        } 
        else if (action === 'email') {
            const emailUrl = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(usageDetails)}`;
            window.open(emailUrl);
            this.closeFallbackModal(fallbackModal);
        } 
        else if (action === 'twitter') {
            const tweetText = `${usageDetails.substring(0, 240)}... Get EcoWellness!`;
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareData.url)}`;
            window.open(twitterUrl, '_blank', 'width=600,height=400');
            this.closeFallbackModal(fallbackModal);
        } 
        else if (action === 'linkedin') {
            const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}&summary=${encodeURIComponent(usageDetails)}`;
            window.open(linkedinUrl, '_blank', 'width=600,height=600');
            this.closeFallbackModal(fallbackModal);
        }
        else if (e.target.classList.contains('close-fallback-btn')) {
            this.closeFallbackModal(fallbackModal);
        }
    });
}

// NEW: Close fallback modal
closeFallbackModal(modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        if (modal.parentElement) {
            modal.remove();
        }
    }, 300);
}

// NEW: Get carbon footprint equivalent for context
getCarbonEquivalent(carbonGrams) {
    if (carbonGrams < 10) {
        return "🌟 Excellent! Lower than average web usage.";
    } else if (carbonGrams < 30) {
        return `🌱 Good impact! Equivalent to ${(carbonGrams/8.22).toFixed(1)} phone charges.`;
    } else if (carbonGrams < 50) {
        return `📱 Moderate usage. Equal to ${(carbonGrams/8.22).toFixed(1)} phone charges worth of energy.`;
    } else {
        const treeOffset = (carbonGrams/1000 * 0.04).toFixed(3);
        return `🌳 Consider reducing usage. Would need ${treeOffset} trees to offset this carbon.`;
    }
}


    async exportData() {
        try {
            const exportData = await this.sendMessage({ action: 'exportData' });
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ecowellness-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            this.showSuccessMessage('Data exported successfully!');
        } catch (error) {
            console.error('Failed to export data:', error);
        }
    }

    async clearAllData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            try {
                await this.sendMessage({ action: 'clearData' });
                await this.loadDashboardData();
                this.updateUI();
                this.showSuccessMessage('All data cleared successfully!');
            } catch (error) {
                console.error('Failed to clear data:', error);
            }
        }
    }

    setupAutoRefresh() {
        // Auto-refresh every 30 seconds
        setInterval(async () => {
            await this.loadDashboardData();
            this.updateUI();
        }, 30000);
    }

    showCarbonAlert(alertData) {
        this.showAlert('carbon-alert', alertData);
    }

    showWellnessAlert(alertData) {
        this.showAlert('wellness-alert', alertData);
    }

    showAlert(type, alertData) {
        const alertContainer = document.createElement('div');
        alertContainer.className = `alert-popup ${type}`;
        alertContainer.innerHTML = `
            <div class="alert-title">${alertData.title}</div>
            <div class="alert-message">${alertData.message}</div>
            <div class="alert-actions">
                <button class="alert-btn primary" onclick="this.parentElement.parentElement.remove()">
                    Take Action
                </button>
                <button class="alert-btn" onclick="this.parentElement.parentElement.remove()">
                    Dismiss
                </button>
            </div>
        `;
        
        document.body.appendChild(alertContainer);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (alertContainer.parentElement) {
                alertContainer.remove();
            }
        }, 8000);
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10001;
            animation: fadeIn 0.3s ease;
        `;
        
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #f44336;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10001;
            animation: fadeIn 0.3s ease;
        `;
        
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    async sendMessage(message) {
        return new Promise((resolve, reject) => {
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage(message, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(response);
                    }
                });
            } else {
                reject(new Error('Chrome runtime not available'));
            }
        });
    }

    async getStoredData(key) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.get(key, (result) => {
                    resolve(result[key]);
                });
            } else {
                const stored = localStorage.getItem(key);
                resolve(stored ? JSON.parse(stored) : null);
            }
        });
    }

    showAchievementDetails(achievement) {
        alert(`🏆 ${achievement.name}\n\n${achievement.description}\n\nUnlocked: ${new Date(achievement.unlockedAt).toLocaleDateString()}`);
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ecoWellnessDashboard = new EcoWellnessDashboard();
});
