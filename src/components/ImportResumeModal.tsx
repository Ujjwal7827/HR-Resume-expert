import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  FileUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { UJJWAL_RESUME_TEXT } from '../data/ujjwalResume';

interface ImportResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportResume: (text: string, autoAudit: boolean) => void;
}

export const ImportResumeModal: React.FC<ImportResumeModalProps> = ({
  isOpen,
  onClose,
  onImportResume,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [autoAudit, setAutoAudit] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setPastedText(text);
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
            throw new Error(data.error || 'Failed to extract text from document');
          }

          if (data.text) {
            setPastedText(data.text);
          } else {
            throw new Error('No readable text returned from document');
          }
        } catch (err: any) {
          setExtractionError(
            err.message || 'Could not parse file automatically. You can paste the text manually.'
          );
        } finally {
          setIsExtracting(false);
        }
      };
      reader.onerror = () => {
        setIsExtracting(false);
        setExtractionError('File read error');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsExtracting(false);
      setExtractionError(err.message || 'Could not parse file. You can paste the text manually.');
    }
  };

  const handleConfirmImport = () => {
    const textToImport = pastedText.trim();
    if (!textToImport) {
      setExtractionError('Please provide resume text before importing.');
      return;
    }
    onImportResume(textToImport, autoAudit);
  };

  const sampleSeniorResume = `Alex Rivera
San Francisco, CA | (555) 349-8812 | alex.rivera@devmail.io | github.com/arivera-dev

PROFESSIONAL SUMMARY
Senior Front-End Software Engineer with 5+ years of experience engineering high-throughput SaaS web applications and design systems in React and TypeScript. Proven expertise architecting state management pipelines, reducing bundle sizes by 38%, and mentoring engineering teams.

EXPERIENCE
Lead UI Engineer | CloudScale Systems (2022 – Present)
• Architected enterprise dashboard using React 18, TypeScript, and TanStack Query, reducing end-to-end data latency by 45% for 120k daily active users.
• Established automated CI/CD component testing suite with Vitest and Playwright, achieving 94% code coverage and eliminating regression incidents.

SKILLS
Languages: TypeScript, JavaScript (ESNext), HTML5, CSS3, GraphQL
Frameworks: React.js, Next.js, Tailwind CSS, Redux Toolkit, Zustand
Tools: Docker, Webpack, Vite, Git, Jest, Playwright, Storybook

EDUCATION
B.S. in Computer Science | San Jose State University (2018–2022)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-2xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Import Resume Document</h3>
              <p className="text-xs text-slate-500">
                Upload a PDF, DOCX, TXT, or paste resume text for real-time HR evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50/40 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 text-xs font-bold border-b-2 px-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Upload File (PDF / DOCX / TXT)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 text-xs font-bold border-b-2 px-2 transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Paste Text
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`pb-2.5 text-xs font-bold border-b-2 px-2 transition-all cursor-pointer ${
              activeTab === 'samples'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sample Resumes
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99]'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.json"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <FileUp className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Click to browse or drag and drop your resume file
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports <strong>PDF</strong>, <strong>Word (.docx)</strong>,{' '}
                    <strong>TXT</strong>, <strong>Markdown (.md)</strong> (Max 10MB)
                  </p>
                </div>
              </div>

              {selectedFile && (
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">
                      {selectedFile.name}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>

                  {isExtracting ? (
                    <div className="flex items-center gap-1.5 text-indigo-600 font-semibold text-[11px] shrink-0">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting Text...</span>
                    </div>
                  ) : pastedText ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px] shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Text Extracted
                    </span>
                  ) : null}
                </div>
              )}

              {pastedText && (
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">
                    Extracted Resume Preview:
                  </span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {pastedText}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Paste Resume Text:</label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={10}
                className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="Paste the full text of your resume here..."
              />
            </div>
          )}

          {activeTab === 'samples' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Load a Benchmark Profile:
              </span>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => setPastedText(UJJWAL_RESUME_TEXT)}
                  className={`p-3.5 text-left rounded-xl border transition-all text-xs cursor-pointer ${
                    pastedText === UJJWAL_RESUME_TEXT
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-950 font-semibold'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="font-bold text-slate-900 block">
                    Ujjwal Singh (Front-End Developer / SaaS Web Designer)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    BCA 2025, 300+ websites launched at Adaan Digital Solutions, React &amp;
                    Tailwind.
                  </span>
                </button>

                <button
                  onClick={() => setPastedText(sampleSeniorResume)}
                  className={`p-3.5 text-left rounded-xl border transition-all text-xs cursor-pointer ${
                    pastedText === sampleSeniorResume
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-950 font-semibold'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="font-bold text-slate-900 block">
                    Alex Rivera — Senior Front-End Software Engineer
                  </span>
                  <span className="text-[11px] text-slate-500">
                    5+ years experience, TypeScript, React 18, CloudScale Systems, automated CI/CD.
                  </span>
                </button>
              </div>
            </div>
          )}

          {extractionError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{extractionError}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoAudit}
                onChange={(e) => setAutoAudit(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Immediately run fresh Gemini HR rating upon import
              </span>
            </label>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={!pastedText.trim() || isExtracting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Import &amp; Analyze Resume</span>
          </button>
        </div>
      </div>
    </div>
  );
};
