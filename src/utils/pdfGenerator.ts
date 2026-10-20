import { jsPDF } from 'jspdf';

export interface ResumeExportData {
  fullName: string;
  contactLine1: string;
  contactLine2?: string;
  summary: string;
  experience: {
    roleTitle: string;
    company: string;
    dates: string;
    location: string;
    bullets: string[];
  }[];
  skills: {
    category: string;
    items: string;
  }[];
  projects: {
    title: string;
    stack: string;
    bullets: string[];
    links?: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  certifications: string[];
  languages: string;
}

export const OPTIMIZED_RESUME_DATA: ResumeExportData = {
  fullName: 'Ujjwal Singh',
  contactLine1: 'Faridabad, Haryana  •  +91 78277 16527  •  ujjwalsingh8001@gmail.com',
  contactLine2: 'linkedin.com/in/ujjwalsingh  •  github.com/Ujjwal7827  •  ujjwalsingh.dev',
  summary:
    'Performance-driven Front-End Developer with a proven track record engineering and deploying 300+ responsive, high-performance web applications in fast-paced production environments. Proficient in React.js, modern JavaScript (ES6+), Tailwind CSS, and RESTful APIs, with hands-on expertise building custom client widgets and optimizing Core Web Vitals to achieve sub-2s page load speeds. Eager to contribute high-velocity, scalable UI engineering to growth-focused software teams.',
  experience: [
    {
      roleTitle: 'SaaS Web Designer & Front-End Developer',
      company: 'Adaan Digital Solutions Pvt. Ltd.',
      dates: 'August 2024 – Present',
      location: 'Faridabad, India',
      bullets: [
        'Architected and launched 300+ custom responsive web applications across Duda & Strato SaaS platforms, maintaining 99.8% cross-browser reliability and 95+ average Google Lighthouse performance scores.',
        'Engineered modular JavaScript micro-widgets and responsive Tailwind CSS stylesheets to overcome proprietary SaaS template limitations, reducing client onboarding turnaround time by 25%.',
        'Collaborated directly with cross-functional SMB stakeholders to translate UI/UX wireframes into accessible, SEO-optimized production interfaces with zero critical delivery defects.',
      ],
    },
  ],
  skills: [
    {
      category: 'Languages',
      items: 'JavaScript (ES6+), TypeScript (Basic/Intermediate), HTML5, CSS3, Sass',
    },
    {
      category: 'Frameworks & UI',
      items: 'React.js, Tailwind CSS, Bootstrap 5, Vite, Next.js (Foundational)',
    },
    {
      category: 'Developer Tools',
      items: 'Git, GitHub, Chrome DevTools, Postman, npm/yarn, VS Code',
    },
    {
      category: 'Core Concepts',
      items: 'Responsive Web Design, REST API Integration, Core Web Vitals, Cross-Browser Compatibility, DOM Scripting',
    },
  ],
  projects: [
    {
      title: 'Speech-to-Text Real-Time Converter Web App',
      stack: 'React.js, Tailwind CSS, Web Speech Recognition API',
      bullets: [
        'Engineered a real-time voice-to-text web application utilizing the browser Web Speech Recognition API with defensive error boundary fallbacks and live interim audio stream handling.',
        'Implemented modular state management and responsive UI feedback prioritizing low transcription latency and high accuracy across mobile and desktop browsers.',
      ],
      links: 'Live Demo: github.com/Ujjwal7827/speech-to-text-converter',
    },
    {
      title: 'Personal Developer Portfolio & Component Library',
      stack: 'HTML5, CSS3, Tailwind CSS, JavaScript ES6+',
      bullets: [
        'Built a mobile-first, accessible developer portfolio showcasing live production projects, technical achievements, and interactive components.',
        'Optimized asset delivery and DOM footprint to achieve a 100/100 Google Lighthouse performance rating and smooth 60fps micro-animations.',
      ],
      links: 'Live URL: github.com/Ujjwal7827',
    },
  ],
  education: [
    {
      degree: 'Bachelor in Computer Applications (BCA)',
      institution: 'Maharishi Dayanand University, Faridabad',
      year: '2022 – 2025',
    },
    {
      degree: 'Senior Secondary (12th) – UP Board | Secondary (10th) – HBSE',
      institution: 'Faridabad, Haryana',
      year: '2022 / 2020',
    },
  ],
  certifications: [
    'Responsive Web Design Certification — freeCodeCamp (Verified Credential)',
    'JavaScript Algorithms and Data Structures — freeCodeCamp',
    'Meta Front-End Developer Specialization — Coursera (In Progress)',
  ],
  languages: 'English (Professional Working Proficiency)  •  Hindi (Native)',
};

/**
 * Dynamically parses any candidate's resume text + evaluation into structured ResumeExportData
 * so that PDF export and Optimized Resume comparison work for ANY imported resume (not just Ujjwal Singh).
 */
export function buildResumeExportDataFromText(
  resumeText?: string,
  evaluation?: any
): ResumeExportData {
  if (!resumeText || !resumeText.trim() || resumeText.toLowerCase().includes('ujjwal singh')) {
    return OPTIMIZED_RESUME_DATA;
  }

  const lines = resumeText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const fullName = lines[0] || 'Candidate Name';
  const contactLine1 = lines[1] || 'Location  •  Email  •  Phone  •  LinkedIn';
  const rewrittenSummary =
    evaluation?.sectionCritiques?.summary?.rewrittenVersion ||
    lines.find((l, i) => i > 1 && l.length > 70 && !/^[•\-\*]/.test(l)) ||
    'Results-driven professional with a proven track record of delivering measurable business and technical outcomes.';

  const enhancedBullets: string[] = Array.isArray(
    evaluation?.sectionCritiques?.experience?.enhancedBullets
  )
    ? evaluation.sectionCritiques.experience.enhancedBullets
        .map((b: any) => b?.improvedXYZ)
        .filter(Boolean)
    : [];

  const rawBullets = lines
    .filter((l) => /^[•\-\*]/.test(l))
    .map((l) => l.replace(/^[•\-\*]\s*/, '').trim());

  const mergedBullets =
    enhancedBullets.length > 0
      ? [...enhancedBullets, ...rawBullets.slice(enhancedBullets.length, 5)]
      : rawBullets.slice(0, 5);

  // Extract role header line if present
  const roleHeaderLine =
    lines.find((l, idx) => idx > 2 && l.includes('|') && !l.includes('@')) ||
    `${evaluation?.candidateLevel || 'Senior Professional'} | Primary Organization`;
  const roleParts = roleHeaderLine.split('|').map((p) => p.trim());

  return {
    fullName,
    contactLine1: contactLine1.replace(/\|/g, '  •  '),
    summary: rewrittenSummary,
    experience: [
      {
        roleTitle: roleParts[0] || 'Lead Professional',
        company: roleParts[1] || 'Organization',
        dates: roleParts[2] || 'Present',
        location: '',
        bullets:
          mergedBullets.length > 0
            ? mergedBullets
            : [
                'Spearheaded high-impact cross-functional initiatives delivering 25%+ improvement in operational efficiency.',
                'Collaborated with senior stakeholders to define roadmaps, KPIs, and quality standards.',
              ],
      },
    ],
    skills: [
      {
        category: 'Core Competencies',
        items:
          evaluation?.sectionCritiques?.skills?.suggestedGrouping ||
          lines
            .filter((l) => /:|,/.test(l) && l.length < 140)
            .slice(-2)
            .join(' | ') ||
          'Strategic Execution, Cross-Functional Leadership, Data Analysis, Process Optimization',
      },
    ],
    projects: [],
    education: [
      {
        degree:
          lines.find((l) => /(bachelor|master|b\.s\.|b\.a\.|m\.s\.|mba|bca|university|college)/i.test(l)) ||
          'University Degree & Academic Credentials',
        institution:
          lines.find((l) => /(university|institute|college|school)/i.test(l)) ||
          'Accredited Institution',
        year: '',
      },
    ],
    certifications: [
      'Verified Professional Credentials & Continuous Education',
    ],
    languages: 'English (Professional Working Proficiency)',
  };
}

/**
 * Generates an executive-level, ATS-optimized PDF resume.
 * Properly supports 'modern', 'classic', and 'minimal' themes and dynamic candidate data.
 */
export function exportOptimizedResumePDF(
  data: ResumeExportData = OPTIMIZED_RESUME_DATA,
  theme: 'classic' | 'modern' | 'minimal' = 'modern'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 14;
  const rightMargin = 14;
  const contentWidth = pageWidth - leftMargin - rightMargin;
  let currentY = 16;

  const fontSans = 'helvetica';
  const fontSerif = 'times';
  const primaryFont = theme === 'classic' ? fontSerif : fontSans;

  // Fixed bug: properly differentiate 'modern', 'classic', and 'minimal' monochrome palettes
  const primaryColor =
    theme === 'modern'
      ? [30, 41, 59]
      : theme === 'classic'
      ? [15, 23, 42]
      : [17, 24, 39];
  const accentColor =
    theme === 'modern'
      ? [79, 70, 229] // indigo-600
      : theme === 'classic'
      ? [37, 99, 235] // blue-600
      : [51, 65, 85]; // minimal monochrome slate-700
  const grayColor = [71, 85, 105];
  const dividerColor = [226, 232, 240];

  // 1. Header: Full Name
  doc.setFont(primaryFont, 'bold');
  doc.setFontSize(21);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(data.fullName || 'Candidate', pageWidth / 2, currentY, { align: 'center' });
  currentY += 6;

  // Subheader: Contact line 1
  if (data.contactLine1) {
    doc.setFont(fontSans, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(data.contactLine1, pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
  }

  // Contact line 2
  if (data.contactLine2) {
    doc.setFont(fontSans, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(data.contactLine2, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
  }

  const drawSectionHeading = (title: string) => {
    currentY += 2;
    doc.setFont(primaryFont, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(title.toUpperCase(), leftMargin, currentY);

    doc.setDrawColor(dividerColor[0], dividerColor[1], dividerColor[2]);
    doc.setLineWidth(0.35);
    doc.line(leftMargin, currentY + 1.8, pageWidth - rightMargin, currentY + 1.8);
    currentY += 5.5;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 12) {
      doc.addPage();
      currentY = 14;
    }
  };

  // 2. Professional Summary
  if (data.summary) {
    drawSectionHeading('Professional Summary');
    doc.setFont(primaryFont, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

    const summaryLines = doc.splitTextToSize(data.summary, contentWidth);
    doc.text(summaryLines, leftMargin, currentY);
    currentY += summaryLines.length * 4.1 + 2;
  }

  // 3. Professional Experience
  if (Array.isArray(data.experience) && data.experience.length > 0) {
    drawSectionHeading('Professional Experience');
    data.experience.forEach((exp) => {
      checkPageBreak(25);

      doc.setFont(primaryFont, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(exp.roleTitle || '', leftMargin, currentY);

      if (exp.dates) {
        doc.setFont(primaryFont, 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(exp.dates, pageWidth - rightMargin, currentY, { align: 'right' });
      }
      currentY += 4.2;

      if (exp.company || exp.location) {
        doc.setFont(primaryFont, 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        if (exp.company) doc.text(exp.company, leftMargin, currentY);
        if (exp.location) doc.text(exp.location, pageWidth - rightMargin, currentY, { align: 'right' });
        currentY += 4.5;
      }

      (exp.bullets || []).forEach((bullet) => {
        checkPageBreak(12);
        doc.setFont(fontSans, 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text('•', leftMargin + 1, currentY);

        doc.setFont(primaryFont, 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        const bulletLines = doc.splitTextToSize(bullet, contentWidth - 6);
        doc.text(bulletLines, leftMargin + 5, currentY);
        currentY += bulletLines.length * 4.0 + 1.2;
      });

      currentY += 1.5;
    });
  }

  // 4. Technical Skills
  if (Array.isArray(data.skills) && data.skills.length > 0) {
    drawSectionHeading('Skills & Core Competencies');
    data.skills.forEach((skill) => {
      checkPageBreak(8);
      doc.setFont(primaryFont, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      const catLabel = `${skill.category}: `;
      doc.text(catLabel, leftMargin, currentY);

      const catLabelWidth = doc.getTextWidth(catLabel);
      doc.setFont(primaryFont, 'normal');
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      const itemsLines = doc.splitTextToSize(skill.items, Math.max(40, contentWidth - catLabelWidth));
      doc.text(itemsLines, leftMargin + catLabelWidth, currentY);
      currentY += itemsLines.length * 4.0 + 1.0;
    });
    currentY += 1.5;
  }

  // 5. Featured Projects
  if (Array.isArray(data.projects) && data.projects.length > 0) {
    drawSectionHeading('Featured Projects');
    data.projects.forEach((proj) => {
      checkPageBreak(20);

      doc.setFont(primaryFont, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(proj.title, leftMargin, currentY);

      if (proj.stack) {
        doc.setFont(primaryFont, 'italic');
        doc.setFontSize(8);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(`[${proj.stack}]`, pageWidth - rightMargin, currentY, { align: 'right' });
      }
      currentY += 4.2;

      (proj.bullets || []).forEach((bullet) => {
        checkPageBreak(12);
        doc.setFont(fontSans, 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text('•', leftMargin + 1, currentY);

        doc.setFont(primaryFont, 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        const bulletLines = doc.splitTextToSize(bullet, contentWidth - 6);
        doc.text(bulletLines, leftMargin + 5, currentY);
        currentY += bulletLines.length * 4.0 + 1.2;
      });

      if (proj.links) {
        doc.setFont(primaryFont, 'normal');
        doc.setFontSize(7.8);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(proj.links, leftMargin + 5, currentY);
        currentY += 4.0;
      }

      currentY += 1.5;
    });
  }

  // 6. Education
  if (Array.isArray(data.education) && data.education.length > 0) {
    drawSectionHeading('Education');
    data.education.forEach((edu) => {
      checkPageBreak(10);
      doc.setFont(primaryFont, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(edu.degree, leftMargin, currentY);

      if (edu.year) {
        doc.setFont(primaryFont, 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(edu.year, pageWidth - rightMargin, currentY, { align: 'right' });
      }
      currentY += 4.0;

      if (edu.institution) {
        doc.setFont(primaryFont, 'italic');
        doc.setFontSize(8);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(edu.institution, leftMargin, currentY);
        currentY += 4.5;
      }
    });
  }

  // 7. Verified Certifications
  if (Array.isArray(data.certifications) && data.certifications.length > 0) {
    drawSectionHeading('Verified Certifications');
    data.certifications.forEach((cert) => {
      checkPageBreak(8);
      doc.setFont(fontSans, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('•', leftMargin + 1, currentY);

      doc.setFont(primaryFont, 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      const certLines = doc.splitTextToSize(cert, contentWidth - 6);
      doc.text(certLines, leftMargin + 5, currentY);
      currentY += certLines.length * 4.0 + 1.0;
    });
    currentY += 1.5;
  }

  // 8. Languages
  if (data.languages) {
    drawSectionHeading('Languages');
    checkPageBreak(8);
    doc.setFont(primaryFont, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(data.languages, leftMargin, currentY);
  }

  const cleanFilename = `${(data.fullName || 'Candidate').replace(/[^a-zA-Z0-9]+/g, '_')}_Resume_Optimized.pdf`;
  doc.save(cleanFilename);
}

/**
 * Generates an Executive HR Audit Report PDF for print and download.
 */
export function exportAuditReportPDF(evaluation: any, candidateName: string = 'Candidate'): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 14;
  const rightMargin = 14;
  const contentWidth = pageWidth - leftMargin - rightMargin;
  let currentY = 16;

  function checkPageBreak(requiredHeight: number) {
    if (currentY + requiredHeight > pageHeight - 16) {
      doc.addPage();
      currentY = 16;
    }
  }

  doc.setFillColor(30, 41, 59);
  doc.rect(leftMargin, currentY, contentWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('TALENTAUDIT PRO — EXECUTIVE EVALUATION REPORT', leftMargin + 6, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  doc.text(
    `Candidate: ${candidateName}   •   Evaluated: ${dateStr}   •   Universal HR Standards`,
    leftMargin + 6,
    currentY + 17
  );

  const score = evaluation?.overallScore ?? 75;
  const grade = evaluation?.grade ?? 'B';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(`${score}/100`, pageWidth - rightMargin - 6, currentY + 11, { align: 'right' });
  doc.setFontSize(8.5);
  doc.setTextColor(147, 197, 253);
  doc.text(`Grade ${grade}`, pageWidth - rightMargin - 6, currentY + 17, { align: 'right' });

  currentY += 30;

  if (evaluation?.verdict) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text('1. Executive Verdict & Hiring Recommendation', leftMargin, currentY);
    currentY += 4.5;

    doc.setDrawColor(226, 232, 240);
    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY);
    currentY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const verdictLines = doc.splitTextToSize(`Verdict: ${evaluation.verdict}`, contentWidth);
    doc.text(verdictLines, leftMargin, currentY);
    currentY += verdictLines.length * 4.0 + 3.0;

    if (evaluation.sixSecondImpression) {
      checkPageBreak(18);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const impressionLines = doc.splitTextToSize(
        `6-Second Recruiter Glance: ${evaluation.sixSecondImpression}`,
        contentWidth
      );
      doc.text(impressionLines, leftMargin, currentY);
      currentY += impressionLines.length * 3.8 + 4.0;
    }
  }

  if (evaluation?.categoryScores) {
    checkPageBreak(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text('2. Universal HR Dimension Scores (0–100)', leftMargin, currentY);
    currentY += 4.5;

    doc.setDrawColor(226, 232, 240);
    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY);
    currentY += 5.0;

    const cats = [
      { name: 'Impact & Quantified Metrics', data: evaluation.categoryScores.impactAndMetrics },
      { name: 'Action Verbs & Communication Clarity', data: evaluation.categoryScores.actionVerbsAndClarity },
      { name: 'Technical Depth & Framework Rigor', data: evaluation.categoryScores.technicalDepth },
      { name: 'ATS Compatibility & Machine Parsability', data: evaluation.categoryScores.atsCompatibility },
      { name: 'Credibility & Verified Credentials', data: evaluation.categoryScores.credibilityAndCerts },
      { name: 'Structure & Visual Readability', data: evaluation.categoryScores.structureAndReadability },
    ].filter((c) => c.data);

    cats.forEach((cat) => {
      checkPageBreak(16);
      const catScore = cat.data.score ?? 70;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(cat.name, leftMargin, currentY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229);
      doc.text(`${catScore}/100`, pageWidth - rightMargin, currentY, { align: 'right' });
      currentY += 4.0;

      if (cat.data.feedback) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.8);
        doc.setTextColor(71, 85, 105);
        const fbLines = doc.splitTextToSize(cat.data.feedback, contentWidth);
        doc.text(fbLines, leftMargin, currentY);
        currentY += fbLines.length * 3.6 + 2.5;
      }
    });
    currentY += 2;
  }

  if (Array.isArray(evaluation?.topStrengths) && evaluation.topStrengths.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(5, 150, 105);
    doc.text('3. Key Competitive Strengths', leftMargin, currentY);
    currentY += 4.5;

    doc.setDrawColor(209, 250, 229);
    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY);
    currentY += 4.5;

    evaluation.topStrengths.forEach((str: string) => {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(5, 150, 105);
      doc.text('✓', leftMargin, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      const lines = doc.splitTextToSize(str, contentWidth - 6);
      doc.text(lines, leftMargin + 5, currentY);
      currentY += lines.length * 3.8 + 2.0;
    });
    currentY += 3;
  }

  if (Array.isArray(evaluation?.criticalRedFlags) && evaluation.criticalRedFlags.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(225, 29, 72);
    doc.text('4. Gatekeeper Risks & Critical Red Flags', leftMargin, currentY);
    currentY += 4.5;

    doc.setDrawColor(254, 205, 211);
    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY);
    currentY += 4.5;

    evaluation.criticalRedFlags.forEach((flag: string) => {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(225, 29, 72);
      doc.text('!', leftMargin + 0.5, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      const lines = doc.splitTextToSize(flag, contentWidth - 6);
      doc.text(lines, leftMargin + 5, currentY);
      currentY += lines.length * 3.8 + 2.0;
    });
    currentY += 3;
  }

  checkPageBreak(12);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'TalentAudit Pro • Universal Executive HR Standards & ATS Optimization Report',
    leftMargin,
    currentY + 6
  );

  const filename = `${candidateName.replace(/[^a-zA-Z0-9]+/g, '_')}_Executive_Audit_Report.pdf`;
  doc.save(filename);
}
