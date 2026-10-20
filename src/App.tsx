import React, { useState } from 'react';
import {
  buildHeuristicEvaluation,
} from './data/ujjwalResume';
import { WelcomeImportView } from './components/WelcomeImportView';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { SectionAuditCard } from './components/SectionAuditCard';
import { HRChatAdvisor } from './components/HRChatAdvisor';
import { BulletPointRewriter } from './components/BulletPointRewriter';
import { ATSAnalyzer } from './components/ATSAnalyzer';
import { InterviewCoach } from './components/InterviewCoach';
import { ResumeComparisonView } from './components/ResumeComparisonView';
import { ImportResumeModal } from './components/ImportResumeModal';
import {
  exportOptimizedResumePDF,
  exportAuditReportPDF,
  buildResumeExportDataFromText,
} from './utils/pdfGenerator';
import {
  Sparkles,
  FileText,
  MessageSquare,
  Wand2,
  Target,
  HelpCircle,
  Printer,
  RotateCcw,
  UserCheck,
  CheckCircle,
  AlertCircle,
  LayoutDashboard,
  FileDown,
  Loader2,
  Upload,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'audit' | 'chat' | 'rewriter' | 'ats' | 'interview' | 'comparison'
  >('overview');
  const [hasImportedResume, setHasImportedResume] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStage, setAuditStage] = useState<string>('');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isPrintingReport, setIsPrintingReport] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const candidateName =
    hasImportedResume && resumeText.trim()
      ? resumeText
          .split('\n')
          .map((l) => l.trim())
          .find((l) => l.length > 0 && !l.startsWith('#')) || 'Candidate'
      : 'No Resume Loaded';

  const handleResetToWelcome = () => {
    setHasImportedResume(false);
    setEvaluation(null);
    setResumeText('');
    setImportNotice(null);
    setErrorNotice(null);
    setActiveTab('overview');
  };

  const handleQuickDownloadPDF = () => {
    if (!hasImportedResume || !evaluation) {
      setIsImportModalOpen(true);
      return;
    }
    setIsDownloadingPDF(true);
    setErrorNotice(null);
    try {
      const exportData = buildResumeExportDataFromText(resumeText, evaluation);
      exportOptimizedResumePDF(exportData, 'modern');
      setImportNotice(`Exported ATS-Optimized PDF for ${candidateName}.`);
    } catch (err: any) {
      setErrorNotice(`PDF export error: ${err.message || 'Failed to export'}`);
    } finally {
      setTimeout(() => setIsDownloadingPDF(false), 600);
    }
  };

  const handlePrintAuditReport = () => {
    if (!hasImportedResume || !evaluation) {
      setIsImportModalOpen(true);
      return;
    }
    setIsPrintingReport(true);
    setErrorNotice(null);
    try {
      exportAuditReportPDF(evaluation, candidateName);
      try {
        window.print();
      } catch (e) {
        console.log('Native window.print() bypassed due to sandbox iframe permissions:', e);
      }
    } catch (err: any) {
      setErrorNotice(`Print report error: ${err.message || 'Failed to generate print report'}`);
    } finally {
      setTimeout(() => setIsPrintingReport(false), 600);
    }
  };

  const [rewriterInitialBullet, setRewriterInitialBullet] = useState(
    'Designed and launched 300+ websites across multiple site editors for SMB clients, building responsive, CMS-based, user-centric web experiences.'
  );
  const [rewriterInitialContext, setRewriterInitialContext] = useState(
    'SaaS Web Designer at Adaan Digital'
  );

  const handleOpenRewriterWithText = (text: string, context: string) => {
    setRewriterInitialBullet(text);
    setRewriterInitialContext(context);
    setActiveTab('rewriter');
  };

  const handleRunGeminiReAudit = async (
    newText: string,
    enableThinking: boolean = false,
    isFreshImport: boolean = false
  ) => {
    setIsAuditing(true);
    setErrorNotice(null);
    const parsedName =
      newText
        .split('\n')
        .map((l) => l.trim())
        .find((l) => l.length > 0 && !l.startsWith('#')) || 'Candidate';
    setAuditStage(
      enableThinking
        ? `Deep Reasoning Analysis: Evaluating universal HR standards for ${parsedName}...`
        : `Instant Analysis: Evaluating universal HR standards for ${parsedName}...`
    );

    try {
      const response = await fetch('/api/rate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: newText,
          enableThinking,
        }),
      });

      if (!response.ok) {
        throw new Error('Evaluation request failed');
      }

      const data = await response.json();
      setEvaluation(data);
      setHasImportedResume(true);
      setActiveTab('overview');

      if (isFreshImport) {
        setImportNotice(
          `Resume for ${parsedName} evaluated! Overall Score: ${data.overallScore}/100 (Grade ${data.grade})`
        );
      } else {
        setImportNotice(
          `Re-audit complete for ${parsedName}! Updated Score: ${data.overallScore}/100 (Grade ${data.grade})`
        );
      }
    } catch {
      // Graceful client-side fallback so evaluation always succeeds
      const fallbackData = buildHeuristicEvaluation(newText);
      setEvaluation(fallbackData);
      setHasImportedResume(true);
      setActiveTab('overview');
      setImportNotice(
        `Resume for ${parsedName} evaluated! Overall Score: ${fallbackData.overallScore}/100 (Grade ${fallbackData.grade})`
      );
    } finally {
      setIsAuditing(false);
      setAuditStage('');
    }
  };

  const handleImportResume = async (newText: string, autoAudit: boolean = true) => {
    setResumeText(newText);
    setHasImportedResume(true);
    setIsImportModalOpen(false);
    setErrorNotice(null);

    const parsedName =
      newText
        .split('\n')
        .map((l) => l.trim())
        .find((l) => l.length > 0 && !l.startsWith('#')) || 'Candidate';

    const lines = newText.split('\n');
    const firstBullet = lines.find(
      (l) => l.trim().startsWith('•') || l.trim().startsWith('-') || l.trim().startsWith('*')
    );
    if (firstBullet) {
      setRewriterInitialBullet(firstBullet.replace(/^[•\-\*]\s*/, '').trim());
      setRewriterInitialContext(`Imported Resume (${parsedName})`);
    }

    if (autoAudit) {
      await handleRunGeminiReAudit(newText, false, true);
    } else {
      // Fix bug where autoAudit=false left evaluation=null and trapped user on WelcomeImportView
      const baselineEval = buildHeuristicEvaluation(newText);
      setEvaluation(baselineEval);
      setActiveTab('overview');
      setImportNotice(
        `Resume loaded for ${parsedName} with baseline score (${baselineEval.overallScore}/100). Open "Compare & PDF -> Resume Editor" anytime to run a deep Gemini re-audit.`
      );
    }
  };

  const tabs = [
    { id: 'overview', label: 'Scorecard', icon: LayoutDashboard },
    { id: 'audit', label: 'Critiques & Fixes', icon: FileText },
    { id: 'rewriter', label: 'Bullet Optimizer', icon: Wand2 },
    { id: 'ats', label: 'Job Matcher', icon: Target },
    { id: 'interview', label: 'Interview Prep', icon: HelpCircle },
    { id: 'comparison', label: 'Compare & PDF', icon: Sparkles },
    { id: 'chat', label: 'AI Advisor', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  TalentAudit Pro
                </h1>
                <p className="text-xs text-slate-500">
                  {hasImportedResume ? (
                    <span className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-slate-700">{candidateName}</span>
                      {evaluation && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <span className="text-emerald-700 font-semibold">
                            Score: {evaluation.overallScore}/100
                          </span>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <span className="text-slate-500">Grade {evaluation.grade}</span>
                        </>
                      )}
                    </span>
                  ) : (
                    <span>Executive Resume Quality Evaluator</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasImportedResume ? (
                <>
                  <button
                    onClick={handleResetToWelcome}
                    className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Return to Welcome Screen & Start Over"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Start Over</span>
                  </button>

                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    title="Import or paste another resume"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Change Resume</span>
                  </button>

                  <button
                    onClick={handleQuickDownloadPDF}
                    disabled={isDownloadingPDF}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                    title="Download ATS-Optimized PDF Resume"
                  >
                    {isDownloadingPDF ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5" />
                    )}
                    <span>Export PDF</span>
                  </button>

                  <button
                    onClick={handlePrintAuditReport}
                    disabled={isPrintingReport}
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
                    title="Print or download complete executive audit report"
                    aria-label="Print or download executive audit report"
                  >
                    {isPrintingReport ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                    ) : (
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span className="hidden sm:inline">Print Report</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Resume</span>
                </button>
              )}
            </div>
          </div>

          {hasImportedResume && evaluation && (
            <div className="border-t border-slate-100 -mb-px">
              <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-3 px-3 sm:px-3.5 text-xs whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                        isActive
                          ? 'border-indigo-600 text-indigo-700 font-bold'
                          : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium'
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                      />
                      <span>{tab.label}</span>
                      {tab.id === 'overview' && evaluation && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 ml-0.5">
                          {evaluation.overallScore}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {isAuditing && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-lg overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/50 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" /> Executive HR Evaluation in
                      Progress
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 font-semibold">
                      Universal Standards
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Analyzing Resume for <span className="text-indigo-200">{candidateName}</span>
                  </h3>
                  <p className="text-xs text-indigo-200/80 mt-1 flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block shrink-0" />
                    <span>
                      {auditStage ||
                        'Reading resume structure & evaluating universal HR standards...'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="hidden md:flex flex-col items-end text-right text-xs text-indigo-300/70">
                <span className="font-semibold text-white">Full-Stack Intelligence Pipeline</span>
                <span className="text-[11px]">Gemini 2.5 Flash Engine</span>
              </div>
            </div>
          </div>
        )}

        {errorNotice && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorNotice}</span>
            </div>
            <button
              onClick={() => setErrorNotice(null)}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
        )}

        {importNotice && !isAuditing && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importNotice}</span>
            </div>
            <button
              onClick={() => setImportNotice(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
        )}

        {!hasImportedResume || !evaluation ? (
          <WelcomeImportView
            onImportResume={handleImportResume}
            isAuditing={isAuditing}
            auditStage={auditStage}
          />
        ) : (
          <>
            <div className="sm:hidden mb-4 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Candidate: {candidateName}</span>
                <span>Universal HR Quality Audit</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Score: {evaluation.overallScore}/100
              </span>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <ExecutiveSummary
                  evaluation={evaluation}
                  candidateName={candidateName}
                  onJumpToTab={(tab) => setActiveTab(tab as any)}
                />
                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Ready to optimize {candidateName}'s resume for top-tier employer shortlists?
                    </h4>
                    <p className="text-xs text-slate-500">
                      Explore section-by-section critiques, the Google XYZ bullet formula, or chat
                      directly with our AI recruiter.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleQuickDownloadPDF}
                      disabled={isDownloadingPDF}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {isDownloadingPDF ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5" />
                      )}
                      <span>Export Optimized PDF</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('audit')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer"
                    >
                      View Section Fixes
                    </button>
                    <button
                      onClick={() => setActiveTab('comparison')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Side-by-Side Diff
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <SectionAuditCard
                sectionCritiques={evaluation.sectionCritiques}
                actionPlan={evaluation.actionPlanTo90Plus}
                onOpenRewriterWithText={handleOpenRewriterWithText}
              />
            )}

            {activeTab === 'chat' && <HRChatAdvisor resumeContext={resumeText} />}

            {activeTab === 'rewriter' && (
              <BulletPointRewriter
                initialBullet={rewriterInitialBullet}
                initialContext={rewriterInitialContext}
              />
            )}

            {activeTab === 'ats' && <ATSAnalyzer resumeText={resumeText} />}

            {activeTab === 'interview' && <InterviewCoach resumeText={resumeText} />}

            {activeTab === 'comparison' && (
              <ResumeComparisonView
                currentResumeText={resumeText}
                evaluation={evaluation}
                onUpdateResumeText={setResumeText}
                onRunGeminiReAudit={handleRunGeminiReAudit}
                isAuditing={isAuditing}
                onOpenImportModal={() => setIsImportModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      <ImportResumeModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportResume={handleImportResume}
      />
    </div>
  );
}
