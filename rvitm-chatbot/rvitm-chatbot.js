/**
 * RVITM CHATBOT CONTROLLER (Interactive Frontend Logic)
 * Integrates:
 * - RVITM Knowledge Base & Engine
 * - Voice Speech Recognition & TTS Audio
 * - Particle Canvas Background
 * - Dual-Write Telemetry Client
 * - Typeahead Autocomplete Popover
 */

(function () {
  'use strict';

  let chatOpen = false;
  let recognition = null;
  let isListening = false;
  let isTTSOn = false;

  // DOM Elements
  let fab, win, msgs, input, sendBtn, micBtn, clearBtn, ttsBtn, typing, quickChips, typeahead;

  function initChatbot() {
    fab = document.getElementById('chatFab');
    win = document.getElementById('chatWindow');
    msgs = document.getElementById('chatMessages');
    input = document.getElementById('chatInput');
    sendBtn = document.getElementById('sendBtn');
    micBtn = document.getElementById('micBtn');
    clearBtn = document.getElementById('clearBtn');
    ttsBtn = document.getElementById('ttsBtn');
    typing = document.getElementById('typingIndicator');
    quickChips = document.getElementById('quickSuggestions');
    typeahead = document.getElementById('typeahead');

    if (!fab || !win) return;

    // Initialize Telemetry
    if (window.RVITM_Telemetry) {
      window.RVITM_Telemetry.init();
    }

    // Bind Event Listeners
    fab.addEventListener('click', toggleChat);
    if (clearBtn) clearBtn.addEventListener('click', clearChat);
    if (sendBtn) sendBtn.addEventListener('click', handleSend);
    if (micBtn) micBtn.addEventListener('click', toggleVoice);
    if (ttsBtn) ttsBtn.addEventListener('click', toggleTTS);

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
      });
      input.addEventListener('input', handleTypeahead);
    }

    // Suggestion chips click delegation
    if (quickChips) {
      quickChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.suggestion-chip');
        if (chip && chip.dataset.query) {
          sendQuery(chip.dataset.query);
        }
      });
    }

    // Message action buttons delegation
    if (msgs) {
      msgs.addEventListener('click', (e) => {
        const btn = e.target.closest('.act-btn');
        if (btn) {
          if (btn.dataset.act) {
            sendQuery(btn.dataset.act);
          }
        }
      });
    }

    // Particle Background
    initParticles();

    // Deep Micro-Interaction Telemetry Tracking (RVCE Parity)
    bindDeepTelemetry();

    // Welcome Message on Initial Boot
    if (msgs.children.length === 0) {
      const welcome = window.RVITM_Engine ? window.RVITM_Engine.getResponse('greet') : null;
      if (welcome) {
        addBot(welcome.text, welcome.buttons);
      }
    }
  }

  function toggleChat() {
    chatOpen = !chatOpen;
    fab.classList.toggle('active', chatOpen);
    win.classList.toggle('open', chatOpen);
    const badge = document.getElementById('fabBadge');
    if (badge) badge.style.display = 'none';

    if (chatOpen && input) {
      setTimeout(() => input.focus(), 300);
      scrollToBottom();
      if (window.RVITM_Telemetry) {
        window.RVITM_Telemetry.logMicroInteraction('open_chat', 'FAB Opened');
      }
    }
  }

  function clearChat() {
    if (!msgs) return;
    msgs.innerHTML = '';
    const welcome = window.RVITM_Engine ? window.RVITM_Engine.getResponse('greet') : null;
    if (welcome) {
      addBot(welcome.text, welcome.buttons);
    }
    if (window.RVITM_Telemetry) {
      window.RVITM_Telemetry.logMicroInteraction('clear_chat', 'Chat Cleared');
    }
  }

  function toggleTTS() {
    isTTSOn = !isTTSOn;
    if (ttsBtn) {
      ttsBtn.classList.toggle('active', isTTSOn);
      ttsBtn.title = isTTSOn ? 'Voice Output: ON' : 'Voice Output: OFF';
    }
  }

  function speakText(htmlText) {
    if (!isTTSOn || !('speechSynthesis' in window)) return;
    const plain = htmlText.replace(/<[^>]+>/g, ' ').replace(/[•*#]/g, '').trim();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  function handleSend() {
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    hideTypeahead();
    sendQuery(text);
  }

  function sendQuery(queryText) {
    addUser(queryText);
    showTyping();

    setTimeout(() => {
      hideTyping();
      processBotResponse(queryText);
    }, 450);
  }

  function processBotResponse(queryText) {
    if (!window.RVITM_Engine) return;

    // 1. Content Moderation Guard
    const mod = window.RVITM_Engine.checkModeration(queryText);
    if (mod.blocked) {
      const warnReply = window.RVITM_Engine.getModerationResponse(mod.type);
      addBotWarn(warnReply);
      if (window.RVITM_Telemetry) {
        window.RVITM_Telemetry.logInteraction(queryText, 'blocked_' + mod.type, { blocked: true });
      }
      return;
    }

    // 2. Classify Intent (with Multi-Intent and Overflow resolution)
    const match = window.RVITM_Engine.classifyIntent(queryText);

    if (match.id) {
      let combinedText = '';
      let combinedButtons = [];

      // If multi-intent includes greeting alongside another query
      if (match.ids && match.ids.length > 1 && match.ids.includes('greet') && match.id !== 'greet') {
        const greetResp = window.RVITM_Engine.getResponse('greet');
        combinedText += greetResp.text + '<br><br>';
      }

      const resp = window.RVITM_Engine.getResponse(match.id);
      combinedText += resp.text;
      combinedButtons = (resp.buttons || []).slice();

      // If multiple distinct queries were asked, render overflow buttons (RVCE Parity)
      if (match.overflow && match.overflow.length > 0) {
        combinedButtons.push({ isDivider: true, text: '⬇️ Also Asked ⬇️' });
        match.overflow.forEach(ovId => {
          const label = (window.RVITM_Engine.INTENT_LABELS && window.RVITM_Engine.INTENT_LABELS[ovId])
            ? window.RVITM_Engine.INTENT_LABELS[ovId]
            : ovId;
          combinedButtons.push({ text: label, act: ovId, isOverflow: true });
        });
      }

      addBot(combinedText, combinedButtons);
      speakText(combinedText);

      if (window.RVITM_Telemetry) {
        window.RVITM_Telemetry.logInteraction(queryText, match.id, {
          matchedType: match.type,
          overflow: match.overflow || []
        });
      }
    } else {
      // Fallback with suggested topics
      const fallbackButtons = (match.suggestions || ['about', 'departments', 'placements', 'admissions']).map(id => {
        return {
          text: (window.RVITM_Engine.INTENT_LABELS && window.RVITM_Engine.INTENT_LABELS[id]) ? window.RVITM_Engine.INTENT_LABELS[id] : id,
          act: id
        };
      });

      const fallbackText = "I couldn't find an exact match for that query. Did you mean one of these topics?";
      addBot(fallbackText, fallbackButtons);

      if (window.RVITM_Telemetry) {
        window.RVITM_Telemetry.logInteraction(queryText, 'fallback', { suggestions: match.suggestions });
      }
    }
  }

  function addUser(text) {
    const wrap = document.createElement('div');
    wrap.className = 'msg-wrapper user';
    wrap.innerHTML = `
      <div class="msg-bubble">${escapeHtml(text)}</div>
      <div class="msg-meta">${formatTime()}</div>
    `;
    msgs.appendChild(wrap);
    scrollToBottom();
  }

  function addBot(text, buttons = []) {
    const wrap = document.createElement('div');
    wrap.className = 'msg-wrapper bot';

    let actionsHtml = '';
    if (buttons && buttons.length > 0) {
      actionsHtml = '<div class="msg-actions">';
      buttons.forEach(b => {
        if (b.isDivider) {
          actionsHtml += `<div class="overflow-divider"><span>${b.text}</span></div>`;
        } else if (b.url) {
          actionsHtml += `<a href="${b.url}" target="_blank" rel="noopener" class="act-btn"><span>${b.text}</span> ↗</a>`;
        } else {
          const cls = b.isOverflow ? 'act-btn overflow-btn' : 'act-btn';
          actionsHtml += `<button class="${cls}" data-act="${b.act}"><span>${b.text}</span></button>`;
        }
      });
      actionsHtml += '</div>';
    }

    wrap.innerHTML = `
      <div class="msg-bubble">${formatMd(text)}${actionsHtml}</div>
      <div class="msg-meta">RVITM Assistant • ${formatTime()}</div>
    `;
    msgs.appendChild(wrap);
    scrollToBottom();
  }

  function addBotWarn(text) {
    const wrap = document.createElement('div');
    wrap.className = 'msg-wrapper bot';
    wrap.innerHTML = `
      <div class="msg-bubble" style="border-left: 3px solid #f59e0b;">${formatMd(text)}</div>
      <div class="msg-meta">System • ${formatTime()}</div>
    `;
    msgs.appendChild(wrap);
    scrollToBottom();
  }

  function showTyping() {
    if (typing) typing.classList.add('show');
    scrollToBottom();
  }

  function hideTyping() {
    if (typing) typing.classList.remove('show');
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    });
  }

  function formatTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatMd(t) {
    return String(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(154,255,120,0.1);padding:1px 5px;border-radius:4px;">$1</code>');
  }

  function escapeHtml(t) {
    const div = document.createElement('div');
    div.textContent = t;
    return div.innerHTML;
  }

  /* Typeahead Popover */
  function handleTypeahead() {
    if (!typeahead || !input || !window.RVITM_Engine) return;
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      hideTypeahead();
      return;
    }

    const labels = window.RVITM_Engine.INTENT_LABELS || {};
    const matches = [];

    for (const [id, label] of Object.entries(labels)) {
      if (label.toLowerCase().includes(q) || id.toLowerCase().includes(q)) {
        matches.push({ id, label });
        if (matches.length >= 5) break;
      }
    }

    if (matches.length === 0) {
      hideTypeahead();
      return;
    }

    typeahead.innerHTML = matches.map(m => `<div class="typeahead-item" data-id="${m.id}">${m.label}</div>`).join('');
    typeahead.classList.remove('hidden');

    typeahead.onclick = (e) => {
      const item = e.target.closest('.typeahead-item');
      if (item && item.dataset.id) {
        input.value = '';
        hideTypeahead();
        sendQuery(item.dataset.id);
      }
    };
  }

  function hideTypeahead() {
    if (typeahead) typeahead.classList.add('hidden');
  }

  /* Voice Recognition (Web Speech API) */
  function toggleVoice() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Voice search is not supported by your current browser.");
      return;
    }

    if (isListening) {
      stopVoice();
      return;
    }

    recognition = new SpeechRec();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListening = true;
      if (micBtn) micBtn.classList.add('active');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (input) input.value = transcript;
      stopVoice();
      sendQuery(transcript);
    };

    recognition.onerror = () => stopVoice();
    recognition.onend = () => stopVoice();

    try {
      recognition.start();
    } catch (e) {
      stopVoice();
    }
  }

  function stopVoice() {
    isListening = false;
    if (micBtn) micBtn.classList.remove('active');
    if (recognition) {
      try { recognition.stop(); } catch (e) {}
    }
  }

  /* Deep Telemetry Micro-Interactions (RVCE Parity) */
  function bindDeepTelemetry() {
    if (!window.RVITM_Telemetry) return;

    // 1. Hover Tracking (interest signals on chips and buttons)
    let hoverTimer = null;
    document.addEventListener('mouseover', (e) => {
      const btn = e.target.closest('.act-btn, .suggestion-chip');
      if (btn) {
        hoverTimer = setTimeout(() => {
          window.RVITM_Telemetry.logMicroInteraction('hover', btn.textContent.trim().substring(0, 60), { element: btn.tagName });
        }, 500);
      }
    });
    document.addEventListener('mouseout', () => {
      if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
    });

    // 2. Copy Tracking (high-intent interaction)
    document.addEventListener('copy', () => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim()) {
        window.RVITM_Telemetry.logMicroInteraction('copy', sel.toString().trim().substring(0, 80));
      }
    });

    // 3. Typing Velocity (keystroke interval detector)
    let keyTimestamps = [];
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (keyTimestamps.length > 2) {
            const intervals = [];
            for (let i = 1; i < keyTimestamps.length; i++) {
              intervals.push(keyTimestamps[i] - keyTimestamps[i - 1]);
            }
            const avgMs = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
            const wpm = Math.round(60000 / (avgMs * 5));
            window.RVITM_Telemetry.logMicroInteraction('typing', `Velocity: ${avgMs}ms/key (~${wpm} WPM)`, { avgMs, wpm });
          }
          keyTimestamps = [];
        } else {
          keyTimestamps.push(Date.now());
        }
      });
    }

    // 4. Scroll Depth Tracking
    let maxScroll = 0;
    if (msgs) {
      msgs.addEventListener('scroll', () => {
        const total = msgs.scrollHeight - msgs.clientHeight;
        if (total > 0) {
          const pct = Math.round((msgs.scrollTop / total) * 100);
          if (pct > maxScroll + 20) {
            maxScroll = pct;
            window.RVITM_Telemetry.logMicroInteraction('scroll_depth', `Depth: ${maxScroll}%`, { depth: maxScroll });
          }
        }
      });
    }

    // 5. Dwell Time & Tab Visibility
    let chatOpenedAt = Date.now();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        window.RVITM_Telemetry.logMicroInteraction('visibility', 'Tab Hidden');
      } else {
        window.RVITM_Telemetry.logMicroInteraction('visibility', 'Tab Visible');
      }
    });

    window.addEventListener('beforeunload', () => {
      const dwellSec = Math.round((Date.now() - chatOpenedAt) / 1000);
      window.RVITM_Telemetry.logMicroInteraction('session_end', `Session Dwell: ${dwellSec}s`, { seconds: dwellSec });
    });
  }

  /* Particle Canvas Effect */
  function initParticles() {
    const cvs = document.getElementById('particles');
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    let pts = [];
    let w, h;

    function resize() {
      w = cvs.width = window.innerWidth;
      h = cvs.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 45; i++) {
      pts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 2 + 1,
        a: Math.random() * 0.4 + 0.1
      });
    }

    function render() {
      ctx.clearRect(0, 0, w, h);
      pts.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(154, 255, 120, ${p.a})`;
        ctx.fill();

        for (let j = i + 1; j < pts.length; j++) {
          const p2 = pts[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(94, 234, 212, ${0.15 * (1 - dist / 110)})`;
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(render);
    }
    render();
  }

  // DOM Ready Execution
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
