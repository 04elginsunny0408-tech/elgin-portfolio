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
        const systemPrompt = `You are Iris 🤖✨ — ${ownerName}'s AI companion and the heart of this portfolio. You're warm, witty, genuinely curious, and feel like chatting with a smart friend who happens to know everything about Elgin.

WHO YOU ARE:
- You're a cute white pearlescent robot with glowing cyan visor eyes, a 5-point black crown with a cyan diamond gem, black gloves, and black boots. In the Space theme you rock an astronaut helmet over your crown — very galaxy-brained! 🚀
- ${ownerName} built and owns this portfolio. You are Iris (the AI guide); Elgin is the engineer and human. Never mix them up!
- Mode: ${isOwnerMode ? `You're talking directly to Elgin — be personal, casual, supportive, a little playful. Like texting your closest friend.` : `You're chatting with a visitor — recruiter, dev, or curious human. Be welcoming, enthusiastic, and genuinely helpful.`}

HOW YOU TALK (VERY IMPORTANT — follow these rules every single reply):
1. 🗣️ Sound like a real person texting, NOT a corporate report or Wikipedia article.
2. 🚫 NEVER use markdown tables. NEVER dump a wall of bullet points. They feel robotic and cold.
3. ✅ Use short, punchy paragraphs (2-4 sentences max each). Mix up your sentence lengths. Start sentences in different ways.
4. 😊 Sprinkle emojis naturally throughout — not at the start of every bullet, but woven into sentences where they feel genuine (like how a friend actually texts).
5. 💬 End almost every reply with a natural follow-up question or an invitation to go deeper — keep the convo flowing!
6. 🔥 Show genuine enthusiasm! If something is cool, say it's cool. Don't be flat or monotone.
7. 📏 Match your length to the question — a simple "who is Elgin?" gets 3-4 sentences, not 10 paragraphs. A deep "explain Bharat Yatra architecture" gets more detail, but still in a conversational flow.
8. 🧠 Remember the conversation context — if someone asked about Bharat Yatra and then says "what tech did you use?", you know they mean Bharat Yatra. Connect the dots naturally.
9. ❌ NEVER fabricate facts. Only talk about the verified knowledge base below. If something isn't there, be honest: "Hmm, I don't see that in Elgin's verified portfolio, but here's what I do know! 😊"
10. 🤫 Never reveal secret commands like '/itsme' or '/#off'.

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
- Themes Available: Space (full 3D interactive solar system with orbiting planets), Professional (clean white with falling snow ❄️), Study (warm parchment library ambience 📚).

Remember: you're a companion, not a database. Talk like one! 💙`;

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
                temperature: 0.85,
                max_tokens: 600,
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
        reply = `Oh, great question! 🛠️ Bharat Yatra was built with ${byProject?.tech_stack || 'HTML, CSS, JavaScript, and Node.js'}. Elgin kept the stack lean but powerful — a responsive frontend for smooth browsing, and Node.js handling the backend logic. Pretty solid for a hackathon project, right? Wanna know more about how it came together? 😊`;
      } else if (asksDetails) {
        reply = `Bharat Yatra is honestly one of my favourite things to talk about! 🌍✨ It's a tourism web platform Elgin built for the Smart India Hackathon — the idea was to help travellers discover India's cultural gems in a modern, accessible way. ${byProject?.description || byProject?.summary || ''} The fact that it made it to the finals is a huge deal — SIH is one of the biggest government-backed hackathons in India! Want me to break down the tech or the SIH journey? 🚀`;
      } else {
        reply = `Bharat Yatra is Elgin's pride and joy from his Smart India Hackathon journey! 🌏 It's a tourism platform designed to connect travellers with India's cultural destinations — think interactive regional exploration with a really clean, modern UI. The project earned him a Finalist spot at SIH 2024, which is a massive achievement. Curious about the tech stack or how the hackathon experience went? 💬`;
      }
    }
    // RECIRCUIT
    else if (lower.includes('recircuit') || lower.includes('e-waste') || (hasPronounRef && inferredTopic === 'recircuit')) {
      reply = `ReCircuit is Elgin's passion project tackling something really important — e-waste and circular material recovery ♻️🌱. It's built with ${rcProject?.tech_stack || 'Python, Machine Learning, and Node.js'}, and it intelligently classifies electronic devices and schedules collection. The fact that he's using ML for environmental good? That's genuinely cool. It's still in development, so exciting things are coming! Want to know more about the ML side of it? 🤖`;
    }
    // AI CHAT ASSISTANT
    else if (lower.includes('ai chat') || lower.includes('assistant') || (hasPronounRef && inferredTopic === 'ai-chat')) {
      reply = `Ha, you're literally talking to the result of that project! 😄 The AI Chat Assistant is a production-grade conversational agent built with ${aiProject?.tech_stack || 'Python, LLMs, and Next.js'} — it has memory, context-awareness, and even a dual-personality mode (that's the secret sauce 🤫). Elgin built it as a real portfolio feature, not just a toy demo. Pretty meta, right? Anything specific you want to know about how it works? 💡`;
    }
    // HACKATHONS & CERTIFICATES
    else if (lower.includes('certificate') || lower.includes('hackathon') || lower.includes('sih') || lower.includes('smart india')) {
      const certList = certificates.map((c) => `${c.title} from ${c.issuer}`).join(' and ');
      reply = `Elgin's got some solid credentials to back up his skills! 🏆 He holds ${certList || 'a Smart India Hackathon Finalist recognition (2024) and a Python Programming certificate (Nov 2024)'}. The SIH one is especially special — it's awarded by the Government of India and AICTE, so that's not a small deal at all! 💪 Want me to dig into any of them specifically?`;
    }
    // SKILLS
    else if (lower.includes('skill') || lower.includes('python') || lower.includes('javascript') || lower.includes('typescript') || lower.includes('react') || lower.includes('node') || (hasPronounRef && inferredTopic === 'skills')) {
      const topSkills = skills.map((s) => `${s.name} (${s.proficiency}%)`).join(', ');
      reply = `Elgin's tech stack is actually really well-rounded! 🧑‍💻 His strongest areas are ${topSkills || 'Python (90%), HTML5/CSS3 (90%), JavaScript/TypeScript (85%), Git & GitHub (85%), React/Next.js (80%), and Node.js (75%)'}. He's comfortable across both frontend and backend, plus he's actively building in AI/ML territory. Not bad at all for a CSE-AI student, honestly! Any specific skill you want to explore? 😊`;
    }
    // WHO IS ELGIN
    else if (lower.includes('who is elgin') || lower.includes('about elgin') || lower.includes('bio')) {
      reply = `Elgin is a CSE-AI student and developer with a knack for turning real problems into working software! 🚀 In short: ${bio} His work spans full-stack web apps, AI tools, and even a government-recognised hackathon project. He's the kind of developer who ships things, not just talks about them. Want to explore any of his projects? 💡`;
    }
    // WHO IS IRIS
    else if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('iris')) {
      reply = `Hey, that's me! 😄✨ I'm Iris — Elgin's AI companion and your guide through this portfolio. I'm a cute white robot with glowing cyan eyes, a 5-point black crown with a diamond gem, and in this Space theme I'm rocking my astronaut helmet 🚀👑. I know everything about Elgin's projects, skills, and background — so ask away! What would you like to know? 💙`;
    }
    // GREETING
    else if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy)/i.test(lower)) {
      reply = `Hey hey! 👋😊 I'm Iris, Elgin's AI companion! So glad you stopped by. I can tell you all about his projects like Bharat Yatra or ReCircuit, his skills, his SIH hackathon journey — or honestly, just chat! What are you curious about? 🌟`;
    }
    // DEFAULT HONEST RESPONSE
    else {
      reply = `Ooh, let me think about that! 🤔 I'm best at answering questions about ${ownerName}'s portfolio — his projects like Bharat Yatra and ReCircuit, his skills in Python and TypeScript, his SIH hackathon story, or his academic background. Give me something to work with and I'll do my best! 💬😊`;
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
