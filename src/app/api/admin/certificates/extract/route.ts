import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || '';
  const auth = verifySession(token);

  if (!auth.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rawText, fileName } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (apiKey && rawText) {
      try {
        const prompt = `You are a strict data extraction assistant for certificates.
Extract structured metadata from the certificate text provided below.

RULES:
1. ONLY extract information that is explicitly stated.
2. NEVER guess, estimate, or fabricate dates, issuers, credential IDs, or skills.
3. If an item is unreadable or uncertain, leave it as an empty string.
4. Output valid JSON with keys: "title", "issuer", "issue_date", "credential_id", "skills_verified", "confidence_score" (0-100).

Certificate text:
${rawText}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            return NextResponse.json({
              draft: {
                title: parsed.title || '',
                issuer: parsed.issuer || '',
                issue_date: parsed.issue_date || '',
                credential_id: parsed.credential_id || '',
                skills_verified: parsed.skills_verified || '',
                ai_extracted: true,
                needs_review: (parsed.confidence_score || 0) < 85 || !parsed.title || !parsed.issuer,
                is_published: false, // Strict rule: Drafts must NEVER be published automatically
              },
            });
          }
        }
      } catch (err) {
        console.error('Gemini extraction error:', err);
      }
    }

    // Pattern-based parser fallback
    const text = (rawText || fileName || '').toLowerCase();
    let title = '';
    let issuer = '';
    let issueDate = '';

    if (text.includes('python')) title = 'Python Programming';
    else if (text.includes('hackathon') || text.includes('sih')) title = 'Smart India Hackathon';
    else if (text.includes('machine learning') || text.includes('ai')) title = 'Machine Learning & AI';
    else if (text.includes('web development')) title = 'Web Development';

    if (text.includes('coursera')) issuer = 'Coursera';
    else if (text.includes('nptel')) issuer = 'NPTEL';
    else if (text.includes('aicte')) issuer = 'AICTE / MoE';
    else if (text.includes('great learning')) issuer = 'Great Learning';
    else if (text.includes('udemy')) issuer = 'Udemy';

    return NextResponse.json({
      draft: {
        title,
        issuer,
        issue_date: issueDate,
        credential_id: '',
        skills_verified: '',
        ai_extracted: true,
        needs_review: true, // Requires owner verification
        is_published: false,
      },
    });
  } catch (err) {
    console.error('Extraction error:', err);
    return NextResponse.json({ error: 'Failed to process certificate text.' }, { status: 500 });
  }
}
