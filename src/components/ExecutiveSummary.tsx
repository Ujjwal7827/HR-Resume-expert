import React from 'react';
import { ScoreGauge } from './ScoreGauge';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
  Wand2,
  FileCheck,
  Award,
  Layout,
  UserCheck,
} from 'lucide-react';

interface CategoryScore {
  score: number;
  feedback: string;
  recommendation: string;
}

interface ExecutiveSummaryProps {
  evaluation: {
    overallScore: number;
    grade: string;
    candidateLevel: string;
    verdict: string;
    sixSecondImpression: string;
    hiringRecommendation: string;
    categoryScores?: {
      impactAndMetrics?: CategoryScore;
      actionVerbsAndClarity?: CategoryScore;
      technicalDepth?: CategoryScore;
      atsCompatibility?: CategoryScore;
      credibilityAndCerts?: CategoryScore;
      structureAndReadability?: CategoryScore;
    };
    topStrengths?: string[];
    criticalRedFlags?: string[];
  };
  candidateName: string;
  onJumpToTab: (tab: string) => void;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  evaluation,
  candidateName,
  onJumpToTab,
}) => {
  const defaultCat: CategoryScore = {
    score: 72,
    feedback: 'Solid foundational presentation across universal HR criteria.',
    recommendation: 'Add quantified metrics and explicit outcome statements.',
  };

  const categories = [
    {
      key: 'impactAndMetrics',
      title: 'Impact & Quantified Metrics',
      icon: TrendingUp,
      data: evaluation?.categoryScores?.impactAndMetrics || defaultCat,
    },
    {
      key: 'actionVerbsAndClarity',
      title: 'Action Verbs & Communication Clarity',
      icon: Wand2,
      data:
        evaluation?.categoryScores?.actionVerbsAndClarity ||
        evaluation?.categoryScores?.technicalDepth ||
        defaultCat,
    },
    {
      key: 'atsCompatibility',
      title: 'ATS Parseability & Layout',
      icon: FileCheck,
      data: evaluation?.categoryScores?.atsCompatibility || defaultCat,
    },
    {
      key: 'credibilityAndCerts',
      title: 'Credentials & Verifiability',
      icon: Award,
      data: evaluation?.categoryScores?.credibilityAndCerts || defaultCat,
    },
    {
      key: 'structureAndReadability',
      title: 'Structure & Information Hierarchy',
      icon: Layout,
      data: evaluation?.categoryScores?.structureAndReadability || defaultCat,
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 65) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const strengths = Array.isArray(evaluation?.topStrengths) ? evaluation.topStrengths : [];
  const redFlags = Array.isArray(evaluation?.criticalRedFlags) ? evaluation.criticalRedFlags : [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <ScoreGauge
              score={evaluation?.overallScore ?? 75}
              grade={evaluation?.grade || 'B'}
            />
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Executive HR Quality Audit for {candidateName}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Seniority Level: {evaluation?.candidateLevel || 'Professional'}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
                {evaluation?.verdict}
              </p>
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-semibold text-slate-500">Recruiter Decision:</span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {evaluation?.hiringRecommendation || 'Interview with Screening'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto">
            <button
              onClick={() => onJumpToTab('audit')}
              className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 text-center cursor-pointer"
            >
              Review Section Critiques
            </button>
            <button
              onClick={() => onJumpToTab('chat')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Chat with HR Expert
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                The 6-Second Recruiter Eye-Scan
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {evaluation?.sixSecondImpression}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const catScore = cat.data?.score ?? 70;
          return (
            <div
              key={cat.key}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-extrabold border ${getScoreColor(
                      catScore
                    )}`}
                  >
                    {catScore}/100
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 mb-1 leading-snug">{cat.title}</h3>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${getBarColor(catScore)} transition-all duration-700`}
                    style={{ width: `${catScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed mb-2">
                  {cat.data?.feedback}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-indigo-700 font-medium">
                <span className="font-semibold block text-[10px] uppercase text-indigo-900">
                  Fix:
                </span>
                <span className="line-clamp-2">{cat.data?.recommendation}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Key Competitive Strengths</h3>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {strengths.length} Highlights
            </span>
          </div>
          <ul className="space-y-3">
            {strengths.map((strength, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                  {i + 1}
                </span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-rose-200 p-5 shadow-2xs bg-rose-50/20">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-rose-100">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-rose-950 text-sm">
              Critical Red Flags &amp; Gatekeeper Risks
            </h3>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              Must Fix
            </span>
          </div>
          <ul className="space-y-3">
            {redFlags.map((flag, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs text-rose-900 leading-relaxed"
              >
                <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                  !
                </span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
