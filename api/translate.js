export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { text, fromLang, toLang } = req.body;
  if (!text) return res.status(400).json({ error: 'مفيش نص!' });
  try {
    let actualFrom = fromLang === 'franco' ? 'ar' : fromLang === 'auto' ? 'ar' : fromLang;
    let actualTo = toLang === 'franco' ? 'ar' : toLang;
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${actualFrom}|${actualTo}`
    );
    const data = await response.json();
    if (data.responseStatus !== 200) return res.status(500).json({ error: 'فشلت الترجمة' });
    let translation = data.responseData.translatedText;
    if (toLang === 'franco') translation = toFranco(translation);
    return res.status(200).json({ translation });
  } catch (e) {
    return res.status(500).json({ error: 'خطأ: ' + e.message });
  }
}
function toFranco(text) {
  const map = {'ع':'3','ء':'2','أ':'2','إ':'2','ح':'7','خ':'5','غ':'8','ق':'9','ا':'a','ب':'b','ت':'t','ث':'th','ج':'g','د':'d','ذ':'z','ر':'r','ز':'z','س':'s','ش':'sh','ص':'s','ض':'d','ط':'t','ظ':'z','ف':'f','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w','ي':'y','ى':'a','ة':'a'};
  return text.split('').map(c => map[c] || c).join('');
}
