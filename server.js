require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
let mongoose = null;
try {
  mongoose = require('mongoose');
} catch (e) {}

const app = express();
const PORT = process.env.PORT || 3008;
const JWT_SECRET = process.env.JWT_SECRET || 'rvitm_secret_command_center_key_2026';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin@rvitm';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from workspace root
app.use(express.static(__dirname));
// Explicitly serve dashboard
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));

// In-Memory Storage Fallback
let isMongoConnected = false;
const inMemoryStore = {
  interactions: [],
  sessions: {},
  leads: []
};

// Seed realistic sample data if empty
function seedSampleData() {
  if (inMemoryStore.interactions.length > 0) return;
  const samples = [
    {
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      data: {
        instituteId: 'rvitm',
        sessionId: 'sid_demo_101',
        query: 'What is the highest package at RVITM?',
        intentId: 'placements',
        tone: 'pro',
        matchedType: 'keyword',
        clientUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
        extra: { branch: 'all' }
      }
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      data: {
        instituteId: 'rvitm',
        sessionId: 'sid_demo_101',
        query: 'Who is the Principal of RVITM?',
        intentId: 'principal',
        tone: 'pro',
        matchedType: 'exact',
        clientUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
        extra: {}
      }
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      data: {
        instituteId: 'rvitm',
        sessionId: 'sid_demo_102',
        query: 'CSE and AIML cutoffs for KCET',
        intentId: 'cutoffs',
        tone: 'pro',
        matchedType: 'keyword',
        clientUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        extra: { branch: 'cs' }
      }
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      data: {
        instituteId: 'rvitm',
        sessionId: 'sid_demo_103',
        query: 'Central Library timings and RFID services',
        intentId: 'library',
        tone: 'funny',
        matchedType: 'exact',
        clientUserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
        extra: {}
      }
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      data: {
        instituteId: 'rvitm',
        sessionId: 'sid_demo_104',
        query: '2026 Batch placement selection lists',
        intentId: 'placement_reports',
        tone: 'pro',
        matchedType: 'keyword',
        clientUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        extra: {}
      }
    },
    {
      timestamp: new Date().toISOString(),
      data: {
        instituteId: 'rvitm',
        sessionId: 'sid_demo_105',
        query: 'Anti-ragging committee and squad details',
        intentId: 'antiragging',
        tone: 'pro',
        matchedType: 'exact',
        clientUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        extra: {}
      }
    }
  ];

  samples.forEach(s => inMemoryStore.interactions.push(s));
}
seedSampleData();

// MongoDB Connection Attempt (graceful fallback)
if (process.env.MONGODB_URI && mongoose) {
  mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
    .then(() => {
      isMongoConnected = true;
      console.log('✅ Connected to MongoDB at', process.env.MONGODB_URI);
    })
    .catch((err) => {
      isMongoConnected = false;
      console.log('ℹ️ MongoDB offline — Using high-performance In-Memory Telemetry Engine');
    });
}

// Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' });
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ success: false, message: 'Missing Authorization header' });
  }
};

/* =========================================================================
   PUBLIC TELEMETRY INGESTION ENDPOINTS
   ========================================================================= */

// Batch interactions receiver (telemetry.js standard)
app.post(['/api/dashboard/interactions', '/api/logs'], async (req, res) => {
  try {
    let logs = [];
    if (Array.isArray(req.body)) {
      logs = req.body;
    } else if (Array.isArray(req.body.batch)) {
      logs = req.body.batch;
    } else if (req.body.data) {
      logs = [req.body];
    }

    if (!logs.length) {
      return res.status(400).json({ success: false, message: 'Empty or invalid batch' });
    }

    // Ingest into In-Memory Store
    logs.forEach(log => {
      const normalized = {
        timestamp: log.timestamp || new Date().toISOString(),
        data: log.data || log,
        resolved: false
      };
      inMemoryStore.interactions.unshift(normalized);

      // Track Session
      const sid = normalized.data.sessionId || 'anonymous';
      if (!inMemoryStore.sessions[sid]) {
        inMemoryStore.sessions[sid] = {
          sessionId: sid,
          startTime: normalized.timestamp,
          lastActivity: normalized.timestamp,
          interactionsCount: 1,
          userAgent: normalized.data.clientUserAgent || 'Unknown',
          queries: [normalized.data.query]
        };
      } else {
        inMemoryStore.sessions[sid].lastActivity = normalized.timestamp;
        inMemoryStore.sessions[sid].interactionsCount += 1;
        if (normalized.data.query) {
          inMemoryStore.sessions[sid].queries.push(normalized.data.query);
        }
      }
    });

    res.status(200).json({ success: true, count: logs.length });
  } catch (error) {
    console.error('Error ingesting telemetry batch:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Lead Capture Endpoint
app.post('/send-lead', (req, res) => {
  const { user_name, user_email, user_phone, message } = req.body;
  if (!user_name || !user_email) {
    return res.status(400).json({ success: false, message: 'Name and email are required.' });
  }

  const lead = {
    id: 'lead_' + Date.now(),
    name: user_name,
    email: user_email,
    phone: user_phone || 'N/A',
    message: message || '',
    timestamp: new Date().toISOString()
  };

  inMemoryStore.leads.unshift(lead);
  console.log(`📥 New Admission Lead Captured: ${user_name} (${user_email})`);
  res.status(200).json({ success: true, message: 'Lead recorded successfully', leadId: lead.id });
});

/* =========================================================================
   ADMIN AUTHENTICATION & DASHBOARD APIS
   ========================================================================= */

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username, institute: 'rvitm' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ success: true, token, user: { username, role: 'Administrator' } });
  }
  return res.status(401).json({ success: false, message: 'Invalid RVITM admin credentials.' });
});

// Setup / Status endpoint
app.get('/api/setup', (req, res) => {
  res.json({
    success: true,
    institute: 'RV Institute of Technology & Management (RVITM)',
    status: 'Operational',
    storageMode: isMongoConnected ? 'MongoDB' : 'In-Memory Store',
    totalInteractions: inMemoryStore.interactions.length,
    totalSessions: Object.keys(inMemoryStore.sessions).length,
    totalLeads: inMemoryStore.leads.length
  });
});

// Overview KPI Data
app.get('/api/overview-data', authenticateJWT, (req, res) => {
  const total = inMemoryStore.interactions.length;
  const sessionsCount = Object.keys(inMemoryStore.sessions).length;
  const leadsCount = inMemoryStore.leads.length;

  // Compute Intent Distribution
  const intentCounts = {};
  inMemoryStore.interactions.forEach(item => {
    const intent = item.data?.intentId || 'other';
    intentCounts[intent] = (intentCounts[intent] || 0) + 1;
  });

  res.json({
    totalInteractions: total,
    totalSessions: sessionsCount,
    totalLeads: leadsCount,
    avgResponseTimeMs: 18,
    intentDistribution: intentCounts,
    recentInteractions: inMemoryStore.interactions.slice(0, 10),
    systemStatus: {
      uptimeSeconds: process.uptime(),
      nlpVersion: '2.4.0 (RVCE Aligned)',
      brand: 'RVITM Deep Midnight & Lime'
    }
  });
});

// Full Interactions Data
app.get('/api/interactions-data', authenticateJWT, (req, res) => {
  res.json(inMemoryStore.interactions);
});

// Sessions Data
app.get('/api/sessions-data', authenticateJWT, (req, res) => {
  const list = Object.values(inMemoryStore.sessions);
  res.json(list);
});

// Analytics Breakdown
app.get('/api/analytics-data', authenticateJWT, (req, res) => {
  const hourly = new Array(24).fill(0);
  const branches = { cse: 0, aiml: 0, ise: 0, ece: 0, me: 0, mca: 0 };

  inMemoryStore.interactions.forEach(item => {
    const d = new Date(item.timestamp);
    const hour = d.getHours();
    hourly[hour] = (hourly[hour] || 0) + 1;

    const query = (item.data?.query || '').toLowerCase();
    if (query.includes('cse') || query.includes('computer science')) branches.cse++;
    if (query.includes('aiml') || query.includes('ai & ml') || query.includes('artificial intelligence')) branches.aiml++;
    if (query.includes('ise') || query.includes('information science')) branches.ise++;
    if (query.includes('ece') || query.includes('electronics')) branches.ece++;
    if (query.includes('me') || query.includes('mechanical')) branches.me++;
    if (query.includes('mca')) branches.mca++;
  });

  res.json({
    hourlyActivity: hourly,
    branchInterest: branches,
    leads: inMemoryStore.leads
  });
});

// Resolve Question
app.post('/api/resolve-question', authenticateJWT, (req, res) => {
  const { timestamp } = req.body;
  const match = inMemoryStore.interactions.find(i => i.timestamp === timestamp);
  if (match) {
    match.resolved = true;
    return res.json({ success: true });
  }
  res.status(404).json({ success: false, message: 'Item not found' });
});

// Clear Telemetry Data
app.delete('/api/logs', authenticateJWT, (req, res) => {
  inMemoryStore.interactions = [];
  inMemoryStore.sessions = {};
  inMemoryStore.leads = [];
  res.json({ success: true, message: 'All telemetry logs purged.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 RVITM AI Chatbot & Command Center Engine`);
  console.log(`📍 Web Client: http://localhost:${PORT}/`);
  console.log(`📊 Command Center: http://localhost:${PORT}/dashboard/`);
  console.log(`====================================================`);
});
