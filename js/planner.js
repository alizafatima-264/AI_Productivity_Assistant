/**
 * AI Personalized Goal Planner Wizard & Weekly Calendar
 */

(function() {
  // ─── Calendar State ────────────────────────────────────────────────────────
  let calendarWeekOffset = 0; // 0 = current week, -1 = prev, +1 = next
  let currentRoadmap = [];

  const COURSE_TEMPLATES = {
    'java': [
      "Introduction to Java",
      "Variables & Data Types",
      "Operators & Expressions",
      "Conditional Statements",
      "Loops & Control Flow",
      "Methods & Functions",
      "Arrays & String Handling",
      "Object-Oriented Programming",
      "Inheritance & Polymorphism",
      "Collections Framework",
      "Exception Handling",
      "File I/O & Lambda Expressions",
      "Mini Project",
      "Revision & Practice"
    ],
    'python': [
      "Introduction & Setup",
      "Variables & Data Types",
      "Operators & Expressions",
      "Conditional Statements & Loops",
      "Functions & Modules",
      "Data Structures (Lists, Tuples, Dicts)",
      "File Handling & Exceptions",
      "Object-Oriented Programming",
      "Libraries Overview (NumPy, Pandas)",
      "Data Visualization (Matplotlib)",
      "API Integrations",
      "Database Connectivity",
      "Mini Project",
      "Revision"
    ],
    'c++': [
      "Introduction & Syntax",
      "Variables & Data Types",
      "Operators & Control Flow",
      "Functions & Scope",
      "Pointers & Memory Management",
      "References & Arrays",
      "Object-Oriented Programming",
      "Inheritance & Polymorphism",
      "Templates & STL",
      "Exception Handling",
      "File Handling",
      "Data Structures in C++",
      "Mini Project",
      "Revision & Debugging"
    ],
    'dsa': [
      "Introduction to DSA & Complexity Analysis",
      "Arrays & Dynamic Arrays",
      "Linked Lists (Singly & Doubly)",
      "Stacks & Queues",
      "Recursion & Backtracking",
      "Searching Algorithms (Binary Search)",
      "Sorting Algorithms (Merge, Quick Sort)",
      "Hash Tables & Collisions",
      "Trees & Binary Search Trees",
      "Heaps & Priority Queues",
      "Graphs & Graph Traversals",
      "Dynamic Programming Basics",
      "Greedy Algorithms",
      "Revision & LeetCode Practice"
    ],
    'machine learning': [
      "Introduction to ML & Pipeline",
      "Python for ML (NumPy, Pandas)",
      "Mathematics (Linear Algebra, Calculus)",
      "Data Preparation & Processing",
      "Linear & Logistic Regression",
      "Classification Algorithms",
      "Decision Trees & Random Forests",
      "Support Vector Machines (SVM)",
      "Clustering (K-Means, Hierarchical)",
      "Dimensionality Reduction (PCA)",
      "Neural Networks Introduction",
      "Model Evaluation & Tuning",
      "Mini Project",
      "Final Project & Deployment"
    ],
    'data science': [
      "Introduction to Data Science",
      "Python for Data Science",
      "Data Wrangling & Cleaning",
      "Exploratory Data Analysis (EDA)",
      "Probability & Statistics",
      "Data Visualization (Seaborn, Tableau)",
      "Linear Regression & Core Stats Models",
      "Intro to Machine Learning",
      "Feature Engineering & Selection",
      "SQL for Data Science",
      "Big Data Overview",
      "Communicating Insights & Storytelling",
      "Capstone Project",
      "Revision & Showcase"
    ],
    'web development': [
      "Internet Basics & HTML5",
      "CSS3 Styling & Layouts (Flexbox, Grid)",
      "Responsive Web Design & Media Queries",
      "JavaScript Core Syntax",
      "DOM Manipulation & Events",
      "Asynchronous JS & Fetch API",
      "Git & Version Control",
      "Front-end Frameworks (Intro to React)",
      "Node.js & Express Basics",
      "Databases & MongoDB Basics",
      "RESTful API Integration",
      "Authentication & Security",
      "Deployment & Hosting",
      "Full Stack Capstone Project"
    ],
    'react': [
      "Introduction & Create React App",
      "JSX & Rendering Elements",
      "Components & Props",
      "State & Lifecycle",
      "Handling Events",
      "Conditional Rendering & Lists",
      "Forms & Controlled Components",
      "Hooks (useState, useEffect)",
      "Custom Hooks & Context API",
      "Routing with React Router",
      "State Management (Redux/Zustand)",
      "API Fetching & Data Flow",
      "Testing React Components",
      "Production Build & Deploy"
    ],
    'android development': [
      "Introduction to Kotlin & XML",
      "Android Studio Setup & Hello World",
      "Activities & Lifecycle",
      "Intents & Navigation",
      "UI Layouts & Widgets",
      "RecyclerView & Adapters",
      "Data Storage (Room DB & SharedPreferences)",
      "Networking & Retrofit Library",
      "MVVM Architecture Pattern",
      "Kotlin Coroutines & LiveData",
      "Firebase Integration",
      "Google Maps & Location Services",
      "Testing & Debugging Android Apps",
      "Google Play Store Deployment"
    ],
    'cybersecurity': [
      "Introduction to Cybersecurity Principles",
      "Networking Basics & Protocols",
      "Cryptography Basics",
      "Linux Commands & Scripting",
      "Information Security Frameworks",
      "Vulnerability Assessment & Scanning",
      "Network Attacks & Defensive Measures",
      "Web Application Pentesting",
      "Malware Analysis Basics",
      "Incident Response & Forensics",
      "Cloud Security Concepts",
      "Identity & Access Management",
      "Ethical Hacking Project",
      "Security Certification Prep"
    ],
    'aws': [
      "Introduction to Cloud & AWS Account Setup",
      "IAM (Identity & Access Management)",
      "EC2 (Elastic Compute Cloud)",
      "VPC (Virtual Private Cloud) Networking",
      "S3 (Simple Storage Service)",
      "RDS & DynamoDB Database Services",
      "Route 53 & CloudFront (DNS/CDN)",
      "Elastic Load Balancing & Auto Scaling",
      "Lambda & Serverless Architecture",
      "CloudWatch & CloudTrail Monitoring",
      "AWS Security & Well-Architected Framework",
      "CloudFormation & Infrastructure as Code",
      "Deploying a High-Availability App",
      "AWS Solutions Architect Review"
    ],
    'devops': [
      "DevOps Culture & Principles",
      "Linux Administration & Scripting",
      "Git & Advanced Version Control",
      "CI/CD Concepts & Jenkins / GitHub Actions",
      "Containerization with Docker",
      "Container Orchestration with Kubernetes",
      "Infrastructure as Code (IaC) with Terraform",
      "Configuration Management with Ansible",
      "Monitoring & Logging (Prometheus, Grafana, ELK)",
      "Cloud Platforms (AWS/Azure DevOps)",
      "Security in DevOps (DevSecOps)",
      "Continuous Deployment & GitOps",
      "DevOps Pipeline Capstone",
      "Revision & Best Practices"
    ],
    'ui/ux': [
      "Introduction to UI/UX Design Principles",
      "User Research & Personas",
      "Information Architecture & Sitemap",
      "Wireframing Concepts & Sketching",
      "Figma Basics & Interface Design",
      "Typography & Color Theory",
      "UI Components & Design Systems",
      "Prototyping & Interactions in Figma",
      "User Testing & Iterative Feedback",
      "Mobile vs Desktop Design Patterns",
      "Accessibility & WCAG Guidelines",
      "UX Writing & Microcopy",
      "Portfolio Case Study Creation",
      "Final Presentation & Hand-off"
    ],
    'digital marketing': [
      "Introduction to Digital Marketing",
      "Content Marketing Strategy",
      "Search Engine Optimization (SEO) Basics",
      "Search Engine Marketing (SEM) & Google Ads",
      "Social Media Marketing (SMM) Strategy",
      "Email Marketing & Automation",
      "Web Analytics & Google Analytics 4",
      "Conversion Rate Optimization (CRO)",
      "Mobile & Video Marketing (YouTube)",
      "Influencer Marketing",
      "Budgeting & ROI Tracking",
      "Digital Marketing Campaign Project",
      "Revision & Future Trends"
    ],
    'affiliate marketing': [
      "Introduction to Affiliate Marketing Model",
      "Niche Selection & Market Research",
      "Affiliate Programs (Amazon, ClickBank, etc.)",
      "Building an Authority Website / Blog",
      "SEO for Affiliate Content",
      "Copywriting: Writing High-Converting Reviews",
      "Social Media & YouTube Affiliate Strategies",
      "Email List Building for Affiliates",
      "Paid Traffic Campaigns (Facebook, Google)",
      "Link Cloaking & Tracking Metrics",
      "Compliance: FTC Guidelines & Disclosures",
      "Scaling & Outsourcing Operations",
      "Affiliate Campaign Project",
      "Revision & Long-Term Optimization"
    ]
  };

  function generateRoadmapForGoal(title) {
    const cleanTitle = title.trim().toLowerCase();
    for (const key in COURSE_TEMPLATES) {
      if (cleanTitle === key || cleanTitle.includes(key)) {
        return [...COURSE_TEMPLATES[key]];
      }
    }
    const topics = [];
    const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);
    if (cleanTitle.includes('learn') || cleanTitle.includes('study') || cleanTitle.includes('master')) {
      const subject = title.replace(/(learn|study|master|how to)\s+/i, '');
      const capSubject = subject.charAt(0).toUpperCase() + subject.slice(1);
      topics.push(`Introduction to ${capSubject}`);
      topics.push(`Core Concepts of ${capSubject}`);
      topics.push(`Foundational Principles of ${capSubject}`);
      topics.push(`Intermediate Techniques for ${capSubject}`);
      topics.push(`Practical Application & Drills`);
      topics.push(`Advanced Topics in ${capSubject}`);
      topics.push(`Troubleshooting & Common Pitfalls`);
      topics.push(`${capSubject} Mini Project`);
      topics.push(`Comprehensive ${capSubject} Capstone`);
      topics.push(`Revision & Final Mastery Review`);
    } else {
      topics.push(`Getting Started with ${capitalizedTitle}`);
      topics.push(`Fundamentals & Key Concepts`);
      topics.push(`Core Methods & Best Practices`);
      topics.push(`Hands-on Practice & Exercises`);
      topics.push(`Intermediate Mastery & Workflows`);
      topics.push(`Advanced Techniques`);
      topics.push(`Real-world Application Case Study`);
      topics.push(`Personal Portfolio Project`);
      topics.push(`Optimization & Refining Details`);
      topics.push(`Final Review & Assessment`);
    }
    return topics;
  }

  function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function formatDateStr(d) {
    return d.toISOString().split('T')[0];
  }

  function formatHour12(hour) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 === 0 ? 12 : hour % 12;
    return `${h.toString().padStart(2, '0')}:00 ${ampm}`;
  }

  function parseHour12(slot) {
    // "09:00 AM" → 9, "02:00 PM" → 14, "10:00 PM" → 22
    const [time, ampm] = slot.split(' ');
    let hour = parseInt(time.split(':')[0], 10);
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return hour;
  }

  // ─── Calendar Rendering ────────────────────────────────────────────────────
  function renderWeeklyCalendar() {
    const grid = document.getElementById('weekly-calendar-grid');
    const weekRangeLabel = document.getElementById('calendar-week-range');
    if (!grid) return;

    const today = new Date();
    let baseDate = new Date();
    
    const activeGoals = window.AppState.getActiveGoals();
    if (activeGoals.length > 0) {
      // Find the most recent active goal
      const sortedGoals = [...activeGoals].sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      baseDate = new Date(sortedGoals[0].dateCreated);
    }
    
    // Clear hours to avoid time-of-day offsets
    baseDate.setHours(0, 0, 0, 0);
    // Apply calendarWeekOffset (rolling by 7 days)
    baseDate.setDate(baseDate.getDate() + calendarWeekOffset * 7);

    const weekDays = [];
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      weekDays.push(d);
    }

    const todayStr = formatDateStr(today);
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    weekRangeLabel.textContent = `${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    const missions = (window.AppState.data && window.AppState.data.missions) ? window.AppState.data.missions : [];

    // Parse user-defined daily hours from latest active goal
    let startHour = 7;
    let endHour = 22;
    if (activeGoals.length > 0) {
      const sortedGoals = [...activeGoals].sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      const latestGoal = sortedGoals[0];
      if (latestGoal.answers) {
        if (latestGoal.answers.dailyStartTime) {
          startHour = parseInt(latestGoal.answers.dailyStartTime.split(':')[0], 10);
        }
        if (latestGoal.answers.dailyEndTime) {
          endHour = parseInt(latestGoal.answers.dailyEndTime.split(':')[0], 10);
        }
      }
    }

    const HOURS = [];
    if (startHour <= endHour) {
      for (let h = startHour; h <= endHour; h++) HOURS.push(h);
    } else {
      // overnight range: e.g. 22 to 4
      for (let h = startHour; h <= 23; h++) HOURS.push(h);
      for (let h = 0; h <= endHour; h++) HOURS.push(h);
    }

    grid.innerHTML = '';

    // ── Header row ─────────────────────────────────────────────────────────
    // Corner cell
    const corner = document.createElement('div');
    corner.className = 'calendar-header-cell';
    corner.style.cssText = 'background: var(--bg-darker); border-right: 1px solid var(--card-border); border-bottom: 2px solid var(--card-border);';
    grid.appendChild(corner);

    weekDays.forEach((d) => {
      const dateStr = formatDateStr(d);
      const isToday = dateStr === todayStr;
      const cell = document.createElement('div');
      cell.className = 'calendar-header-cell' + (isToday ? ' today' : '');
      const dayName = DAY_NAMES[d.getDay()];
      cell.innerHTML = `
        <div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: ${isToday ? 'var(--primary)' : 'var(--text-muted)'};">${dayName}</div>
        <div style="font-size: 1.1rem; font-weight: 700; margin-top: 0.15rem; color: ${isToday ? 'var(--primary)' : 'var(--text-primary)'};">${d.getDate()}</div>
      `;
      grid.appendChild(cell);
    });

    // ── Hour rows ──────────────────────────────────────────────────────────
    HOURS.forEach(hour => {
      // Hour label
      const label = document.createElement('div');
      label.className = 'calendar-hour-label';
      label.textContent = formatHour12(hour);
      grid.appendChild(label);

      weekDays.forEach(d => {
        const dateStr = formatDateStr(d);
        const cell = document.createElement('div');
        cell.className = 'calendar-grid-cell';

        // Find missions that fall in this cell
        const slotStr = formatHour12(hour);
        const cellMissions = missions.filter(m => m.date === dateStr && m.timeSlot === slotStr);

        cellMissions.forEach(m => {
          const card = document.createElement('div');
          card.className = 'calendar-event-card' + (m.completed ? ' completed' : '');
          if (m.recoveryScaled) card.classList.add('recovery');

          const isToday = dateStr === todayStr;
          const goalColors = getGoalAccentColor(m.goalId);

          card.style.borderLeftColor = goalColors.border;
          card.style.background = goalColors.bg;

          card.innerHTML = `
            <div style="font-weight: 700; font-size: 0.72rem; color: ${goalColors.text}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${m.goalTitle || 'Goal'}</div>
            <div style="font-size: 0.68rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">${m.title}</div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 2px;">
              <span style="font-size: 0.65rem; color: var(--text-muted);">${window.getScaledFocusDuration ? window.getScaledFocusDuration(m) : m.focusTimeRequired}m</span>
              ${m.completed ? '<span style="font-size: 0.65rem; color: var(--emerald);">✓ Done</span>' : (isToday && !m.completed ? '<span style="font-size: 0.65rem; color: var(--primary);">▶ Today</span>' : '')}
            </div>
          `;

          card.addEventListener('click', () => {
            if (!m.completed) {
              window.triggerFocusTimerStart(m.id);
            } else {
              window.showToast('Session already completed.', 'primary');
            }
          });

          cell.appendChild(card);
        });

        grid.appendChild(cell);
      });
    });
  }

  // Assign a consistent accent color per goalId
  const GOAL_COLORS = [
    { border: 'var(--primary)',  bg: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.1) 100%)',  text: 'var(--primary)' },
    { border: 'var(--accent)',   bg: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.1) 100%)',  text: 'var(--accent)' },
    { border: 'var(--emerald)',  bg: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(59,130,246,0.08) 100%)', text: 'var(--emerald)' },
  ];
  function getGoalAccentColor(goalId) {
    const goals = window.AppState.data ? window.AppState.data.goals : [];
    const idx = goals.findIndex(g => g.id === goalId);
    return GOAL_COLORS[idx >= 0 ? idx % GOAL_COLORS.length : 0];
  }

  // ─── Calendar Controls ─────────────────────────────────────────────────────
  const prevWeekBtn = document.getElementById('calendar-btn-prev-week');
  const nextWeekBtn = document.getElementById('calendar-btn-next-week');
  const createGoalBtn = document.getElementById('calendar-btn-create-goal');
  const calendarContainer = document.getElementById('planner-calendar-container');
  const wizardContainer = document.getElementById('planner-wizard-container');

  if (prevWeekBtn) {
    prevWeekBtn.addEventListener('click', () => {
      calendarWeekOffset--;
      renderWeeklyCalendar();
    });
  }
  if (nextWeekBtn) {
    nextWeekBtn.addEventListener('click', () => {
      calendarWeekOffset++;
      renderWeeklyCalendar();
    });
  }
  if (createGoalBtn) {
    createGoalBtn.addEventListener('click', () => {
      if (window.AppState.getActiveGoals().length >= 3) {
        window.openGoalLimitModal();
        return;
      }
      if (calendarContainer) calendarContainer.style.display = 'none';
      if (wizardContainer) wizardContainer.style.display = 'block';
    });
  }

  // Render calendar whenever planner nav item is clicked
  document.querySelector('[data-view="planner-view"]') &&
    document.querySelector('[data-view="planner-view"]').addEventListener('click', () => {
      setTimeout(renderWeeklyCalendar, 50);
    });

  // Also expose globally so app.js can call it on stateChanged
  window.renderWeeklyCalendar = renderWeeklyCalendar;

  // ─── Wizard Elements ───────────────────────────────────────────────────────
  const btnToStep2 = document.getElementById('planner-btn-to-step2');
  const btnBackToStep1 = document.getElementById('planner-btn-back-to-step1');
  const btnToStep3 = document.getElementById('planner-btn-to-step3');
  const btnToStep4 = document.getElementById('planner-btn-to-step4');
  const btnBackToStep2 = document.getElementById('planner-btn-back-to-step2');
  const btnCancelPlan = document.getElementById('planner-btn-cancel-plan');
  const btnSavePlan = document.getElementById('planner-btn-save-plan');

  const step1Card = document.getElementById('planner-step-1');
  const step2Card = document.getElementById('planner-step-2');
  const step3Card = document.getElementById('planner-step-3');
  const step4Card = document.getElementById('planner-step-4');

  const ind1 = document.getElementById('step-1-indicator');
  const ind2 = document.getElementById('step-2-indicator');
  const ind3 = document.getElementById('step-3-indicator');
  const ind4 = document.getElementById('step-4-indicator');

  const roadmapAddBtn = document.getElementById('roadmap-add-btn');
  const roadmapAddInput = document.getElementById('roadmap-add-input');
  const roadmapTopicsList = document.getElementById('roadmap-topics-list');

  const inputTitle = document.getElementById('goal-input-title');
  const inputReason = document.getElementById('goal-input-reason');
  const inputDeadline = document.getElementById('goal-input-deadline');
  const questionText = document.getElementById('assessment-question-text');
  const optionsContainer = document.getElementById('assessment-options-container');
  const loadingPanel = document.getElementById('ai-loading-panel');
  const loadingText = document.getElementById('ai-loading-text');
  const loadingSubtext = document.getElementById('ai-loading-subtext');
  const planOutput = document.getElementById('ai-plan-output');
  const planOutputTitle = document.getElementById('plan-output-title');
  const planOutputInsights = document.getElementById('plan-output-insights');
  const planOutputMissions = document.getElementById('plan-output-missions');

  let currentGoalData = { title: '', reason: '', deadline: '', answers: {}, generatedMissions: [] };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);
  if (inputDeadline) inputDeadline.value = tomorrow.toISOString().split('T')[0];

  // ─── Question Bank ─────────────────────────────────────────────────────────
  const questionBank = {
    code: {
      question: "What is your biggest programming obstacle?",
      options: [
        { key: 'syntax', text: "Struggling with syntax and language rules." },
        { key: 'logic', text: "Stuck on structuring algorithmic logic." },
        { key: 'environment', text: "Trouble setting up IDEs, compilers, and dependencies." },
        { key: 'momentum', text: "Getting distracted mid-way through writing functions." }
      ],
      insight: "Coding requires sustained focus. We've scheduled a 45-minute focus session on Day 4 to dive deep into project logic, and suggested the detuned Lofi Drone to soothe cognitive fatigue."
    },
    design: {
      question: "What holds back your creative design projects most?",
      options: [
        { key: 'blank_canvas', text: "Impostor syndrome and staring at a blank canvas." },
        { key: 'perfectionism', text: "Tweaking tiny elements for hours instead of finishing." },
        { key: 'tools', text: "Learning complex design tool layers/short-cuts." },
        { key: 'references', text: "Searching endlessly for references and inspiration." }
      ],
      insight: "To conquer perfectionism, we've limited your Day 3 and 5 tasks to 25-minute sprints. Avoid adjustments once the timer expires."
    },
    general: {
      question: "What is your main distraction window?",
      options: [
        { key: 'morning', text: "Morning fatigue and catching up on notifications." },
        { key: 'afternoon', text: "Mid-day energy dips and browsing social media." },
        { key: 'evening', text: "Late night exhaustion and playing video games." },
        { key: 'irregular', text: "Unexpected meetings and random chores." }
      ],
      insight: "Since energy levels dip, tasks are structured in bite-sized blocks. We scheduled high-intensity learning for morning hours."
    }
  };

  const baseQuestions = [
    { id: 'workingTime', question: "Preferred working time", options: [
      { key: 'morning', text: "Morning (6 AM – 12 PM)" },
      { key: 'afternoon', text: "Afternoon (12 PM – 5 PM)" },
      { key: 'evening', text: "Evening (5 PM – 9 PM)" },
      { key: 'night', text: "Night (9 PM – 2 AM)" }
    ]},
    { id: 'dailyTime', question: "Daily available time", options: [
      { key: '30m', text: "30 Minutes" },
      { key: '1h', text: "1 Hour" },
      { key: '2h', text: "2 Hours" },
      { key: '4h', text: "4 Hours+" }
    ]},
    { id: 'weeklyDays', question: "Days available each week", options: [
      { key: '3d', text: "3 Days (Mon, Wed, Fri)" },
      { key: '5d', text: "5 Days (Weekdays)" },
      { key: '7d', text: "7 Days (Every day)" }
    ]},
    { id: 'experience', question: "Current experience level", options: [
      { key: 'beginner', text: "Beginner (No prior exposure)" },
      { key: 'intermediate', text: "Intermediate (Understand basics)" },
      { key: 'advanced', text: "Advanced (Looking to master)" }
    ]},
    { id: 'difficulty', question: "Goal difficulty", options: [
      { key: 'easy', text: "Easy (Simple habits or basic tasks)" },
      { key: 'medium', text: "Medium (Moderate skill acquisition)" },
      { key: 'hard', text: "Hard (Intense mental or physical load)" }
    ]},
    { id: 'badDayMin', question: "Minimum work possible on a bad day", options: [
      { key: '5m', text: "5 Minutes (Just show up)" },
      { key: '15m', text: "15 Minutes (Short practice)" },
      { key: '30m', text: "30 Minutes (Focus block)" }
    ]},
    { id: 'dailyStartTime', question: "Daily Start Time", type: 'time', default: '07:00' },
    { id: 'dailyEndTime', question: "Daily End Time", type: 'time', default: '22:00' }
  ];

  let activeQuestionsList = [];
  let currentQuestionIndex = 0;

  function renderQuestion(idx) {
    const qObj = activeQuestionsList[idx];
    if (!qObj) return;
    questionText.textContent = `[Question ${idx + 1}/${activeQuestionsList.length}] ${qObj.question}`;
    optionsContainer.innerHTML = '';
    btnToStep3.textContent = (idx === activeQuestionsList.length - 1) ? "Continue to Roadmap" : "Next Question";
    
    const savedAnswer = currentGoalData.answers[qObj.id];
    
    if (qObj.type === 'time') {
      const container = document.createElement('div');
      container.style.cssText = 'display: flex; flex-direction: column; gap: 1rem; align-items: center; width: 100%; margin-top: 1rem;';
      const input = document.createElement('input');
      input.type = 'time';
      input.className = 'form-control';
      input.style.cssText = 'max-width: 200px; text-align: center; font-size: 1.5rem; padding: 0.75rem; border-radius: var(--radius-md); background: rgba(7, 12, 25, 0.4); border: 1px solid var(--card-border); color: var(--text-primary);';
      
      const val = savedAnswer || qObj.default;
      input.value = val;
      currentGoalData.answers[qObj.id] = val; // auto-initialize
      btnToStep3.disabled = false;
      
      input.addEventListener('change', (e) => {
        currentGoalData.answers[qObj.id] = e.target.value;
      });
      
      container.appendChild(input);
      optionsContainer.appendChild(container);
    } else {
      btnToStep3.disabled = !savedAnswer;
      qObj.options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'option-card' + (savedAnswer === opt.key ? ' selected' : '');
        card.innerHTML = `<div class="option-radio"></div><div>${opt.text}</div>`;
        card.addEventListener('click', () => {
          document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          currentGoalData.answers[qObj.id] = opt.key;
          btnToStep3.disabled = false;
        });
        optionsContainer.appendChild(card);
      });
    }
  }

  // ─── Wizard Navigation ─────────────────────────────────────────────────────
  if (btnToStep2) {
    btnToStep2.addEventListener('click', () => {
      const title = inputTitle.value.trim();
      const reason = inputReason.value.trim();
      const deadline = inputDeadline.value;
      if (window.AppState.getActiveGoals().length >= 3) { window.openGoalLimitModal(); return; }
      if (!title) { window.showToast("Goal title cannot be empty.", 'warning'); return; }
      if (!reason || reason.length < 10) { window.showToast("Provide a detailed reason to lock in your accountability (Rule 1).", 'warning'); return; }
      if (!deadline) { window.showToast("Please choose a target deadline.", 'warning'); return; }

      let obstacleQuestion = questionBank.general;
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('code') || lowerTitle.includes('python') || lowerTitle.includes('js') || lowerTitle.includes('program') || lowerTitle.includes('dev') || lowerTitle.includes('java')) {
        obstacleQuestion = questionBank.code;
      } else if (lowerTitle.includes('design') || lowerTitle.includes('art') || lowerTitle.includes('portfolio') || lowerTitle.includes('draw') || lowerTitle.includes('sketch')) {
        obstacleQuestion = questionBank.design;
      }

      activeQuestionsList = [...baseQuestions, { id: 'obstacle', question: obstacleQuestion.question, options: obstacleQuestion.options, insight: obstacleQuestion.insight }];
      currentQuestionIndex = 0;
      currentGoalData.title = title;
      currentGoalData.reason = reason;
      currentGoalData.deadline = deadline;

      step1Card.style.display = 'none';
      step2Card.className = 'glass-card planner-step-content active-step';
      ind1.className = 'step-indicator completed';
      ind2.className = 'step-indicator active';
      renderQuestion(currentQuestionIndex);
    });
  }

  if (btnBackToStep1) {
    btnBackToStep1.addEventListener('click', () => {
      if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion(currentQuestionIndex);
      } else {
        step2Card.className = 'glass-card planner-step-content';
        step1Card.style.display = 'flex';
        ind1.className = 'step-indicator active';
        ind2.className = 'step-indicator';
        btnToStep3.disabled = true;
      }
    });
  }

  function renderRoadmapTopics() {
    if (!roadmapTopicsList) return;
    roadmapTopicsList.innerHTML = '';
    
    currentRoadmap.forEach((topic, idx) => {
      const item = document.createElement('div');
      item.className = 'roadmap-topic-item';
      item.style.cssText = 'display: flex; align-items: center; gap: 0.75rem; background: rgba(16, 26, 48, 0.4); padding: 0.5rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--card-border); transition: var(--transition-smooth); margin-bottom: 0.5rem;';
      
      const badge = document.createElement('div');
      badge.style.cssText = 'width: 24px; height: 24px; border-radius: 50%; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.25); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0;';
      badge.textContent = idx + 1;
      item.appendChild(badge);
      
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-control';
      input.style.cssText = 'flex-grow: 1; padding: 0.35rem 0.5rem; font-size: 0.85rem; background: transparent; border: 1px solid transparent; color: var(--text-primary); border-radius: var(--radius-sm); margin: 0;';
      input.value = topic;
      input.addEventListener('change', (e) => {
        currentRoadmap[idx] = e.target.value.trim() || `Topic ${idx + 1}`;
      });
      input.addEventListener('focus', () => {
        input.style.borderColor = 'rgba(59, 130, 246, 0.3)';
        input.style.background = 'rgba(7, 12, 25, 0.4)';
      });
      input.addEventListener('blur', () => {
        input.style.borderColor = 'transparent';
        input.style.background = 'transparent';
      });
      item.appendChild(input);
      
      const btnGroup = document.createElement('div');
      btnGroup.style.cssText = 'display: flex; align-items: center; gap: 0.25rem; flex-shrink: 0;';
      
      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.style.cssText = 'padding: 0.25rem; cursor: pointer; color: var(--text-secondary); background: none; border: none;';
      upBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>`;
      if (idx > 0) {
        upBtn.addEventListener('click', () => {
          const temp = currentRoadmap[idx];
          currentRoadmap[idx] = currentRoadmap[idx - 1];
          currentRoadmap[idx - 1] = temp;
          renderRoadmapTopics();
        });
      } else {
        upBtn.style.opacity = '0.2';
        upBtn.style.cursor = 'not-allowed';
      }
      
      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.style.cssText = 'padding: 0.25rem; cursor: pointer; color: var(--text-secondary); background: none; border: none;';
      downBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;
      if (idx < currentRoadmap.length - 1) {
        downBtn.addEventListener('click', () => {
          const temp = currentRoadmap[idx];
          currentRoadmap[idx] = currentRoadmap[idx + 1];
          currentRoadmap[idx + 1] = temp;
          renderRoadmapTopics();
        });
      } else {
        downBtn.style.opacity = '0.2';
        downBtn.style.cursor = 'not-allowed';
      }
      
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.style.cssText = 'padding: 0.25rem; cursor: pointer; color: var(--accent); background: none; border: none;';
      deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
      deleteBtn.addEventListener('click', () => {
        currentRoadmap.splice(idx, 1);
        renderRoadmapTopics();
      });
      
      btnGroup.appendChild(upBtn);
      btnGroup.appendChild(downBtn);
      btnGroup.appendChild(deleteBtn);
      item.appendChild(btnGroup);
      roadmapTopicsList.appendChild(item);
    });
  }

  if (roadmapAddBtn) {
    roadmapAddBtn.addEventListener('click', () => {
      const topicText = roadmapAddInput.value.trim();
      if (!topicText) return;
      currentRoadmap.push(topicText);
      roadmapAddInput.value = '';
      renderRoadmapTopics();
    });
  }

  if (btnBackToStep2) {
    btnBackToStep2.addEventListener('click', () => {
      step3Card.style.display = 'none';
      step2Card.className = 'glass-card planner-step-content active-step';
      ind2.className = 'step-indicator active';
      ind3.className = 'step-indicator';
    });
  }

  if (btnToStep3) {
    btnToStep3.addEventListener('click', () => {
      if (currentQuestionIndex < activeQuestionsList.length - 1) {
        currentQuestionIndex++;
        renderQuestion(currentQuestionIndex);
      } else {
        step2Card.className = 'glass-card planner-step-content';
        step3Card.className = 'glass-card planner-step-content active-step';
        ind2.className = 'step-indicator completed';
        ind3.className = 'step-indicator active';
        
        // Generate initial roadmap topics
        currentRoadmap = generateRoadmapForGoal(currentGoalData.title);
        renderRoadmapTopics();
      }
    });
  }

  if (btnToStep4) {
    btnToStep4.addEventListener('click', () => {
      if (currentRoadmap.length === 0) {
        window.showToast("Roadmap cannot be empty. Add at least one topic.", "warning");
        return;
      }
      step3Card.style.display = 'none';
      step4Card.className = 'glass-card planner-step-content active-step';
      ind3.className = 'step-indicator completed';
      ind4.className = 'step-indicator active';
      
      loadingPanel.style.display = 'flex';
      planOutput.style.display = 'none';

      const loadingStates = [
        { t: "Analyzing motivation triggers...", s: "Analyzing: " + currentGoalData.reason.substring(0, 30) + "..." },
        { t: "Checking your calendar for open slots...", s: "Collision-resistant scheduling in progress." },
        { t: "Generating multi-week focus roadmap...", s: "Calibrating milestone breakdown and focus timers." },
        { t: "Assembling adaptive schedule...", s: "Syncing plan structure to Aegis accountability engine." }
      ];
      let stateIdx = 0;
      const interval = setInterval(() => {
        stateIdx++;
        if (stateIdx < loadingStates.length) {
          loadingText.textContent = loadingStates[stateIdx].t;
          loadingSubtext.textContent = loadingStates[stateIdx].s;
        } else {
          clearInterval(interval);
          renderPlanOutput();
        }
      }, 1000);
    });
  }

  if (btnCancelPlan) btnCancelPlan.addEventListener('click', resetPlannerWizard);

  if (btnSavePlan) {
    btnSavePlan.addEventListener('click', () => {
      try {
        window.AppState.addGoal(
          currentGoalData.title, currentGoalData.reason, currentGoalData.deadline,
          currentGoalData.answers, currentGoalData.priority, currentGoalData.generatedMissions
        );
        window.triggerConfetti();
        window.showToast("Personalized AI Goal Plan Activated!", "accent");
        resetPlannerWizard();
        renderWeeklyCalendar();
      } catch (e) {
        window.showToast(e.message, 'warning');
      }
    });
  }

  // ─── Plan Output Renderer ──────────────────────────────────────────────────
  function renderPlanOutput() {
    loadingPanel.style.display = 'none';
    planOutput.style.display = 'block';
    ind4.className = 'step-indicator completed';

    const { missions, priority } = generateGoalMissions(currentGoalData.title, currentGoalData.deadline, currentGoalData.answers, currentRoadmap);
    currentGoalData.priority = priority;
    currentGoalData.generatedMissions = missions;

    planOutputTitle.textContent = `Aegis Plan: ${currentGoalData.title} (Priority ${priority})`;
    const obstacleObj = activeQuestionsList.find(q => q.id === 'obstacle');
    const obstacleInsight = obstacleObj ? obstacleObj.insight : "We've balanced your study slots.";
    planOutputInsights.innerHTML = `
      <strong>Goal Priority:</strong> Priority ${priority}<br>
      <strong>Preferred Slot:</strong> ${currentGoalData.answers.workingTime} (${missions[0]?.timeSlot || '09:00 AM'})<br>
      <strong>Workload:</strong> ${missions.length} focus sessions total.<br>
      <strong>AI Advisor:</strong> ${obstacleInsight}
    `;

    planOutputMissions.innerHTML = '';
    const preview = missions.slice(0, 7);
    if (preview.length === 0) {
      planOutputMissions.innerHTML = `<div style="text-align:center;color:var(--text-secondary);padding:1rem;">No sessions in the first week.</div>`;
    } else {
      preview.forEach(m => {
        const item = document.createElement('div');
        item.className = 'mission-item';
        item.style.padding = '0.75rem 1.25rem';
        item.innerHTML = `
          <div class="mission-left">
            <div style="font-weight:700;color:var(--primary);font-size:0.8rem;width:90px;">${m.date}</div>
            <div class="mission-content">
              <span class="mission-title" style="font-size:0.85rem;">${m.title}</span>
              <span style="font-size:0.7rem;color:var(--text-secondary);">${m.timeSlot}</span>
            </div>
          </div>
          <div class="mission-right">
            <span class="mission-focus-tag">${m.focusTimeRequired}m Focus</span>
          </div>
        `;
        planOutputMissions.appendChild(item);
      });
    }
  }

  // Helper to check if hour is in start/end range
  function isHourInWindow(h, start, end) {
    if (start <= end) {
      return h >= start && h <= end;
    } else {
      return h >= start || h <= end;
    }
  }

  // Helper to increment hour within window
  function nextHourInWindow(h, start, end) {
    let next = (h + 1) % 24;
    if (start <= end) {
      if (next < start || next > end) {
        next = start;
      }
    } else {
      if (next > end && next < start) {
        next = start;
      }
    }
    return next;
  }

  // ─── AI Scheduling Engine (Collision-Resistant) ────────────────────────────
  function generateGoalMissions(title, deadline, answers, roadmap) {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - today;
    const totalDays = Math.max(7, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

    // Use or generate the roadmap topics list
    const finalRoadmap = (roadmap && roadmap.length > 0) ? roadmap : generateRoadmapForGoal(title);

    // Priority based on deadline urgency
    let priority = 3;
    if (totalDays <= 14) priority = 1;
    else if (totalDays <= 30) priority = 2;

    // Base focus minutes from daily available time
    let baseMins = 25;
    if (answers.dailyTime === '30m') baseMins = 30;
    else if (answers.dailyTime === '1h') baseMins = 60;
    else if (answers.dailyTime === '2h') baseMins = 120;
    else if (answers.dailyTime === '4h') baseMins = 240;

    if (answers.difficulty === 'easy') baseMins = Math.max(15, Math.round(baseMins * 0.75));
    else if (answers.difficulty === 'hard') baseMins = Math.round(baseMins * 1.25);

    // Active days of the week based on user availability
    let activeDays;
    if (answers.weeklyDays === '7d') {
      activeDays = [0, 1, 2, 3, 4, 5, 6]; // all 7
    } else if (answers.weeklyDays === '5d') {
      activeDays = [1, 2, 3, 4, 5]; // Mon–Fri
    } else {
      activeDays = [1, 3, 5]; // Mon, Wed, Fri (3d)
    }

    // Daily hours range
    const startHour = answers.dailyStartTime ? parseInt(answers.dailyStartTime.split(':')[0], 10) : 7;
    const endHour = answers.dailyEndTime ? parseInt(answers.dailyEndTime.split(':')[0], 10) : 22;

    // Base hour from preferred working time (clamped into custom window)
    let baseHour = startHour;
    if (answers.workingTime === 'morning') baseHour = 9;
    else if (answers.workingTime === 'afternoon') baseHour = 14;
    else if (answers.workingTime === 'evening') baseHour = 19;
    else if (answers.workingTime === 'night') baseHour = 22;

    if (!isHourInWindow(baseHour, startHour, endHour)) {
      baseHour = startHour;
    }

    // Smart first-day scheduling
    let canScheduleToday = true;
    const now = new Date();
    const currentHour = now.getHours();

    // 1. Check if the current time is past the daily end time
    if (currentHour >= endHour) {
      canScheduleToday = false;
    }

    // 2. Check if the preferred study period has already passed today
    let preferredEndHour = 12;
    if (answers.workingTime === 'afternoon') preferredEndHour = 17;
    else if (answers.workingTime === 'evening') preferredEndHour = 21;
    else if (answers.workingTime === 'night') preferredEndHour = 2;

    if (preferredEndHour > 2) {
      if (currentHour >= preferredEndHour) {
        canScheduleToday = false;
      }
    } else {
      if (currentHour >= 2 && currentHour < 21) {
        canScheduleToday = true; // Night is upcoming tonight
      } else if (currentHour >= 21 || currentHour < 2) {
        canScheduleToday = true; // Night is ongoing
      } else {
        canScheduleToday = false;
      }
    }

    const startOffset = canScheduleToday ? 0 : 1;

    // Gather all already-scheduled missions (from existing goals) for collision detection
    const existingMissions = (window.AppState.data && window.AppState.data.missions) ? window.AppState.data.missions : [];

    const missions = [];
    let missionIndex = 0;

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i + startOffset);
      const currentDayOfWeek = currentDate.getDay();

      if (!activeDays.includes(currentDayOfWeek)) continue;

      const dateStr = currentDate.toISOString().split('T')[0];

      // Collision-resistant slot assignment: shift hour if occupied within range
      let slotHour = baseHour;
      let slotStr = formatHour12(slotHour);
      const allOccupied = [...existingMissions, ...missions];
      let attempts = 0;
      while (allOccupied.some(m => m.date === dateStr && m.timeSlot === slotStr) && attempts < 24) {
        slotHour = nextHourInWindow(slotHour, startHour, endHour);
        slotStr = formatHour12(slotHour);
        attempts++;
      }

      // Assign specific topic from finalRoadmap
      let displayTitle = "";
      if (missionIndex < finalRoadmap.length) {
        displayTitle = finalRoadmap[missionIndex];
      } else {
        displayTitle = `Revision & Practice: ${title}`;
      }

      missions.push({
        title: displayTitle,
        date: dateStr,
        dayIndex: i,
        focusTimeRequired: baseMins,
        timeSlot: slotStr,
        completed: false,
        focusSessionCompleted: false,
        reflections: ''
      });
      missionIndex++;
    }

    return { missions, priority };
  }

  // Expose for state.js fallback (generateAdaptivePlans)
  window.Planner = { generateAdaptivePlans: (goal) => generateGoalMissions(goal.title, goal.deadline, goal.answers || {}).missions };

  // ─── Reset Wizard ──────────────────────────────────────────────────────────
  function resetPlannerWizard() {
    currentGoalData = { title: '', reason: '', deadline: '', answers: {}, generatedMissions: [] };
    currentRoadmap = [];
    if (inputTitle) inputTitle.value = '';
    if (inputReason) inputReason.value = '';
    const d = new Date();
    d.setDate(d.getDate() + 7);
    if (inputDeadline) inputDeadline.value = d.toISOString().split('T')[0];

    if (step4Card) step4Card.className = 'glass-card planner-step-content';
    if (step3Card) step3Card.className = 'glass-card planner-step-content';
    if (step2Card) step2Card.className = 'glass-card planner-step-content';
    if (step1Card) step1Card.style.display = 'flex';
    if (ind1) ind1.className = 'step-indicator active';
    if (ind2) ind2.className = 'step-indicator';
    if (ind3) ind3.className = 'step-indicator';
    if (ind4) ind4.className = 'step-indicator';
    if (btnToStep3) btnToStep3.disabled = true;

    // Return to calendar
    if (wizardContainer) wizardContainer.style.display = 'none';
    if (calendarContainer) calendarContainer.style.display = 'block';
  }

  // Initial calendar render
  renderWeeklyCalendar();
})();
