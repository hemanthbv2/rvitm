# RVITM AI Assistant & Analytics Command Center

> **Production-Grade Intelligent Chatbot & Telemetry Platform for RV Institute of Technology & Management (RVITM)**  
> Developed with complete algorithmic parity to the RVCE AI Chatbot, enriched with authentic institutional data, and styled in the official RVITM Midnight Navy & Electric Lime visual palette.

---

## 🌟 Key Highlights & Architecture

- **100% Algorithmic Parity with RVCE Chatbot**: Content moderation firewall, Levenshtein edit-distance typo tolerance, dot-stripping & acronym sanitization, composite intent resolution, dynamic faculty detective, multi-turn history stack, 0ms button-chip bypass, **Grammar & Stop-Words Filtering**, and **Multi-Intent Overflow Queue** with `"⬇️ Also Asked ⬇️"` action dividers.
- **Authoritative Institutional Tone**: Unified, clean, and professional tone designed for students, parents, and official campus visitors.
- **Institutional Accuracy (Zero Hallucination)**: Curated strictly from 28 official `rvitm.edu.in` pages, institutional circulars, VTU affiliation documents, AICTE EOA orders, and verified placement PDF reports.
- **100% Link Reachability**: All 141 institutional links, syllabus drives, and SAP Fiori fee payment portals validated and audited (0 broken links).
- **Dual-Write Telemetry & Command Center**: Real-time Node.js/Express backend with JWT-secured dashboard (`/dashboard/`), recording session transcripts, sentiment metrics, lead capture, and hourly traffic curves.
- **Ready for Deployment**: Single-click WordPress plugin (`rvitm-chatbot.zip`) and cloud-ready Vercel configuration (`vercel.json`).

---

## 🎨 Visual Identity & Color Palette

Derived directly from the official RVITM website theme:

| Element | Color Hex | Role |
| :--- | :--- | :--- |
| **Midnight Navy** | `#0C2635` | Primary brand background & header gradient |
| **Deep Space Abyssal** | `#071520` | Contrast dark borders & footer canvas |
| **Electric Lime Green** | `#9AFF78` | Action accents, glowing indicators & send triggers |
| **High-Tech Cyan** | `#5EEAD4` | Secondary gradient glow & chip hover states |
| **Emerald Spruce** | `#61CE70` | Interactive active buttons & success badges |
| **Deep Forest Spruce** | `#1F443D` | Widget shadow layers & message bubbles |

---

## 📊 Benchmark & Quality Metrics

Verified through automated benchmark suites:

- **Benchmark Accuracy**: **54 / 54 tests passed (100.0%)** across 17 evaluation categories.
- **Average Inference Latency**: **1.57 ms** per query.
- **Content Moderation Shield**: **3 / 3 (100%)** blocked abusive, speculative, and private inquiries.
- **Link Integrity Audit**: **141 / 141 healthy links (100% reachable)**.

```
Category Breakdown:
 • Conversational        : 3/3 (100%)
 • Institutional         : 5/5 (100%)
 • Admissions            : 4/4 (100%)
 • Placements            : 3/3 (100%)
 • Academics             : 12/12 (100%)
 • Composite Resolution  : 3/3 (100%)
 • Facilities            : 5/5 (100%)
 • Campus Life           : 2/2 (100%)
 • Governance            : 3/3 (100%)
 • Social Impact         : 1/1 (100%)
 • Community             : 1/1 (100%)
 • Regulatory            : 1/1 (100%)
 • Announcements         : 1/1 (100%)
 • Curriculum            : 1/1 (100%)
 • Typo Tolerance        : 4/4 (100%)
 • Sanitization          : 3/3 (100%)
 • Faculty Detective     : 2/2 (100%)
```

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
- **Node.js** v18+ installed.

### 2. Running Locally
Start the dual-write backend and test server:
```bash
npm install
node server.js
```

Open your browser:
- **Chatbot Interactive Client**: [http://localhost:3008/](http://localhost:3008/)
- **Command Center Dashboard**: [http://localhost:3008/dashboard/](http://localhost:3008/dashboard/)
  - *Default Admin Username*: `admin`
  - *Default Admin Password*: `admin@rvitm`

### 3. Running Verification Suites
- **Run Algorithmic Benchmark**:
  ```bash
  node scripts/benchmark_test.js
  ```
- **Run Live Link Audit**:
  ```bash
  node scripts/audit_links.js
  ```

---

## 📦 Deployment Options

### A. WordPress Plugin Installation
1. Locate `rvitm-chatbot.zip` in the root repository folder.
2. In your WordPress admin console, navigate to **Plugins > Add New > Upload Plugin**.
3. Choose `rvitm-chatbot.zip` and click **Install Now**.
4. Click **Activate Plugin**.
5. Navigate to **Settings > RVITM Chatbot** to customize telemetry backend endpoints and display triggers.

### B. Vercel Cloud Deployment
1. Connect this repository to your Vercel account.
2. Ensure the following environment variables are configured (optional, falls back gracefully to in-memory store):
   - `MONGODB_URI`: Connection string for MongoDB Atlas.
   - `JWT_SECRET`: Secure string for signing dashboard tokens.
   - `ADMIN_PASSWORD`: Custom dashboard password.
3. Deploy directly via `vercel --prod` or git push.

---

## 📁 Repository Structure

```
rvitm Chatbot/
├── dashboard/                  # Command Center Analytics UI
│   ├── login.html              # JWT authentication login
│   ├── index.html              # Live KPIs, volume charts & feed
│   ├── interactions.html       # Full searchable transcript viewer
│   ├── sessions.html           # User journey & session path auditor
│   └── analytics.html          # Branch interest & lead management
├── data/pages/                 # Scraped raw page text dumps (28 pages)
├── rvitm-chatbot/              # Standalone WordPress plugin source
├── rvitm-chatbot.css           # Authentic RVITM Midnight & Lime stylesheet
├── rvitm-chatbot.js            # Chatbot UI controller & event binder
├── rvitm-chatbot.php           # WordPress shortcode & hooks entry point
├── rvitm-chatbot.zip           # Production-ready WordPress plugin archive
├── rvitm-engine.js             # NLP classification & response engine
├── rvitm-knowledge-base.js     # Institutional data repository
├── scripts/
│   ├── audit_links.js          # HTTP reachability & anchor validator
│   └── benchmark_test.js       # 54-query algorithmic test suite
├── server.js                   # Node.js/Express API & telemetry backend
├── telemetry.js                # Dual-write beacon & telemetry client
├── vercel.json                 # Vercel serverless deployment config
└── README.md                   # System documentation
```

---

## 🛡️ License & Institutional Copyright
Developed for **RV Institute of Technology and Management (RVITM)**, Rashtreeya Sikshana Samithi Trust (RSST). All institution-specific logos, brochures, and syllabus data are the property of RVITM & RSST.
