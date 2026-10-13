/**
 * RVITM CONVERSATIONAL NLP ENGINE
 * Cloned and enhanced from the official RVCE Chatbot Engine Architecture
 * Data Source: RV Institute of Technology and Management (RVITM)
 * 
 * Core Algorithms:
 * 1. Content Moderation (Abusive, Personal Privacy, Conspiracy)
 * 2. Input Sanitization & Tokenization (Dot stripping e.g. c.s.e -> cse)
 * 3. Priority-Weighted Multi-keyword Intent Matching
 * 4. Levenshtein Fuzzy Distance Engine (Typo tolerance)
 * 5. Composite Intent Engine (Department + Placements/HOD/Labs)
 * 6. Dynamic Faculty Detective
 * 7. Multi-turn Context Memory & History NavStack
 * 8. 0ms Universal Button Bypass
 * 9. Dual-Tone Response Generator (Professional 🎓 vs Friendly 😄)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const KB = require('./rvitm-knowledge-base.js');
    module.exports = factory(KB);
  } else {
    root.RVITM_Engine = factory(root.RVITM_KB);
  }
}(typeof self !== 'undefined' ? self : this, function (KB) {
  'use strict';

  let tone = 'pro'; // 'pro' | 'funny'

  /* =========================================================================
     1. CONTENT MODERATION SYSTEM
     ========================================================================= */
  const BLOCKED = {
    abusive: [
      'fuck', 'shit', 'ass', 'bitch', 'bastard', 'damn', 'dick', 'pussy', 'slut', 'whore',
      'stupid', 'idiot', 'dumb', 'moron', 'retard', 'crap', 'screw you', 'shut up', 'suck',
      'hate you', 'loser', 'trash', 'worthless', 'ugly', 'go to hell', 'kill', 'murder',
      'rape', 'abuse', 'harass', 'molest', 'stalk', 'threat', 'bomb', 'attack', 'terror',
      'drug', 'weed', 'cocaine', 'heroin', 'alcohol', 'drunk', 'smoke', 'gambling', 'porn',
      'sex', 'nude', 'naked', 'obscene', 'vulgar', 'profanity', 'racist', 'sexist', 'bigot',
      'ass hole', 'wtf', 'stfu', 'lmao', 'lmfao', 'bloody', 'madarchod', 'behenchod',
      'chutiya', 'bc', 'mc', 'gaand', 'saala', 'kamina', 'haramkhor', 'bewakoof', 'gadha', 'hack'
    ],
    conspiracy: [
      'illuminati', 'flat earth', 'reptilian', 'chemtrail', '5g cause', 'qanon', 'deep state',
      'new world order', 'fake moon', 'area 51', 'aliens control', 'government mind control',
      'covid fake', 'vaccine microchip', 'bill gates chip', 'controlled demolition',
      'pizza gate', 'fake news media', 'rigged election', 'brainwash', 'propaganda',
      'freemason', 'secret society', 'population control', 'depopulation', 'mk ultra'
    ],
    private: [
      'student phone number', 'personal number', 'private email', 'home address',
      'student address', 'teacher address', 'salary of', 'faculty salary',
      'personal data', 'student marks', 'result of', 'cgpa of', 'gpa of',
      'marks of', 'percentage of', 'private detail', 'confidential', 'password',
      'bank detail', 'account number', 'aadhaar', 'pan card', 'dob of', 'date of birth of',
      'caste of', 'religion of', 'family of', 'father of', 'mother of', 'girlfriend',
      'boyfriend', 'relationship', 'married', 'wife of', 'husband of', "someone's phone",
      'whatsapp number', 'instagram id', 'social media of', 'facebook of'
    ]
  };

  function checkModeration(input) {
    const lower = input.toLowerCase();

    const isBlocked = (list) => {
      for (const word of list) {
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('(?:^|\\s)' + escaped + '(?=\\s|$|[?!.])', 'i');
        if (regex.test(lower)) return true;
      }
      return false;
    };

    if (isBlocked(BLOCKED.abusive)) return { blocked: true, type: 'abusive' };
    if (isBlocked(BLOCKED.conspiracy)) return { blocked: true, type: 'conspiracy' };
    if (isBlocked(BLOCKED.private)) return { blocked: true, type: 'private' };

    return { blocked: false };
  }

  function getModerationResponse(type) {
    const responses = {
      abusive: "⚠️ I am unable to respond to inappropriate or offensive language. Please keep questions focused on RVITM academic and campus details.",
      conspiracy: "⚠️ I am engineered to provide verified information regarding RVITM only. I cannot discuss unverified claims or conspiracy theories.",
      private: "⚠️ I cannot share personal or confidential information regarding individual students or staff members. I can assist with public department, admission, or placement queries."
    };
    return responses[type] || "⚠️ Invalid query.";
  }

  /* =========================================================================
     2. CONTEXT SESSION STATE
     ========================================================================= */
  const SESSION = {
    lastIntent: null,
    history: [],
    navStack: [],
    pendingOverflows: []
  };

  const PREFIXES = [
    "Sure thing!", "I can help with that!", "Got it!", "Great question.",
    "Here's what I found:", "Looking into that...", "Certainly!", "Happy to help."
  ];

  function getPrefix() {
    return PREFIXES[Math.floor(Math.random() * PREFIXES.length)] + " ";
  }

  /* =========================================================================
     3. INPUT SANITIZATION & ACRONYMS
     ========================================================================= */
  function sanitize(input) {
    if (!input) return '';
    let cleaned = input.replace(/\./g, ''); // Handles c.s.e -> cse, a.i.m.l -> aiml
    cleaned = cleaned.replace(/[^a-zA-Z0-9_\s]/g, ' ');
    return cleaned.replace(/\s+/g, ' ').trim();
  }

  const ABBR = {
    'prgm': 'ugPrograms', 'prgms': 'ugPrograms', 'prog': 'ugPrograms',
    'dept': 'departments', 'depts': 'departments',
    'adm': 'admissions', 'adms': 'admissions',
    'plcmnt': 'placements', 'plcmnts': 'placements',
    'hstl': 'hostels', 'hostl': 'hostels',
    'infra': 'facilities', 'amenities': 'facilities',
    'mgmt': 'management_quota',
    'princi': 'principal', 'vp': 'vice_principal',
    'cult': 'clubs', 'club': 'clubs',
    'soc': 'clubs',
    'fee': 'fees', 'fees': 'fees',
    'exam': 'exam', 'place': 'placements',
    'cse': 'dept_cs', 'cs': 'dept_cs',
    'aiml': 'dept_aiml', 'ai': 'dept_aiml',
    'ise': 'dept_is', 'is': 'dept_is',
    'ece': 'dept_ec', 'ec': 'dept_ec',
    'mech': 'dept_me', 'me': 'dept_me',
    'mca': 'dept_mca', 'ash': 'dept_ash',
    'plsemnt': 'placements', 'libry': 'library'
  };

  /* =========================================================================
     4. LEVENSHTEIN FUZZY DISTANCE ENGINE
     ========================================================================= */
  function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /* =========================================================================
     5. INTENT BANK (QA) WITH PRIORITY WEIGHTING
     ========================================================================= */
  const QA = [
    // P5: Greet & Farewell
    { k: ['hi', 'hello', 'hey', 'hii', 'hola', 'good morning', 'good evening', 'good afternoon', 'namaste', 'yo', 'sup', 'howdy', 'namaskara', 'rvitm bot', 'start'], id: 'greet', p: 5 },
    { k: ['bye', 'goodbye', 'thank you', 'thanks', 'thats all', 'see you', 'cya', 'take care', 'ok bye', 'okay bye', 'good night', 'tata', 'thanks a lot', 'exit'], id: 'bye', p: 5 },

    // P1: Core Institutional Topics
    { k: ['about', 'about rvitm', 'overview', 'know rvitm', 'college info', 'tell me about rvitm', 'what is rvitm', 'history', 'established', 'rv institute of technology and management', 'introduction', 'trust', 'rsst', 'rvei'], id: 'about', p: 1 },
    { k: ['principal', 'principal name', 'who is principal', 'head of institution', 'director of rvitm', 'who is the principal', 'about principal', 'dr nagashettappa biradar', 'nagashettappa'], id: 'principal', p: 1 },
    { k: ['vice principal', 'vice principal name', 'who is vice principal', 'about vice principal', 'dr manjunatha prasad', 'manjunatha prasad r', 'vp'], id: 'vice_principal', p: 0.8 },
    { k: ['leadership', 'management', 'rsst leadership', 'trustees', 'president', 'secretary', 'mp shyam', 'avs murthy', 'dp nagaraj'], id: 'leadership', p: 1 },
    { k: ['vision', 'mission', 'motto', 'college vision', 'rvitm vision', 'goal'], id: 'vision', p: 1 },

    // Admissions & Fees
    { k: ['admission', 'admissions', 'how to apply', 'admission process', 'eligibility', 'seat matrix', 'admission criteria', 'admission procedure', 'join rvitm', 'admission 2026', 'admission 2025', 'ug admission', 'b e admission'], id: 'admissions', p: 1 },
    { k: ['kcet', 'comedk', 'cet code', 'comedk code', 'cutoff', 'cutoffs', 'closing rank', 'rank required', 'kcet rank'], id: 'cutoffs', p: 1 },
    { k: ['management quota', 'management seat', 'direct admission', 'donation seat', 'mgmt quota', 'mq seat', 'institutional admission'], id: 'management_quota', p: 1 },
    { k: ['fee', 'fees', 'fee structure', 'tuition', 'college fees', 'annual fees', 'semester fee', 'how much fees', 'cost', 'online fee payment', 'pay fee'], id: 'fees', p: 1 },

    // Placements
    { k: ['placement', 'placements', 'package', 'packages', 'highest package', 'average package', 'salary', 'highest salary', 'top package', 'average salary', 'placement stats', 'placement record', 'recruiters', 'companies visited', 'placement percentage', 'placement rate', 'amazon', 'oracle', 'walmart', 'cisco', 'job opportunities'], id: 'placements', p: 1 },
    { k: ['placement report', 'placement reports', 'selection list', 'selected candidates', 'placed students', '2026 batch', '2025 batch', '2024 batch', 'batch list', 'placement pdf', 'placement flyer', 'batch selection', 'placement selection list', '2026 batch placement selection list'], id: 'placement_reports', p: 0.8 },
    { k: ['placement team', 'placement officer', 'placement director', 'ataullah', 'ranganath', 'mallanagouda patil', 'jayaramu', 'placement team and director'], id: 'placement_team', p: 0.8 },

    // Departments & Academics
    { k: ['department', 'departments', 'branches', 'courses', 'programs', 'all branches', 'engineering branches', 'ug programs', 'academics', 'streams', 'which branches'], id: 'departments', p: 1.2 },
    { k: ['hod', 'hods', 'head of department', 'heads of department', 'list of hods', 'all hods', 'who are the hods'], id: 'hods_list', p: 1.5 },
    { k: ['faculty', 'teachers', 'professors', 'teaching staff', 'faculty list', 'all faculty', 'lecturers'], id: 'faculty_list', p: 1.5 },
    { k: ['syllabus', 'curriculum', 'vtu scheme', 'subjects', 'course structure', 'academic syllabus', 'download syllabus', 'syllabus pdf', 'mca syllabus', 'ece scheme', 'cse syllabus', 'download syllabus mca ece'], id: 'syllabus', p: 0.8 },

    // Campus Facilities & Life
    { k: ['hostel', 'hostels', 'accommodation', 'boys hostel', 'girls hostel', 'hostel fee', 'dormitory', 'stay at rvitm', 'hostel facility', 'hostel food', 'mess'], id: 'hostels', p: 1 },
    { k: ['facility', 'facilities', 'infrastructure', 'campus', 'campus life', 'amenities', 'smart classrooms', 'labs', 'auditorium'], id: 'facilities', p: 1.2 },
    { k: ['library', 'central library', 'books', 'digital library', 'ieee xplore', 'vtu consortium', 'reading room', 'libsoft', 'turnitin', 'drillbit', 'library timings', 'library rules'], id: 'library', p: 1.1 },
    { k: ['sports', 'gym', 'gymnasium', 'badminton', 'games', 'vtu sports award', 'physical education', 'cricket', 'football'], id: 'sports', p: 1 },
    { k: ['canteen', 'cafeteria', 'food', 'food court', 'snacks', 'lunch', 'mess food'], id: 'canteen', p: 1 },
    { k: ['mental health', 'cadabams', 'helpline', 'counselling', 'student wellbeing', 'psychological support', 'cadabams hospital'], id: 'mental_health', p: 0.8 },
    { k: ['club', 'clubs', 'student clubs', 'extracurricular', 'ecx', 'robotics club', 'phoenix robotics', 'coding club', 'aegis', 'e-cell', 'rudra', 'kannada sangha', 'activities'], id: 'clubs', p: 1 },
    { k: ['transport', 'bus', 'bmtc', 'how to reach', 'route', 'metro', 'nearest metro', 'location', 'directions', 'address', 'jp nagar'], id: 'transport', p: 1 },
    { k: ['contact', 'phone', 'email', 'contact us', 'phone number', 'helpline', 'address', 'enquiry', 'office', 'landline', 'office hours'], id: 'contact', p: 0.8 },

    // Statutory Bodies, Governance & Approvals
    { k: ['aicte', 'affiliation', 'vtu affiliation', 'aicte approval', 'accreditation', 'accreditations', 'approvals', 'eoa', 'gok order', 'recognition'], id: 'accreditations', p: 1 },
    { k: ['circular', 'circulars', 'notification', 'notifications', 'academic calendar', 'exam circular', 'time table', 'latest updates', 'notices'], id: 'circulars', p: 1 },
    { k: ['committee', 'committees', 'statutory committee', 'discipline committee', 'dac', 'mpcc', 'governance'], id: 'committees', p: 1 },
    { k: ['anti ragging', 'ragging', 'ragging complaint', 'anti ragging squad', 'ragging helpline', 'anti ragging committee', 'arc', 'ars', 'zero tolerance anti ragging committee', 'zero tolerance'], id: 'antiragging', p: 0.7 },
    { k: ['grievance', 'grievance cell', 'grievance redressal', 'complaint', 'student grievance', 'posh', 'icc', 'women cell', 'harassment', 'online grievance redressal', 'aicte clause 1', 'online grievance redressal aicte clause 1'], id: 'grievance', p: 0.7 },
    { k: ['nss', 'national service scheme', 'nss unit', 'nss recruitment', 'nss unit recruitment', 'social service', 'lokesh p', 'abhaykumar inchal'], id: 'nss', p: 0.8 },
    { k: ['alumni', 'alumni network', 'alumni association', 'graduates', 'alumni portal'], id: 'alumni', p: 1 }
  ];

  /* Dynamically inject Branch Specific Intents */
  const allBranches = [
    { c: 'cs', code: 'CSE', n: 'Computer Science and Engineering', hod: 'Dr. Hema M S' },
    { c: 'aiml', code: 'AI&ML', n: 'Computer Science and Engineering (AI & ML)', hod: 'Dr. Surbhi Agrawal' },
    { c: 'is', code: 'ISE', n: 'Information Science and Engineering', hod: 'Dr. Vinoth Kumar M' },
    { c: 'ec', code: 'ECE', n: 'Electronics and Communication Engineering', hod: 'Dr. Manjunatha Prasad R' },
    { c: 'me', code: 'ME', n: 'Mechanical Engineering', hod: 'Dr. C. Solaimuthu' },
    { c: 'mca', code: 'MCA', n: 'Master of Computer Applications', hod: 'Dr. M. Mrunalini' },
    { c: 'ash', code: 'ASH', n: 'Applied Sciences and Humanities', hod: 'Dr. Gangadharaiah Y H' }
  ];

  // 1. Department Overview Intents
  allBranches.forEach(b => {
    const kws = [
      b.n.toLowerCase(),
      `department of ${b.code.toLowerCase()}`,
      `about ${b.code.toLowerCase()}`,
      `${b.code.toLowerCase()} branch`,
      `${b.code.toLowerCase()} details`
    ];
    if (b.c !== 'me') {
      kws.push(b.code.toLowerCase());
    }
    if (b.c === 'cs') kws.push('cse', 'computer science', 'comp sci');
    if (b.c === 'aiml') kws.push('aiml', 'aiml branch', 'aiml details', 'aiml branch details', 'ai and ml', 'ai ml', 'artificial intelligence', 'machine learning');
    if (b.c === 'is') kws.push('ise', 'information science', 'info science');
    if (b.c === 'ec') kws.push('ece', 'electronics', 'electronics and communication');
    if (b.c === 'me') kws.push('mechanical', 'mech', 'mechanical engineering');

    QA.push({ k: kws, id: `dept_${b.c}`, p: 0.9 });
  });

  // 2. Branch HOD Intents
  allBranches.forEach(b => {
    const kws = [
      `hod ${b.code.toLowerCase()}`,
      `${b.code.toLowerCase()} hod`,
      `head of ${b.code.toLowerCase()}`,
      `who is the hod of ${b.code.toLowerCase()}`,
      `who is ${b.code.toLowerCase()} hod`,
      b.hod.toLowerCase(),
      b.hod.toLowerCase().replace(/dr\.|prof\./gi, '').trim()
    ];
    if (b.c === 'cs') kws.push('cse hod', 'hod cse', 'computer science hod');
    if (b.c === 'aiml') kws.push('aiml hod', 'hod aiml', 'ai ml hod');
    if (b.c === 'is') kws.push('ise hod', 'hod ise', 'information science hod');
    if (b.c === 'ec') kws.push('ece hod', 'hod ece', 'electronics hod');
    if (b.c === 'me') kws.push('mechanical hod', 'mech hod');
    if (b.c === 'mca') kws.push('mca hod', 'hod mca');

    QA.push({ k: kws, id: `hod_${b.c}`, p: 0.4 });
  });

  // 3. Branch Placement Intents
  allBranches.forEach(b => {
    const kws = [
      `placement in ${b.code.toLowerCase()}`,
      `placements in ${b.code.toLowerCase()}`
    ];
    if (b.c !== 'me') {
      kws.push(
        `${b.code.toLowerCase()} placement`,
        `${b.code.toLowerCase()} placements`,
        `${b.code.toLowerCase()} salary`,
        `${b.code.toLowerCase()} package`
      );
    }
    if (b.c === 'cs') kws.push('cse placement', 'cse placements', 'computer science placement');
    if (b.c === 'aiml') kws.push('aiml placement', 'aiml placements', 'ai ml placement', 'aiml salary', 'aiml salary package', 'aiml package');
    if (b.c === 'is') kws.push('ise placement', 'ise placements');
    if (b.c === 'ec') kws.push('ece placement', 'ece placements');
    if (b.c === 'me') kws.push('mechanical placement', 'mech placement', 'mechanical salary', 'mechanical package', 'mech package');

    QA.push({ k: kws, id: `plcmt_${b.c}`, p: 0.4 });
  });

  // 4. Dynamically Inject Direct Faculty Search Intents
  const INTENT_LABELS = {
    'greet': '👋 Welcome to RVITM',
    'about': '🏛️ About RVITM',
    'principal': '👨‍💼 Principal Dr. Nagashettappa Biradar',
    'vice_principal': '👨‍💼 Vice Principal Dr. Manjunatha Prasad R',
    'leadership': '👥 RSST Leadership',
    'vision': '🎯 Vision & Mission',
    'departments': '📚 Academic Departments',
    'admissions': '🎓 Admissions & Eligibility',
    'cutoffs': '📊 CET & COMEDK Cutoffs',
    'management_quota': '🏛️ Management Quota Seats',
    'fees': '💳 Fee Structure & Online Payment',
    'placements': '💼 Placement Statistics (₹41.5 LPA)',
    'facilities': '🏢 Campus Infrastructure & Labs',
    'hostels': '🛏️ Hostels & Accommodation',
    'library': '📖 Central Library & E-Resources',
    'sports': '🏆 Sports & Gymnasium',
    'canteen': '☕ Cafeteria & Food',
    'mental_health': '🧠 24/7 Mental Health (Cadabams)',
    'clubs': '🚀 Student Clubs & Activities',
    'transport': '🚌 Transport & Campus Location',
    'contact': '📞 Contact & Helplines',
    'hods_list': '👔 Heads of Departments',
    'faculty_list': '👨‍🏫 Faculty Directory',
    'syllabus': '📜 Scheme & Syllabus Downloads',
    'placement_reports': '📑 Batch Placement Selection Lists',
    'placement_team': '💼 Training & Placement Cell Team',
    'accreditations': '📜 AICTE & VTU Accreditations',
    'circulars': '📢 Circulars & Academic Calendar',
    'committees': '⚖️ Statutory Institutional Committees',
    'antiragging': '🛡️ Zero-Tolerance Anti-Ragging Cell',
    'grievance': '📝 Online Grievance Redressal & POSH',
    'nss': '🤝 National Service Scheme (NSS Unit)',
    'alumni': '🌐 RVITM Alumni Network'
  };

  allBranches.forEach(b => {
    INTENT_LABELS[`dept_${b.c}`] = `📘 ${b.code} — ${b.n}`;
    INTENT_LABELS[`hod_${b.c}`] = `👔 HOD of ${b.code} (${b.hod})`;
    INTENT_LABELS[`plcmt_${b.c}`] = `💼 ${b.code} Placement Stats`;
  });

  if (KB.faculty) {
    Object.keys(KB.faculty).forEach(deptKey => {
      KB.faculty[deptKey].forEach(fac => {
        const full = fac.n.toLowerCase();
        const plain = fac.n.replace(/Dr\.|Prof\.|Mr\.|Mrs\.|Ms\./gi, '').trim().toLowerCase();
        const slug = fac.slug || full.replace(/[^a-z0-9]/g, '');
        QA.push({ k: [full, plain], id: `fac_${slug}`, p: 4 });
        INTENT_LABELS[`fac_${slug}`] = `👨‍🏫 ${fac.n} (${deptKey.toUpperCase()})`;
      });
    });
  }

  /* =========================================================================
     6. DYNAMIC FACULTY DETECTIVE
     ========================================================================= */
  function findFacultyMatch(input) {
    if (!input || !KB.faculty) return null;
    const sInput = sanitize(input).toLowerCase().replace(/[^a-z]/g, '');
    if (sInput.length < 4) return null;

    let bestMatch = null;
    let bestMatchLength = 0;

    for (const deptKey in KB.faculty) {
      for (const fac of KB.faculty[deptKey]) {
        const fSlug = (fac.slug || fac.n).toLowerCase().replace(/[^a-z]/g, '');
        const pSlug = fac.n.replace(/Dr\.|Prof\.|Mr\.|Mrs\.|Ms\./gi, '').toLowerCase().replace(/[^a-z]/g, '');

        if (sInput === fSlug || sInput === pSlug) {
          return `fac_${fac.slug || fSlug}`;
        }
        if (sInput.length > 5 && (sInput.includes(fSlug) || sInput.includes(pSlug))) {
          const matchLen = sInput.includes(fSlug) ? fSlug.length : pSlug.length;
          if (matchLen > bestMatchLength) {
            bestMatch = `fac_${fac.slug || fSlug}`;
            bestMatchLength = matchLen;
          }
        }
      }
    }
    return bestMatch;
  }

  function findFacultyBySlug(slug) {
    if (!KB.faculty) return null;
    for (const deptKey in KB.faculty) {
      for (const fac of KB.faculty[deptKey]) {
        const facSlug = (fac.slug || fac.n).toLowerCase().replace(/[^a-z0-9]/g, '');
        if (facSlug === slug || fac.slug === slug) {
          return { fac, dept: deptKey };
        }
      }
    }
    return null;
  }

  /* =========================================================================
     7. INTENT CLASSIFICATION & COMPOSITE RESOLUTION
     ========================================================================= */
  function classifyIntent(input) {
    let cleanInput = sanitize(input).toLowerCase();

    // Context Memory: Implicitly inject branch if user asks a topic within department view
    const contextualTopics = ['placement', 'hod', 'faculty', 'labs', 'syllabus', 'curriculum'];
    let strippedInput = cleanInput;
    if (SESSION.lastIntent && SESSION.lastIntent.startsWith('dept_')) {
      const hasTopic = contextualTopics.some(t => cleanInput.includes(t));
      const hasDeptMention = cleanInput.match(/cse|cs|aiml|ise|is|ece|ec|mech|me|mca/i);
      if (hasTopic && !hasDeptMention) {
        const branchCode = SESSION.lastIntent.replace('dept_', '');
        cleanInput += ` ${branchCode}`;
      }
    }

    // Stop words removal / Grammar words filtering (RVCE NLP Parity)
    const stopWords = [
      'the', 'is', 'are', 'was', 'were', 'for', 'a', 'an', 'of', 'in', 'to', 'and',
      'with', 'about', 'on', 'at', 'please', 'can', 'could', 'you', 'tell', 'me',
      'know', 'give', 'what', 'whats', 'how', 'where', 'which', 'who', 'i', 'want',
      'need', 'would', 'like', 'show', 'provide'
    ];
    strippedInput = cleanInput.split(' ').filter(w => !stopWords.includes(w)).join(' ');

    // 0. Abbreviation Check
    if (ABBR[cleanInput]) {
      return { type: 'exact', id: ABBR[cleanInput], suggestions: [] };
    }

    // 1. Universal Button-to-Intent Bypass (Instant 0ms latency for clicked suggestion chips)
    for (const [id, label] of Object.entries(INTENT_LABELS)) {
      if (sanitize(label).toLowerCase() === cleanInput) {
        return { type: 'exact', id, suggestions: [] };
      }
    }

    // Direct Department Name matching
    for (const b of allBranches) {
      if (sanitize(b.n).toLowerCase() === cleanInput || sanitize(b.code).toLowerCase() === cleanInput) {
        return { type: 'exact', id: `dept_${b.c}`, suggestions: [] };
      }
    }

    // Common Button Maps
    const BUTTON_MAP = {
      'ug programs': 'departments', 'branches': 'departments', 'all departments': 'departments',
      'admissions': 'admissions', 'apply online': 'admissions', 'fee details': 'fees',
      'placement stats': 'placements', 'highest package': 'placements',
      'campus facilities': 'facilities', 'hostels': 'hostels', 'student clubs': 'clubs',
      'contact details': 'contact', 'principal': 'principal', 'vice principal': 'vice_principal'
    };
    if (BUTTON_MAP[cleanInput]) {
      return { type: 'exact', id: BUTTON_MAP[cleanInput], suggestions: [] };
    }

    // 2. Exact match against QA bank
    for (const q of QA) {
      if (q.k.includes(cleanInput)) {
        return { type: 'exact', id: q.id, suggestions: [] };
      }
    }

    // 2.5 Dynamic Faculty Match
    const facId = findFacultyMatch(input);
    if (facId) {
      return { type: 'exact', id: facId, suggestions: [] };
    }

    // 3. Keyword-in-sentence & Levenshtein Fuzzy Matching
    let best = null, bestP = 99, bestL = 0;
    const matchedIntents = [];
    const intentIndices = {};

    for (const q of QA) {
      for (const k of q.k) {
        const escapedK = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('(?:^|\\s)' + escapedK + '(?=\\s|$)', 'i');

        let isMatch = regex.test(cleanInput) || regex.test(strippedInput);

        // Fuzzy typo tolerance for words longer than 4 chars
        const wordCount = strippedInput.split(' ').length;
        if (!isMatch && k.length > 4 && !k.includes(' ') && wordCount < 12) {
          const words = strippedInput.split(' ');
          for (const w of words) {
            if (w.length > 4) {
              const dist = levenshtein(w, k);
              if (dist <= 1 || (k.length >= 7 && dist <= 2)) {
                isMatch = true;
                break;
              }
            }
          }
        }

        if (isMatch) {
          const idx = cleanInput.indexOf(k.toLowerCase());

          // Negation Detection
          if (idx !== -1) {
            const preceding = cleanInput.substring(Math.max(0, idx - 20), idx);
            if (/\b(not|no|don't|dont|without|excluding|except)\b/i.test(preceding)) {
              continue;
            }
          }

          matchedIntents.push(q);
          if (!(q.id in intentIndices)) intentIndices[q.id] = cleanInput.length;
          if (idx !== -1 && idx < intentIndices[q.id]) intentIndices[q.id] = idx;

          if (q.p < bestP || (q.p === bestP && k.length > bestL)) {
            best = q.id;
            bestP = q.p;
            bestL = k.length;
          }
        }
      }
    }

    // 4. Composite & Multi-Intent Resolution (RVCE Parity)
    let isComposite = false;
    if (matchedIntents.length > 1) {
      const matchedIds = matchedIntents.map(q => q.id);
      const existingComposite = matchedIds.find(id => id.startsWith('plcmt_') || id.startsWith('hod_'));

      if (existingComposite) {
        best = existingComposite;
        isComposite = true;
      } else {
        const deptMatches = matchedIds.filter(id => id.startsWith('dept_')).sort((a, b) => b.length - a.length);
        const deptMatch = deptMatches[0];

        if (deptMatch) {
          const branchCode = deptMatch.replace('dept_', '');
          if (matchedIds.includes('placements') || cleanInput.includes('placement') || cleanInput.includes('package') || cleanInput.includes('salary')) {
            best = `plcmt_${branchCode}`;
            isComposite = true;
          } else if (matchedIds.includes('hods_list') || cleanInput.includes('hod') || cleanInput.includes('head')) {
            best = `hod_${branchCode}`;
            isComposite = true;
          } else if (matchedIds.includes('faculty_list') || cleanInput.includes('faculty') || cleanInput.includes('professor')) {
            best = `dept_${branchCode}`;
            isComposite = true;
          }
        }
      }
    }

    // 4.5 Multi-Intent Resolution: if not a composite, check for multiple distinct major intents
    if (matchedIntents.length > 1 && !isComposite) {
      // Sort chronologically based on where the keyword appeared in the text
      matchedIntents.sort((a, b) => (intentIndices[a.id] || 0) - (intentIndices[b.id] || 0));

      const uniqueIds = Array.from(new Set(matchedIntents.map(q => q.id)));
      const topIntents = uniqueIds
        .map(id => QA.find(q => q.id === id))
        .filter(q => q && q.p <= 1.5 && q.id !== 'departments' && q.id !== 'about' && q.id !== 'facilities');

      if (topIntents.length > 1) {
        const allIds = topIntents.map(q => q.id);
        const multiIds = allIds.slice(0, 1);
        const overflowIds = allIds.slice(1);

        if (matchedIntents.some(q => q.id === 'greet')) {
          if (!multiIds.includes('greet')) multiIds.unshift('greet');
        }

        return { type: 'multi', ids: multiIds, id: multiIds[0], overflow: overflowIds, suggestions: [] };
      }
    }

    if (best) {
      if (matchedIntents.some(q => q.id === 'greet') && best !== 'greet') {
        return { type: 'multi', ids: ['greet', best], id: best, overflow: [], suggestions: [] };
      }
      return { type: 'keyword', id: best, suggestions: [] };
    }

    // 5. Fallback Suggestions via Levenshtein on Topics
    const suggestions = findSuggestions(cleanInput);
    return { type: null, id: null, suggestions };
  }

  function findSuggestions(input) {
    if (!input || input.length < 3) return ['about', 'departments', 'placements', 'admissions'];
    const candidates = [
      { id: 'admissions', label: 'Admissions & Eligibility' },
      { id: 'placements', label: 'Placement Records & Packages' },
      { id: 'departments', label: 'Engineering Departments' },
      { id: 'fees', label: 'Fee Structure' },
      { id: 'cutoffs', label: 'KCET & COMEDK Cutoffs' },
      { id: 'hostels', label: 'Campus Hostels' },
      { id: 'clubs', label: 'Student Clubs & Activities' },
      { id: 'library', label: 'Digital Library & E-Resources' },
      { id: 'committees', label: 'Statutory Committees & Anti-Ragging' },
      { id: 'nss', label: 'NSS Social Service' },
      { id: 'contact', label: 'Contact Us & Campus Address' }
    ];

    const scored = candidates.map(c => {
      const dist = levenshtein(input, c.id);
      return { ...c, dist };
    });

    scored.sort((a, b) => a.dist - b.dist);
    return scored.slice(0, 3).map(s => s.id);
  }

  /* =========================================================================
     8. DUAL-TONE RESPONSE GENERATOR
     ========================================================================= */
  function T(funnyText, proText) {
    return proText || funnyText;
  }

  function getResponse(id) {
    SESSION.lastIntent = id;
    SESSION.history.push(id);

    // Dynamic Faculty Detail Intent
    if (id.startsWith('fac_')) {
      const slug = id.replace('fac_', '');
      const match = findFacultyBySlug(slug);
      if (match) {
        return renderFacultyCard(match.fac, match.dept);
      }
    }

    // Dynamic Department Overview Intent
    if (id.startsWith('dept_')) {
      const branchCode = id.replace('dept_', '');
      const branch = allBranches.find(b => b.c === branchCode);
      const ugData = KB.departments.ug.find(b => b.c === branchCode) ||
                     KB.departments.pg.find(b => b.c === branchCode) ||
                     KB.departments.foundational.find(b => b.c === branchCode);
      if (ugData) {
        return renderDepartmentCard(ugData);
      }
    }

    // Dynamic Branch HOD Intent
    if (id.startsWith('hod_')) {
      const branchCode = id.replace('hod_', '');
      const ugData = KB.departments.ug.find(b => b.c === branchCode) ||
                     KB.departments.pg.find(b => b.c === branchCode) ||
                     KB.departments.foundational.find(b => b.c === branchCode);
      if (ugData) {
        return renderHODCard(ugData);
      }
    }

    // Dynamic Branch Placement Intent
    if (id.startsWith('plcmt_')) {
      const branchCode = id.replace('plcmt_', '');
      const branch = allBranches.find(b => b.c === branchCode);
      if (branch) {
        const s = KB.placements.stats;
        return {
          text: T(
            `💼 **${branch.code} Placements**<br>RVITM-wide: highest **${s.highestPackage}**, average **${s.averagePackage}**, **${s.placementRate}** placed. Branch-wise numbers are in the batch-wise placement reports on the official placement page! 📊`,
            `💼 **${branch.code} — Placement Information**<br><br>• **Institute Highest Package:** ${s.highestPackage}<br>• **Institute Average Package:** ${s.averagePackage}<br>• **Placement Rate:** ${s.placementRate}<br><br>Branch-wise figures are published in the batch-wise placement reports (2020–24, 2021–25, 2022–26) on the official placement page.`
          ),
          buttons: [
            { text: "📊 Overall Placements", act: "placements" },
            { text: "🌐 Placement Reports", url: KB.placements.placementPage },
            { text: "📘 Dept Overview", act: `dept_${branchCode}` }
          ]
        };
      }
    }

    // Core Curated Responses
    switch (id) {
      case 'greet':
        return {
          text: T(
            `Hey there! 👋 Welcome to **RVITM Assistant**! Looking for placement packages, cutoff ranks, hostel details, or who heads which department? Ask away or pick a quick topic below! 😄`,
            `Welcome to **RVITM Official Assistant** (RV Institute of Technology and Management, Bengaluru).<br>How may I assist you today? You can inquire about admissions, departments, placements, leadership, or campus facilities.`
          ),
          buttons: [
            { text: "💼 Placements (₹41.5 LPA)", act: "placements" },
            { text: "🎓 Admissions 2026", act: "admissions" },
            { text: "📚 Departments", act: "departments" },
            { text: "🏢 Campus Facilities", act: "facilities" }
          ]
        };

      case 'bye':
        return {
          text: T(
            `Catch you later! 🚀 Good luck with your engineering journey at RVITM! If you ever need more info, just tap my icon! ✨`,
            `Thank you for contacting RVITM. Wishing you the very best in your academic pursuits. Feel free to return if you require further assistance.`
          ),
          buttons: [
            { text: "📋 Main Menu", act: "greet" }
          ]
        };

      case 'about':
        return {
          text: T(
            `🏛️ **About RVITM**: Born in 2019 under the legendary **RSST (RV Educational Institutions)** family, we're an ultra-modern tech powerhouse in JP Nagar 8th Phase, Bengaluru! Affiliated to VTU Belagavi and AICTE approved, we feature high-tech labs, top placements, and a 24/7 Cadabams student wellbeing helpline! 🌟`,
            `🏛️ **RV Institute of Technology and Management (RVITM)**<br><br>• **Established:** 2019<br>• **Management:** Rashtreeya Sikshana Samithi Trust (RSST)<br>• **Affiliation:** Visvesvaraya Technological University (VTU), Belagavi<br>• **Approvals:** AICTE & Government of Karnataka<br>• **Campus:** Chaithanya Layout, 8th Phase, J.P. Nagar, Bengaluru – 560076<br>• **Ecosystem:** Enjoys the rich 80+ year heritage of RVEI with joint placement synergy alongside RVCE.`
          ),
          buttons: [
            { text: "👨‍💼 Leadership", act: "leadership" },
            { text: "📚 Departments", act: "departments" },
            { text: "💼 Placements", act: "placements" },
            { text: "📞 Contact Us", act: "contact" }
          ]
        };

      case 'principal':
        return {
          text: T(
            `👨‍💼 **Meet the Captain of the Ship!**<br>Our Principal is **Dr. Nagashettappa Biradar**! A veteran visionary driving RVITM's cutting-edge labs, research initiatives, and stellar student achievements! 🎓`,
            `👨‍💼 **Principal — RVITM**<br><br>**Dr. Nagashettappa Biradar**<br>Principal, RV Institute of Technology and Management<br>• **Focus:** Academic excellence, experiential learning, industry immersion, and innovation.<br>• **Email:** \`principal.rvitm@rvei.edu.in\`<br>• **Office:** Principal's Secretariat, Administrative Block, RVITM Campus.`
          ),
          buttons: [
            { text: "👨‍💼 Vice Principal", act: "vice_principal" },
            { text: "👥 RSST Leadership", act: "leadership" },
            { text: "🏛️ About RVITM", act: "about" }
          ]
        };

      case 'vice_principal':
        return {
          text: T(
            `👨‍💼 **Vice Principal & ECE Dynamo!**<br>**Dr. Manjunatha Prasad R** is our Vice Principal as well as Professor & Head of Electronics & Communication Engineering! ⚡`,
            `👨‍💼 **Vice Principal — RVITM**<br><br>**Dr. Manjunatha Prasad R**<br>Vice Principal, Professor & Head of ECE<br>• **Department:** Electronics & Communication Engineering<br>• **Role:** Oversees academic administration, student mentoring, and departmental growth.`
          ),
          buttons: [
            { text: "👨‍💼 Principal", act: "principal" },
            { text: "📘 ECE Department", act: "dept_ec" },
            { text: "👔 All HODs", act: "hods_list" }
          ]
        };

      case 'leadership':
        return {
          text: T(
            `👥 **The Visionaries behind RVITM (RSST Trust):**<br><br>• **President:** Dr. M. P. Shyam<br>• **Hon. Secretary:** Dr. (h.c.) A. V. S. Murthy<br>• **Hon. Joint Secretary:** Mr. D. P. Nagaraj<br>• **Principal:** Dr. Nagashettappa Biradar<br>• **Vice Principal:** Dr. Manjunatha Prasad R<br><br>Guided by Gandhian ethics and futuristic engineering vision! 🎯`,
            `👥 **Leadership & Governance — RSST / RVITM**<br><br>• **President (RSST):** Dr. M. P. Shyam<br>• **Hon. Secretary (RSST):** Dr. (h.c.) A. V. S. Murthy<br>• **Hon. Joint Secretary (RSST):** Mr. D. P. Nagaraj<br>• **Principal (RVITM):** Dr. Nagashettappa Biradar<br>• **Vice Principal:** Dr. Manjunatha Prasad R<br><br>Governed under the aegis of Rashtreeya Sikshana Samithi Trust (founded in 1940).`
          ),
          buttons: [
            { text: "👨‍💼 Principal", act: "principal" },
            { text: "🎯 Vision & Mission", act: "vision" },
            { text: "🏛️ About College", act: "about" }
          ]
        };

      case 'vision':
        return {
          text: T(
            `🎯 **Vision**: To impart top-quality technical education with global competence and societal commitment, leading to breakthrough innovations!<br><br>🚀 **Mission**: To nurture passionate engineers through experiential learning, cutting-edge labs, and ICT-powered pedagogy!`,
            `🎯 **Vision of RVITM**<br>To impart top-quality technical education with global competence and societal commitment, leading to breakthrough innovations.<br><br>🌱 **Mission of RVITM**<br>Our mission is to nurture passionate engineers through experiential learning by providing state-of-the-art infrastructure and ICT-enabled education.`
          ),
          buttons: [
            { text: "📚 Academic Branches", act: "departments" },
            { text: "🏛️ About RVITM", act: "about" }
          ]
        };

      case 'departments':
        return {
          text: T(
            `📚 **Pick Your Tech Passion at RVITM!**<br>We offer top industry-aligned engineering programs with dedicated GPU clusters, VLSI suites, and smart robotics labs! Tap below to explore:`,
            `📚 **Academic Departments — RVITM**<br><br>**Undergraduate Programmes (B.E.):**<br>1. Computer Science and Engineering (CSE)<br>2. CSE — Artificial Intelligence & Machine Learning (AI&ML)<br>3. Information Science and Engineering (ISE)<br>4. Electronics and Communication Engineering (ECE)<br>5. Mechanical Engineering (ME)<br><br>**Postgraduate Programme:**<br>• Master of Computer Applications (MCA)<br><br>**Foundational:**<br>• Applied Sciences & Humanities (ASH)`
          ),
          buttons: [
            { text: "💻 CSE", act: "dept_cs" },
            { text: "🤖 AI & ML", act: "dept_aiml" },
            { text: "🌐 ISE", act: "dept_is" },
            { text: "⚡ ECE", act: "dept_ec" },
            { text: "⚙️ ME", act: "dept_me" },
            { text: "📱 MCA", act: "dept_mca" }
          ]
        };

      case 'admissions':
        return {
          text: T(
            `🎓 **Ready to Join RVITM? Here is How!**<br><br>• **KCET (Karnataka):** Via KEA counselling<br>• **COMED-K (All India):** Apply via COMED-K counseling<br>• **Management Quota:** Merit-based institutional seats via RSST Central Office<br>• **MCA:** Via PGCET / KMAT<br><br>💡 Pro-tip: RVITM shares campus placement drives with RVCE!`,
            `🎓 **Admissions Pathways — RVITM**<br><br>• **Undergraduate (B.E.):**<br>  1. **KCET (KEA):** Karnataka domicile seats via KEA counselling<br>  2. **COMED-K:** All-India Merit Entrance Examination<br>  3. **Management Quota:** Direct institutional admissions based on merit & eligibility (contact central admissions).<br><br>• **Postgraduate (MCA):**<br>  1. **PGCET (KEA)** & KMAT Entrance Examination.<br><br>• **Eligibility (B.E.):** 10+2 / PUC with Physics and Mathematics (min 45% aggregate; 40% for reserved category).`
          ),
          buttons: [
            { text: "📊 Cutoffs", act: "cutoffs" },
            { text: "💳 Fee Structure", act: "fees" },
            { text: "🏛️ Management Quota", act: "management_quota" },
            { text: "📞 Admissions Helpline", act: "contact" }
          ]
        };

      case 'cutoffs':
        return {
          text: T(
            `📊 **Cutoff Insights!**<br>Cutoff ranks change every counselling round, so check the official KEA and COMED-K portals for this year's numbers. You can also call the college on 080-35095100.`,
            `📊 **Cutoff Ranks & Counseling Information**<br><br>• **Admitting Authorities:** Karnataka Examinations Authority (KEA) & COMED-K Board.<br><br>Exact closing cutoffs vary per counseling round. Refer to official KEA (cetonline.karnataka.gov.in) and COMED-K portals.`
          ),
          buttons: [
            { text: "🎓 Admission Routes", act: "admissions" },
            { text: "💳 Fees Structure", act: "fees" },
            { text: "💼 Placements", act: "placements" }
          ]
        };

      case 'management_quota':
        return {
          text: T(
            `🏛️ **Management Quota Admissions**:<br>Institutional direct admissions are processed transparently on merit through the **RSST Central Admissions Office**. Early registration is strongly recommended as seats for CSE, AIML, and ISE are limited!`,
            `🏛️ **Management Quota (Institutional Admission)**<br><br>• Available for B.E. and MCA programmes based on qualifying marks and entrance performance.<br>• Managed centralized by the **Rashtreeya Sikshana Samithi Trust (RSST)**.<br>• **Helpline:** 080-35095100 / \`info.rvitm@rvei.edu.in\`<br>• **Campus Location:** Chaithanya Layout, JP Nagar 8th Phase, Bengaluru.`
          ),
          buttons: [
            { text: "💳 Fee Details", act: "fees" },
            { text: "📞 Contact Admissions", act: "contact" },
            { text: "💼 Placements Overview", act: "placements" }
          ]
        };

      case 'fees':
        return {
          text: T(
            `💳 **RVITM Fees & Payments**:<br>Fees depend on your entry channel (KCET Government quota has regulated university rates, while COMED-K and Management seats have standard consortium slabs).<br>Convenient **Online Fee Payment** is available directly via the official RVEI SAP Fiori payment gateway! 🏦`,
            `💳 **Fee Structure & Payment Modes — RVITM**<br><br>• **Fee Categorization:**<br>  - **KCET Quota:** Prescribed statutory fees by Government of Karnataka / KEA.<br>  - **COMED-K Quota:** Prescribed statutory fees by COMED-K consortium.<br>  - **Management Quota:** Contact RSST Central Office for branch-specific annual fee structures.<br><br>• **Online Payment Portal:** Secure online fee gateway accessible through the official RVEI SAP Fiori portal.`
          ),
          buttons: [
            { text: "🔗 Online Payment", act: "fees_online" },
            { text: "🎓 Admission Routes", act: "admissions" },
            { text: "🛏️ Hostel Fees", act: "hostels" }
          ]
        };

      case 'fees_online':
        return {
          text: `🔗 You can pay tuition and examination fees online via the official RVEI SAP Fiori payment portal: <a href="https://wds-prd.rvei.edu.in:4430/sap/bc/ui5_ui5/ui2/ushell/shells/abap/Fiorilaunchpad.html" target="_blank" rel="noopener" style="color: #9aff78; font-weight: 600; text-decoration: underline;">Open RVEI Online Fee Portal ↗</a>`,
          buttons: [
            { text: "💳 Fee Overview", act: "fees" },
            { text: "📞 Contact Accounts", act: "contact" }
          ]
        };

      case 'placements':
        return {
          text: T(
            `💼 **Placement Heavyweights!** 💥<br><br>• 🏆 **Highest Package:** **₹41.5 LPA**<br>• 📈 **Average Package:** **₹12.27 LPA**<br>• 🎯 **Placement Rate:** **80%+**<br>• 🏢 **Companies Annually:** **200+**<br><br>🔥 **The Big Advantage:** RVITM shares a centralized placement ecosystem with RVCE! Dream recruiters like Amazon, Oracle, Walmart, Cisco, Qualcomm, Samsung, PhonePe, and JPMorgan hire right on campus!`,
            `💼 **Career & Placement Overview — RVITM**<br><br>• **Highest Package:** **₹41.5 LPA**<br>• **Average Package:** **₹12.27 LPA**<br>• **Placement Percentage:** **80%+**<br>• **Recruiting Companies:** **200+ Organizations**<br><br>⭐ **Strategic RV Synergy:**<br>RVITM students benefit from a joint, centralized placement ecosystem with RVCE, providing access to premier multinational corporations.<br><br>• **Top Recruiters:** Amazon, Oracle, Walmart, Cisco, PhonePe, Nutanix, Qualcomm, Samsung Semiconductors, Philips, JPMorgan Chase, Deutsche Bank, Infosys, Wipro, Accenture.`
          ),
          buttons: [
            { text: "💻 CSE Placements", act: "plcmt_cs" },
            { text: "🤖 AI&ML Placements", act: "plcmt_aiml" },
            { text: "🌐 ISE Placements", act: "plcmt_is" },
            { text: "⚡ ECE Placements", act: "plcmt_ec" },
            { text: "⚙️ ME Placements", act: "plcmt_me" }
          ]
        };

      case 'facilities':
        return {
          text: T(
            `🏢 **Next-Gen Campus Perks!**<br><br>• 🖥️ **Smart Classrooms:** Acoustically treated, digital multimedia boards.<br>• 🔬 **Advanced Labs:** GPU clusters, CAD/VLSI suites, Robotics setups.<br>• 📖 **Central Library:** High-tech book stacks + IEEE & VTU e-journals.<br>• 🛏️ **Hostels:** Wi-Fi, biometric security, tasty dining.<br>• ☕ **Cafeteria:** Fresh snacks & meals.<br>• 🧠 **24/7 Mental Health Helpline:** Partnered with Cadabams Hospital!<br>• 🏆 **Sports:** Gym & grounds (VTU Sports Award winners)!`,
            `🏢 **Infrastructure & Campus Facilities — RVITM**<br><br>• **Smart Classrooms:** Fully air-conditioned, digitally integrated lecture theatres.<br>• **Laboratories:** Branch-specific labs with cutting-edge hardware & software suites.<br>• **Central Library:** Comprehensive print stacks with IEEE Xplore, ScienceDirect, and VTU Consortium e-resources.<br>• **Hostel Accommodation:** Separate Boys and Girls hostels with 24/7 security, high-speed Wi-Fi, and hygienic dining.<br>• **Cadabams Helpline:** 24/7 Student Wellbeing Helpline in official partnership with Cadabams Hospital.<br>• **Sports & Fitness:** Indoor badminton, table tennis, modern gymnasium, and sports coaching.`
          ),
          buttons: [
            { text: "🛏️ Hostels", act: "hostels" },
            { text: "📖 Central Library", act: "library" },
            { text: "🧠 Cadabams Helpline", act: "mental_health" },
            { text: "🏆 Sports", act: "sports" }
          ]
        };

      case 'hostels':
        return {
          text: T(
            `🛏️ **Home Away From Home!**<br>Separate on-campus and proximate Boys & Girls hostels with biometric security, high-speed Wi-Fi, power backup, study rooms, and hygienic dining serving both North & South Indian meals! 🍛`,
            `🛏️ **Hostel & Residential Facilities — RVITM**<br><br>• **Accommodation:** Dedicated Boys and Girls hostels near the campus.<br>• **Amenities:** High-speed internet/Wi-Fi, 24/7 biometric security, continuous water & power backup.<br>• **Mess:** Hygienic dining hall providing nutritious vegetarian meals (North and South Indian menus).<br>• **Recreation:** Common rooms with indoor games, reading space, and warden oversight.`
          ),
          buttons: [
            { text: "🏢 All Facilities", act: "facilities" },
            { text: "💳 Fee Information", act: "fees" },
            { text: "📞 Contact Hostel Office", act: "contact" }
          ]
        };

      case 'library':
        return {
          text: T(
            `📖 **RVITM Hybrid Library & Digital Hub!** 📚<br><br>• 🕒 **Timings:** 9:00 AM – 5:00 PM on all working days<br>• 🤖 **Automation:** LIBSOFT LMS with RFID checkout & OPAC<br>• 💻 **Digital Lab:** 10 computer terminals + high-speed Wi-Fi<br>• 🔍 **Plagiarism Tools:** Turnitin & DrillBit available for students<br>• 🌐 **E-Resources:** IEEE Xplore, ScienceDirect, Springer, Taylor & Francis, Emerald Insight<br>• 👨‍💼 **Librarian:** Dr. A. Nagaraja (Ph.D.)`,
            `📖 **Central Digital Library & Information Centre — RVITM**<br><br>• **Working Hours:** 9:00 AM to 5:00 PM on all working days.<br>• **Automation:** LIBSOFT Library Management System with RFID surveillance & circulation.<br>• **Terminals:** 10 dedicated multimedia computer terminals for digital library & research access.<br>• **Plagiarism Services:** Turnitin & DrillBit tools deployed for student & faculty academic integrity.<br>• **Subscribed E-Journals:** IEEE Xplore, ScienceDirect (Elsevier), Springer Link, Taylor & Francis, Emerald Insight.<br>• **E-Books & MOOCs:** Cambridge Univ Press, Elsevier, Packt, Swayam, NPTEL, Coursera.<br>• **Librarian:** Dr. A. Nagaraja (B.Sc., M.L.I.Sc., Ph.D.)`
          ),
          buttons: [
            { text: "🌐 Library Portal", url: "https://rvitm.edu.in/departments/library-2/" },
            { text: "📄 Librarian Profile", url: "https://rvitm.edu.in/wp-content/uploads/2026/05/Resume.pdf" },
            { text: "🏢 Campus Facilities", act: "facilities" },
            { text: "📚 Academic Departments", act: "departments" }
          ]
        };

      case 'sports':
        return {
          text: T(
            `🏆 **Champions in Action!**<br>RVITM won the prestigious **VTU Institutional Sports Achievement Award**! We have badminton courts, table tennis, cricket & football training, and an equipped gym! 🥇`,
            `🏆 **Sports & Physical Education — RVITM**<br><br>• **Recognition:** Honored with the **VTU Institutional Sports Achievement Award** for remarkable inter-collegiate performances.<br>• **Facilities:** Indoor badminton courts, table tennis, modern fitness gym, outdoor cricket/football fields.<br>• **Activities:** Annual sports meets, VTU tournament participation, and athletic conditioning.`
          ),
          buttons: [
            { text: "🚀 Student Clubs", act: "clubs" },
            { text: "🏢 Campus Facilities", act: "facilities" }
          ]
        };

      case 'canteen':
        return {
          text: T(
            `☕ **Cafeteria Hangout!**<br>The college cafeteria serves delicious South Indian dosas, meals, coffee, tea, and quick bites throughout the day in a clean, vibrant dining area! 🍽️`,
            `☕ **Campus Cafeteria & Dining**<br><br>• Clean, spacious cafeteria providing healthy vegetarian breakfast, lunch, and refreshments.<br>• Adheres to stringent food safety and hygiene protocols.`
          ),
          buttons: [
            { text: "🏢 Campus Facilities", act: "facilities" },
            { text: "🛏️ Hostels", act: "hostels" }
          ]
        };

      case 'mental_health':
        return {
          text: T(
            `🧠 **We Care About You!**<br>RVITM has a pioneering **24/7 Mental Health Helpline** in official partnership with **Cadabams Hospital**. Confidential, professional counseling whenever students need guidance! 💚`,
            `🧠 **Student Mental Health & Wellbeing — Cadabams Partnership**<br><br>• RVITM provides a 24/7 confidential mental health and psychological counseling helpline for all students in collaboration with **Cadabams Hospital**.<br>• Ensures emotional wellbeing, stress management, exam anxiety coping, and holistic student support.`
          ),
          buttons: [
            { text: "🏢 Campus Facilities", act: "facilities" },
            { text: "📞 Contact College", act: "contact" }
          ]
        };

      case 'clubs':
        return {
          text: T(
            `🚀 **Student Clubs at RVITM!**<br><br>• ⚡ **ECX:** Electronics & Hardware Hacking<br>• 🤖 **Phoenix Robotics:** Combat & Autonomous Bots<br>• 💻 **Coding Club:** Hackathons & Competitive Coding<br>• 🛡️ **Aegis:** Cybersecurity & CTF<br>• 💡 **E-Cell:** Startups & Entrepreneurship<br>• 🎭 **Rudra:** Dramatics & Street Theatre<br>• 💛 **Kannada Sangha:** Regional Culture & Literature<br>• 🎨 **Cultural Club:** Dance & Music<br>• 🧗 **Adventure Club:** Treks & Outdoor Thrills<br>• 🤝 **NSS:** Social Impact & Drives`,
            `🚀 **Student Clubs & Co-Curricular Life — RVITM**<br><br>• **Technical Clubs:** ECE Club (ECX), Phoenix Robotics Club, Coding Club, Aegis (Cybersecurity).<br>• **Innovation:** E-Cell (Entrepreneurship Cell) for startup incubation and venture pitching.<br>• **Cultural & Fine Arts:** Rudra (Theatre & Dramatics), Cultural Club (Music & Dance), Kannada Sangha.<br>• **Social Impact & Recreation:** NSS (National Service Scheme), Adventure Activities Club, Science Club, Magazine Club.`
          ),
          buttons: [
            { text: "🏆 Sports Achievements", act: "sports" },
            { text: "🏢 Campus Facilities", act: "facilities" },
            { text: "📚 Departments", act: "departments" }
          ]
        };

      case 'transport':
        return {
          text: T(
            `🚌 **Find Us!**<br>RVITM is in **Chaithanya Layout, 8th Phase, JP Nagar, Bengaluru – 560076**. Call 080-35095100 for directions and college transport details! 🗺️`,
            `🚌 **Location — RVITM**<br><br>• **Campus Address:** RV Institute of Technology & Management, Chaithanya Layout, 8th Phase, J.P. Nagar, Bengaluru – 560076, Karnataka.<br>• **Enquiries on transport / directions:** 080-35095100.`
          ),
          buttons: [
            { text: "📞 Contact Us", act: "contact" },
            { text: "🏛️ About RVITM", act: "about" }
          ]
        };

      case 'contact':
        return {
          text: T(
            `📞 **RVITM Contact Directory & Helpdesk!**<br><br>• 📱 **Direct Mobile:** +91 8951758140<br>• ☎️ **Campus Landlines:** 080-35095100, 35095101, 35095102, 35095103, 35095104<br>• ⏰ **Office Hours:** Mon–Fri 09:00 AM – 05:00 PM | Sat 09:00 AM – 02:00 PM<br>• ✉️ **General Info:** \`info.rvitm@rvei.edu.in\`<br>• 🎓 **Admissions:** \`admissions.rvitm@rvei.edu.in\`<br>• 👨‍💼 **Principal:** \`principal.rvitm@rvei.edu.in\`<br>• 📍 **Campus:** Chaithanya Layout, 8th Phase, J.P. Nagar, Bengaluru – 560076.`,
            `📞 **Official Directory & Enquiries — RVITM**<br><br>• **Direct Mobile Helpline:** +91 8951758140<br>• **Campus Reception & Landlines:** 080-35095100, 080-35095101, 080-35095102, 080-35095103, 080-35095104<br>• **Office Working Hours:** Monday to Friday (09:00 AM – 05:00 PM) | Saturday (09:00 AM – 02:00 PM)<br>• **General Enquiries:** \`info.rvitm@rvei.edu.in\`<br>• **Admissions Desk:** \`admissions.rvitm@rvei.edu.in\`<br>• **Principal's Secretariat:** \`principal.rvitm@rvei.edu.in\`<br>• **Campus Location:** Chaithanya Layout, 8th Phase, J.P. Nagar, Bengaluru – 560076, Karnataka.`
          ),
          buttons: [
            { text: "🎓 Admission Routes", act: "admissions" },
            { text: "🚌 Location & Transport", act: "transport" },
            { text: "🏛️ About RVITM", act: "about" }
          ]
        };

      case 'placement_reports':
        return {
          text: T(
            `📑 **Official Placement Selection Lists!** 🎯<br><br>RVITM publishes transparent candidate selection lists every year:<br><br>• 📄 **2022–2026 Batch:** 202 Candidates Selected<br>• 📄 **2021–2025 Batch:** 172 Candidates Selected<br>• 📄 **2020–2024 Batch:** 181 Candidates Selected<br><br>Tap below to view or download the verified PDF reports! 📊`,
            `📑 **Batch Placement Records & Selection Lists — RVITM**<br><br>Official batch-wise selection lists published by the RVITM Training and Placement Cell:<br><br>• **2022–2026 Batch Selection List:** 202 Candidates Placed<br>• **2021–2025 Batch Selection List:** 172 Candidates Placed<br>• **2020–2024 Batch Selection List:** 181 Candidates Placed<br><br>All figures are documented in official university selection lists.`
          ),
          buttons: [
            { text: "📄 2026 Batch Selection (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/09/RVITM_SelectionList_2026-Batch_15thSept_2026_202_Candidates.pdf" },
            { text: "📄 2025 Batch Selection (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/RVITM_SelectionList_2025-Batch_23rdAugust2025_172_Candidates_Updated.pdf" },
            { text: "📄 2024 Batch Selection (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/RVITM_SelectionList_2024-Batch_19th_Sep2024_181_Candidates-2.pdf" },
            { text: "📊 Placement Statistics (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/08/Placement_Statistics-All-Batches-HS-and-History-of-Baklogs-Candidates-Excluded.docx.pdf" },
            { text: "👥 Placement Team", act: "placement_team" }
          ]
        };

      case 'placement_team':
        return {
          text: T(
            `💼 **The Placement Powerhouse Team!** 🤝<br><br>• 👔 **Director (Placement, RVCE):** Dr. Ranganath D<br>• 👔 **Deputy Director (Placements & Training, RVITM):** MD Ataullah<br>• ⚙️ **Engineering Placement Coordinator:** Dr. Mallanagouda Patil<br>• 📱 **MCA Placement Coordinator:** Prof. Jayaramu M<br><br>They coordinate centralised recruitment across top global tech companies! 🚀`,
            `💼 **Training & Placement Cell Leadership — RVITM**<br><br>• **Director, Placement (RVCE):** Dr. Ranganath D<br>• **Deputy Director, Placements & Training (RVITM):** MD Ataullah<br>• **Placement Coordinator for Engineering (RVITM):** Dr. Mallanagouda Patil<br>• **Placement Coordinator for MCA (RVITM):** Prof. Jayaramu M<br><br>The team manages industry collaborations, centralized internship drives, and corporate training programs.`
          ),
          buttons: [
            { text: "💼 Overall Placements", act: "placements" },
            { text: "📑 Batch Selection Lists", act: "placement_reports" },
            { text: "🌐 Placement Page", url: "https://rvitm.edu.in/placement/" }
          ]
        };

      case 'syllabus':
        return {
          text: T(
            `📜 **Curriculum & Syllabus Downloads!** 🎓<br><br>All programmes follow the updated **VTU Belagavi** credit curriculum. You can download official schemes and syllabus PDFs below:`,
            `📜 **VTU Curriculum & Syllabus Documents — RVITM**<br><br>Programmes are affiliated with Visvesvaraya Technological University (VTU) and adhere to the prescribed choice-based credit system.<br><br>Download official department syllabi:`
          ),
          buttons: [
            { text: "📄 MCA 1st Sem Syllabus", url: "https://rvitm.edu.in/wp-content/uploads/2026/05/MCA-2024-Syllabus-1st-semester.pdf" },
            { text: "📄 MCA 2nd Year Syllabus", url: "https://rvitm.edu.in/wp-content/uploads/2026/08/MCA-2nd-year-Syllabus.pdf" },
            { text: "📄 ECE Scheme (Sem 3–4)", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/ecesch_3_4.pdf" },
            { text: "📄 CSE Brochure & POs", url: "https://rvitm.edu.in/wp-content/uploads/2026/04/E-Brochure-1.pdf" },
            { text: "📚 Academic Departments", act: "departments" }
          ]
        };

      case 'accreditations':
        return {
          text: T(
            `📜 **Recognitions & Approvals!** ✅<br><br>• 🏛️ **AICTE Approval:** Continuous Extension of Approval (EoA) from 2019 to 2026-27!<br>• 🏛️ **VTU Belagavi:** Official affiliation across all B.E. & MCA programmes, plus recognized Research Centres!<br>• 🏛️ **Govt. of Karnataka:** Approved through official government orders and NOCs.`,
            `📜 **Accreditations, Affiliations & Regulatory Approvals — RVITM**<br><br>• **AICTE Approval:** Continuous Extension of Approval (EoA) from 2019 to 2026-27 adhering to national infrastructure and faculty norms.<br>• **VTU Affiliation:** Officially affiliated with Visvesvaraya Technological University (VTU), Belagavi, with validated degree awarding authority.<br>• **VTU Research Centres:** Recognized research centres in Basic Sciences and engineering streams.<br>• **Government of Karnataka (GoK):** Formal No Objection Certificates (NOC) and approval orders.`
          ),
          buttons: [
            { text: "📄 AICTE EoA 2026-27 (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/06/EOA-2026-27.pdf" },
            { text: "📄 VTU Affiliation 2025-26 (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/Affiliation-2025-26.pdf" },
            { text: "📄 GoK Order All Courses (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/GOK-order-all-courses.pdf" },
            { text: "🏛️ About RVITM", act: "about" }
          ]
        };

      case 'circulars':
        return {
          text: T(
            `📢 **Latest Circulars & Notifications!** 🗓️<br><br>Check out all official institutional notices organized by category on the RVITM circulars desk:<br><br>• 📅 Academic Calendar & Semester Schedules<br>• 📝 Examination Time Tables & Result Updates<br>• 📢 Academic & Department Circulars<br>• 🎓 Admission Notices & Cutoff Slabs`,
            `📢 **Circulars & Institutional Notifications — RVITM**<br><br>Official circulars and notices published by the RVITM administration:<br><br>1. **Academic Calendar:** Annual schedule, semester timelines, and holidays.<br>2. **Examination Circulars:** Time tables, hall ticket schedules, and results.<br>3. **Academic Circulars:** Department updates and curriculum notices.<br>4. **Admission Circulars:** Admission schedules, quota details, and procedures.`
          ),
          buttons: [
            { text: "🌐 Open Circulars Desk", url: "https://rvitm.edu.in/circular_and_notifications/" },
            { text: "🎓 Admissions 2026", act: "admissions" },
            { text: "📞 Contact Admin", act: "contact" }
          ]
        };

      case 'committees':
        return {
          text: T(
            `⚖️ **Governance & Statutory Committees!** 🛡️<br><br>RVITM maintains strict statutory committees headed by senior professors:<br><br>• 🚫 **Anti-Ragging Committee:** Zero-tolerance campus discipline<br>• 📝 **Online Grievance Redressal:** AICTE Act compliant student portal<br>• 🌸 **Women Empowerment & POSH:** Safe campus environment<br>• ⚖️ **Disciplinary Action & Malpractice Committees**`,
            `⚖️ **Statutory Committees & Governance — RVITM**<br><br>Constituted in accordance with AICTE, UGC, and VTU regulations:<br><br>• **Disciplinary Action Committee (DAC):** Convenor — Dr. Manjunatha Prasad R (Vice Principal)<br>• **Malpractice Cases Consideration Committee (MPCC):** Convenor — Dr. Hema M S (HOD CSE)<br>• **Institute Development & Planning Committee:** Convenor — Dr. Malini M. Patil (Dean, CSE Cluster)<br>• **Online Grievance Redressal Committee:** Convener — Dr. Prashant P. P. (Professor, ECE)<br>• **Anti-Ragging Committee (ARC):** Chairman — Dr. Nagashettappa Biradar (Principal)<br>• **Women Empowerment Cell & POSH:** Chairperson — Dr. Latha C. A. (Professor, ISE)`
          ),
          buttons: [
            { text: "🛡️ Anti-Ragging Cell", act: "antiragging" },
            { text: "📝 Grievance Redressal", act: "grievance" },
            { text: "🌐 Committees Webpage", url: "https://rvitm.edu.in/committee/" }
          ]
        };

      case 'antiragging':
        return {
          text: T(
            `🛡️ **Zero-Tolerance Anti-Ragging Cell!** 🚫<br><br>Ragging in any form is strictly banned across RVITM! Continuous surveillance is maintained by the Anti-Ragging Squad.<br><br>• 👨‍💼 **Chairman:** Dr. Nagashettappa Biradar (Principal)<br>• 👔 **Convener:** Dr. Gangadharaiah Y. H. (ASH HOD)<br>• 👮 **Police Nominee:** Sri Babu KV, Sub Inspector (8123442381)<br>• 🕵️ **Anti-Ragging Squad Convener:** Dr. Nagbhabushan P.`,
            `🛡️ **Anti-Ragging Committee & Squad — RVITM**<br><br>RVITM enforces a strict zero-tolerance policy against ragging in compliance with AICTE and UGC regulations.<br><br>• **Chairman:** Dr. Nagashettappa Biradar (Principal)<br>• **Deputy Chairman:** Dr. Manjunatha Prasad R (Vice Principal)<br>• **Convener:** Dr. Gangadharaiah Y. H. (Professor & Head, ASH)<br>• **Police Department Nominee:** Sri Babu KV, Sub Inspector of Police (Ph: 8123442381)<br>• **Anti-Ragging Squad (ARS) Convener:** Dr. Nagbhabushan P. (Assistant Professor, Mathematics)<br>• The squad conducts surprise checks across classrooms, laboratories, and hostels.`
          ),
          buttons: [
            { text: "📄 Anti-Ragging Policy (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/Anti-Ragging-web.pdf" },
            { text: "📝 Grievance Redressal", act: "grievance" },
            { text: "📞 Contact Principal", act: "contact" }
          ]
        };

      case 'grievance':
        return {
          text: T(
            `📝 **Online Grievance Redressal & POSH Cell!** 🤝<br><br>• ⚖️ **Mandate:** Constituted under AICTE Act Clause 1, Section 23<br>• 👨‍💼 **Convener:** Dr. Prashant P. P. (Professor, ECE)<br>• ✉️ **Online Submission:** \`principal.rvitm@rvei.edu.in\`<br>• 🌸 **Women Concerns:** Addressed exclusively by women faculty led by Dr. Latha C. A. and clinical psychologist Dr. Padmakshi L!`,
            `📝 **Online Grievance Redressal & POSH Mechanism — RVITM**<br><br>• **Statutory Compliance:** Constituted pursuant to AICTE Act Clause 1 Section 23.<br>• **Convener:** Dr. Prashant P. P. (Professor, Department of ECE).<br>• **Submission Channel:** Formal grievances may be submitted online to \`principal.rvitm@rvei.edu.in\`.<br>• **Women Grievance / POSH:** Handled exclusively by women faculty members under the Women Empowerment Cell chaired by Dr. Latha C. A., with external clinical psychologist Dr. Padmakshi L.`
          ),
          buttons: [
            { text: "📄 Grievance Cell Notification (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/Institute-Online-Grievances-Cell-2025-26.docx.pdf" },
            { text: "🛡️ Anti-Ragging Cell", act: "antiragging" },
            { text: "📞 Contact Us", act: "contact" }
          ]
        };

      case 'nss':
        return {
          text: T(
            `🤝 **National Service Scheme (NSS Unit RVITM)!** 🇮🇳<br><br>• 🌟 **Motto:** *"Not Me But You"*<br>• 👨‍💼 **Coordinators:** Dr. Lokesh P. (9632389355) & Mr. Abhaykumar S. Inchal (9449608448)<br>• ✉️ **Email:** \`nssunit.rvitm@rvei.edu.in\`<br>• 📅 **Enrollment:** Starts 2nd or 3rd week of August every year with personal interviews!<br>• 🌱 **Drives:** Blood donation, rural education, tree planting, and sustainability!`,
            `🤝 **National Service Scheme (NSS) — RVITM Unit**<br><br>• **Motto:** "Not Me But You"<br>• **Programme Officers (2025–26):**<br>  - Dr. Lokesh P. (NSSO-I, Assistant Professor, ME) — 9632389355<br>  - Mr. Abhaykumar S. Inchal (NSSO-II, Assistant Professor, ISE) — 9449608448<br>• **Email:** \`nssunit.rvitm@rvei.edu.in\`<br>• **Recruitment:** Annual enrollments occur in the 2nd/3rd week of August followed by VTU submission.<br>• **Initiatives:** Community outreach, blood donation camps, environmental drives, and digital literacy.`
          ),
          buttons: [
            { text: "🌐 NSS Webpage", url: "https://rvitm.edu.in/nss/" },
            { text: "🚀 Student Clubs", act: "clubs" },
            { text: "🏢 Campus Facilities", act: "facilities" }
          ]
        };

      case 'alumni':
        return {
          text: T(
            `🌐 **RVITM Global Alumni Network!** 🎓<br><br>Connecting graduates across top tech firms, startups, and higher research worldwide!<br><br>• 💡 **Mentorship:** Industry guidance from seniors<br>• 💼 **Internship Referrals:** Corporate connects<br>• 🤝 **Alumni Meets:** Networking sessions throughout the year!`,
            `🌐 **Alumni Network & Community — RVITM**<br><br>The RVITM Alumni Network connects graduates worldwide across software, hardware, entrepreneurship, and research.<br><br>• **Objectives:** Industry mentorship, guest lectures, internship referrals, and career guidance.<br>• **Portal Access:** Open to all RVITM alumni for lifelong networking and campus collaboration.`
          ),
          buttons: [
            { text: "🌐 Alumni Portal", url: "https://rvitm.edu.in/alumni/" },
            { text: "💼 Placement Records", act: "placements" },
            { text: "🏛️ About RVITM", act: "about" }
          ]
        };

      case 'hods_list':
        return {
          text: T(
            `👔 **Meet the Heads of Departments at RVITM!**<br><br>• 💻 **CSE:** Dr. Hema M S<br>• 🤖 **AI & ML:** Dr. Surbhi Agrawal<br>• 🌐 **ISE:** Dr. Vinoth Kumar M<br>• ⚡ **ECE:** Dr. Manjunatha Prasad R (Vice Principal)<br>• ⚙️ **ME:** Dr. C. Solaimuthu<br>• 📱 **MCA:** Dr. M. Mrunalini<br>• 🔬 **ASH:** Dr. Gangadharaiah Y H`,
            `👔 **Academic Heads of Departments (HODs) — RVITM**<br><br>• **Computer Science & Engineering (CSE):** Dr. Hema M S<br>• **CSE — Artificial Intelligence & ML (AI&ML):** Dr. Surbhi Agrawal<br>• **Information Science & Engineering (ISE):** Dr. Vinoth Kumar M<br>• **Electronics & Communication Engineering (ECE):** Dr. Manjunatha Prasad R (Vice Principal)<br>• **Mechanical Engineering (ME):** Dr. C. Solaimuthu<br>• **Master of Computer Applications (MCA):** Dr. M. Mrunalini<br>• **Applied Sciences & Humanities (ASH):** Dr. Gangadharaiah Y H`
          ),
          buttons: [
            { text: "💻 CSE HOD", act: "hod_cs" },
            { text: "🤖 AI&ML HOD", act: "hod_aiml" },
            { text: "⚡ ECE HOD", act: "hod_ec" },
            { text: "🌐 ISE HOD", act: "hod_is" },
            { text: "⚙️ ME HOD", act: "hod_me" }
          ]
        };

      case 'faculty_list':
        return {
          text: T(
            `👨‍🏫 **Over 100+ Renowned Faculty Members!**<br>RVITM faculty members are active researchers with doctorates from top universities and prestigious journal publications. Which department's faculty would you like to explore?`,
            `👨‍🏫 **Faculty Directory — RVITM**<br>RVITM houses over 100 dedicated faculty members across engineering, computer applications, and basic sciences.<br>Select a department to view faculty profiles:`
          ),
          buttons: [
            { text: "💻 CSE Faculty", act: "dept_cs" },
            { text: "🤖 AI&ML Faculty", act: "dept_aiml" },
            { text: "🌐 ISE Faculty", act: "dept_is" },
            { text: "⚡ ECE Faculty", act: "dept_ec" },
            { text: "⚙️ ME Faculty", act: "dept_me" },
            { text: "📱 MCA Faculty", act: "dept_mca" }
          ]
        };

      default:
        return {
          text: T(
            `Hmm, I didn't quite catch that. Could you rephrase your question? Here are some top topics you can explore:`,
            `I apologize, but I could not find a direct answer to your specific query. Please choose from the topics below or rephrase your question:`
          ),
          buttons: [
            { text: "💼 Placements (₹41.5 LPA)", act: "placements" },
            { text: "🎓 Admissions 2026", act: "admissions" },
            { text: "📚 Departments", act: "departments" },
            { text: "📞 Contact Us", act: "contact" }
          ]
        };
    }
  }

  /* =========================================================================
     9. CARD RENDERERS (Department, HOD, Faculty)
     ========================================================================= */
  function renderDepartmentCard(d) {
    const facCount = (KB.faculty && KB.faculty[d.c]) ? KB.faculty[d.c].length : 0;
    return {
      text: `📘 **${d.code} — ${d.n}**<br><br>` +
            `• **Head of Department:** ${d.hod} (${d.hodTitle})<br>` +
            (d.intake ? `• **Annual Intake:** ${d.intake} seats<br>` : '') +
            `• **Key Focus:** ${d.focusAreas.slice(0, 3).join(', ')}<br>` +
            `• **Labs:** ${d.labs.join(', ')}<br>` +
            `• **Faculty Strength:** ${facCount} dedicated professors<br><br>` +
            `<em>${d.overview}</em>`,
      buttons: [
        { text: `💼 ${d.code} Placements`, act: `plcmt_${d.c}` },
        { text: `👔 HOD Details`, act: `hod_${d.c}` },
        { text: `🌐 Official Dept Webpage`, url: d.url },
        { text: `📚 All Departments`, act: "departments" }
      ]
    };
  }

  function renderHODCard(d) {
    return {
      text: `👔 **Head of Department — ${d.code}**<br><br>` +
            `**${d.hod}**<br>` +
            `• **Title:** ${d.hodTitle}<br>` +
            `• **Department:** ${d.n}<br>` +
            `• **Institution:** RV Institute of Technology and Management (RVITM)<br><br>` +
            `The department under ${d.hod}'s leadership prioritizes hands-on project incubation, industry-backed curriculum, and experiential learning.`,
      buttons: [
        { text: `📘 ${d.code} Overview`, act: `dept_${d.c}` },
        { text: `💼 ${d.code} Placements`, act: `plcmt_${d.c}` },
        { text: `👔 All HODs`, act: "hods_list" }
      ]
    };
  }

  function renderFacultyCard(f, deptKey) {
    const deptName = {
      'cse': 'Computer Science and Engineering',
      'aiml': 'Computer Science & Engineering (AI & ML)',
      'ise': 'Information Science and Engineering',
      'ece': 'Electronics and Communication Engineering',
      'me': 'Mechanical Engineering',
      'mca': 'Master of Computer Applications',
      'ash': 'Applied Sciences and Humanities'
    }[deptKey] || deptKey.toUpperCase();

    return {
      text: `👨‍🏫 **Faculty Profile**<br><br>` +
            `**${f.n}**<br>` +
            `• **Department:** ${deptName}<br>` +
            `• **Institution:** RVITM, Bengaluru<br><br>` +
            `For complete research publications, teaching portfolio, and contact details, view the official faculty bio below.`,
      buttons: [
        { text: `📄 View Bio on RVITM Portal`, url: f.u },
        { text: `📘 ${deptKey.toUpperCase()} Dept`, act: `dept_${deptKey}` },
        { text: `👨‍🏫 Faculty Directory`, act: "faculty_list" }
      ]
    };
  }

  /* Public Engine API */
  return {
    classifyIntent,
    getResponse,
    checkModeration,
    getModerationResponse,
    getPrefix,
    setTone: (t) => { tone = (t === 'funny') ? 'funny' : 'pro'; },
    getTone: () => tone,
    getSession: () => SESSION,
    INTENT_LABELS
  };
}));
