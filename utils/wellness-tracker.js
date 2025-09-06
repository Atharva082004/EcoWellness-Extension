// EcoWellness Digital Wellness Tracker - Health and Wellness Monitoring
class WellnessTracker {
  constructor() {
    this.sessionData = {
      startTime: Date.now(),
      activeTime: 0,
      idleTime: 0,
      breaksTaken: 0,
      eyeStrainLevel: 0,
      postureScore: 10,
      lastBreakTime: null,
      consecutiveActiveMinutes: 0,
      blinkRate: 0,
      focusScore: 10
    };

    this.wellnessRules = {
      // 20-20-20 rule for eye health
      twentyTwentyTwenty: {
        interval: 20, // Every 20 minutes
        duration: 20, // Look for 20 seconds
        distance: 20 // At something 20 feet away
      },
      
      // Movement and posture breaks
      hourlyMovement: {
        interval: 60, // Every 60 minutes
        duration: 5,  // 5-minute break
        activity: 'stand and stretch'
      },
      
      // Hydration reminders
      hydrationReminder: {
        interval: 90, // Every 90 minutes
        action: 'drink water'
      },
      
      // Maximum continuous screen time
      maxContinuousTime: 120, // 2 hours maximum
      
      // Optimal break frequency
      optimalBreakInterval: 25, // Pomodoro-style 25-minute intervals
      
      // Daily screen time limits
      dailyLimits: {
        work: 480,      // 8 hours for work
        leisure: 180,   // 3 hours for leisure
        social: 120     // 2 hours for social media
      }
    };

    this.breakActivities = {
      micro: {
        duration: 30, // 30 seconds
        activities: [
          'Take 5 deep breaths',
          'Blink slowly 10 times',
          'Look away from screen',
          'Neck rolls (5 each direction)',
          'Shoulder shrugs (10 times)'
        ]
      },
      short: {
        duration: 120, // 2 minutes
        activities: [
          'Stand and stretch',
          'Walk around your space',
          'Do arm circles',
          'Calf raises (20 times)',
          'Drink a glass of water',
          'Practice mindful breathing'
        ]
      },
      medium: {
        duration: 300, // 5 minutes
        activities: [
          'Take a walk outside',
          'Do light stretching routine',
          'Practice meditation',
          'Hydrate and snack',
          'Chat with a colleague/friend',
          'Organize your workspace'
        ]
      },
      long: {
        duration: 900, // 15 minutes
        activities: [
          'Take a proper walk outside',
          'Do a full body stretch',
          'Practice yoga poses',
          'Have a healthy snack',
          'Call a friend or family member',
          'Do household tasks',
          'Practice mindfulness meditation'
        ]
      }
    };

    this.wellnessMetrics = {
      eyeStrain: {
        factors: ['screenTime', 'brightness', 'blinkRate', 'distance'],
        weights: [0.4, 0.25, 0.2, 0.15]
      },
      postureHealth: {
        factors: ['sittingTime', 'breakFrequency', 'reminderCompliance'],
        weights: [0.5, 0.3, 0.2]
      },
      mentalWellness: {
        factors: ['focusTime', 'breakBalance', 'stressLevel'],
        weights: [0.35, 0.35, 0.3]
      }
    };

    this.tips = {
      eyeHealth: [
        "Follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds",
        "Adjust your screen brightness to match your surroundings",
        "Position your screen 20-26 inches away from your eyes",
        "Blink consciously to keep your eyes moist",
        "Use artificial tears if your eyes feel dry",
        "Ensure proper lighting to reduce glare",
        "Consider computer glasses with blue light filtering"
      ],
      posture: [
        "Sit with your feet flat on the floor",
        "Keep your screen at eye level to avoid neck strain",
        "Support your lower back with a cushion if needed",
        "Keep your elbows at 90-degree angles",
        "Take micro-breaks every 30 minutes to adjust posture",
        "Use a standing desk occasionally",
        "Do shoulder blade squeezes regularly"
      ],
      mentalWellness: [
        "Take regular breaks to prevent mental fatigue",
        "Practice deep breathing when feeling overwhelmed",
        "Step away from screens during breaks",
        "Stay hydrated throughout the day",
        "Practice mindfulness or meditation",
        "Connect with others during break time",
        "Set boundaries for screen time"
      ],
      productivity: [
        "Use the Pomodoro Technique: 25 minutes focused work, 5-minute break",
        "Prioritize tasks to reduce stress",
        "Single-task instead of multitasking",
        "Take proper lunch breaks away from screens",
        "End work at a designated time",
        "Create a dedicated workspace",
        "Use website blockers during focused work time"
      ]
    };

    this.init();
  }

  init() {
    this.startTracking();
    this.loadStoredWellnessData();
  }

  startTracking() {
    // Track active time every minute
    this.trackingInterval = setInterval(() => {
      this.updateActiveTime();
      this.assessWellnessMetrics();
      this.checkWellnessAlerts();
    }, 60000); // Every minute

    // Track micro-interactions more frequently
    this.microTrackingInterval = setInterval(() => {
      this.trackMicroMetrics();
    }, 10000); // Every 10 seconds
  }

  updateActiveTime() {
    this.sessionData.activeTime += 1;
    this.sessionData.consecutiveActiveMinutes += 1;
    
    // Update wellness scores
    this.calculateEyeStrainLevel();
    this.calculatePostureScore();
    this.calculateFocusScore();
    
    this.saveWellnessData();
  }

  trackMicroMetrics() {
    // Simulate blink rate tracking (in real implementation, this would use webcam)
    this.estimateBlinkRate();
    
    // Track focus patterns based on activity
    this.trackFocusPatterns();
  }

  estimateBlinkRate() {
    // Normal blink rate is 15-20 blinks per minute
    // Screen time typically reduces this to 5-7 blinks per minute
    const baselineBlinkRate = 15;
    const screenReduction = Math.min(this.sessionData.consecutiveActiveMinutes * 0.1, 8);
    this.sessionData.blinkRate = Math.max(baselineBlinkRate - screenReduction, 5);
  }

  trackFocusPatterns() {
    // Simulate focus tracking based on activity patterns
    // In real implementation, this could track mouse/keyboard activity
    const activityLevel = this.getActivityLevel();
    
    if (activityLevel > 0.7) {
      this.sessionData.focusScore = Math.min(this.sessionData.focusScore + 0.1, 10);
    } else if (activityLevel < 0.3) {
      this.sessionData.focusScore = Math.max(this.sessionData.focusScore - 0.2, 0);
    }
  }

  getActivityLevel() {
    // Placeholder for activity level calculation
    // In real implementation, this would track mouse movements, clicks, keystrokes
    return 0.7 + (Math.random() - 0.5) * 0.4; // Simulated activity level
  }

  calculateEyeStrainLevel() {
    const factors = {
      screenTime: Math.min(this.sessionData.consecutiveActiveMinutes / 60, 1), // Normalize to 0-1
      brightness: 0.7, // Placeholder - would get actual screen brightness
      blinkRate: Math.max(0, (20 - this.sessionData.blinkRate) / 15), // Lower blink rate = higher strain
      distance: 0.5 // Placeholder - would measure actual viewing distance
    };

    const weights = this.wellnessMetrics.eyeStrain.weights;
    let strainLevel = 0;

    Object.values(factors).forEach((factor, index) => {
      strainLevel += factor * weights[index];
    });

    this.sessionData.eyeStrainLevel = Math.min(strainLevel * 10, 10);
    return this.sessionData.eyeStrainLevel;
  }

  calculatePostureScore() {
    const timeSinceLastBreak = this.sessionData.lastBreakTime ? 
      (Date.now() - this.sessionData.lastBreakTime) / (1000 * 60) : 
      this.sessionData.consecutiveActiveMinutes;

    // Score decreases with time since last break
    let score = 10 - (timeSinceLastBreak / 10);
    
    // Bonus for regular breaks
    if (this.sessionData.breaksTaken > 0) {
      const breakFrequency = this.sessionData.activeTime / this.sessionData.breaksTaken;
      if (breakFrequency <= 30) { // Breaks every 30 minutes or less
        score += 1;
      }
    }

    this.sessionData.postureScore = Math.max(Math.min(score, 10), 0);
    return this.sessionData.postureScore;
  }

  calculateFocusScore() {
    // Focus score is already being tracked in trackFocusPatterns
    // Apply time-based decay if no activity
    if (this.getActivityLevel() < 0.1) {
      this.sessionData.focusScore = Math.max(this.sessionData.focusScore - 0.1, 0);
    }

    return this.sessionData.focusScore;
  }

  assessWellnessMetrics() {
    const metrics = {
      eyeStrain: this.sessionData.eyeStrainLevel,
      postureHealth: 10 - this.sessionData.postureScore,
      mentalWellness: this.calculateMentalWellnessScore(),
      overallWellness: this.calculateOverallWellnessScore()
    };

    return metrics;
  }

  calculateMentalWellnessScore() {
    const factors = {
      focusTime: this.sessionData.focusScore / 10,
      breakBalance: Math.min(this.sessionData.breaksTaken / (this.sessionData.activeTime / 60), 1),
      stressLevel: this.estimateStressLevel()
    };

    const weights = this.wellnessMetrics.mentalWellness.weights;
    let score = 0;

    Object.values(factors).forEach((factor, index) => {
      score += factor * weights[index];
    });

    return score * 10;
  }

  estimateStressLevel() {
    // Estimate stress based on usage patterns
    let stressLevel = 0;

    if (this.sessionData.consecutiveActiveMinutes > 120) {
      stressLevel += 0.4; // Long continuous sessions increase stress
    }

    if (this.sessionData.breaksTaken < Math.floor(this.sessionData.activeTime / 60)) {
      stressLevel += 0.3; // Insufficient breaks increase stress
    }

    if (this.sessionData.eyeStrainLevel > 7) {
      stressLevel += 0.3; // High eye strain increases stress
    }

    return Math.min(stressLevel, 1);
  }

  calculateOverallWellnessScore() {
    const eyeStrainScore = Math.max(0, 10 - this.sessionData.eyeStrainLevel);
    const postureScore = this.sessionData.postureScore;
    const mentalScore = this.calculateMentalWellnessScore();
    const focusScore = this.sessionData.focusScore;

    // Weighted average of all scores
    const overallScore = (eyeStrainScore * 0.3 + postureScore * 0.25 + mentalScore * 0.25 + focusScore * 0.2);
    
    return Math.min(Math.max(overallScore, 0), 10);
  }

  checkWellnessAlerts() {
    const alerts = [];

    // Eye strain alert
    if (this.sessionData.eyeStrainLevel > 7) {
      alerts.push({
        type: 'eyeStrain',
        severity: 'high',
        message: 'High eye strain detected. Take a break and look away from the screen.',
        action: 'takeEyeBreak'
      });
    }

    // Posture alert
    if (this.sessionData.postureScore < 3) {
      alerts.push({
        type: 'posture',
        severity: 'medium',
        message: 'Poor posture detected. Stand up and stretch.',
        action: 'takePostureBreak'
      });
    }

    // Long session alert
    if (this.sessionData.consecutiveActiveMinutes > this.wellnessRules.maxContinuousTime) {
      alerts.push({
        type: 'longSession',
        severity: 'high',
        message: 'You\'ve been active for over 2 hours. Take a longer break.',
        action: 'takeLongBreak'
      });
    }

    // Break reminder
    if (this.shouldTakeBreak()) {
      alerts.push({
        type: 'breakReminder',
        severity: 'medium',
        message: this.getBreakReminderMessage(),
        action: 'takeScheduledBreak'
      });
    }

    return alerts;
  }

  shouldTakeBreak() {
    const timeSinceLastBreak = this.sessionData.lastBreakTime ? 
      (Date.now() - this.sessionData.lastBreakTime) / (1000 * 60) : 
      this.sessionData.consecutiveActiveMinutes;

    return timeSinceLastBreak >= this.wellnessRules.optimalBreakInterval;
  }

  getBreakReminderMessage() {
    const timeSinceLastBreak = this.sessionData.lastBreakTime ? 
      (Date.now() - this.sessionData.lastBreakTime) / (1000 * 60) : 
      this.sessionData.consecutiveActiveMinutes;

    if (timeSinceLastBreak >= 60) {
      return "It's been over an hour since your last break. Time for a movement break!";
    } else if (timeSinceLastBreak >= 20) {
      return "Time for a quick eye break! Look at something 20 feet away for 20 seconds.";
    } else {
      return "Take a moment to rest your eyes and adjust your posture.";
    }
  }

  recommendBreakActivity() {
    const timeSinceLastBreak = this.sessionData.lastBreakTime ? 
      (Date.now() - this.sessionData.lastBreakTime) / (1000 * 60) : 
      this.sessionData.consecutiveActiveMinutes;

    let breakType;
    if (timeSinceLastBreak >= 120) {
      breakType = 'long';
    } else if (timeSinceLastBreak >= 60) {
      breakType = 'medium';
    } else if (timeSinceLastBreak >= 20) {
      breakType = 'short';
    } else {
      breakType = 'micro';
    }

    const activities = this.breakActivities[breakType].activities;
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];

    return {
      type: breakType,
      duration: this.breakActivities[breakType].duration,
      activity: randomActivity,
      message: this.getBreakMessage(breakType, randomActivity)
    };
  }

  getBreakMessage(breakType, activity) {
    const messages = {
      micro: `Take a quick 30-second break: ${activity}`,
      short: `Time for a 2-minute break: ${activity}`,
      medium: `Take a 5-minute wellness break: ${activity}`,
      long: `You deserve a 15-minute break: ${activity}`
    };

    return messages[breakType] || `Break time: ${activity}`;
  }

  recordBreakTaken(breakType = 'general', duration = 0) {
    this.sessionData.breaksTaken += 1;
    this.sessionData.lastBreakTime = Date.now();
    this.sessionData.consecutiveActiveMinutes = 0;

    // Improve wellness scores based on break taken
    this.sessionData.eyeStrainLevel = Math.max(0, this.sessionData.eyeStrainLevel - 2);
    this.sessionData.postureScore = Math.min(10, this.sessionData.postureScore + 1);
    this.sessionData.focusScore = Math.min(10, this.sessionData.focusScore + 0.5);

    // Store break record
    this.recordBreakHistory(breakType, duration);
    this.saveWellnessData();

    return {
      message: 'Break recorded successfully!',
      improvedScores: {
        eyeStrain: this.sessionData.eyeStrainLevel,
        posture: this.sessionData.postureScore,
        focus: this.sessionData.focusScore
      }
    };
  }

  recordBreakHistory(breakType, duration) {
    const today = new Date().toISOString().split('T')[0];
    const breakRecord = {
      timestamp: Date.now(),
      type: breakType,
      duration: duration,
      date: today
    };

    // Store in daily break history
    this.getDailyBreakHistory(today).push(breakRecord);
  }

  getDailyBreakHistory(date) {
    if (!this.breakHistory) {
      this.breakHistory = {};
    }
    if (!this.breakHistory[date]) {
      this.breakHistory[date] = [];
    }
    return this.breakHistory[date];
  }

  getWellnessTips(category = 'random') {
    if (category === 'random') {
      const categories = Object.keys(this.tips);
      category = categories[Math.floor(Math.random() * categories.length)];
    }

    const tips = this.tips[category] || this.tips.mentalWellness;
    return tips[Math.floor(Math.random() * tips.length)];
  }

  getPersonalizedTips() {
    const tips = [];
    const metrics = this.assessWellnessMetrics();

    if (metrics.eyeStrain > 6) {
      tips.push({
        category: 'eyeHealth',
        tip: this.getWellnessTips('eyeHealth'),
        priority: 'high'
      });
    }

    if (metrics.postureHealth > 6) {
      tips.push({
        category: 'posture',
        tip: this.getWellnessTips('posture'),
        priority: 'medium'
      });
    }

    if (metrics.mentalWellness < 5) {
      tips.push({
        category: 'mentalWellness',
        tip: this.getWellnessTips('mentalWellness'),
        priority: 'high'
      });
    }

    // Always include a general productivity tip
    tips.push({
      category: 'productivity',
      tip: this.getWellnessTips('productivity'),
      priority: 'low'
    });

    return tips;
  }

  calculateBreakScore() {
    const activeHours = this.sessionData.activeTime / 60;
    const expectedBreaks = Math.floor(activeHours * 2); // 2 breaks per hour ideal
    const actualBreaks = this.sessionData.breaksTaken;

    if (expectedBreaks === 0) return 10;

    const breakRatio = actualBreaks / expectedBreaks;
    const score = Math.min(breakRatio * 10, 10);

    // Bonus for consistency
    const consistency = this.calculateBreakConsistency();
    return Math.min(score + consistency, 10);
  }

  calculateBreakConsistency() {
    if (!this.breakHistory) return 0;

    const today = new Date().toISOString().split('T')[0];
    const todayBreaks = this.getDailyBreakHistory(today);

    if (todayBreaks.length < 2) return 0;

    // Calculate variance in break intervals
    const intervals = [];
    for (let i = 1; i < todayBreaks.length; i++) {
      const interval = (todayBreaks[i].timestamp - todayBreaks[i-1].timestamp) / (1000 * 60);
      intervals.push(interval);
    }

    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - averageInterval, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower standard deviation = more consistent = higher score
    return Math.max(0, 2 - (standardDeviation / 30)); // Normalize to 0-2 bonus points
  }

  generateWellnessReport() {
    const metrics = this.assessWellnessMetrics();
    const breakScore = this.calculateBreakScore();
    const tips = this.getPersonalizedTips();

    return {
      timestamp: Date.now(),
      sessionDuration: this.sessionData.activeTime,
      wellnessMetrics: {
        eyeStrain: {
          level: this.sessionData.eyeStrainLevel,
          status: this.getWellnessStatus(10 - this.sessionData.eyeStrainLevel),
          recommendation: this.sessionData.eyeStrainLevel > 6 ? 'Take frequent eye breaks' : 'Keep up the good work'
        },
        posture: {
          score: this.sessionData.postureScore,
          status: this.getWellnessStatus(this.sessionData.postureScore),
          recommendation: this.sessionData.postureScore < 5 ? 'Focus on better posture and more breaks' : 'Maintain good posture habits'
        },
        mentalWellness: {
          score: metrics.mentalWellness,
          status: this.getWellnessStatus(metrics.mentalWellness),
          recommendation: metrics.mentalWellness < 5 ? 'Consider stress management techniques' : 'Great mental wellness balance'
        },
        overall: {
          score: metrics.overallWellness,
          status: this.getWellnessStatus(metrics.overallWellness)
        }
      },
      breakAnalysis: {
        breaksTaken: this.sessionData.breaksTaken,
        breakScore: breakScore,
        recommendedBreaks: Math.floor(this.sessionData.activeTime / 30),
        nextBreakRecommendation: this.recommendBreakActivity()
      },
      personalizedTips: tips
    };
  }

  getWellnessStatus(score) {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    if (score >= 2) return 'Poor';
    return 'Critical';
  }

  getWeeklyWellnessStats() {
    const stats = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayStats = this.getDailyWellnessStats(dateStr);
      stats.push({
        date: dateStr,
        ...dayStats
      });
    }

    return stats;
  }

  getDailyWellnessStats(date) {
    const dailyData = this.loadDailyWellnessData(date);

    return {
      screenTime: dailyData.totalActiveTime || 0,
      breaksTaken: dailyData.totalBreaks || 0,
      averageEyeStrain: dailyData.averageEyeStrain || 0,
      averagePostureScore: dailyData.averagePostureScore || 10,
      wellnessScore: dailyData.overallWellnessScore || 10
    };
  }

  saveWellnessData() {
    const data = {
      sessionData: this.sessionData,
      breakHistory: this.breakHistory,
      lastUpdated: Date.now()
    };

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ 'wellnessData': data });
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem('wellnessData', JSON.stringify(data));
    }
  }

  loadStoredWellnessData() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['wellnessData'], (result) => {
        if (result.wellnessData) {
          this.sessionData = { ...this.sessionData, ...result.wellnessData.sessionData };
          this.breakHistory = result.wellnessData.breakHistory || {};
        }
      });
    } else if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('wellnessData');
      if (stored) {
        const data = JSON.parse(stored);
        this.sessionData = { ...this.sessionData, ...data.sessionData };
        this.breakHistory = data.breakHistory || {};
      }
    }
  }

  loadDailyWellnessData(date) {
    // Placeholder for loading specific daily data
    // In a full implementation, this would load from storage
    return {
      totalActiveTime: 0,
      totalBreaks: 0,
      averageEyeStrain: 0,
      averagePostureScore: 10,
      overallWellnessScore: 10
    };
  }

  resetDailyData() {
    this.sessionData = {
      startTime: Date.now(),
      activeTime: 0,
      idleTime: 0,
      breaksTaken: 0,
      eyeStrainLevel: 0,
      postureScore: 10,
      lastBreakTime: null,
      consecutiveActiveMinutes: 0,
      blinkRate: 15,
      focusScore: 10
    };

    this.saveWellnessData();
  }

  cleanup() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }
    if (this.microTrackingInterval) {
      clearInterval(this.microTrackingInterval);
    }
  }

  // Static method for easy instantiation
  static create() {
    return new WellnessTracker();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WellnessTracker;
} else if (typeof window !== 'undefined') {
  window.WellnessTracker = WellnessTracker;
}