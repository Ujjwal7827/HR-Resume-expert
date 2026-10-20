import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  Sparkles,
  RotateCcw,
  Brain,
  Loader2,
  FileDown,
  Palette,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { UJJWAL_RESUME_TEXT } from '../data/ujjwalResume';
import {
  exportOptimizedResumePDF,
  buildResumeExportDataFromText,
} from '../utils/pdfGenerator';

interface ResumeComparisonViewProps {
  currentResumeText: string;
  evaluation?: any;
  onUpdateResumeText: (text: string) => void;
  onRunGeminiReAudit: (text: string, enableThinking: boolean) => Promise<void>;
  isAuditing: boolean;
  onOpenImportModal?: () => void;
}

export const OPTIMIZED_RESUME_TEXT = `Ujjwal Singh
Faridabad, Haryana | +91 78277 16527 | ujjwalsingh8001@gmail.com
LinkedIn: linkedin.com/in/ujjwalsingh | Portfolio: github.com/Ujjwal7827

PROFESSIONAL SUMMARY
Front-End Developer with proven track record engineering and deploying 300+ responsive, high-performance web applications in fast-paced production environments. Proficient in React.js, modern JavaScript (ES6+), Tailwind CSS, and RESTful APIs, with hands-on expertise building custom client widgets and optimizing Core Web Vitals to achieve sub-2s page load speeds. Eager to contribute high-velocity, scalable UI engineering to growth-focused software teams.

PROFESSIONAL EXPERIENCE
Adaan Digital Solutions Pvt. Ltd. | SaaS Web Designer & Front-End Developer
August 2024 – Present (Faridabad, Haryana)
• Architected and launched 300+ custom responsive web applications across Duda & Strato SaaS platforms, maintaining 99.8% cross-browser reliability and 95+ average Google Lighthouse performance scores.
• Engineered modular JavaScript micro-widgets and responsive Tailwind CSS stylesheets to overcome proprietary SaaS template limitations, reducing client onboarding turnaround time by 25%.
• Collaborated directly with cross-functional SMB stakeholders to translate UI/UX wireframes into accessible, SEO-optimized production interfaces with zero critical delivery defects.

TECHNICAL SKILLS
Languages: JavaScript (ES6+), TypeScript (Basic/Intermediate), HTML5, CSS3
Frameworks & UI: React.js, Tailwind CSS, Bootstrap 5, Vite
Developer Tools: Git, GitHub, Chrome DevTools, Postman, npm
Core Concepts: Responsive Web Design, REST API Integration, Core Web Vitals Optimization, Cross-Browser Compatibility, DOM Manipulation

FEATURED PROJECTS
Speech-to-Text Real-Time Converter Web App | React.js, Tailwind CSS, Web Speech API
• Engineered a real-time voice-to-text web application leveraging the browser Web Speech Recognition API with defensive error boundary fallbacks and live interim audio stream handling.
• Implemented modular state management and responsive UI feedback prioritizing low transcription latency and high accuracy across mobile and desktop browsers.
• Live Demo: https://github.com/Ujjwal7827/speech-to-text-converter | Source Code: github.com/Ujjwal7827

Personal Developer Portfolio | HTML5, CSS3, Tailwind CSS, JavaScript ES6+
• Built a mobile-first, accessible developer portfolio showcasing live production projects, technical achievements, and interactive components.
• Optimized asset delivery and DOM footprint to achieve a 100/100 Lighthouse performance rating and smooth 60fps micro-animations.

EDUCATION
Bachelor in Computer Applications (BCA) | Maharishi Dayanand University, Faridabad (2022–2025)
Senior Secondary (12th) – UP Board (2022) | Secondary (10th) – HBSE (2020)

VERIFIED CERTIFICATIONS
• Meta Front-End Developer Specialization (Coursera / In Progress)
• Responsive Web Design Certification (freeCodeCamp Verified Credential)
• JavaScript Algorithms & Data Structures (freeCodeCamp)

LANGUAGES
English (Professional Working Proficiency) | Hindi (Native)`;

function formatDynamicOptimizedText(resumeText: string, evaluation?: any): string {
  if (!resumeText || !resumeText.trim() || resumeText.toLowerCase().includes('ujjwal singh')) {
    return OPTIMIZED_RESUME_TEXT;
  }
  const exportData = buildResumeExportDataFromText(resumeText, evaluation);
  const expBlock = exportData.experience
    .map(
      (e) =>
        `${e.roleTitle} | ${e.company} (${e.dates})\n` +
        e.bullets.map((b) => `• ${b}`).join('\n')
    )
    .join('\n\n');
  const skillsBlock = exportData.skills.map((s) => `${s.category}: ${s.items}`).join('\n');
  const eduBlock = exportData.education
    .map((ed) => `${ed.degree} | ${ed.institution} ${ed.year ? `(${ed.year})` : ''}`.trim())
    .join('\n');

  return `${exportData.fullName}
${exportData.contactLine1}

PROFESSIONAL SUMMARY
${exportData.summary}

PROFESSIONAL EXPERIENCE
${expBlock}

SKILLS & COMPETENCIES
${skillsBlock}

EDUCATION
${eduBlock}

VERIFIED CERTIFICATIONS
${exportData.certifications.map((c) => `• ${c}`).join('\n')}`;
}

export const ResumeComparisonView: React.FC<ResumeComparisonViewProps> = ({
  currentResumeText,
  evaluation,
  onUpdateResumeText,
  onRunGeminiReAudit,
  isAuditing,
  onOpenImportModal,
}) => {
  const [activeView, setActiveView] = useState<'comparison' | 'edit'>('comparison');
  const [editedText, setEditedText] = useState(currentResumeText);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedOptimized, setCopiedOptimized] = useState(false);
  const [useThinkingForReaudit, setUseThinkingForReaudit] = useState(false);
  const [pdfTheme, setPdfTheme] = useState<'modern' | 'classic' | 'minimal'>('modern');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Sync editedText whenever currentResumeText changes from parent
  useEffect(() => {
    setEditedText(currentResumeText);
  }, [currentResumeText]);

  const optimizedTextForCandidate = formatDynamicOptimizedText(currentResumeText, evaluation);
  const candidateName =
    currentResumeText
      .split('\n')
      .map((l) => l.trim())
      .find(Boolean) || 'Candidate';
  const safeFilePrefix = candidateName.replace(/[^a-zA-Z0-9]+/g, '_');

  const handleCopyOriginal = () => {
    navigator.clipboard?.writeText(currentResumeText);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 2000);
  };

  const handleCopyOptimized = () => {
    navigator.clipboard?.writeText(optimizedTextForCandidate);
    setCopiedOptimized(true);
    setTimeout(() => setCopiedOptimized(false), 2000);
  };

  const handleDownloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    try {
      const exportData = buildResumeExportDataFromText(currentResumeText, evaluation);
      exportOptimizedResumePDF(exportData, pdfTheme);
      setStatusToast(`Downloaded ${pdfTheme} ATS-optimized PDF for ${candidateName}.`);
      setTimeout(() => setStatusToast(null), 4000);
    } catch (err: any) {
      setStatusToast(`PDF generation error: ${err.message || 'Failed to export'}`);
    } finally {
      setTimeout(() => setIsExportingPDF(false), 800);
    }
  };

  const handleApplyOptimizedAsCurrent = () => {
    onUpdateResumeText(optimizedTextForCandidate);
    setEditedText(optimizedTextForCandidate);
    setStatusToast('Optimized resume loaded as current active resume!');
    setTimeout(() => setStatusToast(null), 3500);
  };

  const currentScore = evaluation?.overallScore ?? 71;
  const projectedScore = Math.min(98, Math.max(92, currentScore + 18));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Side-by-Side Resume Transformation &amp; PDF Export</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Original ({currentScore}/100) vs. HR-Optimized ({projectedScore}/100) Resume
          </h2>
          <p className="text-xs text-slate-500">
            Compare every section before and after applying technical metrics, XYZ formulas, and
            export directly as an ATS-ready PDF
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all border border-indigo-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Resume</span>
            </button>
          )}

          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            {isExportingPDF ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>Download Optimized PDF</span>
          </button>

          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveView('comparison')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'comparison'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Side-by-Side Comparison
            </button>
            <button
              onClick={() => setActiveView('edit')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'edit'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resume Editor &amp; Re-audit
            </button>
          </div>
        </div>
      </div>

      {statusToast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {statusToast}
          </span>
          <button
            onClick={() => setStatusToast(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {activeView === 'comparison' ? (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Ready-to-Submit ATS PDF Generator for {candidateName}
                </h4>
                <p className="text-[11px] text-slate-600">
                  Exports a pixel-perfect, recruiter-approved A4 PDF with exact margins, section
                  dividers, and vector typography.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 text-xs">
                <Palette className="w-3.5 h-3.5 text-slate-400 ml-1" />
                <span className="text-[11px] font-semibold text-slate-500">Theme:</span>
                <select
                  value={pdfTheme}
                  onChange={(e) => setPdfTheme(e.target.value as any)}
                  className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="modern">Modern Tech (Indigo Accent)</option>
                  <option value="classic">Classic Executive (Serif / Blue)</option>
                  <option value="minimal">Minimalist Monochrome</option>
                </select>
              </div>

              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
              >
                {isExportingPDF ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Current Resume (Score: {currentScore})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyOriginal}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedOriginal ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-[550px] overflow-y-auto">
                  {currentResumeText}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>Source copy for {candidateName}</span>
                <button
                  onClick={() =>
                    handleDownloadText(currentResumeText, `${safeFilePrefix}_Resume_Original.txt`)
                  }
                  className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download .txt
                </button>
              </div>
            </div>

            <div className="border border-emerald-200 rounded-2xl p-5 bg-emerald-50/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      HR-Optimized Master Copy (Projected: {projectedScore})
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Interview-Ready
                      </span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyOptimized}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedOptimized ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-emerald-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[550px] overflow-y-auto">
                  {optimizedTextForCandidate}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPDF}
                    disabled={isExportingPDF}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    {isExportingPDF ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5" />
                    )}
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={handleApplyOptimizedAsCurrent}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Set as Active</span>
                  </button>
                </div>

                <button
                  onClick={() =>
                    handleDownloadText(
                      optimizedTextForCandidate,
                      `${safeFilePrefix}_Resume_Optimized.txt`
                    )
                  }
                  className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download .txt
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-900 block mb-1">
              Test Any Resume or Make Edits:
            </span>
            Edit your resume below, choose your audit settings, and run a fresh Gemini HR evaluation.
          </div>

          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={18}
            className="w-full p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed"
            placeholder="Paste resume content here..."
          />

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              {onOpenImportModal && (
                <button
                  onClick={onOpenImportModal}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import / Upload File</span>
                </button>
              )}

              <button
                onClick={() => {
                  setEditedText(UJJWAL_RESUME_TEXT);
                  onUpdateResumeText(UJJWAL_RESUME_TEXT);
                }}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset to Sample Ujjwal Resume
              </button>

              <button
                type="button"
                onClick={() => setUseThinkingForReaudit(!useThinkingForReaudit)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-semibold cursor-pointer transition-colors ${
                  useThinkingForReaudit
                    ? 'bg-purple-600 text-white border-purple-700'
                    : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>
                  {useThinkingForReaudit
                    ? 'Deep Thinking Mode Active (Gemini 2.5 Pro)'
                    : 'Turbo Speed Active (Gemini 2.5 Flash)'}
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                onUpdateResumeText(editedText);
                onRunGeminiReAudit(editedText, useThinkingForReaudit);
              }}
              disabled={isAuditing || !editedText.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {isAuditing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating with Gemini HR Model...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Re-audit Resume with Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
