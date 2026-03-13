import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { model, messages, max_tokens, temperature } = req.body
    const completion = await groq.chat.completions.create({
      model,
      messages,
      max_tokens,
      temperature,
    })
    res.status(200).json(completion)
  } catch (err: any) {
    console.error('[groq proxy]', err?.message)
    res.status(500).json({ error: err?.message ?? 'Internal server error' })
  }
}
