import axios from 'axios'

const BASE = 'https://graph.facebook.com/v19.0'

export interface TextMessage {
  to: string
  body: string
  phoneNumberId: string
  accessToken: string
}

export async function sendTextMessage(msg: TextMessage): Promise<void> {
  await axios.post(
    `${BASE}/${msg.phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: msg.to,
      type: 'text',
      text: { body: msg.body },
    },
    {
      headers: {
        Authorization: `Bearer ${msg.accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )
}

export function extractIncomingMessage(body: unknown): {
  from: string
  text: string
  phoneNumberId: string
} | null {
  try {
    const entry = (body as any).entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value
    const msg = value?.messages?.[0]
    if (!msg || msg.type !== 'text') return null
    return {
      from: msg.from,
      text: msg.text.body,
      phoneNumberId: value.metadata.phone_number_id,
    }
  } catch {
    return null
  }
}
