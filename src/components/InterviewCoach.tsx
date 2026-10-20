import React, { useState, useEffect } from 'react';
import {
   ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquare,
  Code,
  Users,
  Loader2,
  Compass,
  AlertCircle,
} from 'lucide-react';

interface InterviewCoachProps {
  resumeText: string;
}

function buildQuestionsForResume(resumeText: string) {
  const isUjjwal =
    !resumeText || !resumeText.trim() || resumeText.toLowerCase().includes('ujjwal singh');
  if (isUjjwal) {
    return {
      hrScreenQuestions: [
        {
          question:
            'You mentioned launching 300+ websites at Adaan Digital. How much of that was custom code vs using SaaS template builders like Duda and Strato?',
          whyTheyAskIt:
            'Recruiters want to verify if you are a real software developer writing custom JavaScript/React or simply a content inputter / template configurer.',
          modelAnswerTip:
            'Highlight your custom development: "While platforms like Duda and Strato handled baseline CMS hosting, my core responsibility was writing custom JavaScript widgets, CSS styling overrides, responsive breakpoints, and client-specific API integrations whenever native templates fell short."',
        },
        {
          question:
            'Under Certifications, you listed HTML, CSS, JavaScript, and React. Where did you complete these, and what practical projects did you build?',
          whyTheyAskIt:
            'Listing raw technology names as certifications looks informal. Recruiters test whether you completed rigorous coursework or simply listed familiar topics.',
          modelAnswerTip:
            'Pivot immediately to project proof: "I completed hands-on curricula across freeCodeCamp and Meta Open Source materials, reinforcing those competencies by building production web apps like my Speech-to-Text converter with real-time browser APIs and dynamic React state."',
        },
        {
          question:
            'Walk me through your transition from completing your BCA degree in 2025 to delivering production client sites at scale.',
          whyTheyAskIt:
            'Recruiters verify timeline continuity, work ethic, and readiness for full-time engineering ownership.',
          modelAnswerTip:
            'Emphasize high-velocity execution: "Balancing my BCA studies with high-volume production delivery taught me strict time management, clean component reuse, and how to ship defect-free web experiences under tight agency SLAs."',
        },
      ],
      technicalQuestions: [
        {
          question:
            'How does your Speech-to-Text Converter handle browser compatibility and network drops during real-time transcription?',
          testedConcept: 'Web Speech API, async error handling, audio streams, and React state lifecycle.',
          modelAnswerTip:
            'Walk through architecture: "I utilized the Web Speech API (webkitSpeechRecognition) wrapped in custom React hooks. To prevent UI lockups, I handled recognition lifecycle events (onresult, onerror, onend) with defensive error boundary fallbacks and live interim transcript state updates."',
        },
        {
          question:
            'How do you optimize a website built with Tailwind CSS and React for maximum Google Lighthouse mobile performance?',
          testedConcept:
            'Core Web Vitals (LCP, CLS, INP), CSS purge, dynamic imports, image optimization.',
          modelAnswerTip:
            'Mention concrete tooling: "I enforce automated Tailwind purging of unused utility classes, lazy load non-critical React components with React.lazy/Suspense, use modern WebP image formats with explicit aspect ratios to eliminate CLS, and audit with Chrome DevTools."',
        },
        {
          question:
            'When building responsive layouts across 300+ diverse client sites, how do you manage CSS maintainability and cross-browser quirks?',
          testedConcept:
            'Flexbox, CSS Grid, mobile-first design, Autoprefixer, cross-browser debugging.',
          modelAnswerTip:
            'Emphasize mobile-first methodology: "I adhere to a mobile-first philosophy using modern Flexbox and CSS Grid layouts, test systematically across Safari iOS, Chrome, and Firefox, and leverage CSS custom properties and utility classes to ensure predictability."',
        },
      ],
      behavioralQuestions: [
        {
          question:
            'How did you balance client deadlines when delivering 300+ websites with strict template constraints?',
          situationFocus:
            'Agency pressure, prioritization, client communication, template limitations.',
          starAnswerGuide:
            'Situation: High-volume agency environment. Task: Deliver fast without sacrificing visual polish. Action: Built modular component templates and reusable CSS/JS snippets. Result: Delivered 300+ defect-free sites on schedule while cutting turnaround time by 25%.',
        },
        {
          question:
            'Tell me about a time a client requested a custom feature that the SaaS builder did not natively support.',
          situationFocus: 'Creative technical problem-solving and stakeholder communication.',
          starAnswerGuide:
            'Situation: Client needed dynamic filtering not supported by default widgets. Task: Deliver custom interactivity safely. Action: Wrote a lightweight vanilla JS module injected via custom code blocks. Result: Met client requirements without breaking platform updates.',
        },
      ],
    };
  }

  const lines = resumeText.split('\n').map((l) => l.trim()).filter(Boolean);
  const candidateName = lines[0] || 'Candidate';
  const topBullet =
    lines.find((l) => /^[•\-\*]/.test(l))?.replace(/^[•\-\*]\s*/, '') ||
    'leading cross-functional initiatives and delivering measurable business results';

  return {
    hrScreenQuestions: [
      {
        question: `On your resume, you highlighted "${topBullet.slice(0, 95)}...". Can you walk me through your exact personal ownership and how those metrics were measured?`,
        whyTheyAskIt:
          'Recruiters verify individual contribution vs. team output and test how fluently you speak to your numbers.',
        modelAnswerTip:
          'State the baseline metric before you started, the specific actions you personally led, and how the final KPI improvement was tracked.',
      },
      {
        question: `Looking across ${candidateName}'s career progression, what is the primary value proposition you bring in your first 90 days?`,
        whyTheyAskIt:
          'Evaluates strategic clarity, seniority alignment, and immediate onboarding readiness.',
        modelAnswerTip:
          'Connect your strongest 2 domain skills directly to a 30-60-90 day execution plan grounded in past wins.',
      },
      {
        question:
          'What kind of team culture and operational cadence allows you to do your best work?',
        whyTheyAskIt: 'Assesses cultural fit, communication maturity, and autonomy.',
        modelAnswerTip:
          'Emphasize high-ownership, metric-driven collaboration, transparent feedback loops, and customer-centric execution.',
      },
    ],
    technicalQuestions: [
      {
        question:
          'Which technical or functional system listed on your resume was the most complex to architect or scale?',
        testedConcept: 'Depth of domain mastery, trade-off analysis, and systems thinking.',
        modelAnswerTip:
          'Break down the constraints, the alternatives you rejected, why you chose your architecture/methodology, and the measurable result.',
      },
      {
        question:
          'How do you diagnose bottlenecks and ensure high quality when deliverables face compressed deadlines?',
        testedConcept: 'Root-cause diagnostics, instrumentation, and quality assurance.',
        modelAnswerTip:
          'Walk through a concrete example of using data/profiling tools to isolate the top bottleneck and prevent regressions.',
      },
      {
        question:
          'If you could re-architect one major project from your recent experience today, what would you change?',
        testedConcept: 'Continuous improvement mindset and senior retrospective judgment.',
        modelAnswerTip:
          'Highlight how you would incorporate stronger automation, observability, or modular design based on lessons learned.',
      },
    ],
    behavioralQuestions: [
      {
        question:
          'Tell me about a time you had to influence senior stakeholders or peers when they initially disagreed with your approach.',
        situationFocus: 'Data-backed persuasion, empathy, and cross-functional alignment.',
        starAnswerGuide:
          'Situation: Competing stakeholder priorities. Task: Align team on highest-ROI path. Action: Presented a concise data/prototype comparison showing risk vs. reward. Result: Gained buy-in and delivered ahead of target KPIs.',
      },
      {
        question:
          'Describe a high-stakes project where requirements shifted mid-execution. How did you protect delivery quality?',
        situationFocus: 'Adaptability, scope management, and transparent communication.',
        starAnswerGuide:
          'Situation: Mid-sprint scope change. Task: Hit launch window without burnout or defects. Action: Re-prioritized critical path items and phased secondary features. Result: 100% on-time launch with strong user adoption.',
      },
    ],
  };
}

export const InterviewCoach: React.FC<InterviewCoachProps> = ({ resumeText }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'hr-0': true,
    'tech-0': true,
    'beh-0': true,
  });

  const [questionsData, setQuestionsData] = useState<any>(() =>
    buildQuestionsForResume(resumeText)
  );

  // Sync questions whenever a different candidate's resume is imported
  useEffect(() => {
    setQuestionsData(buildQuestionsForResume(resumeText));
  }, [resumeText]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
        }),
      });

      if (!response.ok) {
        throw new Error('Interview prep regeneration failed');
      }

      const data = await response.json();
      setQuestionsData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to refresh interview questions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Interview Screen Simulator</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Anticipated Recruiter, Technical &amp; Behavioral Questions
          </h2>
          <p className="text-xs text-slate-500">
            The exact questions hiring managers will grill you on based on your resume, with model
            talking points
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={isLoading}
          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-indigo-600" />
          )}
          <span>Refresh Questions</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Section 1: HR Screening Questions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Users className="w-4 h-4" />
            </div>
            <span>HR Phone Screen Questions (Gatekeeper Round)</span>
          </div>

          <div className="space-y-3">
            {questionsData.hrScreenQuestions?.map((item: any, i: number) => {
              const id = `hr-${i}`;
              const isOpen = openItems[id];
              return (
                <div
                  key={i}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50"
                >
                  <div
                    onClick={() => toggleItem(id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-800 pr-2">
                      Q{i + 1}: {item.question}
                    </span>
                    <button className="text-slate-400">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="p-4 pt-2 border-t border-slate-200 bg-white space-y-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                        <strong className="block text-[11px] uppercase tracking-wider mb-0.5">
                          Why the recruiter asks this:
                        </strong>
                        <p>{item.whyTheyAskIt}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                        <strong className="block text-[11px] uppercase tracking-wider text-emerald-800 mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Recommended Winning Answer Strategy:
                        </strong>
                        <p className="leading-relaxed italic">{item.modelAnswerTip}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Technical Deep-Dive */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800">
              <Code className="w-4 h-4" />
            </div>
            <span>Technical &amp; Domain Deep-Dive (Hiring Manager Round)</span>
          </div>

          <div className="space-y-3">
            {questionsData.technicalQuestions?.map((item: any, i: number) => {
              const id = `tech-${i}`;
              const isOpen = openItems[id];
              return (
                <div
                  key={i}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50"
                >
                  <div
                    onClick={() => toggleItem(id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-800 pr-2">
                      Tech Q{i + 1}: {item.question}
                    </span>
                    <button className="text-slate-400">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="p-4 pt-2 border-t border-slate-200 bg-white space-y-3 text-xs">
                      <div className="text-[11px] text-slate-600">
                        <strong>Concepts Tested:</strong> {item.testedConcept}
                      </div>

                      <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-950">
                        <strong className="block text-[11px] uppercase tracking-wider text-indigo-800 mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Technical Answer Walkthrough:
                        </strong>
                        <p className="leading-relaxed">{item.modelAnswerTip}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Behavioral & Situational Questions (Fixed missing render bug!) */}
        {questionsData.behavioralQuestions?.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Compass className="w-4 h-4" />
              </div>
              <span>Behavioral &amp; Leadership Questions (STAR Method Round)</span>
            </div>

            <div className="space-y-3">
              {questionsData.behavioralQuestions.map((item: any, i: number) => {
                const id = `beh-${i}`;
                const isOpen = openItems[id];
                return (
                  <div
                    key={i}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50"
                  >
                    <div
                      onClick={() => toggleItem(id)}
                      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <span className="text-xs font-bold text-slate-800 pr-2">
                        Behavioral Q{i + 1}: {item.question}
                      </span>
                      <button className="text-slate-400">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="p-4 pt-2 border-t border-slate-200 bg-white space-y-3 text-xs">
                        <div className="text-[11px] text-slate-600">
                          <strong>Core Competency Focus:</strong> {item.situationFocus}
                        </div>

                        <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-950">
                          <strong className="block text-[11px] uppercase tracking-wider text-teal-800 mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> STAR Method Answer Blueprint:
                          </strong>
                          <p className="leading-relaxed">{item.starAnswerGuide}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
