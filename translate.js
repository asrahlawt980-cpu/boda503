export default async function handler(req, res) {
  // السماح بالطلبات من أي مكان
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // لو طلب OPTIONS (preflight) رد بموافقة
  if (req.method === 'OPTIONS') return res.status(200).end();

  // لازم يكون POST
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, fromLang, toLang, francoMode } = req.body;

  if (!text) return res.status(400).json({ error: 'مفيش نص!' });

  const LANGUAGES = {
    'ar': 'عربي', 'en': 'إنجليزي', 'fr': 'فرنسي', 'de': 'ألماني',
    'es': 'إسباني', 'it': 'إيطالي', 'tr': 'تركي', 'ru': 'روسي',
    'zh': 'صيني', 'ja': 'ياباني', 'ko': 'كوري', 'pt': 'برتغالي',
    'hi': 'هندي', 'he': 'عبري', 'id': 'إندونيسي', 'nl': 'هولندي',
    'pl': 'بولندي', 'sv': 'سويدي', 'fa': 'فارسي', 'ur': 'أردو',
    'auto': 'اكتشاف تلقائي'
  };

  const fromName = LANGUAGES[fromLang] || fromLang;
  const toName = LANGUAGES[toLang] || toLang;

  const francoInstructions = francoMode
    ? `\n\nمهم: الترجمة بالفرانكو العربي (Arabizi). استخدم أحرف لاتينية مع أرقام: 3=ع، 2=ء، 7=ح، 5=خ، 8=غ، 9=ق. مثال: أنا بخير = ana be5air`
    : '';

  const prompt = `أنت مترجم محترف. ترجم النص التالي من ${fromName} إلى ${toName}.
${fromLang === 'auto' ? 'النص قد يكون بالعربي الفرانكو (Arabizi) أو أي لغة، اكتشف اللغة وترجم.' : ''}${francoInstructions}

النص:
${text}

أعطني الترجمة فقط بدون أي شرح.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY, // الـ Key محفوظ على Vercel بأمان
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'فشل الاتصال بـ Claude' });
    }

    const data = await response.json();
    const translation = data.content[0].text.trim();
    return res.status(200).json({ translation });

  } catch (e) {
    return res.status(500).json({ error: 'خطأ في السيرفر: ' + e.message });
  }
}
