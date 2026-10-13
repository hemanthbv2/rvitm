/**
 * RVITM TELEMETRY SYSTEM (Dual-Write Client)
 * Compliant with Dual-Write Chatbot Architecture:
 * - Writes to WordPress REST API (MySQL)
 * - Writes to Vercel Node.js / MongoDB Dashboard Backend
 * - Key Normalization: Standardized to { timestamp, data } format
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RVITM_Telemetry = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let config = {
    instituteId: 'rvitm',
    wpRestUrl: (typeof window !== 'undefined' && window.rvitmChatbotSettings?.wpRestUrl) || '',
    vercelUrl: (typeof window !== 'undefined' && window.rvitmChatbotSettings?.vercelUrl) || (typeof window !== 'undefined' ? window.location.origin : ''),
    batchIntervalMs: 5000,
    maxBatchSize: 10
  };

  const queue = [];
  let timer = null;

  function init(customConfig) {
    if (customConfig) {
      config = Object.assign(config, customConfig);
    }
    startBatchTimer();
  }

  function getSessionId() {
    let sid = sessionStorage.getItem('rvitm_chat_sid');
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
      sessionStorage.setItem('rvitm_chat_sid', sid);
    }
    return sid;
  }

  function logInteraction(query, intentId, metadata = {}) {
    const payload = {
      timestamp: new Date().toISOString(),
      data: {
        instituteId: config.instituteId,
        sessionId: getSessionId(),
        query: query,
        intentId: intentId,
        tone: metadata.tone || 'pro',
        matchedType: metadata.matchedType || 'direct',
        clientUserAgent: navigator.userAgent,
        extra: metadata
      }
    };

    queue.push(payload);
    if (queue.length >= config.maxBatchSize) {
      flush();
    }
  }

  function logMicroInteraction(type, label, metadata = {}) {
    const payload = {
      timestamp: new Date().toISOString(),
      data: {
        instituteId: config.instituteId,
        sessionId: getSessionId(),
        eventType: type, // 'click', 'voice_search', 'tone_toggle', 'clear_chat'
        label: label,
        clientUserAgent: navigator.userAgent,
        extra: metadata
      }
    };

    queue.push(payload);
    if (queue.length >= config.maxBatchSize) {
      flush();
    }
  }

  function startBatchTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(flush, config.batchIntervalMs);
  }

  function flush() {
    if (queue.length === 0) return;
    const batch = queue.splice(0, queue.length);

    // 1. Dual-Write to WordPress REST API
    if (config.wpRestUrl) {
      try {
        fetch(config.wpRestUrl + '/interactions/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batch })
        }).catch(() => { /* silent fail on local */ });
      } catch (e) {}
    }

    // 2. Dual-Write to Vercel Node.js / MongoDB Backend
    if (config.vercelUrl) {
      try {
        fetch(config.vercelUrl + '/api/dashboard/interactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batch })
        }).catch(() => { /* silent fail on local */ });
      } catch (e) {}
    }
  }

  // Handle page unload beacon
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      flush();
    });
  }

  return {
    init,
    logInteraction,
    logMicroInteraction,
    flush
  };
}));
