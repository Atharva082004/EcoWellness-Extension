// EcoWellness Content Script - Page Interaction and Monitoring
class EcoWellnessContentScript {
  constructor() {
    this.activityData = {
      startTime: Date.now(),
      lastActivity: Date.now(),
      scrollCount: 0,
      clickCount: 0,
      keystrokes: 0,
      focusTime: 0,
      idleTime: 0
    };
    
    this.breakOverlay = null;
    this.isIdle = false;
    this.idleTimer = null;
    this.activityTimer = null;
    
    this.init();
  }

  init() {
    this.trackPageMetrics();
    this.setupActivityMonitoring();
    this.setupMessageListener();
    this.injectEcoStyles();
    this.startActivityTracking();
  }

  trackPageMetrics() {
    // Calculate page size and environmental impact
    const pageSize = this.calculatePageSize();
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    
    // Send data to background script
    chrome.runtime.sendMessage({
      action: 'trackPageMetrics',
      data: {
        url: window.location.href,
        size: pageSize,
        loadTime: loadTime,
        timestamp: Date.now()
      }
    });
  }

  calculatePageSize() {
    // Estimate page size based on DOM elements and resources
    let size = 0;
    
    // HTML content
    size += document.documentElement.outerHTML.length / 1024; // Convert to KB
    
    // Images
    const images = document.getElementsByTagName('img');
    for (let img of images) {
      // Rough estimate based on image dimensions
      const width = img.naturalWidth || img.width || 100;
      const height = img.naturalHeight || img.height || 100;
      size += (width * height * 3) / 1024 / 1024; // Rough estimate in KB
    }
    
    // Stylesheets and scripts (estimated)
    size += document.styleSheets.length * 10; // 10KB per stylesheet estimate
    size += document.scripts.length * 5; // 5KB per script estimate
    
    return Math.max(size, 10); // Minimum 10KB
  }

  setupActivityMonitoring() {
    // Mouse movement tracking
    document.addEventListener('mousemove', () => {
      this.recordActivity();
    }, { passive: true });

    // Scroll tracking
    document.addEventListener('scroll', () => {
      this.activityData.scrollCount++;
      this.recordActivity();
    }, { passive: true });

    // Click tracking
    document.addEventListener('click', () => {
      this.activityData.clickCount++;
      this.recordActivity();
    }, { passive: true });

    // Keyboard activity
    document.addEventListener('keydown', () => {
      this.activityData.keystrokes++;
      this.recordActivity();
    }, { passive: true });

    // Page focus/blur
    window.addEventListener('focus', () => {
      this.handleFocus();
    });

    window.addEventListener('blur', () => {
      this.handleBlur();
    });

    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handleBlur();
      } else {
        this.handleFocus();
      }
    });
  }

  recordActivity() {
    this.activityData.lastActivity = Date.now();
    
    if (this.isIdle) {
      this.isIdle = false;
      this.sendActivityUpdate('active');
    }
    
    // Reset idle timer
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.handleIdle();
    }, 30000); // 30 seconds of inactivity = idle
  }

  handleFocus() {
    this.activityData.focusTime += Date.now() - (this.activityData.lastBlur || this.activityData.startTime);
    this.recordActivity();
  }

  handleBlur() {
    this.activityData.lastBlur = Date.now();
  }

  handleIdle() {
    this.isIdle = true;
    this.sendActivityUpdate('idle');
  }

  sendActivityUpdate(status) {
    chrome.runtime.sendMessage({
      action: 'updateActivity',
      data: {
        ...this.activityData,
        status: status,
        url: window.location.href
      }
    });
  }

  startActivityTracking() {
    // Send activity updates every 5 minutes
    this.activityTimer = setInterval(() => {
      this.sendActivityUpdate('periodic');
    }, 5 * 60 * 1000);
    
    // Initial activity record
    this.recordActivity();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'showBreakReminder':
          this.showBreakReminder(message.data);
          break;
        case 'hideBreakReminder':
          this.hideBreakReminder();
          break;
        case 'getPageActivity':
          sendResponse(this.activityData);
          break;
        case 'injectEcoTips':
          this.injectEcoTips();
          break;
      }
    });
  }

  showBreakReminder(data) {
    if (this.breakOverlay) {
      this.hideBreakReminder();
    }

    this.breakOverlay = document.createElement('div');
    this.breakOverlay.id = 'ecowellness-break-overlay';
    this.breakOverlay.innerHTML = `
      <div class="ecowellness-break-content">
        <div class="ecowellness-break-header">
          <span class="ecowellness-break-icon">${data.icon || '👀'}</span>
          <h3>${data.title || 'Break Time!'}</h3>
          <button class="ecowellness-close-btn" id="ecowellness-close-break">×</button>
        </div>
        <p>${data.message || 'Time to take a wellness break!'}</p>
        <div class="ecowellness-break-timer" id="ecowellness-break-timer">
          <div class="ecowellness-timer-circle">
            <span id="ecowellness-countdown">${data.duration || 20}</span>
          </div>
        </div>
        <div class="ecowellness-break-actions">
          <button class="ecowellness-btn primary" id="ecowellness-start-break">Start ${data.duration || 20}s Break</button>
          <button class="ecowellness-btn secondary" id="ecowellness-skip-break">Skip</button>
          <button class="ecowellness-btn secondary" id="ecowellness-postpone-break">Postpone 5min</button>
        </div>
        <div class="ecowellness-tips">
          <p><strong>Quick tip:</strong> ${this.getRandomBreakTip()}</p>
        </div>
      </div>
    `;

    document.body.appendChild(this.breakOverlay);
    this.setupBreakOverlayEvents();
    
    // Animate in
    setTimeout(() => {
      this.breakOverlay.classList.add('show');
    }, 10);
  }

  setupBreakOverlayEvents() {
    const closeBtn = document.getElementById('ecowellness-close-break');
    const startBtn = document.getElementById('ecowellness-start-break');
    const skipBtn = document.getElementById('ecowellness-skip-break');
    const postponeBtn = document.getElementById('ecowellness-postpone-break');

    closeBtn?.addEventListener('click', () => this.hideBreakReminder());
    skipBtn?.addEventListener('click', () => this.handleBreakAction('skip'));
    postponeBtn?.addEventListener('click', () => this.handleBreakAction('postpone'));
    
    startBtn?.addEventListener('click', () => {
      this.startBreakTimer();
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.breakOverlay) {
        this.hideBreakReminder();
      }
    });
  }

  startBreakTimer() {
    const countdownEl = document.getElementById('ecowellness-countdown');
    let timeLeft = parseInt(countdownEl.textContent);
    
    const timer = setInterval(() => {
      timeLeft--;
      countdownEl.textContent = timeLeft;
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        this.completeBreak();
      }
    }, 1000);
  }

  completeBreak() {
    const content = this.breakOverlay.querySelector('.ecowellness-break-content');
    content.innerHTML = `
      <div class="ecowellness-break-complete">
        <span class="ecowellness-break-icon">✅</span>
        <h3>Well Done!</h3>
        <p>Break completed successfully. You're taking great care of your digital wellness!</p>
        <button class="ecowellness-btn primary" id="ecowellness-close-complete">Continue Browsing</button>
      </div>
    `;
    
    document.getElementById('ecowellness-close-complete')?.addEventListener('click', () => {
      this.handleBreakAction('complete');
    });
    
    setTimeout(() => {
      this.hideBreakReminder();
    }, 3000);
  }

  handleBreakAction(action) {
    chrome.runtime.sendMessage({
      action: 'breakAction',
      data: { action, timestamp: Date.now() }
    });
    
    this.hideBreakReminder();
  }

  hideBreakReminder() {
    if (this.breakOverlay) {
      this.breakOverlay.classList.remove('show');
      setTimeout(() => {
        if (this.breakOverlay && this.breakOverlay.parentNode) {
          this.breakOverlay.parentNode.removeChild(this.breakOverlay);
        }
        this.breakOverlay = null;
      }, 300);
    }
  }

  getRandomBreakTip() {
    const tips = [
      "Look at something 20 feet away for 20 seconds (20-20-20 rule)",
      "Blink slowly 10 times to moisturize your eyes",
      "Roll your shoulders backwards 5 times",
      "Take 3 deep breaths to reduce stress",
      "Stretch your neck gently from side to side",
      "Stand up and do a quick body stretch",
      "Drink a glass of water to stay hydrated",
      "Do 5 minutes of light walking if possible"
    ];
    
    return tips[Math.floor(Math.random() * tips.length)];
  }

  injectEcoTips() {
    // Inject contextual eco-tips based on current website
    const hostname = window.location.hostname;
    let tip = null;

    if (hostname.includes('youtube.com') || hostname.includes('netflix.com')) {
      tip = "💡 Streaming video has a high carbon footprint. Consider lowering video quality to reduce environmental impact.";
    } else if (hostname.includes('google.com') || hostname.includes('search')) {
      tip = "🌱 Each search query uses energy. Try to be more specific to find what you need faster.";
    } else if (hostname.includes('amazon.com') || hostname.includes('shop')) {
      tip = "♻️ Consider the environmental impact of your purchases. Look for eco-friendly alternatives.";
    } else if (hostname.includes('social') || hostname.includes('facebook.com') || hostname.includes('twitter.com')) {
      tip = "⏰ Social media can be energy-intensive. Consider limiting browsing time for both your wellbeing and the environment.";
    }

    if (tip && !document.getElementById('ecowellness-eco-tip')) {
      this.showEcoTip(tip);
    }
  }

  showEcoTip(tipText) {
    const tipElement = document.createElement('div');
    tipElement.id = 'ecowellness-eco-tip';
    tipElement.innerHTML = `
      <div class="ecowellness-tip-content">
        <span class="ecowellness-tip-text">${tipText}</span>
        <button class="ecowellness-tip-close">×</button>
      </div>
    `;

    document.body.appendChild(tipElement);

    // Setup close functionality
    tipElement.querySelector('.ecowellness-tip-close').addEventListener('click', () => {
      tipElement.remove();
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (tipElement.parentNode) {
        tipElement.remove();
      }
    }, 10000);
  }

  injectEcoStyles() {
    const styles = `
      #ecowellness-break-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483647;
        opacity: 0;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(8px);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      #ecowellness-break-overlay.show {
        opacity: 1;
      }

      .ecowellness-break-content {
        background: white;
        border-radius: 16px;
        padding: 32px;
        max-width: 400px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        text-align: center;
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }

      #ecowellness-break-overlay.show .ecowellness-break-content {
        transform: scale(1);
      }

      .ecowellness-break-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .ecowellness-break-icon {
        font-size: 24px;
      }

      .ecowellness-break-header h3 {
        margin: 0;
        font-size: 20px;
        color: #333;
        flex: 1;
        text-align: center;
      }

      .ecowellness-close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
      }

      .ecowellness-close-btn:hover {
        background: rgba(0, 0, 0, 0.1);
        color: #333;
      }

      .ecowellness-break-content p {
        color: #666;
        margin-bottom: 24px;
        font-size: 16px;
        line-height: 1.5;
      }

      .ecowellness-break-timer {
        margin: 24px 0;
      }

      .ecowellness-timer-circle {
        width: 80px;
        height: 80px;
        border: 4px solid #4CAF50;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        font-size: 24px;
        font-weight: bold;
        color: #4CAF50;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }

      .ecowellness-break-actions {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .ecowellness-btn {
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        min-width: 100px;
      }

      .ecowellness-btn.primary {
        background: #4CAF50;
        color: white;
      }

      .ecowellness-btn.primary:hover {
        background: #45a049;
        transform: translateY(-2px);
      }

      .ecowellness-btn.secondary {
        background: #f5f5f5;
        color: #666;
      }

      .ecowellness-btn.secondary:hover {
        background: #e0e0e0;
        color: #333;
      }

      .ecowellness-tips {
        background: rgba(76, 175, 80, 0.1);
        padding: 16px;
        border-radius: 8px;
        margin-top: 16px;
      }

      .ecowellness-tips p {
        margin: 0;
        font-size: 14px;
        color: #2e7d32;
      }

      .ecowellness-break-complete {
        text-align: center;
      }

      .ecowellness-break-complete .ecowellness-break-icon {
        font-size: 48px;
        display: block;
        margin-bottom: 16px;
      }

      #ecowellness-eco-tip {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
        border-radius: 8px;
        padding: 0;
        box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
        z-index: 2147483646;
        max-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: slideInRight 0.3s ease;
      }

      .ecowellness-tip-content {
        display: flex;
        align-items: flex-start;
        padding: 16px;
        gap: 12px;
      }

      .ecowellness-tip-text {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
      }

      .ecowellness-tip-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s ease;
        flex-shrink: 0;
      }

      .ecowellness-tip-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}

// Initialize content script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new EcoWellnessContentScript();
  });
} else {
  new EcoWellnessContentScript();
}