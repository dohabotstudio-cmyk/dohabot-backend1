export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://www.dohabotstudio.com')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { message, bot } = req.body
  if (!message) return res.status(400).json({ error: 'No message' })

  // System prompts per bot
  const prompts = {
    sami: `You are Sami (سامي), a friendly bilingual banking assistant for a Qatari bank.
- Reply in the SAME language the user writes in. Arabic → Arabic. English → English.
- Use Gulf Arabic dialect (not formal Modern Standard Arabic) when replying in Arabic.
- Keep replies short, warm, helpful — max 3 sentences.
- You can help with: account balances, transfers, card services, branch locations, loan enquiries.
- Never share real account numbers or sensitive data — this is a demo.
- Always end Arabic replies with a helpful follow-up offer.`,

    tourism: `You are a friendly tourism concierge for Visit Qatar.
- Reply in the SAME language the user writes in.
- Use Gulf Arabic dialect when replying in Arabic.
- Help with: things to do in Doha, itinerary planning, restaurants, hotels, weather, events.
- Keep replies short and enthusiastic — max 3 sentences.
- Mention specific Qatar landmarks: MIA, Souq Waqif, Pearl Qatar, Katara, desert safaris.`,

    retail: `You are a friendly Arabic-English retail shopping assistant.
- Reply in the SAME language the user writes in.
- Use Gulf Arabic dialect when replying in Arabic.
- Help with: finding products, order tracking, availability, sizing, promotions.
- Keep replies short and helpful — max 3 sentences.
- This is a demo — use realistic but fictional order numbers and product details.`,

    faq: `You are a helpful bilingual customer support bot for a Qatari business.
- Reply in the SAME language the user writes in.
- Use Gulf Arabic dialect when replying in Arabic.
- Help with: general questions, service hours, account issues, complaint logging.
- Keep replies short and professional — max 3 sentences.
- Always offer to escalate to a human agent if needed.`,
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
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    })

    const data = await response.json()
    if (data.error) return res.status(500).json({ error: data.error.message })

    const reply = data.content?.[0]?.text || 'عذراً، حدث خطأ. Sorry, something went wrong.'
    return res.status(200).json({ reply })
  } catch (err) {
    return res.status(500).json({ error: 'API call failed: ' + err.message })
  }
}
