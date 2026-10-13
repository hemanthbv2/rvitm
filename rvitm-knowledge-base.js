/**
 * RVITM KNOWLEDGE BASE (Authentic Institution Data)
 * Source: Official RVITM Portal (https://rvitm.edu.in/)
 * Affiliation: Visvesvaraya Technological University (VTU), Belagavi
 * Approvals: AICTE, Govt. of Karnataka
 * Managed by: Rashtreeya Sikshana Samithi Trust (RSST) / RV Educational Institutions (RVEI)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RVITM_KB = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
    general: {
      name: "RV Institute of Technology and Management (RVITM)",
      shortName: "RVITM",
      est: "2019",
      trust: "Rashtreeya Sikshana Samithi Trust (RSST)",
      affiliation: "Visvesvaraya Technological University (VTU), Belagavi",
      aicteApproved: true,
      campusLocation: "Chaithanya Layout, 8th Phase, J.P. Nagar, Bengaluru – 560076, Karnataka, India",
      campusSize: "Modern Urban High-Tech Engineering Campus in South Bengaluru",
      vision: "To impart top-quality technical education with global competence and societal commitment, leading to breakthrough innovations.",
      mission: "Our mission is to nurture passionate engineers through experiential learning by providing state-of-the-art infrastructure and ICT-enabled education.",
      mentalHealthSupport: "24/7 dedicated mental health helpline in partnership with Cadabams Hospital.",
      legacy: "Part of the prestigious 80+ year legacy of RV Educational Institutions (RVEI) with over 27 institutions and 24,000+ students.",
      contact: {
        phone: "080-35095100",
        phones: [
          "+91 8951758140",
          "080-35095100",
          "080-35095101",
          "080-35095102",
          "080-35095103",
          "080-35095104"
        ],
        mobile: "+91 8951758140",
        officeHours: "Monday to Friday: 09:00 AM – 05:00 PM | Saturday: 09:00 AM – 02:00 PM",
        email: "info.rvitm@rvei.edu.in",
        admissionsEmail: "admissions.rvitm@rvei.edu.in",
        principalEmail: "principal.rvitm@rvei.edu.in",
        nssEmail: "nssunit.rvitm@rvei.edu.in",
        website: "https://rvitm.edu.in",
        address: "Chaithanya Layout, 8th Phase, J.P. Nagar, Bengaluru, Karnataka – 560076"
      }
    },

    leadership: {
      president: {
        name: "Dr. M. P. Shyam",
        role: "President, RSST / RV Educational Institutions"
      },
      honSecretary: {
        name: "Dr. (h.c.) A. V. S. Murthy",
        role: "Hon. Secretary, RSST / RV Educational Institutions"
      },
      honJointSecretary: {
        name: "Mr. D. P. Nagaraj",
        role: "Hon. Joint Secretary, RSST / RV Educational Institutions"
      },
      treasurer: {
        name: "Mr. P. S. Venkatesh Babu",
        role: "Hon. Treasurer, RSST / RV Educational Institutions"
      },
      assistantSecretary: {
        name: "Mr. Nikhil A. Murthy",
        role: "Assistant Secretary, RSST / RV Educational Institutions"
      },
      principal: {
        name: "Dr. Nagashettappa Biradar",
        role: "Principal, RVITM",
        bio: "Distinguished academician and administrator leading RVITM toward cutting-edge research, industry-aligned engineering pedagogy, and holistic student development.",
        email: "principal.rvitm@rvei.edu.in"
      },
      vicePrincipal: {
        name: "Dr. Manjunatha Prasad R",
        role: "Vice Principal, Professor & Head, Department of Electronics & Communication Engineering"
      },
      deanCseCluster: {
        name: "Dr. Malini M. Patil",
        role: "Dean, CSE Cluster"
      },
      iqacChiefCoordinator: {
        name: "Dr. Latha C. A.",
        role: "Professor, ISE Department & IQAC Chief Coordinator"
      }
    },

    departments: {
      ug: [
        {
          c: "cs",
          code: "CSE",
          n: "Computer Science and Engineering",
          intake: "",
          hod: "Dr. Hema M S",
          hodTitle: "Professor & Head of Department",
          url: "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/",
          overview: "Focuses on AI, software architecture, cloud platforms, full-stack development, and data systems with deep tech industry alignment.",
          focusAreas: ["Artificial Intelligence & ML", "Software Engineering", "Data Analytics", "Cloud Computing", "IoT & Embedded Systems"],
          labs: ["Advanced Programming Lab", "AI & Data Engineering Lab", "Cloud & Web Tech Lab", "System Software Lab"]
        },
        {
          c: "aiml",
          code: "AI&ML",
          n: "Computer Science and Engineering (Artificial Intelligence & Machine Learning)",
          intake: "",
          hod: "Dr. Surbhi Agrawal",
          hodTitle: "Professor & Head of Department",
          url: "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering_aiml/",
          overview: "Specialized cutting-edge computing branch combining core algorithms with deep learning, neural networks, robotics perception, and NLP.",
          focusAreas: ["Deep Learning & Neural Networks", "Natural Language Processing", "Computer Vision", "Robotics & Automation", "Predictive Analytics"],
          labs: ["Deep Learning GPU Cluster Lab", "Computer Vision Lab", "AI Innovation Lab"]
        },
        {
          c: "is",
          code: "ISE",
          n: "Information Science and Engineering",
          intake: "",
          hod: "Dr. Vinoth Kumar M",
          hodTitle: "Associate Professor & Head of Department",
          url: "https://rvitm.edu.in/departments/department_of_information_science_and_engineering/",
          overview: "Empowering innovation by transforming information into intelligence. Centers on cybersecurity, big data systems, distributed networks, and modern software architectures.",
          focusAreas: ["Cybersecurity & Cryptography", "Big Data Analytics", "Distributed Computing", "DevOps & Cloud", "Database Architecture"],
          labs: ["Cybersecurity & Networking Lab", "Big Data Analytics Lab", "Enterprise Systems Lab"]
        },
        {
          c: "ec",
          code: "ECE",
          n: "Electronics and Communication Engineering",
          intake: "60",
          hod: "Dr. Manjunatha Prasad R",
          hodTitle: "Vice Principal, Professor & Head of Department",
          url: "https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/",
          overview: "Bridges hardware and modern communications. Focuses on VLSI design, embedded IoT, 5G wireless systems, and signal processing.",
          focusAreas: ["VLSI System Design", "Embedded Systems & IoT", "5G & Wireless Networks", "Signal & Image Processing", "Robotics"],
          labs: ["VLSI & HDL Lab", "Embedded & IoT Microcontroller Lab", "Communication Systems Lab", "Advanced DSP Lab"]
        },
        {
          c: "me",
          code: "ME",
          n: "Mechanical Engineering",
          intake: "",
          hod: "Dr. C. Solaimuthu",
          hodTitle: "Professor & Head of Department",
          url: "https://rvitm.edu.in/departments/department_of_mechanical_engineering/",
          overview: "Cornerstone of engineering innovation integrating smart manufacturing, robotics, CAD/CAM/CAE simulation, thermal energy, and composite materials.",
          focusAreas: ["Robotics & Automation", "CAD/CAM & Digital Manufacturing", "Thermal & Energy Systems", "Material Science", "Mechatronics"],
          labs: ["CAD/CAM Modeling Lab", "Robotics & Automation Lab", "Fluid Mechanics & Heat Transfer Lab", "Materials Testing Lab"]
        }
      ],
      pg: [
        {
          c: "mca",
          code: "MCA",
          n: "Master of Computer Applications",
          intake: "",
          hod: "Dr. M. Mrunalini",
          hodTitle: "Professor & Head of Department",
          url: "https://rvitm.edu.in/departments/department-of-master-of-computer-applications/",
          overview: "Postgraduate programme preparing tech leaders in enterprise software engineering, modern cloud frameworks, full-stack development, and data technologies.",
          focusAreas: ["Full-Stack Enterprise Development", "Mobile & Cloud Applications", "Data Science & Big Data", "Software Testing & QA"],
          labs: ["Enterprise Software Lab", "Cloud Computing Lab", "Advanced Data Science Lab"]
        }
      ],
      foundational: [
        {
          c: "ash",
          code: "ASH",
          n: "Department of Applied Sciences and Humanities",
          hod: "Dr. Gangadharaiah Y H",
          hodTitle: "Professor & Head of Department",
          url: "https://rvitm.edu.in/departments/department_of_applied_sciences_and_humanities/",
          overview: "Builds the analytical, scientific, and mathematical foundation for all first-year engineering students spanning Physics, Chemistry, Mathematics, and Professional Communication.",
          focusAreas: ["Engineering Mathematics", "Engineering Physics", "Engineering Chemistry", "Technical English & Ethics"],
          labs: ["Engineering Physics Lab", "Engineering Chemistry Lab", "Language & Communication Lab"]
        }
      ]
    },

    placements: {
      stats: {
        highestPackage: "₹41.5 LPA",
        averagePackage: "₹12.27 LPA",
        placementRate: "80%+",
        companiesVisiting: "200+",
        totalStudents: "1,687+",
        eligibility: "Students become eligible after completing the 6th semester (3rd year) with requisite academic CGPA."
      },
      team: {
        directorRVCE: "Dr. Ranganath D (Director, Placement, RVCE)",
        deputyDirector: "MD Ataullah (Deputy Director, Placements & Training, RVITM)",
        enggCoordinator: "Dr. Mallanagouda Patil (Placement Coordinator for Engineering, RVITM)",
        mcaCoordinator: "Prof. Jayaramu M (Placement Coordinator for MCA, RVITM)"
      },
      jointEcosystem: "RVITM shares a centralized, combined placement ecosystem with RVCE, providing direct access to premier Tier-1 global recruiters, high-value packages, and industry internship drives.",
      sectors: {
        software: ["Amazon", "Oracle", "Walmart", "Cisco", "PhonePe", "Nutanix", "PayPal", "Avalara"],
        semiconductor: ["Qualcomm", "Samsung Semiconductors", "Philips", "Texas Instruments"],
        financeTech: ["JPMorgan Chase", "Deutsche Bank", "Goldman Sachs"],
        consultingIT: ["Infosys", "Wipro", "Accenture", "Cognizant", "TCS Digital"]
      },
      internships: {
        highlights: "Practical industry internships in AI, Data Science, Software Development, Embedded Systems, and Cloud.",
        stipends: "Stipends up to ₹30,000 per month.",
        recruiters: ["Cisco", "Flipkart", "Deutsche Bank"]
      },
      selectionLists: [
        {
          batch: "2022–2026 Batch",
          selectedCandidates: "202 Candidates",
          date: "15th Sept 2026",
          url: "https://rvitm.edu.in/wp-content/uploads/2026/09/RVITM_SelectionList_2026-Batch_15thSept_2026_202_Candidates.pdf"
        },
        {
          batch: "2021–2025 Batch",
          selectedCandidates: "172 Candidates",
          date: "23rd August 2025",
          url: "https://rvitm.edu.in/wp-content/uploads/2026/03/RVITM_SelectionList_2025-Batch_23rdAugust2025_172_Candidates_Updated.pdf"
        },
        {
          batch: "2020–2024 Batch",
          selectedCandidates: "181 Candidates",
          date: "19th Sep 2024",
          url: "https://rvitm.edu.in/wp-content/uploads/2026/03/RVITM_SelectionList_2024-Batch_19th_Sep2024_181_Candidates-2.pdf"
        }
      ],
      officialDocs: {
        statisticsPdf: "https://rvitm.edu.in/wp-content/uploads/2026/08/Placement_Statistics-All-Batches-HS-and-History-of-Baklogs-Candidates-Excluded.docx.pdf",
        placementFlyer: "https://rvitm.edu.in/wp-content/uploads/2026/07/RVITM-Placement-flyer.pdf"
      },
      placementPage: "https://rvitm.edu.in/placement/"
    },

    admissions: {
      ugEligibility: "10+2 / PUC with Physics and Mathematics as compulsory subjects along with Chemistry / Bio-Technology / Biology / Computer Science / Electronics with minimum 45% aggregate (40% for reserved category).",
      pgEligibility: "Recognized Bachelor's degree of minimum 3 years duration with Mathematics at 10+2 level or at Graduate level with minimum 50% marks (45% for reserved category).",
      routes: [
        {
          name: "KCET (Karnataka Common Entrance Test)",
          quota: "Karnataka Domicile Government Seats",
          authority: "Karnataka Examinations Authority (KEA)",
          code: "Refer to the KEA counselling portal for the current college code"
        },
        {
          name: "COMED-K (Consortium of Medical, Engineering and Dental Colleges of Karnataka)",
          quota: "All India Merit Seats",
          authority: "COMED-K Examination Board",
          code: "COMED-K College Code for RVITM"
        },
        {
          name: "Management Quota (Institutional Admissions)",
          quota: "Direct Institutional Seats based on merit and entrance scores",
          authority: "RSST Central Admissions Office"
        },
        {
          name: "PGCET / KMAT (For MCA)",
          quota: "Postgraduate Karnataka / All India admissions",
          authority: "KEA PGCET Board"
        }
      ],
      onlineFeePayment: "https://wds-prd.rvei.edu.in:4430/sap/bc/ui5_ui5/ui2/ushell/shells/abap/Fiorilaunchpad.html",
      enquiryLink: "https://rvitm.edu.in/admissions/",
      contactHelpline: "080-35095100 / info.rvitm@rvei.edu.in"
    },

    facilities: {
      smartClassrooms: "Acoustically treated, air-conditioned lecture theatres equipped with interactive smart boards, multimedia projectors, and lecture recording systems.",
      laboratories: "Industry-grade specialized laboratories across all branches equipped with high-end workstations, GPU nodes, embedded toolchains, and licensed CAD/VLSI software suites.",
      library: "State-of-the-art Central Library with extensive physical book stacks, e-journals (IEEE Xplore, ScienceDirect, Springer, VTU Consortium), digital reading pods, and quiet study halls.",
      hostels: "Dedicated on-campus/adjacent Boys and Girls hostels featuring 24/7 biometric security, high-speed Wi-Fi, hygienic dining facilities serving North & South Indian meals, indoor recreation, and power backup.",
      mentalHealthCadabams: "24/7 Student Wellbeing Helpline in official partnership with Cadabams Hospital for round-the-clock psychological and emotional support.",
      cafeteria: "Hygienic multi-cuisine cafeteria providing healthy vegetarian and nutritional breakfast, lunch, and snack options throughout campus hours.",
      sportsGym: "Indoor badminton courts, table tennis, gymnasium, and outdoor grounds. Proud winners of the VTU Institutional Sports Achievement Award.",
      transport: "Well-connected BMTC bus routes and dedicated institution transport connecting all major quadrants of Bengaluru including Banashankari, Electronic City, Silk Board, and Kanakapura Road."
    },

    clubs: [
      { name: "ECE Club (ECX)", type: "Technical", description: "Hardware hacking, IoT, PCB design, and embedded electronics workshops." },
      { name: "Pheonix Robotics Club", type: "Technical", description: "Design, build, and programming of autonomous and combat robotics." },
      { name: "Coding Club", type: "Technical", description: "Competitive programming, hackathons, LeetCode sprints, and open-source contributions." },
      { name: "Aegis", type: "Technical", description: "Cybersecurity, ethical hacking, CTF competitions, and system security." },
      { name: "E-Cell (Entrepreneurship Cell)", type: "Innovation", description: "Startup incubation, pitch events, mentorship from founders, and angel investor connects." },
      { name: "Rudra", type: "Cultural & Theatre", description: "Dramatics, street plays, theatrical performances, and stage arts." },
      { name: "Kannada Sangha", type: "Cultural & Literary", description: "Celebrates Kannada culture, Rajyotsava festivals, literature, and regional arts." },
      { name: "Cultural Club", type: "Cultural", description: "Dance, vocal & instrumental music, fashion, and college annual celebrations." },
      { name: "Adventure Activities Club", type: "Recreation", description: "Trekking expeditions, nature exploration, team building, and outdoor survival skills." },
      { name: "Science Club", type: "Academic", description: "Scientific discussions, seminars on astronomy, quantum physics, and research papers." },
      { name: "Magazine Club", type: "Media & Editorial", description: "Curates the college annual magazine, newsletters, interviews, and creative writing." },
      { name: "NSS (National Service Scheme)", type: "Social Service", description: "Blood donation camps, rural literacy drives, tree planting, and community service." }
    ],

    libraryDetails: {
      overview: "Hybrid library and hub of knowledge fully automated with LIBSOFT Library Management System and RFID enabled surveillance and circulation operations.",
      hours: "Open from 9:00 AM to 5:00 PM on all working days.",
      system: "LIBSOFT Library Management System with RFID circulation counter and OPAC catalog.",
      terminals: "10 computer terminals for internet and e-resources access with high-speed Wi-Fi.",
      plagiarismTools: ["Turnitin", "DrillBit"],
      eJournals: [
        "IEEE Xplore",
        "Science Direct (Elsevier)",
        "Springer Link",
        "Taylor & Francis Online",
        "Emerald Insight"
      ],
      eBooks: [
        "CBS Publishers", "Cambridge University Press", "Cengage Learning", "BSP Books",
        "Taylor & Francis", "Springer", "New Age International", "Elsevier Science Direct",
        "Packt", "Edsol Informatics", "Quiklrn"
      ],
      eDatabases: ["EBSCO", "Magzter"],
      moocs: ["Swayam", "NPTEL", "Coursera", "Class Central", "VTU"],
      courses: "70 IEEE Blended e-Learning courses and 14 PAT Technology e-Learning courses.",
      librarian: {
        name: "Dr. A. Nagaraja",
        qualification: "B.Sc., M.L.I.Sc., Ph.D.",
        role: "Librarian",
        resumeUrl: "https://rvitm.edu.in/wp-content/uploads/2026/05/Resume.pdf"
      },
      url: "https://rvitm.edu.in/departments/library-2/"
    },

    statutoryCommittees: {
      antiRaggingCommittee: {
        name: "Anti-Ragging Committee (ARC)",
        chairman: "Dr. Nagashettappa Biradar (Principal)",
        deputyChairman: "Dr. Manjunatha Prasad R (Vice Principal)",
        convener: "Dr. Gangadharaiah Y. H. (Professor & Head, ASH Department)",
        policeNominee: "Sri Babu KV, Sub Inspector of Police (8123442381)",
        docUrl: "https://rvitm.edu.in/wp-content/uploads/2026/03/Anti-Ragging-web.pdf"
      },
      antiRaggingSquad: {
        name: "Anti-Ragging Squad (ARS)",
        convener: "Dr. Nagbhabushan P. (Assistant Professor, Mathematics)",
        role: "Continuous campus patrols, surprise checks, classrooms and hostel vigilance."
      },
      grievanceRedressal: {
        name: "Statutory Online Grievance Redressal Committee",
        mandate: "Constituted in accordance with AICTE Act, Clause 1 of Section 23",
        convener: "Dr. Prashant P. P. (Professor, ECE Department)",
        submissionEmail: "principal.rvitm@rvei.edu.in",
        docUrl: "https://rvitm.edu.in/wp-content/uploads/2026/03/Institute-Online-Grievances-Cell-2025-26.docx.pdf"
      },
      womenEmpowermentAndPOSH: {
        name: "Women Empowerment Cell (WEC) / Anti-Sexual Harassment Committee (ASHC)",
        chairperson: "Dr. Latha C. A. (Professor, ISE Department)",
        externalMember: "Dr. Padmakshi L (Clinical Psychologist, SNL Foundation)",
        mandate: "POSH Act compliance and dedicated grievance handling for women students and staff."
      },
      internalComplaints: {
        name: "Internal Complaints Committee (ICC)",
        chairperson: "Dr. Latha C. A. (Professor, ISE Department)"
      },
      disciplinaryAction: {
        name: "Disciplinary Action Committee (DAC)",
        convenor: "Dr. Manjunatha Prasad R (Vice Principal)"
      },
      malpracticeCases: {
        name: "Malpractice Cases Consideration Committee (MPCC)",
        convenor: "Dr. Hema M. S. (Head, CSE Dept)"
      },
      planningAndDevelopment: {
        name: "Institute Development & Planning Committee",
        convenor: "Dr. Malini M. Patil (Dean, CSE Cluster)"
      },
      url: "https://rvitm.edu.in/committee/"
    },

    nssDetails: {
      name: "National Service Scheme (NSS Unit RVITM)",
      motto: "Not Me But You",
      officers: [
        { name: "Dr. Lokesh P.", role: "NSSO-I (Assistant Professor, ME Department)", phone: "9632389355" },
        { name: "Mr. Abhaykumar S. Inchal", role: "NSSO-II (Assistant Professor, ISE Department)", phone: "9449608448" }
      ],
      email: "nssunit.rvitm@rvei.edu.in",
      enrollment: "Recruitment starts with the academic year (2nd or 3rd week of August) through personal interviews and registration with VTU.",
      initiatives: [
        "Blood Donation Camps",
        "Rural Development & Literacy Programmes",
        "Tree Plantation Drives & Environmental Sustainability",
        "Cleanliness & Waste Management Campaigns",
        "Road Safety & Digital Literacy Drives"
      ],
      url: "https://rvitm.edu.in/nss/"
    },

    syllabusDocs: {
      mca: {
        sem1: "https://rvitm.edu.in/wp-content/uploads/2026/05/MCA-2024-Syllabus-1st-semester.pdf",
        year2: "https://rvitm.edu.in/wp-content/uploads/2026/08/MCA-2nd-year-Syllabus.pdf",
        pos: "https://rvitm.edu.in/wp-content/uploads/2026/05/PROGRAMME-OUTCOMES-POs-1.pdf"
      },
      cse: {
        pos: "https://rvitm.edu.in/wp-content/uploads/2026/05/PROGRAMME-OUTCOMES-POs.pdf",
        brochure: "https://rvitm.edu.in/wp-content/uploads/2026/04/E-Brochure-1.pdf"
      },
      ece: {
        sem3_4: "https://rvitm.edu.in/wp-content/uploads/2026/03/ecesch_3_4.pdf",
        sem5: "https://rvitm.edu.in/wp-content/uploads/2026/03/5_ecesch.pdf",
        sem6: "https://rvitm.edu.in/wp-content/uploads/2026/03/6ecesch.pdf",
        sem7_8: "https://rvitm.edu.in/wp-content/uploads/2026/03/7_8_ecesch.pdf"
      }
    },

    alumniDetails: {
      title: "RVITM Alumni Network",
      tagline: "Connecting Graduates Across the Globe",
      url: "https://rvitm.edu.in/alumni/",
      benefits: [
        "Mentorship from industry professionals",
        "Internship opportunities through alumni referrals",
        "Career guidance and industry talks",
        "Annual alumni meets and global networking"
      ]
    },

    accreditations: {
      aicte: "Continuous AICTE Extension of Approval (EoA) from 2019 to 2026-27.",
      gok: "No Objection Certificate (NOC) and approvals from the Government of Karnataka (GoK).",
      vtu: "Official VTU Affiliation notifications from 2019-20 to 2025-26, including VTU Research Centres.",
      links: [
        { title: "AICTE EoA 2026-27", url: "https://rvitm.edu.in/wp-content/uploads/2026/06/EOA-2026-27.pdf" },
        { title: "AICTE EoA 2025-26", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/EOA-Report-2025-26.pdf" },
        { title: "VTU Affiliation 2025-26", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/Affiliation-2025-26.pdf" },
        { title: "GoK All Courses Order", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/GOK-order-all-courses.pdf" },
        { title: "Research Centre Basic Science", url: "https://rvitm.edu.in/wp-content/uploads/2026/03/Research-Centre-Basic-Science-Dept.pdf" }
      ],
      url: "https://rvitm.edu.in/accreditations_affiliations/"
    },

    circulars: {
      categories: [
        "Academic Calendar (Annual schedules, semester dates, holidays)",
        "Examination Circulars (Time tables, hall tickets, re-evaluations)",
        "Academic Circulars (Curriculum updates, departmental notifications)",
        "Admission Circulars (Procedures, deadlines, fee details)"
      ],
      url: "https://rvitm.edu.in/circular_and_notifications/"
    },

    faculty: {
      "cse": [
            {
                  "n": "Deepika D",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/deepika-d/",
                  "slug": "deepika-d"
            },
            {
                  "n": "Amit Kumar Mestri",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/amit-kumar-mestri/",
                  "slug": "amit-kumar-mestri"
            },
            {
                  "n": "Ms. Agashini V Kumar",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/ms-agashini-v-kumar/",
                  "slug": "ms-agashini-v-kumar"
            },
            {
                  "n": "Dr Hema M S",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/dr_hema_m_s/",
                  "slug": "dr_hema_m_s"
            },
            {
                  "n": "Mrs. Priyanka K R",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/mrs_priyanka_k_r/",
                  "slug": "mrs_priyanka_k_r"
            },
            {
                  "n": "Ms. Veda N",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/ms_veda_n/",
                  "slug": "ms_veda_n"
            },
            {
                  "n": "Mr. Murugan S",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/mr_murugan_s/",
                  "slug": "mr_murugan_s"
            },
            {
                  "n": "Dr. Annie Sujith",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/dr_annie_sujith/",
                  "slug": "dr_annie_sujith"
            },
            {
                  "n": "Dr. Prema",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/dr_prema/",
                  "slug": "dr_prema"
            },
            {
                  "n": "Mrs Indu K S",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/mrs_indu_k_s/",
                  "slug": "mrs_indu_k_s"
            },
            {
                  "n": "Mrs. Madhuri H D",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/mrs_madhuri_h_d/",
                  "slug": "mrs_madhuri_h_d"
            },
            {
                  "n": "Mr. Manjunath K M",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/mr_manjunath_k_m/",
                  "slug": "mr_manjunath_k_m"
            },
            {
                  "n": "Mrs. Nayana H J",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/mrs_nayana_h_j/",
                  "slug": "mrs_nayana_h_j"
            },
            {
                  "n": "Mrs. Manjusha Kulkarni",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/mrs_manjusha_kulkarni/",
                  "slug": "mrs_manjusha_kulkarni"
            },
            {
                  "n": "Mrs. Bhavya N Javagal",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/mrs_bhavya_n_javagal/",
                  "slug": "mrs_bhavya_n_javagal"
            },
            {
                  "n": "Mrs. Uppin Rashmi",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/mrs_uppin_rashmi/",
                  "slug": "mrs_uppin_rashmi"
            },
            {
                  "n": "Mrs. Padamasree N",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/mrs_padamasree_n/",
                  "slug": "mrs_padamasree_n"
            },
            {
                  "n": "Dr. Koushik S",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/dr_koushik_s/",
                  "slug": "dr_koushik_s"
            },
            {
                  "n": "Dr. Prabhavathi K",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/dr_prabhavathi_k/",
                  "slug": "dr_prabhavathi_k"
            },
            {
                  "n": "Dr. Shashidhar V",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/dr_shashidhar_v/",
                  "slug": "dr_shashidhar_v"
            },
            {
                  "n": "Dr. Syeda Ayesha Unisa",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/dr_syeda_ayesha_unisa/",
                  "slug": "dr_syeda_ayesha_unisa"
            },
            {
                  "n": "Dr. Nandita Bangera",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/dr_nandita_bangera/",
                  "slug": "dr_nandita_bangera"
            },
            {
                  "n": "Dr. V R Srividhya",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/dr_v_r_srividhya/",
                  "slug": "dr_v_r_srividhya"
            },
            {
                  "n": "Dr. Anil Kumar B",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/dr_anil_kumar_b/",
                  "slug": "dr_anil_kumar_b"
            },
            {
                  "n": "Dr. Satish Basavaraj Basapur",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/dr_satish_basavaraj_basapur/",
                  "slug": "dr_satish_basavaraj_basapur"
            },
            {
                  "n": "Dr. Mallanagouda Patil",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/dr_mallanagouda_patil/",
                  "slug": "dr_mallanagouda_patil"
            },
            {
                  "n": "Dr. Savitha G",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/dr_savitha_g/",
                  "slug": "dr_savitha_g"
            },
            {
                  "n": "Dr. Deepak N A",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/dr_deepak_n_a/",
                  "slug": "dr_deepak_n_a"
            },
            {
                  "n": "Mr. Sudheendra B S",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/mr_sudheendra_b_s/",
                  "slug": "mr_sudheendra_b_s"
            },
            {
                  "n": "Dr Shrishail",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/dr_shrishail/",
                  "slug": "dr_shrishail"
            },
            {
                  "n": "Faculties of CSE",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/faculties_of_cse/",
                  "slug": "faculties_of_cse"
            }
      ],
      "ash": [
            {
                  "n": "Aishwarya P M",
                  "u": "https://rvitm.edu.in/departments/department_of_applied_sciences_and_humanities/faculties_of_applied_science_and_humanities/aishwarya-p-m/",
                  "slug": "aishwarya-p-m"
            },
            {
                  "n": "B E Prasad",
                  "u": "https://rvitm.edu.in/departments/department_of_applied_sciences_and_humanities/faculties_of_applied_science_and_humanities/b_e_prasad/",
                  "slug": "b_e_prasad"
            },
            {
                  "n": "Samrat D",
                  "u": "https://rvitm.edu.in/departments/department_of_applied_sciences_and_humanities/faculties_of_applied_science_and_humanities/samrat_d/",
                  "slug": "samrat_d"
            },
            {
                  "n": "Rudresh Kumar KJ",
                  "u": "https://rvitm.edu.in/departments/department_of_applied_sciences_and_humanities/faculties_of_applied_science_and_humanities/rudresh_kumar_kj/",
                  "slug": "rudresh_kumar_kj"
            },
            {
                  "n": "Dr. Yashwanth V Naik",
                  "u": "https://rvitm.edu.in/departments/department_of_applied_sciences_and_humanities/faculties_of_applied_science_and_humanities/dr_yashwanth_v_naik/",
                  "slug": "dr_yashwanth_v_naik"
            },
            {
                  "n": "Dr. S. Satyanarayana Reddy",
                  "u": "https://rvitm.edu.in/departments/department_of_applied_sciences_and_humanities/faculties_of_applied_science_and_humanities/dr_s_satyanarayana_reddy/",
                  "slug": "dr_s_satyanarayana_reddy"
            },
            {
                  "n": "Dr. Srinatha N",
                  "u": "https://rvitm.edu.in/departments/department_of_applied_sciences_and_humanities/faculties_of_applied_science_and_humanities/dr_srinatha_n/",
                  "slug": "dr_srinatha_n"
            },
            {
                  "n": "Dr. PAVITHRA K M",
                  "u": "https://rvitm.edu.in/departments/department_of_applied_sciences_and_humanities/faculties_of_applied_science_and_humanities/dr_pavithra_k_m/",
                  "slug": "dr_pavithra_k_m"
            },
            {
                  "n": "Dr. Sushma M Puranik",
                  "u": "https://rvitm.edu.in/departments/department_of_applied_sciences_and_humanities/faculties_of_applied_science_and_humanities/dr_sushma_m_puranik/",
                  "slug": "dr_sushma_m_puranik"
            },
            {
                  "n": "Dr. Nagabhushana P",
                  "u": "https://rvitm.edu.in/departments/department_of_applied_sciences_and_humanities/faculties_of_applied_science_and_humanities/dr_nagabhushana_p/",
                  "slug": "dr_nagabhushana_p"
            },
            {
                  "n": "Dr. Sivasankar S",
                  "u": "https://rvitm.edu.in/departments/department_of_applied_sciences_and_humanities/faculties_of_applied_science_and_humanities/dr_sivasankar_s/",
                  "slug": "dr_sivasankar_s"
            },
            {
                  "n": "Dr. Gangadharaiah Y H",
                  "u": "https://rvitm.edu.in/departments/department_of_applied_sciences_and_humanities/faculties_of_applied_science_and_humanities/dr_gangadharaiah_y_h/",
                  "slug": "dr_gangadharaiah_y_h"
            },
            {
                  "n": "Faculties of Applied Science and Humanities",
                  "u": "https://rvitm.edu.in/departments/department_of_applied_sciences_and_humanities/faculties_of_applied_science_and_humanities/",
                  "slug": "faculties_of_applied_science_and_humanities"
            },
            {
                  "n": "Faculty Achievements",
                  "u": "https://rvitm.edu.in/achievements/faculty-achievements/",
                  "slug": "faculty-achievements"
            }
      ],
      "ece": [
            {
                  "n": "Dr. Prateek Dolas",
                  "u": "https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/faculties_of_ece/dr-prateek-dolas/",
                  "slug": "dr-prateek-dolas"
            },
            {
                  "n": "Mrs. Nivedita S Desai",
                  "u": "https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/faculties_of_ece/mrs_nivedita_s_desai/",
                  "slug": "mrs_nivedita_s_desai"
            },
            {
                  "n": "Dr. Divyashree M",
                  "u": "https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/faculties_of_ece/dr_divyashree_m/",
                  "slug": "dr_divyashree_m"
            },
            {
                  "n": "Dr. Venu Gopal B T",
                  "u": "https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/faculties_of_ece/dr_venu_gopal_b_t/",
                  "slug": "dr_venu_gopal_b_t"
            },
            {
                  "n": "Dr. Vikash Kumar",
                  "u": "https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/faculties_of_ece/dr_vikash_kumar/",
                  "slug": "dr_vikash_kumar"
            },
            {
                  "n": "Dr. Shalini Shravan",
                  "u": "https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/faculties_of_ece/dr_shalini_shravan/",
                  "slug": "dr_shalini_shravan"
            },
            {
                  "n": "Dr. Nagesh M",
                  "u": "https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/faculties_of_ece/dr_nagesh_m/",
                  "slug": "dr_nagesh_m"
            },
            {
                  "n": "Dr. Kavitha N",
                  "u": "https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/faculties_of_ece/dr_kavitha_n/",
                  "slug": "dr_kavitha_n"
            },
            {
                  "n": "Dr. Chethan K S",
                  "u": "https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/faculties_of_ece/dr_chethan_k_s/",
                  "slug": "dr_chethan_k_s"
            },
            {
                  "n": "Dr. Madhumathy P",
                  "u": "https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/faculties_of_ece/dr_madhumathy_p/",
                  "slug": "dr_madhumathy_p"
            },
            {
                  "n": "Dr. Nataraj V",
                  "u": "https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/faculties_of_ece/dr_nataraj_v/",
                  "slug": "dr_nataraj_v"
            },
            {
                  "n": "Dr. Prashant P Patavardhan",
                  "u": "https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/faculties_of_ece/dr_prashant_p_patavardhan/",
                  "slug": "dr_prashant_p_patavardhan"
            },
            {
                  "n": "Dr. Manjunatha Prasad R",
                  "u": "https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/faculties_of_ece/dr_manjunatha_prasad_r/",
                  "slug": "dr_manjunatha_prasad_r"
            },
            {
                  "n": "Faculties of ECE",
                  "u": "https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/faculties_of_ece/",
                  "slug": "faculties_of_ece"
            }
      ],
      "ise": [
            {
                  "n": "Mrs. Sunita",
                  "u": "https://rvitm.edu.in/departments/department_of_information_science_and_engineering/faculties_of_ise/mrs_sunita/",
                  "slug": "mrs_sunita"
            },
            {
                  "n": "Mr. Abhaykumar S Inchal",
                  "u": "https://rvitm.edu.in/departments/department_of_information_science_and_engineering/faculties_of_ise/mr_abhaykumar_s_inchal/",
                  "slug": "mr_abhaykumar_s_inchal"
            },
            {
                  "n": "Mrs. Pallavi K N",
                  "u": "https://rvitm.edu.in/departments/department_of_information_science_and_engineering/faculties_of_ise/mrs_pallavi_k_n/",
                  "slug": "mrs_pallavi_k_n"
            },
            {
                  "n": "Mrs. Namrata Brahamaprakash",
                  "u": "https://rvitm.edu.in/departments/department_of_information_science_and_engineering/faculties_of_ise/mrs_namrata_brahamaprakash/",
                  "slug": "mrs_namrata_brahamaprakash"
            },
            {
                  "n": "Mr. Krupesha D",
                  "u": "https://rvitm.edu.in/departments/department_of_information_science_and_engineering/faculties_of_ise/mr_krupesha_d/",
                  "slug": "mr_krupesha_d"
            },
            {
                  "n": "Mrs. Samatha R Swamy",
                  "u": "https://rvitm.edu.in/departments/department_of_information_science_and_engineering/faculties_of_ise/mrs_samatha_r_swamy/",
                  "slug": "mrs_samatha_r_swamy"
            },
            {
                  "n": "Dr. Shruthi P",
                  "u": "https://rvitm.edu.in/departments/department_of_information_science_and_engineering/faculties_of_ise/dr_shruthi_p/",
                  "slug": "dr_shruthi_p"
            },
            {
                  "n": "Dr. Niharika P Kumar",
                  "u": "https://rvitm.edu.in/departments/department_of_information_science_and_engineering/faculties_of_ise/dr_niharika_p_kumar/",
                  "slug": "dr_niharika_p_kumar"
            },
            {
                  "n": "Dr. M. Dhanalakshmi",
                  "u": "https://rvitm.edu.in/departments/department_of_information_science_and_engineering/faculties_of_ise/dr_m_dhanalakshmi/",
                  "slug": "dr_m_dhanalakshmi"
            },
            {
                  "n": "Dr. Latha C A",
                  "u": "https://rvitm.edu.in/departments/department_of_information_science_and_engineering/faculties_of_ise/dr_latha_c_a/",
                  "slug": "dr_latha_c_a"
            },
            {
                  "n": "Dr. Vinoth Kumar M",
                  "u": "https://rvitm.edu.in/departments/department_of_information_science_and_engineering/faculties_of_ise/dr_vinoth_kumar_m/",
                  "slug": "dr_vinoth_kumar_m"
            },
            {
                  "n": "Faculties of ISE",
                  "u": "https://rvitm.edu.in/departments/department_of_information_science_and_engineering/faculties_of_ise/",
                  "slug": "faculties_of_ise"
            }
      ],
      "aiml": [
            {
                  "n": "Mrs. Nisha Wilvicta J",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering_aiml/faculties_of_cse_ai_ml/mrs_nisha_wilvicta_j/",
                  "slug": "mrs_nisha_wilvicta_j"
            },
            {
                  "n": "Mr. Girish Kumar B C",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering_aiml/faculties_of_cse_ai_ml/mr_girish_kumar_b_c/",
                  "slug": "mr_girish_kumar_b_c"
            },
            {
                  "n": "Ms. Arpitha J",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering_aiml/faculties_of_cse_ai_ml/ms-arpitha-j/",
                  "slug": "ms-arpitha-j"
            },
            {
                  "n": "Mr Avinash Rao",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering_aiml/faculties_of_cse_ai_ml/mr-avinash-rao/",
                  "slug": "mr-avinash-rao"
            },
            {
                  "n": "Dr Surabhi Agrawal",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering_aiml/faculties_of_cse_ai_ml/dr-surabhi-agrawal/",
                  "slug": "dr-surabhi-agrawal"
            },
            {
                  "n": "Faculties of CSE(AI/ML)",
                  "u": "https://rvitm.edu.in/departments/department_of_computer_science_and_engineering_aiml/faculties_of_cse_ai_ml/",
                  "slug": "faculties_of_cse_ai_ml"
            }
      ],
      "mca": [
            {
                  "n": "Mrs. K. Sravanthi",
                  "u": "https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/mrs-k-sravanthi/",
                  "slug": "mrs-k-sravanthi"
            },
            {
                  "n": "Mr. Vasanth C Bhagawat",
                  "u": "https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/mr-vasanth-c-bhagawat/",
                  "slug": "mr-vasanth-c-bhagawat"
            },
            {
                  "n": "Mr. Prashanth B",
                  "u": "https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/mr-prashanth-b/",
                  "slug": "mr-prashanth-b"
            },
            {
                  "n": "Ms. Sangeetha K",
                  "u": "https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/ms-sangeetha-k/",
                  "slug": "ms-sangeetha-k"
            },
            {
                  "n": "Dr. B. Sathyabama",
                  "u": "https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/dr-b-sathyabama/",
                  "slug": "dr-b-sathyabama"
            },
            {
                  "n": "Ms. Shreya Khodanpur",
                  "u": "https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/ms-shreya-khodanpur/",
                  "slug": "ms-shreya-khodanpur"
            },
            {
                  "n": "Dr. R. Saravanan",
                  "u": "https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/dr-r-saravanan/",
                  "slug": "dr-r-saravanan"
            },
            {
                  "n": "Ms. Tamal Sarkar",
                  "u": "https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/ms-tamal-sarkar/",
                  "slug": "ms-tamal-sarkar"
            },
            {
                  "n": "Mrs. Shruthi M G",
                  "u": "https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/mrs-shruthi-m-g/",
                  "slug": "mrs-shruthi-m-g"
            },
            {
                  "n": "Mr. Jayaramu M",
                  "u": "https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/mr-jayaramu-m/",
                  "slug": "mr-jayaramu-m"
            },
            {
                  "n": "Dr. N. Kumaresh",
                  "u": "https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/dr-n-kumaresh/",
                  "slug": "dr-n-kumaresh"
            },
            {
                  "n": "Dr. Chethan Venkatesh",
                  "u": "https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/dr-chethan-venkatesh/",
                  "slug": "dr-chethan-venkatesh"
            },
            {
                  "n": "Dr. M. Mrunalini",
                  "u": "https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/dr-m-mrunalini/",
                  "slug": "dr-m-mrunalini"
            },
            {
                  "n": "Faculties of MCA",
                  "u": "https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/",
                  "slug": "faculties-of-mca"
            }
      ],
      "me": [
            {
                  "n": "Mr.Thejas C M",
                  "u": "https://rvitm.edu.in/departments/department_of_mechanical_engineering/faculty-of-mechanical-engineering/mr-thejas-c-m/",
                  "slug": "mr-thejas-c-m"
            },
            {
                  "n": "Dr. Manish Kumar",
                  "u": "https://rvitm.edu.in/departments/department_of_mechanical_engineering/faculty-of-mechanical-engineering/dr-manish-kumar/",
                  "slug": "dr-manish-kumar"
            },
            {
                  "n": "Dr. Harish H",
                  "u": "https://rvitm.edu.in/departments/department_of_mechanical_engineering/faculty-of-mechanical-engineering/dr-harish-h/",
                  "slug": "dr-harish-h"
            },
            {
                  "n": "Dr. Shanthala Kollur",
                  "u": "https://rvitm.edu.in/departments/department_of_mechanical_engineering/faculty-of-mechanical-engineering/dr-shanthala-kollur/",
                  "slug": "dr-shanthala-kollur"
            },
            {
                  "n": "Dr. Gajanan M Naik.",
                  "u": "https://rvitm.edu.in/departments/department_of_mechanical_engineering/faculty-of-mechanical-engineering/dr-gajanan-m-naik/",
                  "slug": "dr-gajanan-m-naik"
            },
            {
                  "n": "Dr. Ramesh S",
                  "u": "https://rvitm.edu.in/departments/department_of_mechanical_engineering/faculty-of-mechanical-engineering/dr-ramesh-s/",
                  "slug": "dr-ramesh-s"
            },
            {
                  "n": "Dr. Lokesh P",
                  "u": "https://rvitm.edu.in/departments/department_of_mechanical_engineering/faculty-of-mechanical-engineering/dr-lokesh-p/",
                  "slug": "dr-lokesh-p"
            },
            {
                  "n": "Dr. Durga Prasad C",
                  "u": "https://rvitm.edu.in/departments/department_of_mechanical_engineering/faculty-of-mechanical-engineering/dr-durga-prasad-c/",
                  "slug": "dr-durga-prasad-c"
            },
            {
                  "n": "Dr. Raghavendra Reddy N V",
                  "u": "https://rvitm.edu.in/departments/department_of_mechanical_engineering/faculty-of-mechanical-engineering/dr-raghavendra-reddy-n-v/",
                  "slug": "dr-raghavendra-reddy-n-v"
            },
            {
                  "n": "Dr. C. SOLAIMUTHU",
                  "u": "https://rvitm.edu.in/departments/department_of_mechanical_engineering/faculty-of-mechanical-engineering/dr-c-solaimuthu/",
                  "slug": "dr-c-solaimuthu"
            },
            {
                  "n": "Faculties of Mechanical Engineering",
                  "u": "https://rvitm.edu.in/departments/department_of_mechanical_engineering/faculty-of-mechanical-engineering/",
                  "slug": "faculty-of-mechanical-engineering"
            }
      ]
}
  };
}));
