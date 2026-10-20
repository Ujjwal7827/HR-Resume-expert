import React, { useState, useRef } from 'react';
import {
  Upload,
  FileUp,
  Sparkles,
  AlertCircle,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Award,
  Target,
  Zap,
  ArrowRight,
  ClipboardPaste,
  FileCheck,
} from 'lucide-react';
import { UJJWAL_RESUME_TEXT } from '../data/ujjwalResume';

interface WelcomeImportViewProps {
  onImportResume: (text: string, autoAudit?: boolean) => Promise<void>;
  isAuditing: boolean;
  auditStage: string;
}

const SAMPLE_RESUMES = [
  {
    role: 'Software Engineer Sample',
    candidate: 'Ujjwal Singh (Web & Frontend)',
    description: '300+ SMB websites, React/Tailwind, needs stronger conversion & impact metrics.',
    text: UJJWAL_RESUME_TEXT,
  },
  {
    role: 'Product / Project Manager Sample',
    candidate: 'Sarah Jenkins (Senior PM)',
    description: 'Led cross-functional teams of 14, reduced churn by 18%, agile sprint delivery.',
    text: `Sarah Jenkins
New York, NY | sarah.jenkins@example.com | (555) 321-7654 | linkedin.com/in/sarahjenkins-pm

PROFESSIONAL SUMMARY
Results-driven Senior Product Manager with 6+ years of experience leading cross-functional engineering, design, and marketing teams to scale SaaS platforms. Proven track record in customer discovery, roadmapping, and driving double-digit user retention growth.

EXPERIENCE
Lead Product Manager | CloudSphere Technologies | 2022 - Present
• Spearheaded end-to-end product strategy for enterprise cloud collaboration tool, growing Monthly Active Users from 45,000 to 180,000 in 18 months.
• Defined and prioritized roadmap features using RICE scoring, cutting sprint cycle delivery delays by 22%.
• Collaborated with UX research to revamp onboarding funnel, boosting 30-day user activation rate by 18%.
• Managed quarterly OKR reviews and communicated product progress to C-suite executives and board members.

Product Manager | Nexa Digital Solutions | 2019 - 2022
• Owned mobile product roadmap for fintech iOS/Android app with 250k+ downloads.
• Conducted 80+ customer discovery interviews to identify friction points in checkout flow, reducing cart abandonment by 14%.
• Partnered with engineering leads to migrate monolithic backend to microservices, reducing incident downtime by 35%.

EDUCATION
Bachelor of Science in Business Administration & Computer Science
Boston University | Magna Cum Laude | 2019

CORE COMPETENCIES
Product Roadmapping, Agile/Scrum, User Journey Mapping, Data Analysis (Mixpanel, Amplitude), SQL, Jira, PRD Writing, A/B Testing, Stakeholder Management`,
  },
  {
    role: 'Marketing Specialist Sample',
    candidate: 'Alex Rivera (Growth & Demand Gen)',
    description: 'PPC campaigns, $600k budget management, email automation, SEO optimization.',
    text: `Alex Rivera
Austin, TX | alex.rivera@example.com | (512) 890-4321 | linkedin.com/in/alexrivera-growth

PROFESSIONAL SUMMARY
Data-oriented Growth Marketing Specialist with 4 years of experience scaling B2B demand generation pipelines, paid acquisition, and inbound conversion. Managed over $600K in annual digital ad spend with an average ROAS of 3.8x.

WORK EXPERIENCE
Growth Marketing Specialist | ScaleFlow SaaS | 2021 - Present
• Orchestrated multichannel paid search and social campaigns across Google Ads, LinkedIn, and Meta, generating 3,400+ qualified MQLs annually.
• Lowered Customer Acquisition Cost (CAC) by 24% through multivariate landing page testing and negative keyword pruning.
• Designed automated email nurturing sequences in HubSpot, increasing lead-to-opportunity conversion by 19%.
• Analyzed weekly pipeline metrics using Google Analytics 4 and Tableau to allocate budget toward highest ROI channels.

Digital Marketing Associate | Elevate Agency | 2020 - 2021
• Managed content strategy and technical SEO optimizations for 12 client websites, yielding an average organic traffic increase of 65% in 9 months.
• Wrote high-converting ad copy and product one-pagers that generated $180k in attributable pipeline revenue.

SKILLS
Google Ads (Search & Display), Meta Ads Manager, LinkedIn Campaign Manager, HubSpot, GA4, Semrush, Webflow, Copywriting, A/B Testing, Attribution Modeling

EDUCATION
B.A. in Strategic Communication & Marketing
University of Texas at Austin | 2020`,
  },
];

export const WelcomeImportView: React.FC<WelcomeImportViewProps> = ({
  onImportResume,
  isAuditing,
}) => {
  const [tab, setTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setExtractionError(null);

    if (
      file.type === 'text/plain' ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.json')
    ) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        if (text && text.trim().length > 30) {
          setPastedText(text);
          await onImportResume(text, true);
        } else {
          setExtractionError('The uploaded file appears to be empty or has too little text.');
        }
      };
      reader.readAsText(file);
      return;
    }

    setIsExtracting(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          const mimeType = file.type || 'application/pdf';

          const response = await fetch('/api/extract-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: base64Data,
              mimeType,
              fileName: file.name,
            }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(
              data.error || 'Failed to extract text from document. You can paste the text directly.'
            );
          }

          if (data.text && data.text.trim().length > 30) {
            setPastedText(data.text);
            await onImportResume(data.text, true);
          } else {
            throw new Error(
              'Could not find readable text in this document. Please try pasting the text.'
            );
          }
        } catch (err: any) {
          setExtractionError(err.message || 'Error processing document');
        } finally {
          setIsExtracting(false);
        }
      };
      reader.onerror = () => {
        setExtractionError('Error reading file from disk');
        setIsExtracting(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setExtractionError(err.message || 'Error processing document');
      setIsExtracting(false);
    }
  };

  const handleAnalyzePasted = async () => {
    if (!pastedText || pastedText.trim().length < 40) {
      setExtractionError(
        'Please paste at least a couple sentences of your resume (name, experience, skills).'
      );
      return;
    }
    setExtractionError(null);
    await onImportResume(pastedText.trim(), true);
  };

  return (
    <div className="space-y-10 py-4 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide uppercase shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Executive HR &amp; ATS Resume Intelligence</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Evaluate Your Resume Like a{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
            Senior HR Director
          </span>
        </h1>

        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Import your resume below to receive an instant, objective 100-point evaluation. Scored
          strictly against universal executive HR standards — impact metrics, action verbs, ATS
          machine readability, and professional presentation — with zero role bias.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-2">
          <button
            onClick={() => setTab('upload')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'upload'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document (PDF / DOCX)</span>
          </button>

          <button
            onClick={() => setTab('paste')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'paste'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>Paste Resume Text</span>
          </button>

          <button
            onClick={() => setTab('samples')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'samples'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Try Sample Resume</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {tab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? 'border-indigo-600 bg-indigo-50/70 scale-[0.99]'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.json"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                    {isExtracting || isAuditing ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <FileUp className="w-8 h-8" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800">
                      {isExtracting
                        ? 'Extracting text from resume...'
                        : isAuditing
                        ? 'Analyzing resume with Gemini...'
                        : 'Drag & Drop your resume file here'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Supports PDF, Word (.docx), Plain Text (.txt), or Markdown
                    </p>
                  </div>

                  {!isExtracting && !isAuditing && (
                    <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse Files on Computer</span>
                    </div>
                  )}

                  {selectedFile && !isExtracting && (
                    <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                      Loaded: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              </div>

              {extractionError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{extractionError}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Files are processed privately &amp; securely
                </span>
                <span>Max file size: 10MB</span>
              </div>
            </div>
          )}

          {tab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Paste Resume Content (Summary, Experience, Education, Skills)
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => {
                    setPastedText(e.target.value);
                    setExtractionError(null);
                  }}
                  rows={10}
                  placeholder={`John Doe\nSoftware Engineer | San Francisco, CA | john@example.com\n\nPROFESSIONAL SUMMARY\nFull-stack engineer with 4+ years of experience building scalable web applications...\n\nWORK EXPERIENCE\nSenior Frontend Engineer | Acme Corp (2022 - Present)\n• Architected design system used across 8 applications, cutting frontend dev cycles by 30%...\n• Spearheaded web vitals initiative, improving LCP from 3.2s to 1.1s...`}
                  className="w-full p-4 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed transition-all"
                />
              </div>

              {extractionError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{extractionError}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">
                  {pastedText.length} characters • ~
                  {pastedText.split(/\s+/).filter(Boolean).length} words
                </span>

                <button
                  onClick={handleAnalyzePasted}
                  disabled={isAuditing || !pastedText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  {isAuditing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating Universal HR Standards...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Start HR Evaluation &amp; Scoring</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {tab === 'samples' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 font-medium">
                Want to test the HR scoring system instantly? Pick any of these realistic candidate
                profiles to experience the full evaluation suite:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SAMPLE_RESUMES.map((sample, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 bg-slate-50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">
                        {sample.role}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-2">{sample.candidate}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {sample.description}
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        setPastedText(sample.text);
                        await onImportResume(sample.text, true);
                      }}
                      disabled={isAuditing}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-indigo-600 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      {isAuditing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Load &amp; Score This Resume</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Universal HR Scorecard</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            100-point rubric assessing impact metrics, action verbs, machine parsability, layout,
            and credibility.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Google XYZ Rewrites</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Transform passive responsibilities into "Accomplished [X], measured by [Y], by doing
            [Z]" power bullets.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Job Description Matcher</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Paste any targeted job opening to detect missing keywords, skill gaps, and custom
            tailoring advice.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">ATS Optimized PDF Export</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Generate and download a clean, single-page PDF formatted to effortlessly pass modern
            ATS scanners.
          </p>
        </div>
      </div>
    </div>
  );
};
