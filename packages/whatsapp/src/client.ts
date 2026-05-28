import axios, { AxiosError } from 'axios'

const BASE = 'https://graph.facebook.com/v19.0'

interface BaseMsg { to: string; phoneNumberId: string; accessToken: string }

export interface TextMessage extends BaseMsg { body: string }

export interface ButtonMessage extends BaseMsg {
  body: string
  buttons: Array<{ id: string; title: string }> // max 3, title max 20 chars
}

export interface ListSection {
  title: string
  rows: Array<{ id: string; title: string; description?: string }>
}

export interface ListMessage extends BaseMsg {
  body: string
  buttonText: string // label on the button that opens the list, max 20 chars
  sections: ListSection[]
}

export interface CtaUrlMessage extends BaseMsg {
  body: string           // message text shown above the button
  buttonText: string     // label on the button, max 20 chars
  url: string            // URL to open when button is tapped (must be https://)
}

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function logWaError(fn: string, err: unknown) {
  if (err instanceof AxiosError) {
    console.error(`[whatsapp] ${fn} failed ${err.response?.status}:`, JSON.stringify(err.response?.data))
  } else {
    console.error(`[whatsapp] ${fn} failed:`, err)
  }
}

export async function sendTextMessage(msg: TextMessage): Promise<void> {
  try {
    await axios.post(
      `${BASE}/${msg.phoneNumberId}/messages`,
      { messaging_product: 'whatsapp', to: msg.to, type: 'text', text: { body: msg.body } },
      { headers: headers(msg.accessToken) }
    )
  } catch (err) {
    logWaError('sendTextMessage', err)
    throw err
  }
}

export async function sendButtonMessage(msg: ButtonMessage): Promise<void> {
  try {
    await axios.post(
      `${BASE}/${msg.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: msg.to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: msg.body },
          action: {
            buttons: msg.buttons.slice(0, 3).map(b => ({
              type: 'reply',
              reply: { id: b.id, title: b.title.slice(0, 20) },
            })),
          },
        },
      },
      { headers: headers(msg.accessToken) }
    )
  } catch (err) {
    logWaError('sendButtonMessage', err)
    throw err
  }
}

export async function sendListMessage(msg: ListMessage): Promise<void> {
  try {
    await axios.post(
      `${BASE}/${msg.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: msg.to,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: { text: msg.body.slice(0, 1024) },
          action: {
            button: msg.buttonText.slice(0, 20),
            sections: msg.sections.slice(0, 10).map(s => ({
              title: s.title.slice(0, 24),
              rows: s.rows.slice(0, 10).map(r => ({
                id: r.id,
                title: r.title.slice(0, 24),
                ...(r.description ? { description: r.description.slice(0, 72) } : {}),
              })),
            })),
          },
        },
      },
      { headers: headers(msg.accessToken) }
    )
  } catch (err) {
    logWaError('sendListMessage', err)
    throw err
  }
}

export async function sendCtaUrlMessage(msg: CtaUrlMessage): Promise<void> {
  try {
    await axios.post(
      `${BASE}/${msg.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: msg.to,
        type: 'interactive',
        interactive: {
          type: 'cta_url',
          body: { text: msg.body },
          action: {
            name: 'cta_url',
            parameters: {
              display_text: msg.buttonText.slice(0, 20),
              url: msg.url,
            },
          },
        },
      },
      { headers: headers(msg.accessToken) }
    )
  } catch (err) {
    logWaError('sendCtaUrlMessage', err)
    throw err
  }
}

// Button/list reply IDs mapped to plain-text equivalents so the router
// doesn't need to know whether the input came from a button or typed text.
const BUTTON_MAP: Record<string, string> = {
  intent_menu:     'menu',
  intent_hours:    'open',
  intent_location: 'location',
  intent_book:     'book a table',
  res_yes:         'yes',
  res_no:          'no',
  order_done:      'done',
  order_more:      'order more',
}

export function extractIncomingMessage(body: unknown): {
  from: string
  text: string
  phoneNumberId: string
} | null {
  try {
    const entry  = (body as any).entry?.[0]
    const change = entry?.changes?.[0]
    const value  = change?.value
    const msg    = value?.messages?.[0]
    if (!msg) return null

    const from          = msg.from as string
    const phoneNumberId = value.metadata.phone_number_id as string

    if (msg.type === 'text') {
      return { from, text: msg.text.body as string, phoneNumberId }
    }

    if (msg.type === 'interactive') {
      const iType = msg.interactive.type as string
      let rawId: string | null = null

      if (iType === 'button_reply') rawId = msg.interactive.button_reply.id
      if (iType === 'list_reply')   rawId = msg.interactive.list_reply.id

      if (rawId) {
        const text = BUTTON_MAP[rawId] ?? rawId
        return { from, text, phoneNumberId }
      }
    }

    return null
  } catch {
    return null
  }
}
