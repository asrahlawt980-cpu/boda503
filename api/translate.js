export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, fromLang, toLang } = req.body;
  if (!text) return res.status(400).json({ error: 'مفيش نص!' });

  try {
    const from = fromLang === 'auto' ? 'ar' : fromLang;
    const langPair = `${from}|${toLang}`;

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`
    );

    const data = await response.json();

    if (data.responseStatus !== 200) {
      return res.status(500).json({ error: 'فشلت الترجمة، حاول تاني' });
    }

    const translation = data.responseData.translatedText;
    return res.status(200).json({ translation });

  } catch (e) {
    return res.status(500).json({ error: 'خطأ في السيرفر: ' + e.message });
  }
}
