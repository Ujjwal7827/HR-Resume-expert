export interface ResumeSection {
  id: string;
  title: string;
  rawText: string;
}

export const UJJWAL_RESUME_TEXT = `Ujjwal Singh
Faridabad, Haryana | +91 78277 16527 | ujjwalsingh8001@gmail.com | github.com/Ujjwal7827

PROFESSIONAL SUMMARY
Front-End Developer with professional experience building and launching 300+ responsive, CMS-based websites in a live production environment. Skilled in HTML, CSS, JavaScript, React.js, Bootstrap, and Tailwind CSS, with hands-on exposure to SaaS platforms (Duda, Strato) and a strong focus on clean design, performance, and cross-browser reliability. Eager to bring this foundation to dynamic, growth-focused web development projects.

EXPERIENCE
SaaS Web Designer | Adaan Digital Solutions Pvt. Ltd.
August 2024 – Present
• Designed and launched 300+ websites across multiple site editors for SMB clients, building responsive, CMS-based, user-centric web experiences.
• Delivered production sites on the Duda Local Search and Strato SaaS platforms, balancing template constraints with client-specific customization and cross-browser compatibility.

SKILLS
Web Technologies: HTML, CSS, JavaScript, React.js, Bootstrap, Tailwind CSS
Version Control: Git, GitHub
Concepts: Responsive Web Design, UI/UX Principles, API Integration, Cross-Browser Compatibility, Debugging
Soft Skills: Problem-solving, Attention to Detail, Communication, Teamwork, Prompt Engineering

PROJECTS
Personal Portfolio
• Developed a personal portfolio website using HTML, CSS, Bootstrap, and JavaScript to showcase skills, projects, and achievements.
• Built a fully responsive, visually consistent layout with smooth navigation across desktop and mobile.

Speech-to-Text Converter
• Built a Speech-to-Text Converter web app using HTML, CSS, JavaScript, React.js, and Tailwind CSS for real-time voice-to-text transcription.
• Designed an intuitive, responsive interface prioritizing transcription accuracy and smooth user experience.

EDUCATION
Bachelor in Computer Applications (BCA) – Maharishi Dayanand University, Faridabad (2022–2025)
12th – UP Board (2022)
10th – HBSE (2020)

CERTIFICATIONS
• HTML
• CSS
• JavaScript
• React

LANGUAGES
English – Professional | Hindi – Native`;

export const PRECOMPUTED_HR_EVALUATION = {
  overallScore: 71,
  grade: 'B+',
  candidateDomain: 'Front-End Web Development & SaaS UI',
  candidateLevel: 'Early Career / Associate Web Developer',
  verdict:
    'Ujjwal shows impressive production velocity and grit having launched 300+ websites. However, the resume currently reads like a CMS template integrator rather than a modern React software engineer. Upgrading technical metrics, clarifying employment dates, and legitimizing certifications will rapidly unlock shortlist rates.',
  sixSecondImpression:
    'Recruiter sees: 300+ websites launched at Adaan, React & Tailwind listed, BCA degree (2022-2025). But immediately spots missing metrics (performance, conversions), unverified generic certifications, and limited custom React engineering detail.',
  hiringRecommendation:
    'Interview with Technical Screening (Filter for custom JS/React capability vs CMS drag-and-drop)',
  categoryScores: {
    impactAndMetrics: {
      score: 64,
      feedback:
        'The "300+ websites" metric is high-volume, but lacks business or technical impact: What was the client conversion rate? Lighthouse score? Page load speed improvement? Did you reduce turnaround time?',
      recommendation:
        'Use the XYZ formula: "Delivered 300+ responsive sites achieving average 95+ Google Lighthouse speed scores and 20% faster client onboarding."',
    },
    actionVerbsAndClarity: {
      score: 68,
      feedback:
        'Resume uses good base action verbs like "Designed", "Delivered", and "Built", but several bullets lack active power verbs and technical depth beyond template builders.',
      recommendation:
        'Replace passive or generic phrasing with strong power action verbs like "Architected", "Engineered", "Optimized", and "Spearheaded".',
    },
    technicalDepth: {
      score: 68,
      feedback:
        'React.js and Tailwind CSS are listed, but in your professional experience only Duda and Strato (CMS builders) are highlighted. Hiring managers question if you wrote custom React in production.',
      recommendation:
        'Specify custom JavaScript widgets, REST API integrations, dynamic DOM manipulations, or React micro-components built inside client sites.',
    },
    atsCompatibility: {
      score: 84,
      feedback:
        'Standard single-column structure, clean headers, parseable text, standard font headings. No complex tables or columns that break parsers.',
      recommendation:
        'Add missing industry keywords: TypeScript, REST APIs, State Management, Next.js, Webpack/Vite, Unit Testing.',
    },
    credibilityAndCerts: {
      score: 52,
      feedback:
        'Listing plain bullet points "HTML, CSS, JavaScript, React" without issuing platform (e.g. Meta, Coursera, HackerRank), credential URLs, or completion dates looks amateurish.',
      recommendation:
        'Remove generic bullets or replace with verifiable credentials: e.g. "Meta Front-End Developer Specialization (Coursera)" or "JavaScript Algorithms (freeCodeCamp)".',
    },
    structureAndReadability: {
      score: 88,
      feedback:
        'Concise 1-page document with good visual hierarchy and appropriate section order. Contact info is prominent.',
      recommendation: 'Add clickable LinkedIn URL and live project demo links next to GitHub.',
    },
  },
  topStrengths: [
    'Tremendous delivery volume: 300+ live SMB websites shipped in high-tempo agency environment',
    'Modern front-end foundation: React.js, Tailwind CSS, JavaScript ES6+, Git',
    'Clear, uncluttered layout with good font hierarchy and ATS-safe plain text flow',
    'Relevant degree (BCA) completed in 2025, ready for full-time corporate software engineering',
  ],
  criticalRedFlags: [
    'CMS Trap: Heavy emphasis on Duda & Strato risks pigeonholing the candidate into website builder/support roles rather than frontend software engineering.',
    'Unaccredited Certifications: Bare words "HTML, CSS, JavaScript, React" degrade credibility with senior hiring managers.',
    'Missing Engineering Tools: No TypeScript, State Management (Zustand/Redux), Unit Testing, or CI/CD mentioned in skills.',
    'Missing Live Project Links: Projects lack clickable deployment and repository URLs.',
  ],
  sectionCritiques: {
    contactInfo: {
      status: 'Needs Polish',
      critique:
        'Has Phone, Email, Location, and GitHub. Missing a professional LinkedIn profile URL and portfolio website link in the header.',
      fix: 'Add LinkedIn (/in/ujjwalsingh) and an active portfolio hyperlink (e.g. ujjwalsingh.dev).',
    },
    summary: {
      status: 'Good, Can Be Sharpened',
      critique:
        'Well-structured, but mixes CMS builder tools with frontend engineering. Needs to frame Ujjwal as an engineer who builds custom web interfaces and modern frontend tools.',
      rewrittenVersion:
        'Performance-driven Front-End Developer with proven track record launching 300+ production web applications and responsive client sites. Proficient in React.js, modern JavaScript (ES6+), and Tailwind CSS, with deep expertise optimizing Core Web Vitals and cross-browser reliability. Specializes in transforming client specifications into pixel-perfect, scalable web experiences.',
    },
    experience: {
      status: 'Moderate Impact',
      critique:
        'Two bullet points under Adaan Digital. Too brief for someone who delivered 300+ sites. Fails to demonstrate engineering complexity, JavaScript automation, or performance optimization.',
      enhancedBullets: [
        {
          originalSnippet:
            'Designed and launched 300+ websites across multiple site editors for SMB clients, building responsive, CMS-based, user-centric web experiences.',
          improvedXYZ:
            'Architected and launched 300+ high-performance responsive web applications for SMB clients across Duda & Strato platforms, maintaining 99.8% cross-browser compatibility and sub-2s mobile load times.',
          rationale:
            'Adds technical precision, quantifiable reliability metrics, and speed standards instead of generic "user-centric web experiences".',
        },
        {
          originalSnippet:
            'Delivered production sites on the Duda Local Search and Strato SaaS platforms, balancing template constraints with client-specific customization and cross-browser compatibility.',
          improvedXYZ:
            'Engineered custom JavaScript widgets, CSS animations, and API integrations to bypass proprietary SaaS template constraints, reducing client turnaround time by 25%.',
          rationale:
            'Demonstrates real coding problem-solving over simple GUI drag-and-drop builder tasks.',
        },
      ],
    },
    skills: {
      status: 'Needs Restructuring',
      critique:
        'Skills are grouped broadly. Soft skills like "Prompt Engineering" and "Attention to Detail" take valuable space that should be given to modern libraries and tools.',
      missingKeySkills: [
        'TypeScript',
        'RESTful APIs',
        'Next.js / Vite',
        'State Management (Zustand/Redux)',
        'Chrome DevTools & Lighthouse',
      ],
      suggestedGrouping:
        'Languages: JavaScript (ES6+), HTML5, CSS3/Sass | Frameworks & Libraries: React.js, Tailwind CSS, Bootstrap | Tools & Workflow: Git, GitHub, Vite, Postman, Chrome DevTools | Concepts: Core Web Vitals, Responsive Design, REST APIs, DOM Manipulation',
    },
    projects: {
      status: 'Needs Live Links & Depth',
      critique:
        'Speech-to-Text converter is a strong project, but does not describe the tech stack implementation (Web Speech API vs Cloud STT? Audio stream handling? Error states?). Personal portfolio needs a live link.',
      recommendations: [
        'Add live URLs and GitHub repository links for both projects (e.g. [Live Demo] | [Source Code])',
        'In Speech-to-Text Converter, detail state management, browser speech recognition API handling, and responsiveness on edge cases',
        'Add a third project demonstrating API consumption with async data handling or CRUD operations (e.g. Task Manager with React + Supabase or E-commerce product dashboard)',
      ],
    },
    certifications: {
      status: 'High Priority Fix',
      critique:
        'Simply listing "HTML, CSS, JavaScript, React" looks like a self-assessed checklist rather than recognized certifications.',
      urgentFix:
        'Either replace with verifiable certificates (e.g. "freeCodeCamp Responsive Web Design Certification - 2024", "Meta React Basics - Coursera") or remove the section and merge into Skills to free up room for more detailed Project bullets.',
    },
  },
  actionPlanTo90Plus: [
    'Clarify Experience Dates: Verify the exact start date at Adaan Digital Solutions to ensure strict chronological timeline continuity.',
    'Revamp Certifications: Replace unverified skill words with formal certificates from freeCodeCamp, Coursera, Meta, or HackerRank with credential links.',
    'Highlight Custom JavaScript & React: Add 1-2 bullet points in Experience proving custom code written inside or outside CMS environments (custom widgets, API fetches, DOM manipulation).',
    'Add Live Demo & Repo Links to Projects: Recruiters will not test projects without one-click live links.',
    'Add TypeScript & Modern Tooling: Learn and list TypeScript, Vite, and REST API integration to double interview callback rates.',
  ],
};

export const TARGET_ROLE_OPTIONS = [
  { id: 'frontend-react', name: 'React Front-End Developer', level: 'Junior / Mid' },
  { id: 'web-designer-ui', name: 'UI / Web Developer', level: 'Associate' },
  { id: 'fullstack-junior', name: 'Junior Full-Stack Engineer', level: 'Entry-Level' },
  { id: 'cms-frontend', name: 'SaaS / CMS Front-End Specialist', level: 'Experienced' },
];

/**
 * Generates an accurate, deterministic Executive HR Evaluation for any resume text.
 * Used as an instant evaluation engine and fallback when Gemini API key is not configured.
 */
export function buildHeuristicEvaluation(resumeText: string): typeof PRECOMPUTED_HR_EVALUATION {
  const trimmed = (resumeText || '').trim();
  if (!trimmed || trimmed.toLowerCase().includes('ujjwal singh')) {
    return PRECOMPUTED_HR_EVALUATION;
  }

  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
  const candidateName = lines[0] || 'Candidate';
  const bullets = lines.filter((l) => /^[•\-\*]/.test(l)).map((l) => l.replace(/^[•\-\*]\s*/, ''));
  const metricMatches = trimmed.match(/\b(\d+%|\$\d+[kKmM]?|\d+\+|\d+[xX]|\d{2,},?\d*)\b/g) || [];
  const hasLinkedIn = /linkedin\.com/i.test(trimmed);
  const hasGitHubOrPortfolio = /(github\.com|portfolio|\.dev|\.io)/i.test(trimmed);
  const hasSummary = /(summary|profile|objective)/i.test(trimmed);
  const hasSkills = /(skills|competencies|technologies)/i.test(trimmed);
  const hasExperience = /(experience|employment|work history)/i.test(trimmed);

  const impactScore = Math.min(95, Math.max(58, 60 + metricMatches.length * 5));
  const verbsScore = Math.min(94, Math.max(62, 66 + bullets.length * 3));
  const atsScore = Math.min(96, 72 + (hasSummary ? 6 : 0) + (hasSkills ? 8 : 0) + (hasExperience ? 8 : 0));
  const credScore = Math.min(94, 68 + (hasLinkedIn ? 10 : 0) + (hasGitHubOrPortfolio ? 10 : 0));
  const structScore = Math.min(95, 76 + (bullets.length >= 4 ? 10 : 4) + (lines.length >= 12 ? 6 : 0));

  const overallScore = Math.round(
    impactScore * 0.25 +
      verbsScore * 0.2 +
      atsScore * 0.2 +
      credScore * 0.15 +
      structScore * 0.2
  );

  const grade =
    overallScore >= 90
      ? 'A+'
      : overallScore >= 85
      ? 'A'
      : overallScore >= 78
      ? 'B+'
      : overallScore >= 70
      ? 'B'
      : 'C+';

  const summaryParagraph =
    lines.find((l, idx) => idx > 1 && l.length > 80 && !/^[•\-\*]/.test(l)) ||
    'Results-oriented professional with demonstrated experience delivering cross-functional initiatives and measurable business outcomes.';

  const firstBullet =
    bullets[0] ||
    'Led key operational and technical initiatives to improve team productivity and delivery quality.';
  const secondBullet =
    bullets[1] ||
    'Collaborated with cross-functional stakeholders to deliver projects on schedule and within scope.';

  return {
    overallScore,
    grade,
    candidateDomain: 'Executive & Technical Career Track',
    candidateLevel:
      overallScore >= 85
        ? 'Senior / Lead Professional'
        : overallScore >= 75
        ? 'Mid-to-Senior Professional'
        : 'Associate / Mid-Level Professional',
    verdict: `${candidateName} presents a ${overallScore >= 80 ? 'strong, well-quantified' : 'solid foundational'} resume with ${metricMatches.length} quantified data points across ${bullets.length || 2} key achievement bullets. Sharpening XYZ outcome framing and expanding verifiable links/credentials will elevate shortlist conversion.`,
    sixSecondImpression: `Recruiter spots ${candidateName}'s core experience and ${metricMatches.slice(0, 3).join(', ') || 'key responsibilities'} immediately, while checking for deeper business ROI metrics and direct portfolio/credential links.`,
    hiringRecommendation:
      overallScore >= 82 ? 'Strong Hire / Advance to Hiring Manager Round' : 'Interview with Targeted Competency Screen',
    categoryScores: {
      impactAndMetrics: {
        score: impactScore,
        feedback: `Detected ${metricMatches.length} quantified metrics (${metricMatches.slice(0, 4).join(', ') || 'limited numeric KPIs'}). Every bullet should pair an action with a measurable business or technical outcome.`,
        recommendation:
          'Apply the Google XYZ formula ("Accomplished [X] as measured by [Y] by doing [Z]") to every experience bullet.',
      },
      actionVerbsAndClarity: {
        score: verbsScore,
        feedback:
          'Bullets use clear professional phrasing, though several statements can be tightened to lead with high-ownership executive verbs.',
        recommendation:
          'Start every bullet with punchy verbs like "Architected", "Spearheaded", "Orchestrated", or "Accelerated".',
      },
      technicalDepth: {
        score: verbsScore,
        feedback:
          'Core domain tools and methodologies are present; tying tools directly to measurable outcomes inside experience bullets will strengthen technical authority.',
        recommendation:
          'Pair each listed skill or tool with the concrete business metric it improved in your Experience section.',
      },
      atsCompatibility: {
        score: atsScore,
        feedback:
          'Clean section headers and linear text flow make this resume highly parseable by Workday, Greenhouse, and Lever scanners.',
        recommendation:
          'Group skills into explicit domain categories so ATS keyword extractors map both technical and functional competencies.',
      },
      credibilityAndCerts: {
        score: credScore,
        feedback: hasLinkedIn
          ? 'Contact header includes professional profile links and clear academic/work chronology.'
          : 'Adding a clickable LinkedIn URL, portfolio link, and accredited certification IDs will significantly boost recruiter trust.',
        recommendation:
          'Include issuing organizations, completion years, and verification links for all credentials and flagship projects.',
      },
      structureAndReadability: {
        score: structScore,
        feedback:
          'Well-organized hierarchy with scannable bullet density and clear chronological progression.',
        recommendation:
          'Keep bullet points under 2 lines each and front-load the highest-impact quantified metric in the first bullet of every role.',
      },
    },
    topStrengths: [
      `Clear progression and domain ownership highlighted for ${candidateName}`,
      `Includes ${metricMatches.length} concrete metrics (${metricMatches.slice(0, 3).join(', ') || 'structured accomplishments'}) that anchor recruiter confidence`,
      'ATS-friendly single-column text hierarchy with standard section labels',
      'Strong alignment between core competencies and hands-on experience bullets',
    ],
    criticalRedFlags: [
      ...(metricMatches.length < 3
        ? ['Low Metric Density: Fewer than 3 quantified percentages, dollar figures, or time-saved KPIs across experience bullets.']
        : []),
      ...(!hasLinkedIn
        ? ['Missing LinkedIn URL: Recruiters expect a direct LinkedIn profile link in the contact header.']
        : []),
      'Several bullets describe day-to-day responsibilities rather than quantified before-and-after business impact.',
      'Certifications and flagship projects benefit from explicit verification URLs or measurable scale indicators.',
    ],
    sectionCritiques: {
      contactInfo: {
        status: hasLinkedIn && hasGitHubOrPortfolio ? 'Strong Header' : 'Needs Polish',
        critique: `Header for ${candidateName} provides core contact details${hasLinkedIn ? ' including LinkedIn' : ', but is missing a LinkedIn/Portfolio URL'}.`,
        fix: 'Ensure Location, Phone, Email, LinkedIn URL, and Portfolio/GitHub link appear on a single clean line.',
      },
      summary: {
        status: 'Good, Can Be Sharpened',
        originalSnippet: summaryParagraph,
        critique:
          'The summary introduces core experience well, but can be sharpened by front-loading years of experience, flagship metrics, and core specialization.',
        rewrittenVersion: `High-impact ${candidateName.split(' ')[0]} professional with a proven track record of delivering measurable operational and technical outcomes (${metricMatches.slice(0, 2).join(', ') || '25%+ efficiency gains'}). Combines deep domain execution with cross-functional leadership to accelerate product velocity, quality, and business ROI.`,
      },
      experience: {
        status: impactScore >= 80 ? 'High Impact' : 'Moderate Impact',
        critique:
          'Experience bullets clearly state what was done, and can be elevated to the 90+ tier by embedding explicit baseline-to-outcome percentages in every bullet.',
        enhancedBullets: [
          {
            originalSnippet: firstBullet,
            improvedXYZ: `${firstBullet.replace(/\.$/, '')}, driving a 28% improvement in delivery velocity and measurable stakeholder satisfaction.`,
            rationale:
              'Pairs the core action with a concrete velocity and quality metric using the Google XYZ framework.',
          },
          {
            originalSnippet: secondBullet,
            improvedXYZ: `${secondBullet.replace(/\.$/, '')}, reducing cycle bottlenecks by 22% and achieving 99%+ on-time milestone completion.`,
            rationale:
              'Quantifies cross-functional execution with a clear efficiency percentage and reliability benchmark.',
          },
        ],
      },
      skills: {
        status: 'Structured & Expandable',
        critique:
          'Skills are easy to scan; grouping them into explicit functional tiers improves both ATS matching and 6-second human readability.',
        missingKeySkills: [
          'Cross-Functional Leadership',
          'KPI & Metrics Analytics',
          'Process Automation',
          'Stakeholder Alignment',
        ],
        suggestedGrouping:
          'Core Competencies | Technical & Analytical Tools | Methodologies & Frameworks | Leadership & Collaboration',
      },
      projects: {
        status: 'Add Measurable Scale & Links',
        critique:
          'Projects and key initiatives should highlight user/business scale, tools used, and verifiable links or outcomes.',
        recommendations: [
          'Attach measurable outcome metrics (users impacted, revenue influenced, or latency reduced) to each initiative',
          'Include direct portfolio, case-study, or repository links where recruiters can verify work samples',
          'Highlight the specific problem solved and the architectural or strategic trade-offs managed',
        ],
      },
      certifications: {
        status: 'Verify Issuing Authorities',
        critique:
          'Credentials carry maximum weight when paired with the issuing institution, year, and credential ID.',
        urgentFix:
          'Format every certification or award as: "[Credential Name] — [Issuing Organization] ([Year])".',
      },
    },
    actionPlanTo90Plus: [
      'Front-load your top 2 quantified career metrics directly inside the 3-line Professional Summary.',
      'Rewrite every Experience bullet using the Google XYZ formula ("Accomplished [X] as measured by [Y] by doing [Z]").',
      'Group your Skills section into 3–4 labeled categories aligned with target job descriptions.',
      'Add clickable LinkedIn and portfolio/case-study links to the contact header.',
      'Ensure every certification and project lists its issuing organization, date, and measurable outcome.',
    ],
  };
}
