import React, { useState } from 'react';
import {
  Briefcase,
  User,
  Code2,
  FolderGit2,
  Award,
  Mail,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckSquare,
} from 'lucide-react';

interface SectionAuditProps {
  sectionCritiques: any;
  actionPlan: string[];
  onOpenRewriterWithText: (text: string, context: string) => void;
}

export const SectionAuditCard: React.FC<SectionAuditProps> = ({
  sectionCritiques = {},
  actionPlan = [],
  onOpenRewriterWithText,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    summary: true,
    experience: true,
    skills: true,
    certifications: true,
    projects: false,
    contactInfo: false,
    actionPlan: true,
  });

  const summary = sectionCritiques?.summary || {
    status: 'Needs Review',
    critique: 'Summary should highlight core domain expertise and top quantified achievements.',
    rewrittenVersion:
      'Results-driven professional with proven expertise delivering measurable operational and technical outcomes.',
  };
  const experience = sectionCritiques?.experience || {
    status: 'Moderate Impact',
    critique: 'Experience bullets benefit from explicit Google XYZ metrics.',
    enhancedBullets: [],
  };
  const skills = sectionCritiques?.skills || {
    status: 'Structured',
    critique: 'Organize skills into explicit functional categories.',
    missingKeySkills: [],
    suggestedGrouping: '',
  };
  const certifications = sectionCritiques?.certifications || {
    status: 'Needs Verification',
    critique: 'List accredited issuing authorities and dates.',
    urgentFix: 'Include issuing organization and verification link for each credential.',
  };
  const projects = sectionCritiques?.projects || {
    status: 'Add Links & Metrics',
    critique: 'Include live links and measurable project outcomes.',
    recommendations: [],
  };
  const contactInfo = sectionCritiques?.contactInfo || {
    status: 'Needs Polish',
    critique: 'Ensure full contact details and LinkedIn/Portfolio links are visible.',
    fix: 'Add LinkedIn and portfolio URLs in the header.',
  };

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text || '');
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div
          onClick={() => toggleSection('actionPlan')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Action Plan: Steps to Reach 90+ HR Score &amp; Maximize Callbacks
              </h3>
              <p className="text-xs text-slate-500">
                Prioritized recommendations based on executive HR hiring standards
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            {openSections.actionPlan ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {openSections.actionPlan && (
          <div className="mt-5 space-y-3 pt-4 border-t border-slate-100">
            {(Array.isArray(actionPlan) ? actionPlan : []).map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="text-xs text-slate-800 leading-relaxed font-medium">{action}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1. Professional Summary Audit */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div
          onClick={() => toggleSection('summary')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Professional Summary Audit</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  {summary.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Elevates candidate positioning with impactful power verbiage
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            {openSections.summary ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {openSections.summary && (
          <div className="mt-5 space-y-4 pt-4 border-t border-slate-100">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">HR Specialist Critique:</strong>
              {summary.critique}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Original Summary / Overview
                </span>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "
                  {summary.originalSnippet ||
                    summary.originalText ||
                    'Front-End Developer with professional experience building and launching 300+ responsive, CMS-based websites in a live production environment...'}
                  "
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Recommended High-Impact Rewrite
                  </span>
                  <button
                    onClick={() => handleCopy(summary.rewrittenVersion, 'summary')}
                    className="p-1.5 rounded-lg bg-emerald-200 hover:bg-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'summary' ? (
                      <>
                        <Check className="w-3 h-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                  {summary.rewrittenVersion}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Work Experience Audit */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div
          onClick={() => toggleSection('experience')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Work Experience &amp; Impact Audit
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                  {experience.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Applying the Google XYZ Formula to prove measurable achievements
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            {openSections.experience ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {openSections.experience && (
          <div className="mt-5 space-y-5 pt-4 border-t border-slate-100">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">HR Recruiter Critique:</strong>
              {experience.critique}
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Bullet Point Enhancements (XYZ Format)
              </h4>

              {(Array.isArray(experience.enhancedBullets) ? experience.enhancedBullets : []).map(
                (item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-500 block mb-0.5">
                        Original Bullet:
                      </span>
                      <span className="line-through text-slate-400">{item.originalSnippet}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase text-emerald-800 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Improved XYZ Bullet Point
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              onOpenRewriterWithText(item.originalSnippet, 'Experience Bullet')
                            }
                            className="text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            Customize <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleCopy(item.improvedXYZ, `bullet-${idx}`)}
                            className="p-1 rounded bg-emerald-200 hover:bg-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {copiedKey === `bullet-${idx}` ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-emerald-950 leading-relaxed">
                        • {item.improvedXYZ}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 italic">
                      <strong>Why this works:</strong> {item.rationale}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Skills Audit */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div
          onClick={() => toggleSection('skills')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Skills &amp; Keywords Architecture
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                  {skills.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Eliminating filler soft skills, organizing high-value domain keywords
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            {openSections.skills ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {openSections.skills && (
          <div className="mt-5 space-y-4 pt-4 border-t border-slate-100">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">HR Recruiter Critique:</strong>
              {skills.critique}
            </div>

            {skills.missingKeySkills?.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  High-Priority Missing Keywords &amp; Competencies:
                </span>
                <div className="flex flex-wrap gap-2">
                  {skills.missingKeySkills.map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200"
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {skills.suggestedGrouping && (
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-900">
                    Recommended ATS Categorization:
                  </span>
                  <button
                    onClick={() => handleCopy(skills.suggestedGrouping, 'skills-group')}
                    className="p-1 px-2 rounded bg-indigo-200 hover:bg-indigo-300 text-indigo-900 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'skills-group' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}{' '}
                    Copy Grouping
                  </button>
                </div>
                <p className="text-xs text-indigo-950 font-mono leading-relaxed bg-white p-3 rounded-lg border border-indigo-100">
                  {skills.suggestedGrouping}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Certifications Urgent Fix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div
          onClick={() => toggleSection('certifications')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Credentials &amp; Qualifications Audit
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                  {certifications.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ensuring accredited, verifiable credential presentation
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            {openSections.certifications ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {openSections.certifications && (
          <div className="mt-5 space-y-4 pt-4 border-t border-slate-100">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong className="block mb-1">HR Recruiter Assessment:</strong>
              {certifications.critique}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-800 block mb-1">
                Recommended Solution:
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{certifications.urgentFix}</p>
            </div>
          </div>
        )}
      </div>

      {/* 5. Projects & Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Projects Audit</h3>
              <p className="text-xs text-slate-500">{projects.status}</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-3">{projects.critique}</p>
          <ul className="space-y-2">
            {(Array.isArray(projects.recommendations) ? projects.recommendations : []).map(
              (rec: string, i: number) => (
                <li
                  key={i}
                  className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100"
                >
                  <span className="text-teal-600 font-bold shrink-0">•</span>
                  <span>{rec}</span>
                </li>
              )
            )}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Header &amp; Contact Info</h3>
              <p className="text-xs text-slate-500">{contactInfo.status}</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-3">{contactInfo.critique}</p>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
            <strong>Recommended Fix:</strong> {contactInfo.fix}
          </div>
        </div>
      </div>
    </div>
  );
};
