// EcoWellness Carbon Calculator - Research-Aligned Environmental Impact Calculations
class CarbonCalculator {
  constructor() {
    // Research-aligned carbon emission factors based on latest studies
    this.factors = {
      // Core calculation framework - aligned with research
      ENERGY_PER_GB: 0.81,        // kWh per GB (research standard)
      CO2_PER_KWH: 437,           // grams CO2e per kWh (global average)
      MB_TO_GB: 0.001,            // Conversion factor
      
      // Data transfer (research-aligned)
      dataTransferPerMB: 0.354,   // 0.81 kWh/GB × 437g CO2/kWh × 0.001 = 0.354g per MB
      
      // Web page loading (research values)
      averagePageSize: 2.28,      // MB (research standard)
      firstVisitCO2: 0.8,         // grams CO2 (research: 2.28MB × 0.0008 kWh × 437g)
      returnVisitCO2: 0.6,        // grams CO2 (25% cache savings)
      cacheReduction: 0.25,       // 25% savings on return visits
      
      // Search engine queries (research values)
      searchQueries: {
        google: 0.2,              // grams CO2 per search
        bing: 0.12,               // grams CO2 per search
        duckduckgo: 0.14,         // grams CO2 per search
        default: 0.16             // average
      },
      
      // Video streaming (research-aligned per hour)
      videoStreamingSD: 36,       // grams CO2 per hour (standard definition)
      videoStreamingHD: 55,       // grams CO2 per hour (high definition)
      videoStreamingUHD: 175,     // grams CO2 per hour (4K streaming)
      videoStreamingMobile: 0.56, // grams CO2 per hour (smartphone)
      videoStreamingLaptop: 10.19, // grams CO2 per hour (laptop)
      
      // Email activities (research values)
      emailShort: 0.3,            // grams CO2 (no attachments)
      emailLong: 17,              // grams CO2 (10 min to write)
      emailAttachment: 50,        // grams CO2 (with attachment)
      emailSpam: 0.03,            // grams CO2
      emailStorage: 10,           // grams CO2 per email per year
      
      // Social media & communication (research values)
      videoCallPerHour: 160,      // grams CO2 per hour
      socialMediaPageView: 1.76,  // grams CO2 per page view
      imageUploadView: 2.5,       // grams CO2 (average 0.1-5g range)
      
      // Device-specific multipliers (research-aligned)
      deviceMultipliers: {
        desktop: 1.0,             // Base emissions
        laptop: 0.8,              // 20% reduction
        tablet: 0.6,              // 40% reduction
        smartphone: 0.3           // 70% reduction
      },
      
      // CPU usage impact (research-based)
      baseCO2PerSecond: 70 / 3600, // 70g CO2 per hour average PC operation
      
      // Time-based calculations (research values)
      activeTimePerMinute: 0.02,   // grams CO2 per minute active
      backgroundTabPerMinute: 0.005, // grams CO2 per minute per background tab
      idleBrowsingPerMinute: 0.01, // grams CO2 per minute idle
      
      // Content-type specific (research values)
      contentTypes: {
        textPer1000Words: 0.1,    // grams CO2 per 1000 words
        imagePerMB: 0.4,          // grams CO2 per MB
        videoPerMB: 1.2,          // grams CO2 per MB
        audioPerMB: 0.8,          // grams CO2 per MB
        scriptsPerMB: 0.6         // grams CO2 per MB (scripts/CSS)
      },
      
      // Page component breakdown (research-based estimates)
      pageComponents: {
        htmlCss: { min: 50, max: 200 },      // KB
        javascript: { min: 400, max: 800 },   // KB
        images: { min: 1000, max: 5000 },     // KB
        videos: { min: 2000, max: 50000 },    // KB
        fonts: { min: 50, max: 500 },         // KB
        thirdParty: { min: 200, max: 2000 }   // KB
      },
      
      // Regional electricity grid factors (g CO2/kWh) - research values
      gridFactors: {
        'US': 400,
        'EU': 300,
        'UK': 250,
        'CA': 150,
        'AU': 600,
        'IN': 700,
        'CN': 550,
        'JP': 350,
        'default': 437  // Global average from research
      }
    };
    
    this.deviceType = this.detectDeviceType();
    this.region = this.detectRegion();
    this.gridFactor = this.factors.gridFactors[this.region] || this.factors.gridFactors.default;
  }

  // Research-aligned core calculation
  calculateCO2FromDataTransfer(dataTransferMB) {
    const energyKWh = dataTransferMB * this.factors.MB_TO_GB * this.factors.ENERGY_PER_GB;
    return Math.round(energyKWh * this.factors.CO2_PER_KWH * 100) / 100;
  }

  // Network activity tracking (research-aligned)
  calculateNetworkActivityCO2(bytesTransferred) {
    const mb = bytesTransferred / (1024 * 1024);
    return Math.round(mb * 0.0008 * 437 * 100) / 100; // Research formula
  }

  // CPU usage impact (research-based)
  calculateCPUUsageCO2(cpuPercentage, durationSeconds) {
    const deviceMultiplier = this.factors.deviceMultipliers[this.deviceType] || 1.0;
    const baseCO2 = this.factors.baseCO2PerSecond * durationSeconds;
    return Math.round(cpuPercentage / 100 * baseCO2 * deviceMultiplier * 100) / 100;
  }

  // Page loading calculation (research-aligned)
  calculatePageLoadCO2(pageData) {
    const {
      sizeKB = 0,
      isFirstVisit = true,
      hasImages = true,
      hasVideo = false,
      hasThirdPartyScripts = true
    } = pageData;

    const sizeMB = sizeKB / 1024;
    let baseCO2;

    if (sizeMB <= 0.1) {
      // Very small page
      baseCO2 = 0.1;
    } else if (sizeMB >= 2.28) {
      // Average or larger page - use research values
      baseCO2 = isFirstVisit ? this.factors.firstVisitCO2 : this.factors.returnVisitCO2;
      
      // Scale for larger pages
      if (sizeMB > 2.28) {
        const scaleFactor = sizeMB / 2.28;
        baseCO2 *= scaleFactor;
      }
    } else {
      // Scale research values for smaller pages
      const scaleFactor = sizeMB / 2.28;
      baseCO2 = (isFirstVisit ? this.factors.firstVisitCO2 : this.factors.returnVisitCO2) * scaleFactor;
    }

    // Apply device-specific multiplier
    const deviceMultiplier = this.factors.deviceMultipliers[this.deviceType] || 1.0;
    
    return Math.round(baseCO2 * deviceMultiplier * 100) / 100;
  }

  // Search query calculation (research-aligned)
  calculateSearchCO2(searchEngine = 'google') {
    const co2 = this.factors.searchQueries[searchEngine.toLowerCase()] || this.factors.searchQueries.default;
    const deviceMultiplier = this.factors.deviceMultipliers[this.deviceType] || 1.0;
    return Math.round(co2 * deviceMultiplier * 100) / 100;
  }

  // Video streaming calculation (research-aligned)
  calculateVideoStreamingCO2(durationMinutes, quality = 'HD', deviceType = null) {
    const device = deviceType || this.deviceType;
    let baseCO2PerHour;

    // Use device-specific values when available
    if (device === 'smartphone') {
      baseCO2PerHour = this.factors.videoStreamingMobile;
    } else if (device === 'laptop' || device === 'desktop') {
      baseCO2PerHour = this.factors.videoStreamingLaptop;
    } else {
      // Use quality-based calculation
      switch (quality.toUpperCase()) {
        case 'SD':
          baseCO2PerHour = this.factors.videoStreamingSD;
          break;
        case 'HD':
          baseCO2PerHour = this.factors.videoStreamingHD;
          break;
        case 'UHD':
        case '4K':
          baseCO2PerHour = this.factors.videoStreamingUHD;
          break;
        default:
          baseCO2PerHour = this.factors.videoStreamingHD;
      }
    }

    const co2 = (durationMinutes / 60) * baseCO2PerHour;
    return Math.round(co2 * 100) / 100;
  }

  // Social media activity calculation (research-aligned)
  calculateSocialMediaCO2(pageViews, imageViews = 0) {
    const pageViewCO2 = pageViews * this.factors.socialMediaPageView;
    const imageCO2 = imageViews * this.factors.imageUploadView;
    const total = pageViewCO2 + imageCO2;
    
    const deviceMultiplier = this.factors.deviceMultipliers[this.deviceType] || 1.0;
    return Math.round(total * deviceMultiplier * 100) / 100;
  }

  // Time-based browsing calculation (research-aligned)
  calculateTimeBrowsingCO2(activeMinutes, backgroundTabs = 0, idleMinutes = 0) {
    const activeCO2 = activeMinutes * this.factors.activeTimePerMinute;
    const backgroundCO2 = backgroundTabs * activeMinutes * this.factors.backgroundTabPerMinute;
    const idleCO2 = idleMinutes * this.factors.idleBrowsingPerMinute;
    
    const total = activeCO2 + backgroundCO2 + idleCO2;
    const deviceMultiplier = this.factors.deviceMultipliers[this.deviceType] || 1.0;
    
    return Math.round(total * deviceMultiplier * 100) / 100;
  }

  // Content-type specific calculation (research-aligned)
  calculateContentTypeCO2(content) {
    const {
      textWords = 0,
      imageMB = 0,
      videoMB = 0,
      audioMB = 0,
      scriptsMB = 0
    } = content;

    const textCO2 = (textWords / 1000) * this.factors.contentTypes.textPer1000Words;
    const imageCO2 = imageMB * this.factors.contentTypes.imagePerMB;
    const videoCO2 = videoMB * this.factors.contentTypes.videoPerMB;
    const audioCO2 = audioMB * this.factors.contentTypes.audioPerMB;
    const scriptsCO2 = scriptsMB * this.factors.contentTypes.scriptsPerMB;

    const total = textCO2 + imageCO2 + videoCO2 + audioCO2 + scriptsCO2;
    const deviceMultiplier = this.factors.deviceMultipliers[this.deviceType] || 1.0;
    
    return Math.round(total * deviceMultiplier * 100) / 100;
  }

  // Comprehensive session calculation (research-aligned)
  calculateSessionCarbon(sessionData) {
    const {
      totalTimeMinutes = 0,
      activeTabs = 1,
      idleTabs = 0,
      totalRequests = 0,
      totalDataMB = 0,
      videoTimeMinutes = 0,
      videoQuality = 'HD',
      searchQueries = 0,
      socialMediaPageViews = 0,
      imageViews = 0,
      categories = {}
    } = sessionData;

    let totalCarbon = 0;

    // Base time-based calculation
    totalCarbon += this.calculateTimeBrowsingCO2(totalTimeMinutes, idleTabs, 0);

    // Data transfer
    totalCarbon += this.calculateCO2FromDataTransfer(totalDataMB);

    // Video streaming
    if (videoTimeMinutes > 0) {
      totalCarbon += this.calculateVideoStreamingCO2(videoTimeMinutes, videoQuality);
    }

    // Search queries
    if (searchQueries > 0) {
      totalCarbon += searchQueries * this.calculateSearchCO2();
    }

    // Social media activity
    if (socialMediaPageViews > 0) {
      totalCarbon += this.calculateSocialMediaCO2(socialMediaPageViews, imageViews);
    }

    // Apply regional grid factor adjustment
    const gridAdjustment = this.gridFactor / this.factors.gridFactors.default;
    totalCarbon *= gridAdjustment;

    return Math.round(totalCarbon * 100) / 100;
  }

  detectDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(userAgent);
    
    if (isMobile && !isTablet) return 'smartphone';
    if (isTablet) return 'tablet';
    
    // Detect desktop vs laptop (rough estimation)
    const screenWidth = screen.width;
    const screenHeight = screen.height;
    const screenSize = Math.sqrt(screenWidth * screenWidth + screenHeight * screenHeight);
    
    return screenSize > 2000 ? 'desktop' : 'laptop';
  }

  detectRegion() {
    // Try to detect region from timezone or navigator language
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language.toLowerCase();
    
    if (timezone.includes('America')) return 'US';
    if (timezone.includes('Europe')) return 'EU';
    if (timezone.includes('Asia/Kolkata') || language.includes('hi')) return 'IN';
    if (timezone.includes('Asia/Shanghai') || timezone.includes('Asia/Beijing')) return 'CN';
    if (timezone.includes('Asia/Tokyo')) return 'JP';
    if (timezone.includes('Australia')) return 'AU';
    if (language.includes('en-gb') || timezone.includes('London')) return 'UK';
    if (language.includes('en-ca') || timezone.includes('Toronto')) return 'CA';
    
    return 'default';
  }

  // Research-aligned website category impact
  estimateWebsiteCategory(url) {
    const hostname = url.toLowerCase();
    
    if (hostname.includes('youtube.com') || hostname.includes('netflix.com') || 
        hostname.includes('twitch.tv') || hostname.includes('video') || 
        hostname.includes('stream')) {
      return { category: 'streaming', multiplier: 2.0 };
    }
    
    if (hostname.includes('facebook.com') || hostname.includes('twitter.com') || 
        hostname.includes('instagram.com') || hostname.includes('social')) {
      return { category: 'socialMedia', multiplier: 1.2 };
    }
    
    if (hostname.includes('google.com') || hostname.includes('search')) {
      return { category: 'search', multiplier: 0.8 };
    }
    
    return { category: 'default', multiplier: 1.0 };
  }

  // Generate research-aligned recommendations
  getEcoRecommendations(carbonFootprint, sessionData = {}) {
    const recommendations = [];
    
    // Research-based thresholds
    if (carbonFootprint > 100) { // High impact threshold
      recommendations.push({
        type: 'urgent',
        message: 'Your carbon footprint is significantly above average (100g+). Consider reducing video streaming and data-heavy activities.',
        impact: 'High',
        potentialSaving: '50-75g CO₂',
        action: 'Reduce video quality, close unused tabs'
      });
    }
    
    if (sessionData.videoTimeMinutes > 60) {
      const savings = Math.round(sessionData.videoTimeMinutes * 0.3 * 100) / 100; // 30% potential saving
      recommendations.push({
        type: 'video',
        message: `Video streaming accounts for ${Math.round(sessionData.videoTimeMinutes * 0.9)}g CO₂. Reducing quality can cut emissions by 30%.`,
        impact: 'High',
        potentialSaving: `${savings}g CO₂`,
        action: 'Switch to lower video quality'
      });
    }
    
    return recommendations;
  }

  // Research-aligned benchmark comparison
  getCarbonBenchmarks() {
    return {
      excellent: 20,    // Research: Very low impact
      good: 50,         // Research: Below average
      average: 100,     // Research: Typical user
      high: 200,        // Research: Above average
      veryHigh: 500     // Research: Heavy user
    };
  }

  formatCarbonFootprint(carbonGrams) {
    if (carbonGrams < 1000) {
      return `${Math.round(carbonGrams * 100) / 100}g CO₂`;
    } else {
      return `${Math.round(carbonGrams / 10) / 100}kg CO₂`;
    }
  }

  // Static method for easy access
  static create() {
    return new CarbonCalculator();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CarbonCalculator;
} else if (typeof window !== 'undefined') {
  window.CarbonCalculator = CarbonCalculator;
}

//   detectDeviceType() {
//     const userAgent = navigator.userAgent.toLowerCase();
//     const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
//     const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(userAgent);
    
//     if (isMobile && !isTablet) return 'mobile';
//     if (isTablet) return 'tablet';
    
//     // Detect desktop vs laptop (rough estimation)
//     const screenWidth = screen.width;
//     const screenHeight = screen.height;
//     const screenSize = Math.sqrt(screenWidth * screenWidth + screenHeight * screenHeight);
    
//     return screenSize > 2000 ? 'desktop' : 'laptop';
//   }

//   detectRegion() {
//     // Try to detect region from timezone or navigator language
//     const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;e
//     const language = navigator.language.toLowerCase();
    
//     if (timezone.includes('America')) return 'US';
//     if (timezone.includes('Europe')) return 'EU';
//     if (timezone.includes('Asia/Kolkata') || language.includes('hi')) return 'IN';
//     if (timezone.includes('Asia/Shanghai') || timezone.includes('Asia/Beijing')) return 'CN';
//     if (timezone.includes('Asia/Tokyo')) return 'JP';
//     if (timezone.includes('Australia')) return 'AU';
//     if (language.includes('en-gb') || timezone.includes('London')) return 'UK';
//     if (language.includes('en-ca') || timezone.includes('Toronto')) return 'CA';
    
//     return 'default';
//   }

//   calculatePageCarbon(pageData) {
//     const {
//       sizeKB = 0,
//       timeMinutes = 0,
//       requests = 1,
//       category = 'default',
//       hasVideo = false,
//       videoMinutes = 0,
//       videoQuality = 'SD',
//       adBlockerEnabled = false
//     } = pageData;

//     let totalCarbon = 0;

//     // Data transfer carbon footprint
//     totalCarbon += sizeKB * this.factors.dataTransfer;

//     // Device energy consumption
//     const deviceFactor = this.factors[this.deviceType] || this.factors.laptop;
//     totalCarbon += timeMinutes * deviceFactor;

//     // Network requests
//     totalCarbon += requests * this.factors.serverRequest;

//     // Video streaming impact
//     if (hasVideo && videoMinutes > 0) {
//       const videoFactor = this.factors[`videoStreaming${videoQuality}`] || this.factors.videoStreamingSD;
//       totalCarbon += videoMinutes * videoFactor;
//     }

//     // Website category multiplier
//     const categoryMultiplier = this.factors[category] || 1.0;
//     totalCarbon *= categoryMultiplier;

//     // Ad blocker reduction
//     if (adBlockerEnabled) {
//       totalCarbon *= (1 + this.factors.adBlocking); // Reduce by 40%
//     }

//     return Math.max(totalCarbon, 0.1); // Minimum 0.1g CO2
//   }

//   calculateSessionCarbon(sessionData) {
//     const {
//       totalTimeMinutes = 0,
//       activeTabs = 1,
//       idleTabs = 0,
//       totalRequests = 0,
//       totalDataKB = 0,
//       videoTimeMinutes = 0,
//       categories = {}
//     } = sessionData;

//     let totalCarbon = 0;

//     // Base device consumption
//     const deviceFactor = this.factors[this.deviceType] || this.factors.laptop;
//     totalCarbon += totalTimeMinutes * deviceFactor;

//     // Tab overhead
//     totalCarbon += activeTabs * totalTimeMinutes * this.factors.tabActive;
//     totalCarbon += idleTabs * totalTimeMinutes * this.factors.tabIdle;

//     // Data transfer
//     totalCarbon += totalDataKB * this.factors.dataTransfer;

//     // Network requests
//     totalCarbon += totalRequests * this.factors.serverRequest;

//     // Video streaming
//     totalCarbon += videoTimeMinutes * this.factors.videoStreamingHD;

//     // Apply category-specific multipliers
//     for (const [category, timeSpent] of Object.entries(categories)) {
//       const multiplier = this.factors[category] || 1.0;
//       const categoryImpact = timeSpent * deviceFactor * (multiplier - 1);
//       totalCarbon += Math.max(categoryImpact, 0);
//     }

//     return totalCarbon;
//   }

//   calculateDailyCarbon(dailyData) {
//     const {
//       sessions = [],
//       totalScreenTime = 0,
//       sitesVisited = 0,
//       totalDataTransfer = 0
//     } = dailyData;

//     let totalCarbon = 0;

//     // Sum up all session carbon footprints
//     sessions.forEach(session => {
//       totalCarbon += this.calculateSessionCarbon(session);
//     });

//     // Add baseline device usage
//     const deviceFactor = this.factors[this.deviceType] || this.factors.laptop;
//     totalCarbon += totalScreenTime * deviceFactor;

//     return totalCarbon;
//   }

//   estimateWebsiteCategory(url) {
//     const hostname = url.toLowerCase();
    
//     // Social media
//     if (hostname.includes('facebook.com') || hostname.includes('twitter.com') || 
//         hostname.includes('instagram.com') || hostname.includes('linkedin.com') ||
//         hostname.includes('tiktok.com') || hostname.includes('snapchat.com') ||
//         hostname.includes('reddit.com') || hostname.includes('pinterest.com')) {
//       return 'socialMedia';
//     }
    
//     // E-commerce
//     if (hostname.includes('amazon.com') || hostname.includes('ebay.com') ||
//         hostname.includes('shop') || hostname.includes('store') ||
//         hostname.includes('buy') || hostname.includes('cart')) {
//       return 'ecommerce';
//     }
    
//     // Streaming
//     if (hostname.includes('youtube.com') || hostname.includes('netflix.com') ||
//         hostname.includes('twitch.tv') || hostname.includes('hulu.com') ||
//         hostname.includes('disney') || hostname.includes('prime') ||
//         hostname.includes('video') || hostname.includes('stream')) {
//       return 'streaming';
//     }
    
//     // Gaming
//     if (hostname.includes('steam') || hostname.includes('game') ||
//         hostname.includes('play') || hostname.includes('xbox') ||
//         hostname.includes('playstation') || hostname.includes('nintendo')) {
//       return 'gaming';
//     }
    
//     // News
//     if (hostname.includes('news') || hostname.includes('cnn.com') ||
//         hostname.includes('bbc.com') || hostname.includes('reuters.com') ||
//         hostname.includes('nytimes.com') || hostname.includes('guardian.com')) {
//       return 'news';
//     }
    
//     // Search
//     if (hostname.includes('google.com') || hostname.includes('bing.com') ||
//         hostname.includes('yahoo.com') || hostname.includes('duckduckgo.com')) {
//       return 'search';
//     }
    
//     // Productivity
//     if (hostname.includes('docs.google') || hostname.includes('office.com') ||
//         hostname.includes('notion.so') || hostname.includes('slack.com') ||
//         hostname.includes('zoom.us') || hostname.includes('github.com')) {
//       return 'productivity';
//     }
    
//     return 'default';
//   }

//   getEcoRecommendations(carbonFootprint, sessionData = {}) {
//     const recommendations = [];
    
//     if (carbonFootprint > 50) {
//       recommendations.push({
//         type: 'urgent',
//         message: 'Your carbon footprint is high today. Consider reducing video streaming and closing unused tabs.',
//         impact: 'High',
//         action: 'Reduce video quality, close tabs'
//       });
//     }
    
//     if (sessionData.activeTabs > 10) {
//       recommendations.push({
//         type: 'tabs',
//         message: 'You have many tabs open. Each tab consumes energy even when idle.',
//         impact: 'Medium',
//         action: 'Close unused tabs, use bookmarks'
//       });
//     }
    
//     if (sessionData.videoTimeMinutes > 60) {
//       recommendations.push({
//         type: 'video',
//         message: 'Video streaming has a high carbon footprint. Consider reducing video quality.',
//         impact: 'High',
//         action: 'Lower video quality, take breaks'
//       });
//     }
    
//     if (!sessionData.adBlockerEnabled) {
//       recommendations.push({
//         type: 'adblocker',
//         message: 'Ad blockers can reduce data usage by up to 40%, lowering your carbon footprint.',
//         impact: 'Medium',
//         action: 'Install an ad blocker extension'
//       });
//     }
    
//     // Always include general tips
//     recommendations.push({
//       type: 'general',
//       message: 'Enable dark mode to reduce screen energy consumption.',
//       impact: 'Low',
//       action: 'Switch to dark mode in browser settings'
//     });
    
//     recommendations.push({
//       type: 'general',
//       message: 'Use search engines like Ecosia that plant trees with your searches.',
//       impact: 'Medium',
//       action: 'Switch to eco-friendly search engine'
//     });
    
//     return recommendations;
//   }

//   calculateCarbonSaved(beforeCarbon, afterCarbon) {
//     const saved = beforeCarbon - afterCarbon;
//     return Math.max(saved, 0);
//   }

//   formatCarbonFootprint(carbonGrams) {
//     if (carbonGrams < 1000) {
//       return `${Math.round(carbonGrams * 10) / 10}g CO₂`;
//     } else {
//       return `${Math.round(carbonGrams / 100) / 10}kg CO₂`;
//     }
//   }

//   convertToEquivalents(carbonGrams) {
//     // Convert carbon footprint to real-world equivalents
//     return {
//       treesNeeded: Math.round((carbonGrams / 1000) * 0.04 * 100) / 100, // Trees needed to offset (1 tree absorbs ~25kg CO2/year)
//       carMiles: Math.round((carbonGrams / 404) * 100) / 100, // Equivalent car miles (404g CO2/mile average)
//       phoneCharges: Math.round((carbonGrams / 8.22) * 10) / 10, // Phone charge equivalents (8.22g CO2 per charge)
//       lightBulbHours: Math.round((carbonGrams / 10) * 10) / 10 // LED bulb hours (10g CO2 per hour)
//     };
//   }

//   getCarbonBenchmarks() {
//     return {
//       excellent: 10,    // Under 10g CO2 per day
//       good: 25,         // 10-25g CO2 per day
//       average: 50,      // 25-50g CO2 per day
//       high: 100,        // 50-100g CO2 per day
//       veryHigh: 200     // Over 100g CO2 per day
//     };
//   }

//   assessCarbonLevel(carbonGrams) {
//     const benchmarks = this.getCarbonBenchmarks();
    
//     if (carbonGrams <= benchmarks.excellent) return 'excellent';
//     if (carbonGrams <= benchmarks.good) return 'good';
//     if (carbonGrams <= benchmarks.average) return 'average';
//     if (carbonGrams <= benchmarks.high) return 'high';
//     return 'veryHigh';
//   }

//   generateCarbonReport(weeklyData) {
//     const totalCarbon = weeklyData.reduce((sum, day) => sum + (day.carbon || 0), 0);
//     const averageDaily = totalCarbon / weeklyData.length;
//     const trend = this.calculateTrend(weeklyData);
//     const level = this.assessCarbonLevel(averageDaily);
//     const equivalents = this.convertToEquivalents(totalCarbon);
    
//     return {
//       totalWeekly: totalCarbon,
//       averageDaily: averageDaily,
//       trend: trend,
//       level: level,
//       equivalents: equivalents,
//       recommendations: this.getEcoRecommendations(averageDaily),
//       benchmarks: this.getCarbonBenchmarks()
//     };
//   }

//   calculateTrend(weeklyData) {
//     if (weeklyData.length < 2) return 'stable';
    
//     const firstHalf = weeklyData.slice(0, Math.floor(weeklyData.length / 2));
//     const secondHalf = weeklyData.slice(Math.floor(weeklyData.length / 2));
    
//     const firstAvg = firstHalf.reduce((sum, day) => sum + (day.carbon || 0), 0) / firstHalf.length;
//     const secondAvg = secondHalf.reduce((sum, day) => sum + (day.carbon || 0), 0) / secondHalf.length;
    
//     const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
//     if (change > 10) return 'increasing';
//     if (change < -10) return 'decreasing';
//     return 'stable';
//   }

//   // Static method for easy access
//   static create() {
//     return new CarbonCalculator();
//   }
// }

// // Export for use in other modules
// if (typeof module !== 'undefined' && module.exports) {
//   module.exports = CarbonCalculator;
// } else if (typeof window !== 'undefined') {
//   window.CarbonCalculator = CarbonCalculator;
// }