export async function callGroq(payload: {
  model: string
  messages: { role: 'system' | 'user'; content: string }[]
  max_tokens: number
  temperature: number
}): Promise<string> {
  const res = await fetch('/api/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error ?? `Request failed (${res.status})`)
  }

  const data = await res.json()
  return data.choices[0]?.message?.content ?? ''
}
