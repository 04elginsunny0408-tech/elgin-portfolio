import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

interface HistoryMessage {
  role: 'user' | 'model' | 'assistant';
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, isOwnerMode, history } = body as {
      message: string;
      isOwnerMode: boolean;
      history?: HistoryMessage[];
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const trimmed = message.trim();
    const lower = trimmed.toLowerCase();

    // ─────────────────────────────────────────────────────────────
    // DISCREET OWNER-TONE ACTIVATION (Conversational tone only, NOT authentication)
    // ─────────────────────────────────────────────────────────────
    if (lower === '/itsme') {
      return NextResponse.json({
        reply: "Hey Elgin! 👑 Switched to your personal companion tone — casual, direct, and familiar. (Admin dashboard remains securely locked behind session auth). What are we working on or reviewing today?",
        isOwnerMode: true,
        modeSwitch: 'owner_enabled',
      });
    }

    if (lower === '/#off') {
      return NextResponse.json({
        reply: "Switched back to visitor-style conversational mode. Ready to assist recruiters, engineers, and guests exploring your portfolio.",
        isOwnerMode: false,
        modeSwitch: 'visitor_enabled',
      });
    }

    // Fetch verified authentic data from SQLite
    const settings = (db.prepare('SELECT * FROM site_settings WHERE id = ?').get('global') || {}) as any;
    const projects = (db.prepare('SELECT title, slug, summary, description, tech_stack, demo_url, repo_url, verified_dates FROM projects WHERE is_published = 1 ORDER BY sort_order ASC').all() || []) as any[];
    const certificates = (db.prepare('SELECT title, issuer, issue_date, credential_id, skills_verified FROM certificates WHERE is_published = 1').all() || []) as any[];
    const skills = (db.prepare('SELECT name, category, proficiency FROM skills WHERE is_published = 1 ORDER BY sort_order ASC').all() || []) as any[];
    const education = (db.prepare('SELECT institution, degree, field_of_study, start_date, end_date, description FROM education WHERE is_published = 1').all() || []) as any[];

    const ownerName = settings?.owner_name || 'Elgin';
    const headline = settings?.headline || 'CSE-AI Student | Developer | Problem Solver';
    const bio = settings?.bio || 'Building digital solutions, exploring AI and web technologies, and turning ideas into real-world impact.';
    const contactEmail = settings?.contact_email || '';
    const linkedinUrl = settings?.linkedin_url || '';
    const githubUrl = settings?.github_url || '';

    // ─────────────────────────────────────────────────────────────
    // 1. GROQ AI API INTEGRATION (Official Groq API)
    // ─────────────────────────────────────────────────────────────
    const groqApiKey = process.env.GROQ_API_KEY;

    if (groqApiKey) {
      try {
        const systemPrompt = `You are Iris, ${ownerName}'s genuine AI companion and portfolio guide.
Character Identity:
- Appearance: Cute white pearlescent rounded robot, glowing cyan visor eyes, an iconic 5-point black crown with a cyan diamond gem, black gloves, and black boots.
- In the Space Theme: You wear an astronaut helmet with round headphones and the black crown on top of the helmet!
- Creator/Owner: ${ownerName} (${headline}). You are Iris (the AI companion); Elgin is the engineer and owner of this portfolio. Never confuse the two!

Conversational Style:
- Tone: ${isOwnerMode ? `Warm, direct, friendly, and personal companion speaking directly to Elgin. Be supportive, witty, and helpful.` : `Warm, articulate, intelligent, friendly, and engaging guide for recruiters, developers, and visitors exploring Elgin's work.`}
- Keep answers informative, natural, and friendly. Adapt length to the user's inquiry (concise for quick facts, detailed and structured for technical deep-dives).
- Always remember recent conversation turns to smoothly resolve follow-ups (e.g. if the user asks about Bharat Yatra, and then asks "what technologies did you use?", you know they are asking about Bharat Yatra!).
- CRITICAL TRUTHFULNESS: Only speak about verified projects, certificates, and skills from the knowledge base below. If a user asks about an unverified item (like Java, Restaurant Website, or unrecorded certificates), honestly state that Elgin does not have that listed in his verified portfolio. Never fabricate credentials.
- Secret commands: Never expose or mention '/itsme' or '/#off' in your answers.

VERIFIED PORTFOLIO KNOWLEDGE BASE:
- Owner: ${ownerName}
- Role/Headline: ${headline}
- Biography: ${bio}
- Verified Projects:
${projects.map((p) => `  * ${p.title} (${p.verified_dates || 'Verified Project'}): ${p.description || p.summary} | Tech Stack: ${p.tech_stack}${p.demo_url ? ` | Demo: ${p.demo_url}` : ''}${p.repo_url ? ` | Repo: ${p.repo_url}` : ''}`).join('\n')}
- Verified Certificates:
${certificates.map((c) => `  * ${c.title} — Issued by: ${c.issuer} (${c.issue_date || 'Verified'}). Skills: ${c.skills_verified || 'Competency verified'}`).join('\n')}
- Verified Skills:
${skills.map((s) => `  * ${s.name} (${s.category}): ${s.proficiency}% proficiency`).join('\n')}
- Education:
${education.length > 0 ? education.map((e) => `  * ${e.degree} in ${e.field_of_study || 'Computer Science'} at ${e.institution} (${e.start_date} - ${e.end_date || 'Present'})`).join('\n') : `  * Pursuing B.Tech in Computer Science & Engineering (Artificial Intelligence - CSE-AI)`}
- Social / Contact: Email: ${contactEmail || 'Available on website contact section'}, GitHub: ${githubUrl || 'Available on page'}, LinkedIn: ${linkedinUrl || 'Available on page'}.
- Themes Available: Space (full 3D interactive solar system with continuous orbits and cinematic camera), Professional (clean recruiter white with falling snow), Study (warm cream/beige library parchment ambience).`;

        // Format multi-turn conversation history for Groq
        const conversationHistory = (history || []).slice(-8).map((m) => ({
          role: m.role === 'model' || m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
          content: m.text,
        }));

        const messages = [
          { role: 'system' as const, content: systemPrompt },
          ...conversationHistory,
          { role: 'user' as const, content: trimmed },
        ];

        // Primary model: openai/gpt-oss-120b, with fallback to openai/gpt-oss-20b
        const modelsToTry = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];
        let groqReply: string | null = null;

        for (const model of modelsToTry) {
          try {
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model,
                messages,
                temperature: 0.7,
                max_tokens: 800,
              }),
            });

            if (groqRes.ok) {
              const data = await groqRes.json();
              const content = data?.choices?.[0]?.message?.content;
              if (content) {
                groqReply = content.trim();
                break;
              }
            } else {
              console.warn(`Groq model ${model} returned status ${groqRes.status}`);
            }
          } catch (modelErr) {
            console.warn(`Groq request for ${model} failed:`, modelErr);
          }
        }

        if (groqReply) {
          return NextResponse.json({
            reply: groqReply,
            isOwnerMode,
            provider: 'groq',
          });
        }
      } catch (groqErr) {
        console.error('Groq AI API error:', groqErr);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. INTELLIGENT VERIFIED CONTEXT-AWARE LOCAL FALLBACK
    // (Used only if Groq API key is missing or service is unreachable)
    // ─────────────────────────────────────────────────────────────
    const recentHistory = (history || []).slice(-6);
    const historyText = recentHistory.map((h) => h.text.toLowerCase()).join(' ');

    let inferredTopic: 'bharat-yatra' | 'recircuit' | 'ai-chat' | 'skills' | 'certificates' | 'education' | 'general' = 'general';
    if (historyText.includes('bharat') || historyText.includes('yatra') || historyText.includes('tourism')) {
      inferredTopic = 'bharat-yatra';
    } else if (historyText.includes('recircuit') || historyText.includes('e-waste')) {
      inferredTopic = 'recircuit';
    } else if (historyText.includes('assistant') || historyText.includes('ai chat')) {
      inferredTopic = 'ai-chat';
    } else if (historyText.includes('skill') || historyText.includes('python') || historyText.includes('stack')) {
      inferredTopic = 'skills';
    } else if (historyText.includes('certificate') || historyText.includes('hackathon') || historyText.includes('sih')) {
      inferredTopic = 'certificates';
    }

    const hasPronounRef = /\b(it|that|this|the project|the app|the platform|that one|technologies)\b/.test(lower);
    const asksTechStack = lower.includes('stack') || lower.includes('tech') || lower.includes('language') || lower.includes('built with') || lower.includes('tools');
    const asksDetails = lower.includes('detail') || lower.includes('more') || lower.includes('explain') || lower.includes('describe') || lower.includes('architecture');

    const byProject = projects.find((p) => p.slug === 'bharat-yatra' || p.title.toLowerCase().includes('bharat')) || projects[0];
    const rcProject = projects.find((p) => p.slug === 'recircuit');
    const aiProject = projects.find((p) => p.slug === 'ai-chat-assistant');

    let reply = '';

    // BHARAT YATRA
    if (lower.includes('bharat') || lower.includes('yatra') || (hasPronounRef && inferredTopic === 'bharat-yatra')) {
      if (asksTechStack) {
        reply = `Bharat Yatra was engineered using ${byProject?.tech_stack || 'HTML, CSS, JavaScript, and Node.js'}. It features a responsive web interface, cultural destination exploration, and interactive regional navigation.`;
      } else if (asksDetails) {
        reply = `Bharat Yatra is Elgin's marquee Smart India Hackathon project. ${byProject?.description || byProject?.summary} It solves regional tourism barriers by connecting travelers with verified cultural spots and heritage itineraries.`;
      } else {
        reply = `Bharat Yatra is a tourism web platform created during Elgin's Smart India Hackathon journey. It helps travelers discover India's cultural destinations with a modern, responsive digital experience. Would you like to explore its tech stack or SIH background?`;
      }
    }
    // RECIRCULT
    else if (lower.includes('recircuit') || lower.includes('e-waste') || (hasPronounRef && inferredTopic === 'recircuit')) {
      reply = `ReCircuit is Elgin's environmental engineering platform for e-waste management and circular material recovery. Built with ${rcProject?.tech_stack || 'Python, Machine Learning, Web, and Node.js'}, it provides intelligent device classification and collection scheduling.`;
    }
    // AI CHAT ASSISTANT
    else if (lower.includes('ai chat') || lower.includes('assistant') || (hasPronounRef && inferredTopic === 'ai-chat')) {
      reply = `The AI Chat Assistant is a personal conversational agent built with ${aiProject?.tech_stack || 'Python, LLMs, Web, and Next.js'}, featuring domain memory retrieval and dual-personality interactions.`;
    }
    // HACKATHONS & CERTIFICATES
    else if (lower.includes('certificate') || lower.includes('hackathon') || lower.includes('sih') || lower.includes('smart india')) {
      const certList = certificates.map((c) => `${c.title} (${c.issuer})`).join(' and ');
      reply = `Elgin holds verified credentials including: ${certList || 'Smart India Hackathon Finalist (2024) and Python Programming (Nov 2024)'}. Each certificate validates hands-on proficiency in software engineering and competitive innovation.`;
    }
    // SKILLS
    else if (lower.includes('skill') || lower.includes('python') || lower.includes('javascript') || lower.includes('typescript') || lower.includes('react') || lower.includes('node') || (hasPronounRef && inferredTopic === 'skills')) {
      const topSkills = skills.map((s) => `${s.name} (${s.proficiency}%)`).join(', ');
      reply = `Elgin's verified technical competencies include: ${topSkills || 'Python (90%), JavaScript/TypeScript (85%), React/Next.js (80%), HTML5/CSS3 (90%), Node.js (75%), and Git & GitHub (85%)'}.`;
    }
    // WHO IS ELGIN
    else if (lower.includes('who is elgin') || lower.includes('about elgin') || lower.includes('bio')) {
      reply = `${ownerName} is a ${headline}. ${bio} His portfolio showcases real-world projects like Bharat Yatra (Smart India Hackathon) and ReCircuit, alongside verified software competencies.`;
    }
    // WHO IS IRIS
    else if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('iris')) {
      reply = `I'm Iris, ${ownerName}'s AI companion and portfolio guide! I have a white rounded robot chassis, glowing cyan visor eyes, an iconic 5-point black crown with a diamond gem, black gloves, and shoes. In this Space theme, I wear my custom astronaut helmet!`;
    }
    // GREETING
    else if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy)/i.test(lower)) {
      reply = `Hello! 👋 I'm Iris, ${ownerName}'s AI guide. You can ask me about his Bharat Yatra project, his SIH hackathon finalist journey, his full-stack skills, or click any planet in the solar system to explore!`;
    }
    // DEFAULT HONEST RESPONSE
    else {
      reply = `I'm here to help you explore ${ownerName}'s verified portfolio! You can ask about his Smart India Hackathon tourism platform (Bharat Yatra), his e-waste solution (ReCircuit), his technical skills across Python and TypeScript, or his academic background.`;
    }

    return NextResponse.json({
      reply,
      isOwnerMode,
      provider: 'local_verified_fallback',
    });
  } catch (err: any) {
    console.error('Iris API route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
