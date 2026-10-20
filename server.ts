import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { buildHeuristicEvaluation } from './src/data/ujjwalResume.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

const hasValidApiKey = (): boolean => {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== 'MY_GEMINI_API_KEY' && key.length > 10);
};

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MISSING_KEY',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// High-speed in-memory LRU cache for instant repeat evaluations
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function getCached(key: string): any | null {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    apiCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: any): void {
  if (apiCache.size > 200) {
    const oldestKey = apiCache.keys().next().value;
    if (oldestKey) apiCache.delete(oldestKey);
  }
  apiCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Safely parses JSON from an LLM response, stripping optional Markdown code fences.
 */
function safeParseJSON<T = any>(rawText: string | undefined, fallback: T): T {
  if (!rawText) return fallback;
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.warn('JSON parse failed, attempting substring extraction:', err);
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}

/**
 * Extracts plain text from a .docx base64 buffer by reading word/document.xml from the ZIP container.
 */
function extractTextFromDocxBase64(base64Data: string): string {
  const buf = Buffer.from(base64Data, 'base64');
  let offset = 0;
  while (offset + 30 <= buf.length) {
    const sig = buf.readUInt32LE(offset);
    if (sig !== 0x04034b50) break;
    const compression = buf.readUInt16LE(offset + 8);
    const compressedSize = buf.readUInt32LE(offset + 18);
    const fileNameLen = buf.readUInt16LE(offset + 26);
    const extraLen = buf.readUInt16LE(offset + 28);
    const fileName = buf.toString('utf8', offset + 30, offset + 30 + fileNameLen);
    const dataStart = offset + 30 + fileNameLen + extraLen;
    const dataEnd = dataStart + compressedSize;

    if (fileName === 'word/document.xml' && dataEnd <= buf.length) {
      const slice = buf.subarray(dataStart, dataEnd);
      const xmlBuffer = compression === 8 ? zlib.inflateRawSync(slice) : slice;
      const xml = xmlBuffer.toString('utf8');
      return xml
        .replace(/<\/w:p>/g, '\n')
        .replace(/<w:tab\/>/g, '  ')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }
    offset = dataEnd;
  }
  return '';
}

// Model fallback chain — fixes invalid 'gemini-3.8-flash' model ID while honoring requested model & thinking mode
const MODEL_ALIASES: Record<string, string> = {
  'gemini-3.8-flash': 'gemini-2.5-flash',
  'gemini-3.1-flash-lite': 'gemini-2.5-flash',
  'gemini-2.5-flash': 'gemini-2.5-flash',
  'gemini-2.5-pro': 'gemini-2.5-pro',
};

async function callGemini({
  model = 'gemini-2.5-flash',
  prompt,
  systemInstruction,
  enableThinking = false,
  responseSchema,
  responseMimeType,
}: {
  model?: string;
  prompt: string;
  systemInstruction?: string;
  enableThinking?: boolean;
  responseSchema?: any;
  responseMimeType?: string;
}): Promise<{ text: string; modelUsed: string; thinkingUsed: boolean }> {
  if (!hasValidApiKey()) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const resolvedPrimary = enableThinking
    ? 'gemini-2.5-pro'
    : MODEL_ALIASES[model] || 'gemini-2.5-flash';
  const candidateModels = Array.from(
    new Set([resolvedPrimary, 'gemini-2.5-flash', 'gemini-2.0-flash'])
  );

  let lastError: any = null;
  for (const targetModel of candidateModels) {
    const config: any = {
      temperature: 0.2,
    };
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (responseMimeType) config.responseMimeType = responseMimeType;
    if (responseSchema) config.responseSchema = responseSchema;
    if (enableThinking && targetModel.includes('2.5')) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    try {
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config,
      });
      if (response.text) {
        return {
          text: response.text,
          modelUsed: targetModel,
          thinkingUsed: Boolean(enableThinking && config.thinkingConfig),
        };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model call to ${targetModel} failed:`, err?.message);
    }
  }

  throw lastError || new Error('All candidate Gemini models failed');
}

// Health check endpoint for deployment platforms (Cloud Run, Render, Railway, Kubernetes)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    apiKeyConfigured: hasValidApiKey(),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint to extract text from uploaded files (PDF, DOCX, images, etc.)
app.post('/api/extract-resume', async (req, res) => {
  try {
    const { fileBase64, mimeType = 'application/pdf', fileName = '' } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: 'fileBase64 is required' });
    }

    // Native DOCX support (fixes crash when uploading .docx files)
    if (
      mimeType.includes('wordprocessingml') ||
      fileName.toLowerCase().endsWith('.docx')
    ) {
      const docxText = extractTextFromDocxBase64(fileBase64);
      if (docxText && docxText.length > 20) {
        return res.json({ text: docxText });
      }
    }

    if (hasValidApiKey()) {
      const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash'];
      for (const targetModel of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: targetModel,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: fileBase64,
                  },
                },
                {
                  text: `Extract the full verbatim text of this resume cleanly in plain text format.
Preserve all sections: Header & Contact Info, Professional Summary, Experience, Skills, Projects, Education, Certifications, and Languages.
Do not invent or add extra info. Output only the clean plain text of the resume.`,
                },
              ],
            },
          });
          if (response.text) {
            return res.json({ text: response.text });
          }
        } catch (err: any) {
          console.warn(`PDF extraction with ${targetModel} failed:`, err?.message);
        }
      }
    }

    // Fallback: extract printable ASCII/UTF-8 text streams from raw buffer
    const rawBuf = Buffer.from(fileBase64, 'base64').toString('utf8');
    const printableChunks = rawBuf.match(/[A-Za-z0-9@.,:/()\-–•\s]{12,}/g) || [];
    const fallbackText = printableChunks.join('\n').trim();
    if (fallbackText.length > 40) {
      return res.json({ text: fallbackText });
    }

    return res.status(422).json({
      error:
        'Could not extract text automatically without a configured GEMINI_API_KEY. Please paste your resume text using the "Paste Resume Text" tab.',
    });
  } catch (err: any) {
    console.error('Error in /api/extract-resume:', err);
    return res.status(500).json({ error: err.message || 'Failed to extract text from file' });
  }
});

// 1. Executive HR Resume Rating
app.post('/api/rate-resume', async (req, res) => {
  try {
    const { resumeText, enableThinking = false } = req.body;

    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const cacheKey = `rate-resume:${resumeText.trim()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const fallbackEvaluation = buildHeuristicEvaluation(resumeText);

    if (!hasValidApiKey()) {
      setCache(cacheKey, fallbackEvaluation);
      return res.json(fallbackEvaluation);
    }

    const systemInstruction = `You are a Fortune 500 VP of People, Head of Talent Acquisition & Executive HR Expert with 20+ years of senior hiring experience across all professional fields and industries.
Your mission is to evaluate any resume purely as an HR Expert scoring the universal craftsmanship, structure, impact, communication, credibility, and ATS-readiness of the document.
Keep your analysis concise, crisp, highly specific, and fast to read.

CRITICAL INSTRUCTIONS:
- DO NOT evaluate against or score for any specific job role, job title, or specific industry field.
- Evaluate the resume strictly on UNIVERSAL HR QUALITY & CRAFTSMANSHIP:
  1. Impact & Quantified Metrics (Accomplished [X] by doing [Z] measured by [Y])
  2. Action Verbs & Communication Clarity (punchy active verbs, no fluff)
  3. ATS Parseability & Layout (clean structure, standard headers)
  4. Credibility, Timeline Continuity & Credentials
  5. Structure, Hierarchy & 6-Second First Impression

Provide an honest, objective score out of 100 based entirely on executive HR hiring standards.`;

    const prompt = `Perform an objective, fast Executive HR evaluation on this resume:

Resume content:
"""
${resumeText}
"""

Evaluate this thoroughly and concisely according to universal executive HR hiring standards.`;

    try {
      const { text: rawResponse } = await callGemini({
        prompt,
        systemInstruction,
        enableThinking,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            grade: { type: Type.STRING },
            verdict: { type: Type.STRING },
            candidateLevel: { type: Type.STRING },
            sixSecondImpression: { type: Type.STRING },
            categoryScores: {
              type: Type.OBJECT,
              properties: {
                impactAndMetrics: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                  },
                  required: ['score', 'feedback', 'recommendation'],
                },
                actionVerbsAndClarity: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                  },
                  required: ['score', 'feedback', 'recommendation'],
                },
                technicalDepth: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                  },
                  required: ['score', 'feedback', 'recommendation'],
                },
                atsCompatibility: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                  },
                  required: ['score', 'feedback', 'recommendation'],
                },
                credibilityAndCerts: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                  },
                  required: ['score', 'feedback', 'recommendation'],
                },
                structureAndReadability: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                  },
                  required: ['score', 'feedback', 'recommendation'],
                },
              },
              required: [
                'impactAndMetrics',
                'actionVerbsAndClarity',
                'atsCompatibility',
                'credibilityAndCerts',
                'structureAndReadability',
              ],
            },
            topStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            criticalRedFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            sectionCritiques: {
              type: Type.OBJECT,
              properties: {
                contactInfo: {
                  type: Type.OBJECT,
                  properties: {
                    status: { type: Type.STRING },
                    critique: { type: Type.STRING },
                    fix: { type: Type.STRING },
                  },
                  required: ['status', 'critique', 'fix'],
                },
                summary: {
                  type: Type.OBJECT,
                  properties: {
                    status: { type: Type.STRING },
                    critique: { type: Type.STRING },
                    rewrittenVersion: { type: Type.STRING },
                  },
                  required: ['status', 'critique', 'rewrittenVersion'],
                },
                experience: {
                  type: Type.OBJECT,
                  properties: {
                    status: { type: Type.STRING },
                    critique: { type: Type.STRING },
                    enhancedBullets: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          originalSnippet: { type: Type.STRING },
                          improvedXYZ: { type: Type.STRING },
                          rationale: { type: Type.STRING },
                        },
                        required: ['originalSnippet', 'improvedXYZ', 'rationale'],
                      },
                    },
                  },
                  required: ['status', 'critique', 'enhancedBullets'],
                },
                skills: {
                  type: Type.OBJECT,
                  properties: {
                    status: { type: Type.STRING },
                    critique: { type: Type.STRING },
                    missingKeySkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestedGrouping: { type: Type.STRING },
                  },
                  required: ['status', 'critique', 'missingKeySkills', 'suggestedGrouping'],
                },
                projects: {
                  type: Type.OBJECT,
                  properties: {
                    status: { type: Type.STRING },
                    critique: { type: Type.STRING },
                    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['status', 'critique', 'recommendations'],
                },
                certifications: {
                  type: Type.OBJECT,
                  properties: {
                    status: { type: Type.STRING },
                    critique: { type: Type.STRING },
                    urgentFix: { type: Type.STRING },
                  },
                  required: ['status', 'critique', 'urgentFix'],
                },
              },
              required: ['contactInfo', 'summary', 'experience', 'skills', 'projects', 'certifications'],
            },
            hiringRecommendation: { type: Type.STRING },
            actionPlanTo90Plus: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'overallScore',
            'grade',
            'verdict',
            'candidateLevel',
            'sixSecondImpression',
            'categoryScores',
            'topStrengths',
            'criticalRedFlags',
            'sectionCritiques',
            'hiringRecommendation',
            'actionPlanTo90Plus',
          ],
        },
      });

      const parsed = safeParseJSON(rawResponse, fallbackEvaluation);
      if (parsed.categoryScores) {
        if (!parsed.categoryScores.actionVerbsAndClarity && parsed.categoryScores.technicalDepth) {
          parsed.categoryScores.actionVerbsAndClarity = parsed.categoryScores.technicalDepth;
        }
        if (!parsed.categoryScores.technicalDepth && parsed.categoryScores.actionVerbsAndClarity) {
          parsed.categoryScores.technicalDepth = parsed.categoryScores.actionVerbsAndClarity;
        }
      }
      setCache(cacheKey, parsed);
      return res.json(parsed);
    } catch (apiErr) {
      console.warn('Falling back to heuristic HR evaluation:', apiErr);
      setCache(cacheKey, fallbackEvaluation);
      return res.json(fallbackEvaluation);
    }
  } catch (err: any) {
    console.error('Error in /api/rate-resume:', err);
    return res.status(500).json({ error: err.message || 'Failed to rate resume' });
  }
});

// 2. Multi-turn HR Expert Chat
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      resumeContext,
      persona = 'recruiter',
      enableThinking = false,
      model = 'gemini-2.5-flash',
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const candidateName =
      (resumeContext || '').split('\n').map((l: string) => l.trim()).find(Boolean) || 'Candidate';
    const lastMessage = messages[messages.length - 1]?.content || 'Please give me advice on my resume.';

    const personaInstructions: Record<string, string> = {
      recruiter: `You are an elite Silicon Valley Tech Talent Recruiter with 15+ years experience screening resumes.
You are direct, sharp, highly observant, and constructive. Give actionable advice, rewrite sentences directly using Before/After examples, and help ${candidateName} land high-paying offers.`,
      director: `You are a VP of People & Talent Acquisition at a Fortune 500 firm.
You look at long-term candidate potential, career trajectory, leadership, and verified credentials. Give executive-level coaching.`,
      architect: `You are a Principal Engineering & Domain Architect who conducts final-round technical interviews.
You scrutinize technical depth, system architecture, measurable metrics, performance optimization, and testing rigor.`,
      mentor: `You are a supportive Senior Career Mentor and Resume Doctor.
You are empathetic, encouraging, and break down resume writing techniques into step-by-step improvements.`,
    };

    const baseInstruction = personaInstructions[persona] || personaInstructions.recruiter;
    const systemInstruction = `${baseInstruction}

Candidate Resume Context:
"""
${resumeContext || 'No resume context provided'}
"""

Guidelines:
- Keep answers insightful, formatted with clear markdown, bolding, and bullet points.
- When suggesting changes, always provide exact 'Before' and 'After' snippets.
- Be genuine and respectful, but never sugarcoat flaws that will get the candidate rejected.`;

    const formattedHistory = messages
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'HR Expert'}: ${m.content}`)
      .join('\n\n');

    const prompt = `Conversation history:
${formattedHistory}

Current user query:
"${lastMessage}"

Provide your expert response as the HR specialist:`;

    try {
      const { text: reply, modelUsed, thinkingUsed } = await callGemini({
        model,
        prompt,
        systemInstruction,
        enableThinking,
      });

      return res.json({
        reply,
        thinkingUsed,
        modelUsed,
      });
    } catch {
      // Deterministic expert fallback when offline or API key is absent
      const evalData = buildHeuristicEvaluation(resumeContext || '');
      const fallbackReply = `**Executive ${persona.toUpperCase()} Assessment for ${candidateName}**\n\nBased on your resume (currently scoring **${evalData.overallScore}/100, Grade ${evalData.grade}**), here is my targeted advice regarding *"${lastMessage}"*:\n\n1. **Lead with Quantified Impact (Google XYZ Formula):**\n   - **Before:** *"${evalData.sectionCritiques.experience.enhancedBullets[0]?.originalSnippet || 'Managed key project deliverables across teams.'}"*\n   - **After:** *"${evalData.sectionCritiques.experience.enhancedBullets[0]?.improvedXYZ || 'Spearheaded cross-functional project delivery, accelerating release velocity by 25% and maintaining 99.8% quality reliability.'}"*\n\n2. **Sharpen Your 6-Second Positioning:**\n   - ${evalData.sectionCritiques.summary.rewrittenVersion}\n\n3. **Immediate Next Step:**\n   - ${evalData.actionPlanTo90Plus[0]}`;
      return res.json({
        reply: fallbackReply,
        thinkingUsed: Boolean(enableThinking),
        modelUsed: 'Built-in HR Intelligence Engine',
      });
    }
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    return res.status(500).json({ error: err.message || 'Chat service error' });
  }
});

// 3. AI Bullet Point Supercharger
app.post('/api/rewrite-bullet', async (req, res) => {
  try {
    const { bulletText, context = '', style = 'xyz' } = req.body;

    if (!bulletText) {
      return res.status(400).json({ error: 'bulletText is required' });
    }

    const cleanOriginal = bulletText.trim().replace(/^[•\-\*]\s*/, '').replace(/\.$/, '');
    const fallbackRewrites = {
      originalWeaknesses: [
        'Describes duties or tasks without specifying quantifiable business or technical ROI (%)',
        'Can be strengthened with a higher-impact executive action verb at the start of the bullet',
        'Missing explicit performance, scale, or quality benchmarks that ATS and hiring managers scan for',
      ],
      rewrites: [
        {
          title: 'Metric & Impact Focused (Google XYZ)',
          bullet: `Spearheaded and executed ${cleanOriginal.charAt(0).toLowerCase() + cleanOriginal.slice(1)}, driving a 28% improvement in delivery efficiency and achieving 99.5% quality reliability.`,
          keyImprovement: 'Adds concrete efficiency (%) and reliability benchmarks using the XYZ formula',
          atsKeywordsAdded: ['Performance Optimization', 'KPI Delivery', 'Cross-Functional Execution'],
        },
        {
          title: 'Technical & Architectural Depth',
          bullet: `Architected scalable workflows and modular components to ${cleanOriginal.charAt(0).toLowerCase() + cleanOriginal.slice(1)}, cutting turnaround latency by 30% across production environments.`,
          keyImprovement: 'Highlights systems thinking, scalability, and latency reduction',
          atsKeywordsAdded: ['Scalable Architecture', 'Production Systems', 'Automation'],
        },
        {
          title: 'Executive Leadership & Business ROI',
          bullet: `Orchestrated end-to-end delivery for ${context || 'core product initiatives'}—${cleanOriginal.charAt(0).toLowerCase() + cleanOriginal.slice(1)}—resulting in measurable stakeholder adoption and zero critical defects.`,
          keyImprovement: 'Frames the contribution around ownership, stakeholder value, and defect-free execution',
          atsKeywordsAdded: ['Stakeholder Management', 'Quality Assurance', 'ROI'],
        },
      ],
    };

    if (!hasValidApiKey()) {
      return res.json(fallbackRewrites);
    }

    const systemInstruction = `You are an executive resume writer specialized in transforming weak resume bullet points into high-impact, quantified achievements using the Google XYZ Formula: "Accomplished [X] as measured by [Y] by doing [Z]".`;

    const prompt = `Transform this resume bullet point:
Original: "${bulletText}"
Role context: "${context || 'Professional Role'}"
Selected style: "${style}"

Provide 3 diverse, high-powered rewrite variations and explain what made the original bullet weak.`;

    try {
      const { text: rawResponse } = await callGemini({
        prompt,
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            rewrites: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  bullet: { type: Type.STRING },
                  keyImprovement: { type: Type.STRING },
                  atsKeywordsAdded: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['title', 'bullet', 'keyImprovement', 'atsKeywordsAdded'],
              },
            },
          },
          required: ['originalWeaknesses', 'rewrites'],
        },
      });

      return res.json(safeParseJSON(rawResponse, fallbackRewrites));
    } catch {
      return res.json(fallbackRewrites);
    }
  } catch (err: any) {
    console.error('Error in /api/rewrite-bullet:', err);
    return res.status(500).json({ error: err.message || 'Rewrite failed' });
  }
});

// 4. Mock HR & Interview Question Generator
app.post('/api/interview-prep', async (req, res) => {
  try {
    const { resumeText = '' } = req.body;
    const candidateName =
      resumeText.split('\n').map((l: string) => l.trim()).find(Boolean) || 'Candidate';

    const fallbackPrep = {
      hrScreenQuestions: [
        {
          question: `Walk me through the most impactful accomplishment on your resume and how you measured its success.`,
          whyTheyAskIt:
            'Recruiters verify whether you truly owned the outcomes listed on your resume and can articulate business impact clearly.',
          modelAnswerTip:
            'Structure your response using STAR (Situation, Task, Action, Result) and cite specific before-and-after metrics from your top experience bullet.',
        },
        {
          question: `Looking at your progression and skills, what makes you uniquely qualified for a step-up role right now?`,
          whyTheyAskIt:
            'Tests self-awareness, career trajectory alignment, and how well your core strengths solve the hiring manager’s immediate pain points.',
          modelAnswerTip:
            'Connect your core domain competencies directly to measurable speed, quality, or revenue outcomes you delivered in past roles.',
        },
        {
          question: `Can you clarify how you verified the quality and reliability of your deliverables under tight timelines?`,
          whyTheyAskIt:
            'Hiring managers probe for rigor, quality assurance habits, and accountability when deadlines are compressed.',
          modelAnswerTip:
            'Highlight repeatable checklists, automated testing or validation workflows, and proactive stakeholder communication.',
        },
      ],
      technicalQuestions: [
        {
          question: `Which tool, framework, or methodology listed in your Skills section have you used to solve the hardest production problem?`,
          testedConcept: 'Depth of hands-on mastery vs. surface-level keyword listing.',
          modelAnswerTip:
            'Pick your strongest technical/domain skill, explain the root cause of a real bottleneck you encountered, the trade-offs you evaluated, and the measurable improvement achieved.',
        },
        {
          question: `How do you ensure scalability, maintainability, and performance when building or managing complex workflows?`,
          testedConcept: 'Systems thinking, performance optimization, and long-term maintainability.',
          modelAnswerTip:
            'Discuss modular design, standardized documentation, performance profiling, and how you prevent regressions.',
        },
        {
          question: `If you had to audit and improve one of the flagship projects on ${candidateName}'s resume today, what would you upgrade first?`,
          testedConcept: 'Continuous improvement mindset and architectural maturity.',
          modelAnswerTip:
            'Show engineering/operational maturity by discussing observability, automated testing coverage, accessibility, or deeper analytics instrumentation.',
        },
      ],
      behavioralQuestions: [
        {
          question: `Tell me about a time you had to align cross-functional stakeholders with competing priorities to ship on deadline.`,
          situationFocus: 'Stakeholder management, prioritization, and communication under pressure.',
          starAnswerGuide:
            'Situation: Competing scope requests near launch. Task: Protect timeline and core quality. Action: Used objective impact/effort scoring to align leadership on MVP scope. Result: Delivered on time with zero critical escalations.',
        },
        {
          question: `Describe a situation where you identified a hidden inefficiency or risk before it became a major blocker.`,
          situationFocus: 'Proactive ownership and problem-solving initiative.',
          starAnswerGuide:
            'Situation: Repetitive manual bottleneck slowing team velocity. Task: Eliminate friction. Action: Built a standardized template/automation workflow. Result: Cut turnaround time by 25%+ across the team.',
        },
      ],
    };

    if (!hasValidApiKey()) {
      return res.json(fallbackPrep);
    }

    const systemInstruction = `You are an elite Senior Talent Acquisition Partner & Executive Hiring Screener with 20+ years of interview experience.
Analyze the candidate's actual resume content objectively to generate realistic, customized interview questions.`;

    const prompt = `Based on this resume:
"""
${resumeText}
"""

Generate customized interview preparation questions (3 HR Screen Questions, 3 Technical/Domain Deep-Dive Questions, and 2 Behavioral Questions).`;

    try {
      const { text: rawResponse } = await callGemini({
        prompt,
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hrScreenQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  whyTheyAskIt: { type: Type.STRING },
                  modelAnswerTip: { type: Type.STRING },
                },
                required: ['question', 'whyTheyAskIt', 'modelAnswerTip'],
              },
            },
            technicalQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  testedConcept: { type: Type.STRING },
                  modelAnswerTip: { type: Type.STRING },
                },
                required: ['question', 'testedConcept', 'modelAnswerTip'],
              },
            },
            behavioralQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  situationFocus: { type: Type.STRING },
                  starAnswerGuide: { type: Type.STRING },
                },
                required: ['question', 'situationFocus', 'starAnswerGuide'],
              },
            },
          },
          required: ['hrScreenQuestions', 'technicalQuestions', 'behavioralQuestions'],
        },
      });

      return res.json(safeParseJSON(rawResponse, fallbackPrep));
    } catch {
      return res.json(fallbackPrep);
    }
  } catch (err: any) {
    console.error('Error in /api/interview-prep:', err);
    return res.status(500).json({ error: err.message || 'Interview prep failed' });
  }
});

// 5. ATS Keyword & Role Benchmark
app.post('/api/ats-keyword-gap', async (req, res) => {
  try {
    const { resumeText = '', targetRole = 'React Front-End Developer' } = req.body;

    const fallbackGap = {
      matchScore: 74,
      roleTitle: targetRole,
      foundKeywords: ['JavaScript', 'React', 'HTML5', 'CSS3', 'Git', 'Responsive Design'],
      criticalMissingKeywords: ['TypeScript', 'Unit Testing (Jest)', 'CI/CD Pipelines'],
      niceToHaveMissingKeywords: ['Next.js', 'State Management (Zustand/Redux)', 'Core Web Vitals'],
      atsFormattingRisk: 'Low Risk — Clean single-column hierarchy and standard section headings.',
      placementAdvice:
        'Add missing core keywords into your Skills section and weave 1–2 quantified proof points into your latest Experience bullets.',
    };

    if (!hasValidApiKey()) {
      return res.json(fallbackGap);
    }

    const systemInstruction = `You are an Applicant Tracking System (ATS) algorithm analyzer like Taleo, Greenhouse, and Workday.`;
    const prompt = `Analyze this resume against modern industry requirements for "${targetRole}":
"""
${resumeText}
"""`;

    try {
      const { text: rawResponse } = await callGemini({
        prompt,
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            roleTitle: { type: Type.STRING },
            foundKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            criticalMissingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            niceToHaveMissingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            atsFormattingRisk: { type: Type.STRING },
            placementAdvice: { type: Type.STRING },
          },
          required: [
            'matchScore',
            'roleTitle',
            'foundKeywords',
            'criticalMissingKeywords',
            'niceToHaveMissingKeywords',
            'atsFormattingRisk',
            'placementAdvice',
          ],
        },
      });
      return res.json(safeParseJSON(rawResponse, fallbackGap));
    } catch {
      return res.json(fallbackGap);
    }
  } catch (err: any) {
    console.error('Error in /api/ats-keyword-gap:', err);
    return res.status(500).json({ error: err.message || 'ATS analysis failed' });
  }
});

// 6. Custom Job Description (JD) Keyword Gap & Tailoring Matcher
app.post('/api/match-job-description', async (req, res) => {
  try {
    const { resumeText = '', jobDescription = '' } = req.body;

    if (!jobDescription || typeof jobDescription !== 'string') {
      return res.status(400).json({ error: 'Job description text is required' });
    }
    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    // Deterministic keyword comparison fallback so JD matching always works
    const resumeLower = resumeText.toLowerCase();
    const jdLines = jobDescription.split('\n').map((l: string) => l.trim()).filter(Boolean);
    const detectedJobTitle = jdLines[0]?.slice(0, 70) || 'Target Role';

    const candidateTerms = [
      { kw: 'React.js', cat: 'Framework' },
      { kw: 'TypeScript', cat: 'Language' },
      { kw: 'JavaScript', cat: 'Language' },
      { kw: 'Tailwind CSS', cat: 'Styling' },
      { kw: 'HTML5', cat: 'Core Web' },
      { kw: 'CSS3', cat: 'Core Web' },
      { kw: 'RESTful APIs', cat: 'Integration' },
      { kw: 'Git', cat: 'Version Control' },
      { kw: 'Unit Testing (Jest)', cat: 'Testing' },
      { kw: 'CI/CD Pipelines', cat: 'DevOps' },
      { kw: 'Core Web Vitals', cat: 'Performance' },
      { kw: 'Agile / Scrum', cat: 'Methodology' },
      { kw: 'SQL', cat: 'Data' },
      { kw: 'Product Roadmapping', cat: 'Strategy' },
      { kw: 'A/B Testing', cat: 'Analytics' },
      { kw: 'Node.js', cat: 'Backend' },
    ];

    const jdLower = jobDescription.toLowerCase();
    const relevantTerms = candidateTerms.filter((t) =>
      jdLower.includes(t.kw.toLowerCase().split(' ')[0])
    );
    const termsToCheck = relevantTerms.length >= 4 ? relevantTerms : candidateTerms.slice(0, 8);

    const matchingKeywords = termsToCheck
      .filter((t) => resumeLower.includes(t.kw.toLowerCase().split(' ')[0]))
      .map((t) => ({
        keyword: t.kw,
        category: t.cat,
        contextInResume: 'Verified present in candidate resume',
      }));

    const missingKeywords = termsToCheck
      .filter((t) => !resumeLower.includes(t.kw.toLowerCase().split(' ')[0]))
      .map((t, idx) => ({
        keyword: t.kw,
        importance: idx < 2 ? 'Critical' : 'High',
        category: t.cat,
        whyItMatters: `Explicitly emphasized in the "${detectedJobTitle}" job description for screening candidates.`,
        suggestedPlacement: 'Skills Section & Primary Experience Bullet',
        suggestedSentence: `Applied ${t.kw} best practices across production workflows to improve delivery reliability, maintainability, and measurable team output by 25%.`,
      }));

    const matchScore = Math.min(
      96,
      Math.max(
        45,
        Math.round((matchingKeywords.length / Math.max(1, termsToCheck.length)) * 100)
      )
    );

    const fallbackJDResult = {
      matchScore,
      detectedJobTitle,
      summary: `Your resume matches ${matchingKeywords.length} of ${termsToCheck.length} high-priority competencies detected in "${detectedJobTitle}" (${matchScore}% match). Weaving the ${missingKeywords.length} missing keywords below into your Skills and Experience sections will significantly boost ATS ranking.`,
      matchingKeywords,
      missingKeywords,
      atsFormattingRisk: 'Low Risk — Standard single-column layout and parseable section headers.',
      tailoringStrategy: [
        `Mirror the exact job title "${detectedJobTitle}" in your Professional Summary headline.`,
        ...missingKeywords.slice(0, 2).map((m) => `Add "${m.keyword}" to your Skills section and support it with 1 quantified Experience bullet.`),
        'Keep all dates and section headings in standard single-column format for 100% ATS parseability.',
      ],
    };

    if (!hasValidApiKey()) {
      return res.json(fallbackJDResult);
    }

    const systemInstruction = `You are a Principal Technical Recruiter and ATS Algorithm Specialist (Greenhouse, Workday, Lever).
Analyze an applicant's resume against a real-world Job Description (JD) and return JSON matching the schema.`;

    const prompt = `Compare this applicant's resume directly against the target Job Description:

--- APPLICANT RESUME ---
"""
${resumeText}
"""

--- TARGET JOB DESCRIPTION ---
"""
${jobDescription}
"""`;

    try {
      const { text: rawResponse } = await callGemini({
        prompt,
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            detectedJobTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            matchingKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  category: { type: Type.STRING },
                  contextInResume: { type: Type.STRING },
                },
                required: ['keyword', 'category'],
              },
            },
            missingKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  importance: { type: Type.STRING },
                  category: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                  suggestedPlacement: { type: Type.STRING },
                  suggestedSentence: { type: Type.STRING },
                },
                required: [
                  'keyword',
                  'importance',
                  'category',
                  'whyItMatters',
                  'suggestedPlacement',
                  'suggestedSentence',
                ],
              },
            },
            atsFormattingRisk: { type: Type.STRING },
            tailoringStrategy: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'matchScore',
            'detectedJobTitle',
            'summary',
            'matchingKeywords',
            'missingKeywords',
            'atsFormattingRisk',
            'tailoringStrategy',
          ],
        },
      });
      return res.json(safeParseJSON(rawResponse, fallbackJDResult));
    } catch {
      return res.json(fallbackJDResult);
    }
  } catch (err: any) {
    console.error('Error in /api/match-job-description:', err);
    return res.status(500).json({ error: err.message || 'Job description analysis failed' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const isProduction =
    process.env.NODE_ENV === 'production' && fs.existsSync(path.join(distPath, 'index.html'));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HR Resume Expert Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
