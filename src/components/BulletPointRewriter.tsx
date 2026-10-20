import React, { useState, useEffect } from 'react';
import { Sparkles, Wand2, Check, Copy, Tag, AlertCircle, Loader2 } from 'lucide-react';

interface BulletRewriterProps {
  initialBullet?: string;
  initialContext?: string;
}

export const BulletPointRewriter: React.FC<BulletRewriterProps> = ({
  initialBullet = 'Designed and launched 300+ websites across multiple site editors for SMB clients, building responsive, CMS-based, user-centric web experiences.',
  initialContext = 'SaaS Web Designer at Adaan Digital Solutions',
}) => {
  const [bulletText, setBulletText] = useState(initialBullet);
  const [context, setContext] = useState(initialContext);
  const [style, setStyle] = useState('xyz');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Sync props when user clicks "Customize ->" in SectionAuditCard or imports a new resume
  useEffect(() => {
    if (initialBullet) setBulletText(initialBullet);
  }, [initialBullet]);

  useEffect(() => {
    if (initialContext) setContext(initialContext);
  }, [initialContext]);

  const sampleBullets = [
    {
      title: 'Adaan Digital (CMS Websites)',
      bullet:
        'Designed and launched 300+ websites across multiple site editors for SMB clients, building responsive, CMS-based, user-centric web experiences.',
      context: 'SaaS Web Designer at Adaan Digital',
    },
    {
      title: 'Adaan Digital (Template Constraints)',
      bullet:
        'Delivered production sites on the Duda Local Search and Strato SaaS platforms, balancing template constraints with client-specific customization and cross-browser compatibility.',
      context: 'SaaS Web Designer at Adaan Digital',
    },
    {
      title: 'Speech-to-Text Converter Project',
      bullet:
        'Built a Speech-to-Text Converter web app using HTML, CSS, JavaScript, React.js, and Tailwind CSS for real-time voice-to-text transcription.',
      context: 'React Frontend Project',
    },
    {
      title: 'Product / Growth Initiative',
      bullet:
        'Collaborated with UX research and engineering to revamp user onboarding funnel and reduce customer drop-off.',
      context: 'Senior Product Manager',
    },
  ];

  const handleRewrite = async () => {
    if (!bulletText.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/rewrite-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletText,
          context,
          style,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate bullet point rewrites.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error rewriting bullet point');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google XYZ Formula Supercharger</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            AI Resume Bullet Point Power-Up
          </h2>
          <p className="text-xs text-slate-500">
            Convert passive task descriptions into quantified, high-impact accomplishments:
            "Accomplished [X] as measured by [Y] by doing [Z]"
          </p>
        </div>
      </div>

      <div>
        <span className="text-xs font-bold text-slate-600 block mb-2">
          Or test a sample resume bullet:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sampleBullets.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setBulletText(sample.bullet);
                setContext(sample.context);
                setResult(null);
                setErrorMsg(null);
              }}
              className={`p-2.5 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                bulletText === sample.bullet
                  ? 'border-indigo-500 bg-indigo-50/50 text-indigo-950 font-semibold'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-indigo-600 block mb-0.5">
                {sample.title}
              </span>
              <span className="line-clamp-2 text-[11px] text-slate-600">{sample.bullet}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Resume Bullet Point to Rewrite:
          </label>
          <textarea
            value={bulletText}
            onChange={(e) => setBulletText(e.target.value)}
            rows={3}
            className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none text-slate-800 leading-relaxed"
            placeholder="e.g. Designed and launched 300+ websites across multiple site editors..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Role Context / Company:
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none text-slate-800"
              placeholder="e.g. SaaS Web Designer, Front-End Developer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Optimization Formula:
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none text-slate-800 bg-white"
            >
              <option value="xyz">Google XYZ Formula (Impact + Metrics)</option>
              <option value="tech">Technical Engineering Depth (React/JS/CSS focus)</option>
              <option value="car">CAR Formula (Context, Action, Result)</option>
              <option value="speed">Performance &amp; Web Vitals Focus</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={handleRewrite}
          disabled={!bulletText.trim() || isLoading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing High-Impact Rewrites...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Generate 3 High-Impact Bullet Rewrites</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          {result.originalWeaknesses?.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Why Recruiters Rate the Original Bullet Weak:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                {result.originalWeaknesses.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Executive-Approved Variations:
            </h3>

            {result.rewrites?.map((rw: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                    {rw.title}
                  </span>
                  <button
                    onClick={() => handleCopy(rw.bullet, idx)}
                    className="p-1 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Bullet
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs font-semibold text-slate-900 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  • {rw.bullet}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                  <span className="italic">
                    <strong className="text-slate-700">Key Upgrade:</strong> {rw.keyImprovement}
                  </span>
                  {rw.atsKeywordsAdded?.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-600" />
                      <span className="text-[10px] font-bold text-emerald-700">
                        ATS Keywords: {rw.atsKeywordsAdded.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
