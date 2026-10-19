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
    let PAGES = null;
    try { PAGES = require('./rvitm-pages-index.js'); } catch (e) {}
    module.exports = factory(KB, PAGES);
  } else {
    root.RVITM_Engine = factory(root.RVITM_KB, root.RVITM_PAGES);
  }
}(typeof self !== 'undefined' ? self : this, function (KB, PAGES) {
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
    'prgm': 'departments', 'prgms': 'departments', 'prog': 'departments',
    'dept': 'departments', 'depts': 'departments',
    'course': 'departments', 'courses': 'departments', 'cource': 'departments', 'cources': 'departments', 'corse': 'departments',
    'coursesb': 'barch', 'coursesb arch': 'barch', 'barch': 'barch', 'b arch': 'barch', 'architecture': 'barch',
    'adm': 'admissions', 'adms': 'admissions', 'admission': 'admissions', 'admision': 'admissions', 'addmission': 'admissions',
    'plcmnt': 'placements', 'plcmnts': 'placements', 'placement': 'placements', 'placements': 'placements', 'plsemnt': 'placements',
    'hstl': 'hostels', 'hostl': 'hostels', 'hostel': 'hostels',
    'infra': 'facilities', 'amenities': 'facilities', 'facility': 'facilities', 'facilities': 'facilities', 'facilties': 'facilities',
    'mgmt': 'management_quota',
    'princi': 'principal', 'vp': 'vice_principal',
    'cult': 'clubs', 'club': 'clubs',
    'soc': 'clubs',
    'fee': 'fees', 'fees': 'fees',
    'exam': 'circulars', 'place': 'placements',
    'cse': 'dept_cs', 'cs': 'dept_cs',
    'aiml': 'dept_aiml', 'ai': 'dept_aiml',
    'ise': 'dept_is', 'is': 'dept_is',
    'ece': 'dept_ec', 'ec': 'dept_ec',
    'mech': 'dept_me', 'me': 'dept_me',
    'mca': 'dept_mca', 'ash': 'dept_ash',
    'libry': 'library', 'library': 'library',
    'contact': 'contact', 'contact us': 'contact', 'contct': 'contact',
    'about': 'about', 'about us': 'about'
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
    // P0.3: Broad Campus & Institutional Comprehensive Overview
    { k: ['campus overview', 'college overview', 'show everything', 'tell me everything', 'what and all it contains', 'what does it contain', 'show about cources admissions facilities contact us', 'show about courses admissions facilities contact us', 'overview of everything', 'all details', 'explore rvitm', 'what does rvitm have', 'what is available at rvitm', 'show all sections', 'full overview', 'complete details'], id: 'campus_overview', p: 0.3 },

    // P0.4: Greet & Farewell
    { k: ['hi', 'hello', 'hey', 'hii', 'hola', 'good morning', 'good evening', 'good afternoon', 'namaste', 'yo', 'sup', 'howdy', 'namaskara', 'rvitm bot', 'start'], id: 'greet', p: 0.4 },
    { k: ['bye', 'goodbye', 'thank you', 'thanks', 'thats all', 'see you', 'cya', 'take care', 'ok bye', 'okay bye', 'good night', 'tata', 'thanks a lot', 'exit', 'thank you bye'], id: 'bye', p: 0.4 },

    // Core Institutional Topics
    { k: ['about', 'show about', 'about rvitm', 'about the college', 'about college', 'overview', 'know rvitm', 'college info', 'tell me about rvitm', 'what is rvitm', 'history', 'established', 'rv institute of technology and management', 'introduction', 'trust', 'rsst', 'rvei', 'about us', 'about institution'], id: 'about', p: 1.0 },
    { k: ['principal', 'principal name', 'who is principal', 'head of institution', 'director of rvitm', 'who is the principal', 'about principal', 'dr nagashettappa biradar', 'nagashettappa'], id: 'principal', p: 0.6 },
    { k: ['vice principal', 'vice principal name', 'who is vice principal', 'about vice principal', 'dr manjunatha prasad', 'manjunatha prasad r', 'vp'], id: 'vice_principal', p: 0.6 },
    { k: ['leadership', 'management', 'rsst leadership', 'trustees', 'president', 'secretary', 'mp shyam', 'avs murthy', 'dp nagaraj'], id: 'leadership', p: 0.8 },
    { k: ['vision', 'mission', 'motto', 'college vision', 'rvitm vision', 'goal'], id: 'vision', p: 0.8 },

    // Admissions & Fees (High Priority 0.6)
    { k: ['admission', 'admissions', 'admision', 'admissions 2026', 'admission 2026', 'admission 2025', 'how to apply', 'admission process', 'eligibility', 'seat matrix', 'admission criteria', 'admission procedure', 'join rvitm', 'how to join', 'ug admission', 'b e admission', 'apply online'], id: 'admissions', p: 0.6 },
    { k: ['kcet', 'comedk', 'cet code', 'comedk code', 'cutoff', 'cutoffs', 'closing rank', 'rank required', 'kcet rank'], id: 'cutoffs', p: 0.6 },
    { k: ['management quota', 'management seat', 'direct admission', 'donation seat', 'mgmt quota', 'mq seat', 'institutional admission'], id: 'management_quota', p: 0.6 },
    { k: ['fee', 'fees', 'fee structure', 'tuition', 'college fees', 'annual fees', 'semester fee', 'how much fees', 'cost', 'online fee payment', 'pay fee'], id: 'fees', p: 0.6 },

    // Placements (High Priority 0.6)
    { k: ['placement', 'placements', 'package', 'packages', 'highest package', 'average package', 'salary', 'highest salary', 'top package', 'average salary', 'placement stats', 'placement record', 'recruiters', 'companies visited', 'placement percentage', 'placement rate', 'amazon', 'oracle', 'walmart', 'cisco', 'job opportunities'], id: 'placements', p: 0.6 },
    { k: ['placement report', 'placement reports', 'selection list', 'selected candidates', 'placed students', '2026 batch', '2025 batch', '2024 batch', 'batch list', 'placement pdf', 'placement flyer', 'batch selection', 'placement selection list', '2026 batch placement selection list'], id: 'placement_reports', p: 0.7 },
    { k: ['placement team', 'placement officer', 'placement director', 'ataullah', 'ranganath', 'mallanagouda patil', 'jayaramu', 'placement team and director'], id: 'placement_team', p: 0.7 },

    // Departments & Academics (High Priority 0.6, includes cources/courses)
    { k: ['department', 'departments', 'branches', 'courses', 'cources', 'course', 'cource', 'corse', 'programs', 'programmes', 'all branches', 'engineering branches', 'ug programs', 'be courses', 'what courses', 'which courses', 'what cources', 'academics', 'streams', 'which branches'], id: 'departments', p: 0.6 },
    { k: ['barch', 'b arch', 'coursesb arch', 'courses b arch', 'course b arch', 'architecture', 'b arch course', 'b arch admission', 'b arch fees', 'b arch syllabus', 'b arch eligibility', 'rvca', 'rv college of architecture', 'architecture courses', 'b.arch', 'm.arch', 'm arch', 'nata'], id: 'barch', p: 0.5 },
    { k: ['hod', 'hods', 'head of department', 'heads of department', 'list of hods', 'all hods', 'who are the hods'], id: 'hods_list', p: 0.7 },
    { k: ['faculty', 'teachers', 'professors', 'teaching staff', 'faculty list', 'all faculty', 'lecturers'], id: 'faculty_list', p: 0.7 },
    { k: ['syllabus', 'curriculum', 'vtu scheme', 'subjects', 'course structure', 'academic syllabus', 'download syllabus', 'syllabus pdf', 'mca syllabus', 'ece scheme', 'cse syllabus', 'download syllabus mca ece'], id: 'syllabus', p: 0.7 },

    // Campus Facilities & Life (High Priority 0.6)
    { k: ['facility', 'facilities', 'facilties', 'infrastructure', 'campus facilities', 'amenities', 'what facilities', 'smart classrooms', 'labs', 'auditorium'], id: 'facilities', p: 0.6 },
    { k: ['hostel', 'hostels', 'accommodation', 'boys hostel', 'girls hostel', 'hostel fee', 'dormitory', 'stay at rvitm', 'hostel facility', 'hostel food', 'mess'], id: 'hostels', p: 0.6 },
    { k: ['library', 'central library', 'books', 'digital library', 'ieee xplore', 'vtu consortium', 'reading room', 'libsoft', 'turnitin', 'drillbit', 'library timings', 'library rules'], id: 'library', p: 0.6 },
    { k: ['sports', 'gym', 'gymnasium', 'badminton', 'games', 'vtu sports award', 'physical education', 'cricket', 'football'], id: 'sports', p: 0.7 },
    { k: ['canteen', 'cafeteria', 'food', 'food court', 'snacks', 'lunch', 'mess food', 'campus cafeteria and food', 'campus cafeteria', 'campus food'], id: 'canteen', p: 0.45 },
    { k: ['mental health', 'cadabams', 'helpline', 'counselling', 'student wellbeing', 'psychological support', 'cadabams hospital'], id: 'mental_health', p: 0.6 },
    { k: ['club', 'clubs', 'student clubs', 'extracurricular', 'ecx', 'robotics club', 'phoenix robotics', 'coding club', 'aegis', 'e-cell', 'rudra', 'kannada sangha', 'activities'], id: 'clubs', p: 0.7 },
    { k: ['phoenix robotics', 'robotics club', 'combat robots', 'robotics'], id: 'club_robotics', p: 0.5 },
    { k: ['coding club', 'aegis', 'competitive programming', 'cybersecurity club', 'hackathons'], id: 'club_coding', p: 0.5 },
    { k: ['cultural club', 'rudra', 'theatre club', 'dramatics', 'dance club'], id: 'club_cultural', p: 0.5 },
    { k: ['e-cell', 'ecell', 'entrepreneurship cell', 'startup club'], id: 'club_ecell', p: 0.5 },
    { k: ['kannada sangha', 'kannada club', 'rajyotsava'], id: 'club_kannada', p: 0.5 },
    { k: ['ecx', 'ece club', 'ecx club', 'electronics club'], id: 'club_ecx', p: 0.5 },
    { k: ['adventure club', 'adventure activities club', 'trekking club'], id: 'club_adventure', p: 0.5 },
    { k: ['science club', 'astronomy club', 'physics club'], id: 'club_science', p: 0.5 },
    { k: ['magazine club', 'college magazine', 'editorial club'], id: 'club_magazine', p: 0.5 },
    { k: ['research', 'innovation', 'vtu research', 'research centres', 'icdte', 'breakthrough innovation'], id: 'research', p: 0.6 },
    { k: ['vtu research centre', 'vtu research centres', 'phd research centres'], id: 'vtu_research', p: 0.5 },
    { k: ['research awards', 'patents', 'student patents', 'springer conference'], id: 'research_awards', p: 0.5 },
    { k: ['transport', 'bus', 'bmtc', 'how to reach', 'route', 'metro', 'nearest metro', 'location', 'directions', 'address', 'jp nagar', 'campus location and transport in jp nagar', 'campus location', 'transport in jp nagar'], id: 'transport', p: 0.45 },
    { k: ['contact', 'contact us', 'phone', 'email', 'phone number', 'helpline', 'address', 'enquiry', 'office', 'landline', 'office hours', 'how to contact', 'reach out', 'call'], id: 'contact', p: 0.6 },

    // Statutory Bodies, Governance & Approvals
    { k: ['aicte', 'affiliation', 'vtu affiliation', 'aicte approval', 'accreditation', 'accreditations', 'approvals', 'eoa', 'gok order', 'recognition'], id: 'accreditations', p: 0.8 },
    { k: ['circular', 'circulars', 'notification', 'notifications', 'academic calendar', 'exam circular', 'time table', 'latest updates', 'notices', 'latest circulars and academic calendar', 'latest circulars'], id: 'circulars', p: 0.45 },
    { k: ['committee', 'committees', 'statutory committee', 'discipline committee', 'dac', 'mpcc', 'governance'], id: 'committees', p: 0.8 },
    { k: ['anti ragging', 'ragging', 'ragging complaint', 'anti ragging squad', 'ragging helpline', 'anti ragging committee', 'arc', 'ars', 'zero tolerance anti ragging committee', 'zero tolerance'], id: 'antiragging', p: 0.7 },
    { k: ['grievance', 'grievance cell', 'grievance redressal', 'complaint', 'student grievance', 'posh', 'icc', 'women cell', 'harassment', 'online grievance redressal', 'aicte clause 1', 'online grievance redressal aicte clause 1'], id: 'grievance', p: 0.7 },
    { k: ['nss', 'national service scheme', 'nss unit', 'nss recruitment', 'nss unit recruitment', 'social service', 'lokesh p', 'abhaykumar inchal', 'nss unit recruitment august'], id: 'nss', p: 0.45 },
    { k: ['alumni', 'alumni network', 'alumni association', 'graduates', 'alumni portal'], id: 'alumni', p: 0.8 }
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
    if (b.c === 'mca') kws.push('mca', 'mca program', 'mca program details', 'mca details', 'mca course', 'mca branch');

    QA.push({ k: kws, id: `dept_${b.c}`, p: 0.45 });
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
    'campus_overview': '🏛️ Campus & Institutional Overview',
    'about': '🏛️ About RVITM',
    'principal': '👨‍💼 Principal Dr. Nagashettappa Biradar',
    'vice_principal': '👨‍💼 Vice Principal Dr. Manjunatha Prasad R',
    'leadership': '👥 RSST Leadership',
    'vision': '🎯 Vision & Mission',
    'departments': '📚 Academic Departments & Courses',
    'admissions': '🎓 Admissions & Eligibility',
    'cutoffs': '📊 CET & COMEDK Cutoffs',
    'management_quota': '🏛️ Management Quota Seats',
    'fees': '💳 Fee Structure',
    'placements': '💼 Placements',
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
    'alumni': '🌐 RVITM Alumni Network',
    'barch': '🏛️ Architecture (B.Arch RVCA)',
    'research': '🔬 Research & Innovation',
    'vtu_research': '🏛️ VTU Recognized Research Centres',
    'research_awards': '🏆 Research Awards & Publications',
    'club_robotics': '🤖 Phoenix Robotics Club',
    'club_coding': '💻 Coding Club & Aegis',
    'club_cultural': '🎭 Cultural Club & Rudra',
    'club_ecell': '💡 E-Cell (Startups)',
    'club_kannada': '💛 Kannada Sangha',
    'club_ecx': '⚡ ECE Club (ECX)',
    'club_adventure': '🧗 Adventure Activities Club',
    'club_science': '🔬 Science Club',
    'club_magazine': '📰 Magazine Club',
    'page_search_result': '📄 Website Page Result'
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
     6. DYNAMIC FACULTY DETECTIVE WITH ALIAS MAPPING
     ========================================================================= */
  const FACULTY_ALIASES = {
    'surbhi': 'surabhi',
    'surbhiagrawal': 'drsurabhiagrawal',
    'surabhiagrawal': 'drsurabhiagrawal',
    'manjunathaprasad': 'drmanjunathaprasadr',
    'manjunathaprasadr': 'drmanjunathaprasadr',
    'latha': 'drlathaca',
    'lathaca': 'drlathaca',
    'hemams': 'drhemams',
    'hema': 'drhemams',
    'vinothkumar': 'drvinothkumarm',
    'vinoth': 'drvinothkumarm',
    'solaimuthu': 'drcsolaimuthu',
    'csolaimuthu': 'drcsolaimuthu',
    'mrunalini': 'drmmrunalini',
    'mmrunalini': 'drmmrunalini',
    'patavardhan': 'drprashantppatavardhan',
    'prashantpatavardhan': 'drprashantppatavardhan',
    'gangadharaiah': 'drgangadharaiahyh',
    'nagashettappa': 'drnagashettappabiradar',
    'biradar': 'drnagashettappabiradar',
    'malinipatil': 'drmalinimpatil',
    'malini': 'drmalinimpatil'
  };

  function normalize(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function findFacultyMatch(input) {
    if (!input || !KB.faculty) return null;
    const rawClean = input.toLowerCase().replace(/dr\.|prof\.|mr\.|mrs\.|ms\./gi, ' ').replace(/[^a-z0-9\s]/g, ' ');
    const blacklist = [
      'who', 'is', 'the', 'tell', 'about', 'details', 'info', 'professor', 'faculty', 'teacher',
      'thank', 'thanks', 'bye', 'goodbye', 'hello', 'hey', 'unit', 'recruitment', 'august',
      'food', 'cafeteria', 'location', 'transport', 'calendar', 'circulars', 'programs',
      'program', 'engineering', 'branch', 'department', 'admission', 'fee', 'hostel'
    ];
    const tokens = rawClean.split(/\s+/).filter(w => w.length >= 3 && !blacklist.includes(w));
    const fullNorm = normalize(input);

    // 1. Direct Alias Check
    for (const alias in FACULTY_ALIASES) {
      if (fullNorm.includes(alias)) {
        const targetSlug = FACULTY_ALIASES[alias];
        for (const dept in KB.faculty) {
          for (const f of KB.faculty[dept]) {
            const fSlugNorm = normalize(f.slug || f.n);
            if (fSlugNorm.includes(targetSlug) || targetSlug.includes(fSlugNorm)) {
              return 'fac_' + (f.slug || f.n);
            }
          }
        }
      }
    }

    if (tokens.length === 0) return null;

    // 2. Token overlap score
    let bestMatch = null;
    let highestScore = 0;

    for (const dept in KB.faculty) {
      for (const f of KB.faculty[dept]) {
        const fPlain = f.n.toLowerCase().replace(/dr\.|prof\.|mr\.|mrs\.|ms\./gi, ' ').replace(/[^a-z0-9\s]/g, ' ');
        const fTokens = fPlain.split(/\s+/).filter(w => w.length >= 2);

        let score = 0;
        let matchedDirectToken = false;
        for (const t of tokens) {
          if (fTokens.includes(t)) {
            score += t.length * 3;
            matchedDirectToken = true;
          } else if (fTokens.some(ft => ft.length >= 4 && ft.startsWith(t) && t.length >= 4)) {
            score += t.length * 2;
            matchedDirectToken = true;
          }
        }

        if (matchedDirectToken && score > highestScore && score >= 5) {
          highestScore = score;
          bestMatch = 'fac_' + (f.slug || f.n);
        }
      }
    }

    return bestMatch;
  }

  function findFacultyBySlug(slug) {
    if (!KB.faculty) return null;
    const cleanSlug = normalize(slug);
    for (const dept in KB.faculty) {
      for (const f of KB.faculty[dept]) {
        const fSlug = normalize(f.slug || f.n);
        if (fSlug === cleanSlug) return { fac: f, dept: dept };
      }
    }
    return null;
  }

  /* =========================================================================
     6.5 SITE-WIDE PAGE SEARCH & CONTENT RETRIEVAL (RVITM.EDU.IN)
     ========================================================================= */
  function searchWebsitePages(query) {
    const pagesData = PAGES || (typeof self !== 'undefined' && self.RVITM_PAGES) || (typeof window !== 'undefined' && window.RVITM_PAGES);
    if (!pagesData || !pagesData.chunks || !pagesData.chunks.length) return null;
    const clean = (query || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
    const tokens = clean.split(/\s+/).filter(w => w.length >= 3 && !['what', 'who', 'tell', 'about', 'how', 'when', 'where', 'which', 'can', 'the', 'and', 'for', 'with', 'details', 'give', 'show', 'provide'].includes(w));
    if (!tokens.length) return null;

    let bestChunk = null;
    let bestScore = 0;

    for (const chunk of pagesData.chunks) {
      const page = pagesData.pages[chunk.p];
      if (!page || (page.u && page.u.includes('dummy'))) continue;

      const xLower = chunk.x.toLowerCase();
      const hLower = (chunk.h || '').toLowerCase();
      const tLower = (page.t || '').toLowerCase();

      let score = 0;

      // Exact phrase match in body or heading
      if (clean.length >= 5) {
        if (xLower.includes(clean)) score += 15;
        if (hLower.includes(clean)) score += 20;
      }

      // Token overlap
      for (const t of tokens) {
        if (hLower.includes(t)) score += t.length * 4;
        if (tLower.includes(t)) score += t.length * 2;
        if (xLower.includes(t)) score += t.length * 1.5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestChunk = { chunk, page, score };
      }
    }

    if (bestScore >= 12 && bestChunk) {
      return {
        title: bestChunk.chunk.h || bestChunk.page.t,
        pageTitle: bestChunk.page.t,
        pageUrl: bestChunk.page.u,
        text: bestChunk.chunk.x,
        docs: bestChunk.page.docs || [],
        score: bestScore
      };
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

    // Check for broad institutional overview / "what and all it contains" / multiple pillars asked at once
    const corePillars = ['about', 'course', 'cource', 'branch', 'admission', 'admision', 'facilit', 'contact', 'contain'];
    const hits = corePillars.filter(p => cleanInput.includes(p)).length;
    if (hits >= 3 || cleanInput.includes('what and all it contains') || cleanInput.includes('what does it contain') || cleanInput.includes('show everything') || cleanInput.includes('tell me everything') || cleanInput.includes('all details') || cleanInput.includes('campus overview') || cleanInput.includes('what rvitm contains')) {
      return { type: 'exact', id: 'campus_overview', suggestions: [] };
    }

    // Stop words removal / Grammar words filtering (RVCE NLP Parity)
    const stopWords = [
      'the', 'is', 'are', 'was', 'were', 'for', 'a', 'an', 'of', 'in', 'to', 'and',
      'with', 'about', 'on', 'at', 'please', 'can', 'could', 'you', 'tell', 'me',
      'know', 'give', 'what', 'whats', 'how', 'where', 'which', 'who', 'i', 'want',
      'need', 'would', 'like', 'show', 'provide'
    ];
    strippedInput = cleanInput.split(' ').filter(w => !stopWords.includes(w)).join(' ');

    // 0. Direct Intent ID Bypass (0ms latency for clicked action buttons)
    if (INTENT_LABELS[cleanInput] || cleanInput.startsWith('fac_') || cleanInput.startsWith('dept_') || cleanInput.startsWith('hod_') || cleanInput.startsWith('plcmt_')) {
      return { type: 'exact', id: cleanInput, suggestions: [] };
    }

    // 0.5 Abbreviation Check
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
      'courses': 'departments', 'cources': 'departments',
      'coursesb arch': 'barch', 'courses b arch': 'barch', 'b arch': 'barch', 'barch': 'barch', 'architecture': 'barch',
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
      // If 'about' matched, skip if query contains another specific subject ("tell me about courses")
      if (q.id === 'about') {
        const hasSpecificTopic = /(course|cource|branch|admission|admision|facilit|hostel|placement|package|fee|contact|library|sports|nss|hod|faculty|principal)/i.test(cleanInput);
        if (hasSpecificTopic) {
          continue;
        }
      }

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

    // 5. Site-Wide Page Search (Searches across all crawled pages of rvitm.edu.in)
    const pageMatch = searchWebsitePages(cleanInput);
    if (pageMatch) {
      SESSION.lastPageResult = pageMatch;
      return { type: 'page_search', id: 'page_search_result', pageResult: pageMatch, suggestions: [] };
    }

    // 6. Fallback Suggestions via Levenshtein on Topics
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

  const INTENT_URLS = {
    'campus_overview': 'https://rvitm.edu.in/',
    'about': 'https://rvitm.edu.in/know_rvitm/',
    'principal': 'https://rvitm.edu.in/key_executives/',
    'vice_principal': 'https://rvitm.edu.in/key_executives/',
    'leadership': 'https://rvitm.edu.in/leadership_and_governance/',
    'vision': 'https://rvitm.edu.in/know_rvitm/',
    'departments': 'https://rvitm.edu.in/departments/',
    'barch': 'https://rvca.edu.in/b-arch/',
    'admissions': 'https://rvitm.edu.in/admissions/',
    'cutoffs': 'https://rvitm.edu.in/admissions/',
    'management_quota': 'https://rvitm.edu.in/admissions/',
    'fees': 'https://rvitm.edu.in/admissions/',
    'placements': 'https://rvitm.edu.in/placement/',
    'facilities': 'https://rvitm.edu.in/facilties/',
    'hostels': 'https://rvitm.edu.in/facilties/',
    'library': 'https://rvitm.edu.in/departments/library-2/',
    'sports': 'https://rvitm.edu.in/departments/department_of_physical_education/sports_achievements/',
    'canteen': 'https://rvitm.edu.in/facilties/',
    'mental_health': 'https://rvitm.edu.in/know_rvitm/',
    'clubs': 'https://rvitm.edu.in/clubs/',
    'club_robotics': 'https://rvitm.edu.in/clubs/',
    'club_coding': 'https://rvitm.edu.in/clubs/',
    'club_cultural': 'https://rvitm.edu.in/clubs/',
    'club_ecell': 'https://rvitm.edu.in/clubs/',
    'club_kannada': 'https://rvitm.edu.in/clubs/',
    'research': 'https://rvitm.edu.in/achievements/',
    'vtu_research': 'https://rvitm.edu.in/accreditations_affiliations/',
    'research_awards': 'https://rvitm.edu.in/achievements/',
    'transport': 'https://rvitm.edu.in/contact_us/',
    'contact': 'https://rvitm.edu.in/contact_us/',
    'placement_reports': 'https://rvitm.edu.in/placement/',
    'placement_team': 'https://rvitm.edu.in/placement/',
    'syllabus': 'https://rvitm.edu.in/departments/',
    'accreditations': 'https://rvitm.edu.in/accreditations_affiliations/',
    'circulars': 'https://rvitm.edu.in/circular_and_notifications/',
    'committees': 'https://rvitm.edu.in/committee/',
    'antiragging': 'https://rvitm.edu.in/committee/',
    'grievance': 'https://rvitm.edu.in/committee/',
    'nss': 'https://rvitm.edu.in/nss/',
    'alumni': 'https://rvitm.edu.in/alumni/',
    'hods_list': 'https://rvitm.edu.in/departments/',
    'faculty_list': 'https://rvitm.edu.in/departments/'
  };

  function getResponse(id) {
    if (!id || id === 'menu') {
      return {
        text: "Hello! 👋 Welcome to **RV Institute of Technology & Management (RVITM)**. How can I assist you today? Choose any topic below or ask me directly!",
        url: 'https://rvitm.edu.in/',
        buttons: [
          { text: "🏛️ About RVITM", act: "about" },
          { text: "🎓 Admissions 2026", act: "admissions" },
          { text: "📚 Courses Offered", act: "departments" },
          { text: "💼 Placements", act: "placements" },
          { text: "👨‍🏫 Faculty Directory", act: "faculty_list" },
          { text: "🔬 Research & Innovation", act: "research" },
          { text: "🚀 Student Clubs", act: "clubs" },
          { text: "🏢 Hostels & Facilities", act: "facilities" },
          { text: "📞 Contact Us", act: "contact" }
        ]
      };
    }

    SESSION.lastIntent = id;
    SESSION.history.push(id);

    const res = getResponseInternal(id);
    if (res && !res.url) {
      res.url = INTENT_URLS[id] || 'https://rvitm.edu.in/';
    }
    return res;
  }

  function getResponseInternal(id) {
    // 0. Dynamic Website Page Search Result (Concise summary of source page)
    if (id === 'page_search_result' && SESSION.lastPageResult) {
      const pr = SESSION.lastPageResult;
      const cleanLines = (pr.text || '')
        .split('\n')
        .map(s => s.trim().replace(/^•\s*/, ''))
        .filter(s => s.length > 20 && !s.includes('©') && !s.includes('http') && !s.includes('rights reserved'))
        .slice(0, 3);

      let text = `📄 **${pr.title || pr.pageTitle}**<br><br>` +
                 (cleanLines.length ? cleanLines.map(l => `• ${l}`).join('<br>') + '<br><br>' : '') +
                 `🌐 **Source:** [${pr.pageTitle || 'Official Webpage'}](${pr.pageUrl})`;

      if (pr.docs && pr.docs.length > 0) {
        text += '<br><br>📑 **Downloads:**<br>' +
                pr.docs.slice(0, 2).map(d => `• 🔗 [${d.t}](${d.u})`).join('<br>');
      }

      const buttons = [
        { text: "🌐 View Official Page", url: pr.pageUrl },
        { text: "📚 Courses Offered", act: "departments" },
        { text: "🏛️ Main Menu", act: "menu" }
      ];

      return { text, buttons, url: pr.pageUrl };
    }

    const deptCodeMap = {
      'cs': 'cse', 'cse': 'cse',
      'aiml': 'aiml', 'ai': 'aiml',
      'is': 'ise', 'ise': 'ise',
      'ec': 'ece', 'ece': 'ece',
      'me': 'me', 'mech': 'me',
      'mca': 'mca',
      'ash': 'ash'
    };

    // 1. Dynamic Faculty Detail Intent & Department Roster
    if (id.startsWith('fac_')) {
      const slug = id.replace('fac_', '');
      const mappedDept = deptCodeMap[slug];
      if (mappedDept && KB.faculty && KB.faculty[mappedDept]) {
        return renderDeptFacultyList(mappedDept);
      }
      const match = findFacultyBySlug(slug);
      if (match) {
        return renderFacultyCard(match.fac, match.dept);
      }
    }

    // 2. Dynamic Department Overview Intent
    if (id.startsWith('dept_')) {
      const branchCode = id.replace('dept_', '');
      const ugData = KB.departments.ug.find(b => b.c === branchCode) ||
                     KB.departments.pg.find(b => b.c === branchCode) ||
                     KB.departments.foundational?.find(b => b.c === branchCode);
      if (ugData) {
        return renderDepartmentCard(ugData);
      }
    }

    // 3. Dynamic Branch HOD Intent
    if (id.startsWith('hod_')) {
      const branchCode = id.replace('hod_', '');
      const ugData = KB.departments.ug.find(b => b.c === branchCode) ||
                     KB.departments.pg.find(b => b.c === branchCode) ||
                     KB.departments.foundational?.find(b => b.c === branchCode);
      if (ugData) {
        return renderHODCard(ugData);
      }
    }

    // 4. Dynamic Branch Placement Intent
    if (id.startsWith('plcmt_')) {
      const branchCode = id.replace('plcmt_', '');
      const branch = allBranches.find(b => b.c === branchCode);
      if (branch) {
        const s = KB.placements.stats;
        return {
          text: "💼 **" + branch.code + " — Placements** (Centralized with RVCE)<br><br>" +
                "• **Highest Package:** " + s.highestPackage + "<br>" +
                "• **Average Package:** " + s.averagePackage + "<br>" +
                "• **Placement Rate:** " + s.placementRate + "<br>" +
                "• **Top Recruiters:** Amazon, Oracle, Cisco, Walmart, PhonePe, Nutanix, Qualcomm, Samsung",
          buttons: [
            { text: "💼 Overall Placements", act: "placements" },
            { text: "📑 Batch Reports (PDF)", act: "placement_reports" },
            { text: "📘 " + branch.code + " Course Info", act: "dept_" + branchCode },
            { text: "👨‍🏫 " + branch.code + " Faculty", act: "fac_" + branchCode }
          ]
        };
      }
    }

    // Core Curated Responses
    switch (id) {
      case 'greet':
        return {
          text: "Hello! 👋 Welcome to **RVITM Assistant**. How can I help you today? Choose any topic below or ask me directly!",
          url: 'https://rvitm.edu.in/',
          buttons: [
            { text: "🏛️ About RVITM", act: "about" },
            { text: "📚 Courses Offered", act: "departments" },
            { text: "🎓 Admissions 2026", act: "admissions" },
            { text: "💼 Placements", act: "placements" },
            { text: "👨‍🏫 Faculty Directory", act: "faculty_list" },
            { text: "🔬 Research & Clubs", act: "research" }
          ]
        };

      case 'bye':
        return {
          text: "Thank you for visiting RVITM! 🙌 Feel free to return anytime. Best wishes on your engineering journey!",
          buttons: [
            { text: "🌐 Visit Official Website", url: "https://rvitm.edu.in/" },
            { text: "📋 Main Menu", act: "menu" }
          ]
        };

      case 'campus_overview':
      case 'about':
        return {
          text: "🏛️ **RVITM, Bengaluru** (RSST Trust, Est. 2019)<br><br>" +
                "• 📍 **Location:** JP Nagar 8th Phase, Bengaluru<br>" +
                "• 📜 **Affiliation:** VTU Belagavi & AICTE Approved<br>" +
                "• 👨‍💼 **Leadership:** Dr. Nagashettappa Biradar (Principal)<br>" +
                "• 💼 **Placements:** Centralized with RVCE (Highest: **₹41.5 LPA** | Avg: **₹12.27 LPA**)<br>" +
                "• 🧠 **Student Care:** 24/7 mental health counseling (Cadabams)",
          url: "https://rvitm.edu.in/know_rvitm/",
          buttons: [
            { text: "📚 Courses Offered", act: "departments" },
            { text: "🎓 Admissions 2026", act: "admissions" },
            { text: "💼 Placements", act: "placements" },
            { text: "👨‍🏫 Faculty Directory", act: "faculty_list" },
            { text: "🏢 Campus Facilities", act: "facilities" }
          ]
        };

      case 'principal':
        return {
          text: "👨‍💼 **Principal — RVITM**<br><br>" +
                "**Dr. Nagashettappa Biradar**<br>" +
                "• 📧 **Email:** `principal.rvitm@rvei.edu.in`<br>" +
                "• 📍 **Office:** Principal's Secretariat, RVITM Campus, Bengaluru",
          buttons: [
            { text: "👨‍💼 Vice Principal", act: "vice_principal" },
            { text: "👥 RSST Leadership", act: "leadership" },
            { text: "🏛️ About RVITM", act: "about" }
          ]
        };

      case 'vice_principal':
        return {
          text: "👨‍💼 **Vice Principal — RVITM**<br><br>" +
                "**Dr. Manjunatha Prasad R**<br>" +
                "• 👔 **Designation:** Vice Principal, Professor & Head of ECE<br>" +
                "• 🔬 **Expertise:** VLSI Design & Embedded IoT Systems",
          buttons: [
            { text: "👨‍💼 Principal", act: "principal" },
            { text: "📘 ECE Department", act: "dept_ec" },
            { text: "👔 All HODs", act: "hods_list" }
          ]
        };

      case 'leadership':
        return {
          text: "👥 **RSST & RVITM Leadership**<br><br>" +
                "• **President (RSST):** Dr. M. P. Shyam<br>" +
                "• **Hon. Secretary (RSST):** Dr. (h.c.) A. V. S. Murthy<br>" +
                "• **Hon. Joint Secretary:** Mr. D. P. Nagaraj<br>" +
                "• **Principal (RVITM):** Dr. Nagashettappa Biradar<br>" +
                "• **Vice Principal:** Dr. Manjunatha Prasad R",
          buttons: [
            { text: "👨‍💼 Principal", act: "principal" },
            { text: "🎯 Vision & Mission", act: "vision" },
            { text: "🏛️ About RVITM", act: "about" }
          ]
        };

      case 'vision':
        return {
          text: "🎯 **Vision & Mission — RVITM**<br><br>" +
                "• **Vision:** Top-quality technical education with global competence and breakthrough innovations.<br>" +
                "• **Mission:** Nurturing passionate engineers through experiential learning, ICT, and modern labs.",
          buttons: [
            { text: "📚 Academic Courses", act: "departments" },
            { text: "🏛️ About RVITM", act: "about" }
          ]
        };

      case 'departments':
        return {
          text: "📚 **Programmes Offered at RVITM** (VTU & AICTE Approved)<br><br>" +
                "• 💻 **B.E. Computer Science & Engg (CSE)** — HOD: Dr. Hema M S<br>" +
                "• 🤖 **B.E. CSE (AI & Machine Learning)** — HOD: Dr. Surabhi Agrawal<br>" +
                "• 🌐 **B.E. Information Science (ISE)** — HOD: Dr. Vinoth Kumar M<br>" +
                "• ⚡ **B.E. Electronics & Communication (ECE)** — HOD: Dr. Manjunatha Prasad R<br>" +
                "• ⚙️ **B.E. Mechanical Engineering (ME)** — HOD: Dr. C. Solaimuthu<br>" +
                "• 📱 **MCA (Postgraduate, 2 Yrs)** — HOD: Dr. M. Mrunalini<br>" +
                "• 🔬 **Applied Sciences & Humanities (ASH)** — HOD: Dr. Gangadharaiah Y H",
          url: "https://rvitm.edu.in/departments/",
          buttons: [
            { text: "💻 Computer Science (CSE)", act: "dept_cs" },
            { text: "🤖 AI & Machine Learning", act: "dept_aiml" },
            { text: "🌐 Information Science (ISE)", act: "dept_is" },
            { text: "⚡ Electronics & Comm (ECE)", act: "dept_ec" },
            { text: "⚙️ Mechanical Engineering", act: "dept_me" },
            { text: "📱 MCA (Postgraduate)", act: "dept_mca" },
            { text: "🏛️ B.Arch (RVCA)", act: "barch" },
            { text: "💼 Placements", act: "placements" }
          ]
        };

      case 'barch':
        return {
          text: "🏛️ **B.Arch & M.Arch — RVCA (Sister Institution)**<br><br>" +
                "• **Campus:** RV College of Architecture, Mysore Road, Bengaluru (RSST trust)<br>" +
                "• **Degrees:** 5-Year B.Arch & 2-Year M.Arch (VTU & COA approved)<br>" +
                "• **Eligibility:** 10+2 PCM (min 50%) + valid NATA / JEE Main Paper-2 score<br>" +
                "*(Note: RVITM campus specializes in B.E. Engineering & MCA)*",
          url: "https://rvca.edu.in/b-arch/",
          buttons: [
            { text: "🌐 RVCA Official Portal", url: "https://rvca.edu.in/b-arch/" },
            { text: "📚 RVITM Engineering Courses", act: "departments" },
            { text: "🎓 Admissions 2026", act: "admissions" }
          ]
        };

      case 'admissions':
        return {
          text: "🎓 **Admissions 2026 — RVITM**<br><br>" +
                "• 🏛️ **KCET (CET Code: E273):** State counseling based on rank<br>" +
                "• 📝 **COMED-K:** All-India entrance test for open merit seats<br>" +
                "• 👔 **Management Quota:** Merit-based institutional admission via RSST<br>" +
                "• 📋 **Eligibility:** 10+2 with min 45% in PCM (40% for SC/ST/OBC)<br>" +
                "• 📞 **Helpline:** **+91 8951758140** | `admissions.rvitm@rvei.edu.in`",
          buttons: [
            { text: "📊 CET & COMEDK Cutoffs", act: "cutoffs" },
            { text: "🏛️ Management Quota", act: "management_quota" },
            { text: "💳 Fee Structure", act: "fees" },
            { text: "📚 Courses Offered", act: "departments" }
          ]
        };

      case 'cutoffs':
        return {
          text: "📊 **KCET & COMED-K Cutoffs — RVITM**<br><br>" +
                "• **Trend:** CSE, AI&ML, and ISE close in top ranks, followed by ECE and ME.<br>" +
                "• Cutoffs vary by round and category (GM, OBC, 371J).<br>" +
                "• 📞 To check your rank eligibility: **+91 8951758140**",
          buttons: [
            { text: "🎓 Admissions 2026", act: "admissions" },
            { text: "🏛️ Management Quota", act: "management_quota" },
            { text: "💳 Fee Structure", act: "fees" },
            { text: "📞 Contact Desk", act: "contact" }
          ]
        };

      case 'management_quota':
        return {
          text: "🏛️ **Management Quota Admissions 2026 — RSST**<br><br>" +
                "• **Administered By:** Central Admissions Office, RSST<br>" +
                "• **Eligibility:** 10+2 PCM (min 45%) + valid KCET/COMEDK/JEE rank<br>" +
                "• 📞 **Contact:** **+91 8951758140** / 080-35095100<br>" +
                "• ✉️ **Email:** `admissions.rvitm@rvei.edu.in`",
          buttons: [
            { text: "🎓 Admission Routes", act: "admissions" },
            { text: "💳 Fee Structure", act: "fees" },
            { text: "📞 Contact Admissions", act: "contact" }
          ]
        };

      case 'fees':
        return {
          text: "💳 **Fee Structure Guidelines — RVITM**<br><br>" +
                "• 🏛️ **KCET:** Statutory tuition fee fixed annually by KEA/Govt of Karnataka<br>" +
                "• 📝 **COMED-K:** Statutory fees fixed by COMED-K consortium<br>" +
                "• 👔 **Management Quota:** Institutional fees established by RSST<br>" +
                "• 📞 For latest fee circulars: **+91 8951758140** | `admissions.rvitm@rvei.edu.in`",
          buttons: [
            { text: "🎓 Admissions 2026", act: "admissions" },
            { text: "📞 Contact Admissions", act: "contact" },
            { text: "💼 Placements", act: "placements" },
            { text: "📚 Courses Offered", act: "departments" }
          ]
        };

      case 'placements':
        return {
          text: "💼 **Placements at RVITM** (Centralized with RVCE)<br><br>" +
                "• 🏆 **Highest Package:** **₹41.5 LPA**<br>" +
                "• 📈 **Average Package:** **₹12.27 LPA**<br>" +
                "• 🎯 **Placement Rate:** **80%+** (200+ Recruiting Companies)<br>" +
                "• 🏢 **Top Recruiters:** Amazon, Cisco, Oracle, Walmart, PhonePe, Nutanix, Qualcomm, Samsung, Infosys, TCS, Wipro",
          url: "https://rvitm.edu.in/placement/",
          buttons: [
            { text: "📑 Batch Placement Reports", act: "placement_reports" },
            { text: "💼 Training & Placement Team", act: "placement_team" },
            { text: "📚 Courses Offered", act: "departments" },
            { text: "🌐 Official Placement Portal", url: "https://rvitm.edu.in/placement/" }
          ]
        };

      case 'placement_reports':
        return {
          text: "📑 **Batch Placement Records — RVITM**<br><br>" +
                "• 📄 **2022–2026 Batch:** 202 Candidates Placed (Ongoing)<br>" +
                "• 📄 **2021–2025 Batch:** 172 Candidates Placed<br>" +
                "• 📄 **2020–2024 Batch:** 181 Candidates Placed",
          buttons: [
            { text: "📄 2026 Batch Report (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/09/RVITM_SelectionList_2026-Batch_15thSept_2026_202_Candidates.pdf" },
            { text: "📄 2025 Batch Report (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/07/RVITM_SelectionList_2025-Batch.pdf" },
            { text: "💼 Placement Overview", act: "placements" }
          ]
        };

      case 'placement_team':
        return {
          text: "💼 **Placement Cell Leadership — RVITM**<br><br>" +
                "• 👨‍💼 **Placement Officer:** Mr. Ataullah<br>" +
                "• 👔 **Advisory Board:** Dr. Malini M. Patil & Dr. Manjunatha Prasad R<br>" +
                "• 🎯 **Training:** Coding bootcamps, mock interviews, and hackathons",
          buttons: [
            { text: "💼 Placement Statistics", act: "placements" },
            { text: "📑 Batch Reports (PDF)", act: "placement_reports" }
          ]
        };

      case 'facilities':
        return {
          text: "🏢 **Campus Facilities — RVITM**<br><br>" +
                "• 📖 **Digital Library:** Automated LIBSOFT, RFID, 10 research terminals, IEEE/Springer e-resources<br>" +
                "• 🛏️ **Hostels:** Separate boys & girls accommodation with 24/7 security, Wi-Fi & dining<br>" +
                "• 🏆 **Sports:** Indoor badminton, gym, table tennis & sports grounds (VTU Award winner)<br>" +
                "• ☕ **Cafeteria:** Hygienic food court serving daily meals & snacks<br>" +
                "• 🧠 **Health & Counseling:** 24/7 Cadabams mental health support",
          buttons: [
            { text: "📖 Digital Library", act: "library" },
            { text: "🛏️ Hostels", act: "hostels" },
            { text: "🏆 Sports Achievements", act: "sports" },
            { text: "🧠 Mental Health Support", act: "mental_health" }
          ]
        };

      case 'hostels':
        return {
          text: "🛏️ **Hostels — RVITM**<br><br>" +
                "• **Facilities:** Separate boys & girls hostels near campus<br>" +
                "• **Amenities:** Wi-Fi, RO water, 24/7 CCTV, biometric access, wardens<br>" +
                "• **Mess:** Hygienic vegetarian food<br>" +
                "• 📞 **Enquiries:** 080-35095100 | `info.rvitm@rvei.edu.in`",
          buttons: [
            { text: "🏢 Campus Facilities", act: "facilities" },
            { text: "☕ Cafeteria", act: "canteen" },
            { text: "📞 Contact Office", act: "contact" }
          ]
        };

      case 'library':
        return {
          text: "📖 **Central Library — RVITM**<br><br>" +
                "• **Timings:** 9:00 AM – 5:00 PM (Working days)<br>" +
                "• **Features:** Automated LIBSOFT LMS, RFID, 10 research workstations<br>" +
                "• **Subscriptions:** IEEE Xplore, ScienceDirect, Springer, Taylor & Francis<br>" +
                "• **Chief Librarian:** Dr. A. Nagaraja (Ph.D., M.L.I.Sc.)",
          url: "https://rvitm.edu.in/departments/library-2/",
          buttons: [
            { text: "📄 Librarian Profile", url: "https://rvitm.edu.in/wp-content/uploads/2026/05/Resume.pdf" },
            { text: "🔬 Research at RVITM", act: "research" },
            { text: "🏢 Campus Facilities", act: "facilities" }
          ]
        };

      case 'sports':
        return {
          text: "🏆 **Sports & Fitness — RVITM**<br><br>" +
                "• 🥇 **Recognition:** Awarded the **VTU Institutional Sports Achievement Award**.<br>" +
                "• 🏋️ **Facilities:** Indoor badminton courts, modern gymnasium, table tennis, cricket & football training.<br>" +
                "• 🏅 **Achievements:** State & university-level medals in chess, athletics, and annual meets.",
          buttons: [
            { text: "🚀 Student Clubs", act: "clubs" },
            { text: "🏢 Campus Facilities", act: "facilities" }
          ]
        };

      case 'canteen':
        return {
          text: "☕ **Campus Cafeteria & Dining**<br><br>" +
                "• Clean food court serving fresh South Indian meals, snacks, and beverages.<br>" +
                "• High hygiene standards with industrial water purification systems.",
          buttons: [
            { text: "🏢 Campus Facilities", act: "facilities" },
            { text: "🛏️ Hostels", act: "hostels" }
          ]
        };

      case 'mental_health':
        return {
          text: "🧠 **Mental Health & Wellbeing**<br><br>" +
                "• **24/7 Confidential Helpline** in official partnership with **Cadabams Hospital**.<br>" +
                "• Professional counseling for stress management, exam anxiety, and emotional wellness.",
          buttons: [
            { text: "🏢 Campus Facilities", act: "facilities" },
            { text: "📞 Contact Us", act: "contact" }
          ]
        };

      // ================= RESEARCH INTENTS (RVCE PARITY) =================
      case 'research':
        return {
          text: "🔬 **Research & Innovation — RVITM**<br><br>" +
                "• 🏛️ **VTU Research Centres:** Approved for Ph.D. & M.Sc. (Engg.) in Physics, Chemistry, Math & Engineering.<br>" +
                "• 📄 **Publications:** 100+ peer-reviewed papers in IEEE Xplore, Springer, and Scopus journals.<br>" +
                "• 🌐 **Conferences:** Host of **ICDTE-2025** (Springer); papers at ICCNP, ICRIET, IMSTEM.<br>" +
                "• 🏆 **Key Honors:** Best Paper Award at ICRIET-2025 (IoT Smart Mirror); Google Generation Scholar Chavi Gupta.",
          url: "https://rvitm.edu.in/achievements/",
          buttons: [
            { text: "🔬 VTU Research Centres", act: "vtu_research" },
            { text: "🏆 Research Awards", act: "research_awards" },
            { text: "🚀 Student Clubs", act: "clubs" },
            { text: "🌐 Research on Web", url: "https://rvitm.edu.in/achievements/" }
          ]
        };

      case 'vtu_research':
        return {
          text: "🔬 **VTU Recognized Research Centres — RVITM**<br><br>" +
                "• 🧬 **Recognized Domains:** Physics, Chemistry, Mathematics, and Engineering (VLSI, Wireless, AI).<br>" +
                "• 🎓 **Programs:** Ph.D. and M.Sc. (Engg.) by Research under doctoral supervisors.<br>" +
                "• 📄 **Affiliation:** Officially recognized and notified by Visvesvaraya Technological University (VTU).",
          url: "https://rvitm.edu.in/wp-content/uploads/2026/03/Research-Centre-Basic-Science-Dept.pdf",
          buttons: [
            { text: "📄 VTU Notification (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/Research-Centre-Basic-Science-Dept.pdf" },
            { text: "🔬 Research Overview", act: "research" },
            { text: "📚 Academic Courses", act: "departments" }
          ]
        };

      case 'research_awards':
        return {
          text: "🏆 **Research Awards & Honors — RVITM**<br><br>" +
                "• 🥇 **Best Research Paper (ICRIET-2025):** IoT Smart Mirror project (Navyashree et al., mentored by Dr. Shalini J, funded by RVEI).<br>" +
                "• 🌐 **Generation Google Scholarship (APAC):** Awarded to Chavi Gupta.<br>" +
                "• 📄 **Springer ICDTE-2025:** Devika Biradar honored for Privacy-Preserving Applications research.<br>" +
                "• 🏥 **Cardiovascular ML (ICCCNP-2025):** Heart disease detection model by Nidhi, Prarthana & Manya.",
          url: "https://rvitm.edu.in/achievements/",
          buttons: [
            { text: "🔬 Research Overview", act: "research" },
            { text: "🚀 Student Clubs", act: "clubs" },
            { text: "🌐 Official Achievements", url: "https://rvitm.edu.in/achievements/" }
          ]
        };

      // ================= STUDENT CLUBS INTENTS (RVCE PARITY) =================
      case 'clubs':
        return {
          text: "🚀 **Student Clubs — RVITM**<br><br>" +
                "• 🤖 **Phoenix Robotics:** Combat & autonomous robotics, line followers, VTU competitions.<br>" +
                "• 💻 **Coding Club & Aegis:** Competitive coding, hackathons, and CTF cybersecurity.<br>" +
                "• ⚡ **ECE Club (ECX):** Embedded hardware, IoT, and PCB prototyping.<br>" +
                "• 💡 **E-Cell:** Startup pitching, ideation, and incubator mentorship (Christ Academy 1st prize).<br>" +
                "• 🎭 **Cultural & Rudra:** Theatre, classical dance (Natya Jothi winners), music, and fests.<br>" +
                "• 💛 **Kannada Sangha:** Heritage, literature, and Rajyotsava celebrations.<br>" +
                "• 🧗 **Adventure & Science:** Trekking, outdoor survival, and astronomy colloquiums.<br>" +
                "• 📰 **Magazine Club & NSS:** Campus editorial, journalism, and community outreach.",
          url: "https://rvitm.edu.in/clubs/",
          buttons: [
            { text: "🤖 Phoenix Robotics", act: "club_robotics" },
            { text: "💻 Coding Club & Aegis", act: "club_coding" },
            { text: "⚡ ECE Club (ECX)", act: "club_ecx" },
            { text: "🎭 Cultural Club & Rudra", act: "club_cultural" },
            { text: "💡 E-Cell (Startups)", act: "club_ecell" },
            { text: "💛 Kannada Sangha", act: "club_kannada" },
            { text: "🧗 Adventure Club", act: "club_adventure" },
            { text: "🔬 Science Club", act: "club_science" },
            { text: "📰 Magazine Club", act: "club_magazine" },
            { text: "🤝 NSS Unit", act: "nss" }
          ]
        };

      case 'club_robotics':
        return {
          text: "🤖 **Phoenix Robotics Club — RVITM**<br><br>" +
                "• 🦾 **Focus:** Autonomous mobile robots, combat robotics, ROS, and embedded microcontrollers (ESP32, Arduino).<br>" +
                "• 🏆 **Activities:** Inter-collegiate bot wars, maze navigation, and VTU challenges.<br>" +
                "• 🛠️ **Access:** Dedicated hardware lab access open to all branches.",
          url: "https://rvitm.edu.in/clubs/",
          buttons: [
            { text: "💻 Coding Club & Aegis", act: "club_coding" },
            { text: "🚀 All Student Clubs", act: "clubs" },
            { text: "🌐 Clubs Webpage", url: "https://rvitm.edu.in/clubs/" }
          ]
        };

      case 'club_coding':
        return {
          text: "💻 **Coding Club & Aegis Cybersecurity**<br><br>" +
                "• 🚀 **Coding Club:** Competitive programming (LeetCode, Codeforces), full-stack apps, and hackathons.<br>" +
                "• 🛡️ **Aegis:** Ethical hacking, Capture The Flag (CTF) tournaments, and network security.<br>" +
                "• 💡 **Workshops:** Docker, Git/GitHub, Cloud computing, and open-source sprints.",
          url: "https://rvitm.edu.in/clubs/",
          buttons: [
            { text: "🤖 Phoenix Robotics", act: "club_robotics" },
            { text: "💡 E-Cell (Startups)", act: "club_ecell" },
            { text: "🚀 All Student Clubs", act: "clubs" }
          ]
        };

      case 'club_cultural':
        return {
          text: "🎭 **Cultural Club & Rudra Theatre**<br><br>" +
                "• 🎭 **Rudra Dramatics:** Street plays, social skits, mono-acting, and stage productions.<br>" +
                "• 🎨 **Cultural Club:** Dance (Natya Jothi awardees), music ensembles, and annual college fests.<br>" +
                "• 🎪 **Events:** Inter-collegiate cultural competitions and battle of the bands.",
          url: "https://rvitm.edu.in/clubs/",
          buttons: [
            { text: "💛 Kannada Sangha", act: "club_kannada" },
            { text: "🚀 All Student Clubs", act: "clubs" },
            { text: "🌐 Clubs Webpage", url: "https://rvitm.edu.in/clubs/" }
          ]
        };

      case 'club_ecell':
        return {
          text: "💡 **E-Cell (Entrepreneurship Cell) — RVITM**<br><br>" +
                "• 📈 **Incubation:** Startup guidance, venture pitch decks, and investor networking.<br>" +
                "• 🏆 **Achievement:** 1st Place in \"Pitch a Product\" at Christ Academy.<br>" +
                "• 🤝 **Mentorship:** RSST alumni founders, VC masterclasses, and IP patent workshops.",
          url: "https://rvitm.edu.in/clubs/",
          buttons: [
            { text: "💻 Coding Club", act: "club_coding" },
            { text: "🚀 All Student Clubs", act: "clubs" },
            { text: "🌐 Clubs Webpage", url: "https://rvitm.edu.in/clubs/" }
          ]
        };

      case 'club_kannada':
        return {
          text: "💛 **Kannada Sangha — RVITM**<br><br>" +
                "• 🚩 **Rajyotsava:** Annual celebration of Karnataka heritage with folk arts (Yakshagana, Dollu Kunitha).<br>" +
                "• 📚 **Literary Activities:** Debates, poetry sessions, and guest talks with Kannada scholars.<br>" +
                "• 🤝 **Community:** Promoting regional culture and social initiatives.",
          url: "https://rvitm.edu.in/clubs/",
          buttons: [
            { text: "🎭 Cultural Club", act: "club_cultural" },
            { text: "🚀 All Student Clubs", act: "clubs" },
            { text: "🌐 Clubs Webpage", url: "https://rvitm.edu.in/clubs/" }
          ]
        };

      case 'club_ecx':
        return {
          text: "⚡ **ECE Club (ECX) — RVITM**<br><br>" +
                "• 🔌 **Focus:** Embedded systems, STM32/ESP32, PCB schematic design, FPGA, and IoT sensors.<br>" +
                "• 🛠️ **Workshops:** Hardware hackathons, soldering bootcamps, and drone telemetry.<br>" +
                "• 🏭 **Industry Visits:** Semiconductor and VLSI hubs in Bengaluru.",
          url: "https://rvitm.edu.in/clubs/",
          buttons: [
            { text: "🤖 Phoenix Robotics", act: "club_robotics" },
            { text: "⚡ ECE Dept Info", act: "dept_ec" },
            { text: "🚀 All Student Clubs", act: "clubs" }
          ]
        };

      case 'club_adventure':
        return {
          text: "🧗 **Adventure Activities Club — RVITM**<br><br>" +
                "• 🏕️ **Expeditions:** Western Ghats trekking, rock climbing, cave exploration, and camping.<br>" +
                "• 🌲 **Skills:** Orienteering, survival tactics, and eco-friendly outdoor protocols.<br>" +
                "• 🤝 **Teamwork:** High-rope obstacle challenges and fitness conditioning.",
          url: "https://rvitm.edu.in/clubs/",
          buttons: [
            { text: "🤝 NSS Unit", act: "nss" },
            { text: "🚀 All Student Clubs", act: "clubs" }
          ]
        };

      case 'club_science':
        return {
          text: "🔬 **Science Club — RVITM**<br><br>" +
                "• 🌌 **Domains:** Astronomy, quantum mechanics, material physics, and computational math.<br>" +
                "• 📑 **Seminars:** Guest lectures by scientists from IISc, ISRO, and premier research labs.<br>" +
                "• 💡 **Exhibitions:** National Science Day projects and paper presentations.",
          url: "https://rvitm.edu.in/clubs/",
          buttons: [
            { text: "🔬 Research at RVITM", act: "research" },
            { text: "🚀 All Student Clubs", act: "clubs" }
          ]
        };

      case 'club_magazine':
        return {
          text: "📰 **Magazine Club — RVITM**<br><br>" +
                "• ✍️ **Publications:** RVITM annual magazine, quarterly bulletins, and campus newsletters.<br>" +
                "• 🎙️ **Content:** Student journalism, creative writing, alumni interviews, and photography.<br>" +
                "• 🎨 **Design:** Hands-on training in digital illustration and editorial layout.",
          url: "https://rvitm.edu.in/clubs/",
          buttons: [
            { text: "🎭 Cultural Club", act: "club_cultural" },
            { text: "🚀 All Student Clubs", act: "clubs" }
          ]
        };

      // ================= FACULTY DIRECTORY INTENTS (RVCE PARITY) =================
      case 'faculty':
      case 'faculty_list':
        return {
          text: "👨‍🏫 **Faculty Directory — RVITM**<br><br>" +
                "RVITM has 90+ dedicated professors and doctoral supervisors across engineering, MCA, and basic sciences.<br><br>" +
                "Select a department to view faculty members:",
          url: "https://rvitm.edu.in/departments/",
          buttons: [
            { text: "💻 Computing & IT Faculty", act: "fac_group_comp" },
            { text: "⚡ Electrical & Comm (ECE)", act: "fac_ec" },
            { text: "⚙️ Core Mechanical (ME)", act: "fac_me" },
            { text: "🔬 Applied Sciences (ASH)", act: "fac_ash" },
            { text: "📱 MCA Faculty", act: "fac_mca" },
            { text: "👔 All HODs", act: "hods_list" },
            { text: "👨‍💼 Deans & Leadership", act: "deans_list" }
          ]
        };

      case 'fac_group_comp':
        return {
          text: "💻 **Computing & Information Technology Faculty**<br><br>Choose a department to view the roster:",
          buttons: [
            { text: "💻 Computer Science (CSE)", act: "fac_cs" },
            { text: "🤖 AI & Machine Learning", act: "fac_aiml" },
            { text: "🌐 Information Science (ISE)", act: "fac_is" },
            { text: "📱 Master of Computer Applications", act: "fac_mca" },
            { text: "👨‍🏫 All Faculty", act: "faculty_list" }
          ]
        };

      case 'deans_list':
        return {
          text: "👨‍💼 **Academic Deans & Leadership — RVITM**<br><br>" +
                "• 🎓 **Principal:** Dr. Nagashettappa Biradar (`principal.rvitm@rvei.edu.in`)<br>" +
                "• ⚡ **Vice Principal & ECE Head:** Dr. Manjunatha Prasad R<br>" +
                "• 💻 **Dean, CSE Cluster:** Dr. Malini M. Patil<br>" +
                "• 📊 **IQAC Coordinator:** Dr. Latha C. A. (ISE)<br>" +
                "• ⚖️ **Grievance Convener:** Dr. Prashant P. Patavardhan (ECE)<br>" +
                "• 📖 **Chief Librarian:** Dr. A. Nagaraja",
          url: "https://rvitm.edu.in/key_executives/",
          buttons: [
            { text: "👨‍💼 Principal", act: "principal" },
            { text: "👨‍💼 Vice Principal", act: "vice_principal" },
            { text: "👔 All HODs", act: "hods_list" },
            { text: "👨‍🏫 Faculty Directory", act: "faculty_list" }
          ]
        };

      case 'hods_list':
        return {
          text: "👔 **Heads of Departments (HODs) — RVITM**<br><br>" +
                "• 💻 **CSE:** **Dr. Hema M S**<br>" +
                "• 🤖 **AI & ML:** **Dr. Surabhi Agrawal**<br>" +
                "• 🌐 **ISE:** **Dr. Vinoth Kumar M**<br>" +
                "• ⚡ **ECE:** **Dr. Manjunatha Prasad R** (Vice Principal)<br>" +
                "• ⚙️ **ME:** **Dr. C. Solaimuthu**<br>" +
                "• 📱 **MCA:** **Dr. M. Mrunalini**<br>" +
                "• 🔬 **ASH:** **Dr. Gangadharaiah Y H**",
          buttons: [
            { text: "💻 CSE HOD", act: "hod_cs" },
            { text: "🤖 AI&ML HOD", act: "hod_aiml" },
            { text: "⚡ ECE HOD", act: "hod_ec" },
            { text: "🌐 ISE HOD", act: "hod_is" },
            { text: "⚙️ ME HOD", act: "hod_me" }
          ]
        };

      case 'transport':
        return {
          text: "🚌 **Location & Connectivity — RVITM**<br><br>" +
                "• 📍 **Address:** Chaithanya Layout, 8th Phase, J.P. Nagar, Bengaluru – 560076.<br>" +
                "• 🚇 **Metro & Road:** Near Namma Metro Green Line; accessible via Bannerghatta & Kanakapura roads.<br>" +
                "• 🚌 **Bus:** Frequent BMTC routes connect directly to campus.<br>" +
                "• ☎️ **Campus Desk:** 080-35095100",
          buttons: [
            { text: "📞 Contact Us", act: "contact" },
            { text: "🏛️ About RVITM", act: "about" }
          ]
        };

      case 'contact':
        return {
          text: "📞 **Contact RVITM**<br><br>" +
                "• 📍 **Location:** Chaithanya Layout, 8th Phase, J.P. Nagar, Bengaluru – 560076.<br>" +
                "• 📱 **Admissions Helpline:** **+91 8951758140**<br>" +
                "• ☎️ **Landline:** 080-35095100 / 101 / 102 / 103 / 104<br>" +
                "• ✉️ **Email:** `admissions.rvitm@rvei.edu.in` | `info.rvitm@rvei.edu.in`<br>" +
                "• ⏰ **Office Hours:** Mon–Fri: 9:00 AM – 5:00 PM | Sat: 9:00 AM – 2:00 PM",
          buttons: [
            { text: "🎓 Admission Routes", act: "admissions" },
            { text: "🚌 Location & Transport", act: "transport" },
            { text: "🏛️ About RVITM", act: "about" }
          ]
        };

      case 'syllabus':
        return {
          text: "📜 **Curriculum & Syllabus — RVITM (VTU CBCS)**<br><br>" +
                "Download official VTU scheme and syllabus documents:",
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
          text: "📜 **Accreditations & Approvals — RVITM**<br><br>" +
                "• 🏛️ **AICTE Approval:** Continuous Extension of Approval (EoA 2026-27).<br>" +
                "• 🎓 **VTU Affiliation:** Permanently affiliated to Visvesvaraya Technological University, Belagavi.<br>" +
                "• 🔬 **Research Centres:** VTU-recognized centres in Basic Sciences and Engineering.<br>" +
                "• 🏛️ **Government Approval:** Validated by Government of Karnataka (GoK).",
          buttons: [
            { text: "📄 AICTE EoA (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/06/EOA-2026-27.pdf" },
            { text: "📄 VTU Affiliation (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/Affiliation-2025-26.pdf" },
            { text: "📄 GoK Order (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/GOK-order-all-courses.pdf" }
          ]
        };

      case 'circulars':
        return {
          text: "📢 **Circulars & Notices — RVITM**<br><br>" +
                "• 📅 **Academic Calendar:** Semester schedules, timelines, and exams.<br>" +
                "• 📝 **VTU Circulars:** Examination time-tables and registration notices.<br>" +
                "• 🎓 **Admissions:** Latest seat availability, quotas, and guidelines.",
          buttons: [
            { text: "🌐 Open Circulars Desk", url: "https://rvitm.edu.in/circular_and_notifications/" },
            { text: "🎓 Admissions 2026", act: "admissions" },
            { text: "📞 Contact Office", act: "contact" }
          ]
        };

      case 'committees':
        return {
          text: "⚖️ **Statutory Committees — RVITM**<br><br>" +
                "• 🛡️ **Anti-Ragging Committee (ARC):** Dr. Nagashettappa Biradar (Principal)<br>" +
                "• ⚖️ **Disciplinary Action Committee (DAC):** Dr. Manjunatha Prasad R (Vice Principal)<br>" +
                "• 📝 **Grievance Redressal:** Dr. Prashant P. Patavardhan (ECE)<br>" +
                "• 📋 **Malpractice Cases (MPCC):** Dr. Hema M S (HOD CSE)<br>" +
                "• 👩 **Women Empowerment & POSH:** Dr. Latha C. A. (ISE)<br>" +
                "• 📈 **Institute Planning:** Dr. Malini M. Patil (Dean CSE)",
          buttons: [
            { text: "🛡️ Anti-Ragging Cell", act: "antiragging" },
            { text: "📝 Grievance Redressal", act: "grievance" },
            { text: "🌐 Committees Webpage", url: "https://rvitm.edu.in/committee/" }
          ]
        };

      case 'antiragging':
        return {
          text: "🛡️ **Anti-Ragging Committee & Squad — RVITM**<br><br>" +
                "• **Policy:** Strict zero tolerance against ragging per AICTE/UGC norms.<br>" +
                "• **Chairman:** Dr. Nagashettappa Biradar (Principal)<br>" +
                "• **Deputy Chairman:** Dr. Manjunatha Prasad R (Vice Principal)<br>" +
                "• **Convener:** Dr. Gangadharaiah Y. H. (ASH)<br>" +
                "• **Police Nominee:** Sri Babu KV, Sub Inspector (Ph: 8123442381)<br>" +
                "• **Squad Convener:** Dr. Nagbhabushan P. (Math) — conducts surprise checks.",
          buttons: [
            { text: "📄 Anti-Ragging Policy (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/Anti-Ragging-web.pdf" },
            { text: "📝 Grievance Redressal", act: "grievance" },
            { text: "📞 Contact Office", act: "contact" }
          ]
        };

      case 'grievance':
        return {
          text: "📝 **Online Grievance Redressal & POSH — RVITM**<br><br>" +
                "• **Compliance:** Mandated under AICTE Act Clause 1 Section 23.<br>" +
                "• **Convener:** Dr. Prashant P. Patavardhan (Professor, ECE).<br>" +
                "• **Submission:** Online filing at `principal.rvitm@rvei.edu.in`.<br>" +
                "• **Women / POSH Cell:** Led by Dr. Latha C. A. and clinical psychologist Dr. Padmakshi L.",
          buttons: [
            { text: "📄 Grievance Order (PDF)", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/Institute-Online-Grievances-Cell-2025-26.docx.pdf" },
            { text: "🛡️ Anti-Ragging Cell", act: "antiragging" },
            { text: "📞 Contact Us", act: "contact" }
          ]
        };

      case 'nss':
        return {
          text: "🤝 **National Service Scheme (NSS) — RVITM Unit**<br><br>" +
                "• **Motto:** \"Not Me But You\"<br>" +
                "• **Programme Officers:**<br>" +
                "  - Dr. Lokesh P. (ME) — 9632389355<br>" +
                "  - Mr. Abhaykumar S. Inchal (ISE) — 9449608448<br>" +
                "• **Recruitment:** Annual enrollment in August followed by VTU submission.<br>" +
                "• **Email:** `nssunit.rvitm@rvei.edu.in` | Blood camps, tree plantations & digital literacy.",
          buttons: [
            { text: "🌐 NSS Webpage", url: "https://rvitm.edu.in/nss/" },
            { text: "🚀 Student Clubs", act: "clubs" },
            { text: "🏢 Campus Facilities", act: "facilities" }
          ]
        };

      case 'alumni':
        return {
          text: "🌐 **Alumni Network — RVITM**<br><br>" +
                "• Global community of graduates across tech, research, and entrepreneurship.<br>" +
                "• Engaged in mentorship, guest talks, campus referrals, and project guidance.",
          buttons: [
            { text: "🌐 Alumni Portal", url: "https://rvitm.edu.in/alumni/" },
            { text: "💼 Placements", act: "placements" },
            { text: "🏛️ About RVITM", act: "about" }
          ]
        };

      default:
        return {
          text: "I couldn't find an exact match for that query. Choose a topic below or rephrase your question:",
          buttons: [
            { text: "💼 Placements", act: "placements" },
            { text: "🎓 Admissions 2026", act: "admissions" },
            { text: "📚 Courses Offered", act: "departments" },
            { text: "👨‍🏫 Faculty Directory", act: "faculty_list" },
            { text: "🔬 Research & Clubs", act: "research" },
            { text: "📞 Contact Us", act: "contact" }
          ]
        };
    }
  }

  /* =========================================================================
     9. CARD RENDERERS (Department, HOD, Faculty, Faculty Roster)
     ========================================================================= */
  function renderDepartmentCard(d) {
    const deptCodeMap = {
      'cs': 'cse', 'cse': 'cse',
      'aiml': 'aiml', 'ai': 'aiml',
      'is': 'ise', 'ise': 'ise',
      'ec': 'ece', 'ece': 'ece',
      'me': 'me', 'mech': 'me',
      'mca': 'mca',
      'ash': 'ash'
    };
    const key = deptCodeMap[d.c] || d.c;
    const facList = (KB.faculty && KB.faculty[key]) ? KB.faculty[key] : [];
    const facCount = facList.length;
    const focusStr = (d.focusAreas && d.focusAreas.length) ? d.focusAreas.join(', ') : 'Emerging Technologies & Engineering';

    return {
      text: "📘 **Department of " + d.n + " (" + d.code + ")**<br><br>" +
            "• 👨‍💼 **HOD:** **" + d.hod + "** (" + d.hodTitle + ")<br>" +
            (d.intake ? "• 🎓 **Intake:** **" + d.intake + " seats** (AICTE approved, VTU affiliated)<br>" : '') +
            "• 🔬 **Key Focus:** " + focusStr + "<br>" +
            "• 👨‍🏫 **Faculty:** " + facCount + " faculty members<br>" +
            "• 💼 **Placements:** Centralized with RVCE (Highest: ₹41.5 LPA, Avg: ₹12.27 LPA)",
      url: d.url,
      buttons: [
        { text: "👨‍🏫 " + d.code + " Faculty", act: "fac_" + d.c },
        { text: "💼 " + d.code + " Placements", act: "plcmt_" + d.c },
        { text: "🌐 Official Dept Webpage", url: d.url },
        { text: "📚 All Courses", act: "departments" }
      ]
    };
  }

  function renderHODCard(d) {
    return {
      text: "👔 **Head of Department — " + d.code + "**<br><br>" +
            "**" + d.hod + "**<br>" +
            "• **Designation:** " + d.hodTitle + "<br>" +
            "• **Department:** " + d.n + "<br>" +
            "• **Institution:** RV Institute of Technology & Management (RVITM)",
      url: d.url,
      buttons: [
        { text: "📘 " + d.code + " Overview", act: "dept_" + d.c },
        { text: "👨‍🏫 " + d.code + " Faculty", act: "fac_" + d.c },
        { text: "💼 " + d.code + " Placements", act: "plcmt_" + d.c },
        { text: "👔 All HODs", act: "hods_list" }
      ]
    };
  }

  function renderDeptFacultyList(deptKey) {
    const deptCodeMap = {
      'cs': 'cse', 'cse': 'cse',
      'aiml': 'aiml', 'ai': 'aiml',
      'is': 'ise', 'ise': 'ise',
      'ec': 'ece', 'ece': 'ece',
      'me': 'me', 'mech': 'me',
      'mca': 'mca',
      'ash': 'ash'
    };
    const key = deptCodeMap[deptKey] || deptKey;
    const list = (KB.faculty && KB.faculty[key]) ? KB.faculty[key] : [];
    const deptObj = allBranches.find(b => b.c === deptKey || b.c === key) || KB.departments.foundational?.find(b => b.c === deptKey || b.c === key);
    const deptName = deptObj ? deptObj.n : key.toUpperCase();
    const code = deptObj ? deptObj.code : key.toUpperCase();

    if (!list || list.length === 0) {
      return {
        text: "👨‍🏫 Faculty directory for " + deptName + " will be updated shortly.",
        buttons: [{ text: "📚 All Courses", act: "departments" }]
      };
    }

    let text = "👨‍🏫 **Faculty Directory — " + deptName + " (" + code + ")**<br><br>" +
               "Total " + list.length + " faculty members. Key professors:<br><br>";

    list.slice(0, 6).forEach((f, idx) => {
      text += (idx + 1) + ". **" + f.n + "** — " + f.d + "<br>";
    });

    if (list.length > 6) {
      text += "<br><em>...and " + (list.length - 6) + " more professors on official page.</em>";
    }

    const buttons = [];
    list.slice(0, 3).forEach(f => {
      const cleanSlug = f.slug || f.n.toLowerCase().replace(/[^a-z0-9]/g, '');
      const shortName = f.n.replace(/Dr\.|Prof\.|Mr\.|Mrs\.|Ms\./gi, '').trim();
      buttons.push({ text: "👤 " + shortName, act: "fac_" + cleanSlug });
    });

    const listingUrl = list[0].u.replace(/\/[^\/]+\/?$/, '/');
    buttons.push({ text: "🌐 All " + code + " Profiles", url: listingUrl });
    buttons.push({ text: "📘 " + code + " Course Info", act: "dept_" + (deptObj ? deptObj.c : deptKey) });
    buttons.push({ text: "👨‍🏫 Faculty Directory", act: "faculty_list" });

    return { text, url: listingUrl, buttons };
  }

  function renderFacultyCard(f, deptCode) {
    if (!f) return { text: "Faculty profile not found.", buttons: [{ text: "👨‍🏫 Faculty Directory", act: "faculty_list" }] };
    const deptCodeMap = {
      'cs': 'cse', 'cse': 'cse',
      'aiml': 'aiml', 'ai': 'aiml',
      'is': 'ise', 'ise': 'ise',
      'ec': 'ece', 'ece': 'ece',
      'me': 'me', 'mech': 'me',
      'mca': 'mca',
      'ash': 'ash'
    };
    const key = deptCodeMap[deptCode] || deptCode;
    const deptObj = allBranches.find(b => b.c === deptCode || b.c === key) || KB.departments.foundational?.find(b => b.c === deptCode || b.c === key);
    const deptName = deptObj ? deptObj.n : (key ? key.toUpperCase() : 'Engineering');
    const code = deptObj ? deptObj.code : (key ? key.toUpperCase() : '');

    return {
      text: "👨‍🏫 **" + f.n + "** — **" + deptName + "**<br><br>" +
            "• 👔 **Designation:** " + f.d + "<br>" +
            "• 🎓 **Qualification:** " + (f.q || "M.Tech / Ph.D.") + "<br>" +
            "• 🔬 **Domain:** " + (f.e || "Engineering & Research") + "<br>" +
            "• 🏛️ **College:** RVITM, Bengaluru",
      url: f.u,
      buttons: [
        { text: "🌐 View Official Profile", url: f.u },
        { text: "📘 " + code + " Dept", act: "dept_" + (deptObj ? deptObj.c : deptCode) },
        { text: "👨‍🏫 " + code + " Faculty", act: "fac_" + (deptObj ? deptObj.c : deptCode) },
        { text: "👨‍🏫 Faculty Directory", act: "faculty_list" }
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
