/**
 * Fault-tolerant WhatsApp send helpers.
 * Button and list messages fall back to plain text automatically when
 * the WhatsApp API returns a non-2xx response (e.g. sandbox restrictions,
 * older client versions that don't support interactive messages).
 */
import { sendTextMessage, sendButtonMessage, sendListMessage } from '@wabot/whatsapp'

type Creds = { phoneNumberId: string; accessToken: string }

export async function safeText(creds: Creds, to: string, body: string): Promise<void> {
  await sendTextMessage({ to, body, ...creds })
}

export async function safeButtons(
  creds: Creds,
  to: string,
  body: string,
  buttons: Array<{ id: string; title: string }>
): Promise<void> {
  try {
    await sendButtonMessage({ to, body, buttons, ...creds })
  } catch {
    // Fallback: append button labels as numbered options in plain text
    const options = buttons.map((b, i) => `${i + 1}. ${b.title}`).join('\n')
    await sendTextMessage({ to, body: `${body}\n\n${options}`, ...creds })
  }
}

export async function safeList(
  creds: Creds,
  to: string,
  body: string,
  buttonText: string,
  sections: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>,
  textFallback: string
): Promise<void> {
  try {
    await sendListMessage({ to, body, buttonText, sections, ...creds })
  } catch {
    await sendTextMessage({ to, body: textFallback, ...creds })
  }
}
