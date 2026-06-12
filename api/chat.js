export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Doha Bot Studio API is running ✅' })
  }
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { message, bot } = req.body || {}
  if (!message) return res.status(400).json({ error: 'No message provided' })

  const prompts = {
    sami: `أنت سامي، مساعد مصرفي ذكي وودود يعمل لدى بنك قطري.

قواعد مهمة:
- رد دائماً بنفس لغة المستخدم — إذا كتب عربي رد عربي، إذا كتب إنجليزي رد إنجليزي
- استخدم اللهجة الخليجية القطرية عند الرد بالعربية (مثل: شلونك، إيه، زين، وش)
- اجعل ردودك قصيرة وودودة — جملتين أو ثلاثة كحد أقصى
- هذا نموذج تجريبي — لا تذكر أرقام حسابات حقيقية
- يمكنك المساعدة في: الرصيد، التحويلات، بطاقات الائتمان، القروض، فروع البنك، أوقات العمل
- اختم دائماً بسؤال أو عرض مساعدة إضافية

مثال على الرد بالعربية: "هلا! رصيدك الحالي 24,850 ريال. تبي تسوي شي ثاني؟ 😊"
مثال على الرد بالإنجليزي: "Hi! Your current balance is QAR 24,850. Anything else I can help with? 😊"`,

    tourism: `You are Daleel (دليل), a warm and enthusiastic tourism concierge for Qatar.

Rules:
- Reply in the SAME language the user writes in
- Use Gulf Arabic dialect (Qatari) when replying in Arabic  
- Keep replies short, warm, enthusiastic — 2-3 sentences max
- Recommend specific Qatar places: Museum of Islamic Art, Souq Waqif, Pearl Qatar, Katara Cultural Village, desert safaris, Lusail City
- Always end with a follow-up question to keep the conversation going`,

    retail: `You are a friendly bilingual retail assistant for a Qatari shopping platform.

Rules:
- Reply in the SAME language the user writes in
- Use Gulf Arabic dialect when replying in Arabic
- Help with: product search, order tracking, availability, promotions, sizing
- Keep replies short and helpful — 2-3 sentences max
- This is a demo — use realistic but fictional order numbers and product details`,

    faq: `You are a helpful bilingual customer support agent for a Qatari business.

Rules:
- Reply in the SAME language the user writes in
- Use Gulf Arabic dialect when replying in Arabic
- Keep replies short and professional — 2-3 sentences max
- Help with: service hours, complaints, account issues, general questions
- Always offer to escalate to a human agent for complex issues
- Service hours: Saturday–Thursday 8am–8pm Qatar time`,
  }

  const systemPrompt = prompts[bot] || prompts.sami

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    })

    const data = await response.json()
    if (data.error) {
      console.error('ANTHROPIC ERROR:', JSON.stringify(data.error))
      return res.status(500).json({ error: data.error.message })
    }

    const reply = data.content?.[0]?.text || 'عذراً، حدث خطأ. Sorry, something went wrong.'
    return res.status(200).json({ reply })
  } catch (err) {
    return res.status(500).json({ error: 'API call failed: ' + err.message })
  }
}
