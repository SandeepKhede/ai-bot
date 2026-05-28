import { FastifyInstance } from 'fastify'
import QRCode from 'qrcode'

/**
 * GET /pay?pa=upiid&am=400&pn=RestaurantName&tn=Table+advance
 *
 * Serves a UPI payment page with:
 * 1. A scannable QR code (works with ALL UPI apps — no security blocks)
 * 2. UPI ID to copy as fallback
 *
 * NOTE: UPI deep link buttons (phonepe://, tez://) are intentionally removed.
 * PhonePe and GPay block payments originating from browser/WebView deep links
 * as a security measure. QR scanning is the correct merchant payment method.
 */
export async function payRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { pa?: string; am?: string; pn?: string; tn?: string }
  }>('/pay', async (req, reply) => {
    const { pa = '', am = '0', pn = 'Restaurant', tn = 'Payment' } = req.query

    // UPI payment string — this is what gets encoded in the QR
    const upiString = `upi://pay?pa=${pa}&pn=${encodeURIComponent(pn)}&am=${am}&cu=INR&tn=${encodeURIComponent(tn)}`

    // Generate QR code as a base64 data URL
    const qrDataUrl = await QRCode.toDataURL(upiString, {
      width: 280,
      margin: 2,
      color: { dark: '#1a1a1a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pay ₹${am} — ${pn}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f0fdf4;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 28px 24px;
      max-width: 360px;
      width: 100%;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      text-align: center;
    }
    .restaurant { font-size: 18px; font-weight: 700; color: #111; margin-bottom: 2px; }
    .sub { font-size: 13px; color: #888; margin-bottom: 20px; }
    .amount { font-size: 42px; font-weight: 800; color: #16a34a; margin-bottom: 4px; }
    .note { font-size: 12px; color: #aaa; margin-bottom: 24px; }

    .qr-wrap {
      background: #f8fafc;
      border: 2px dashed #d1fae5;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 16px;
      display: inline-block;
      width: 100%;
    }
    .qr-wrap img { width: 220px; height: 220px; display: block; margin: 0 auto; }
    .qr-label {
      margin-top: 12px;
      font-size: 13px;
      color: #555;
      font-weight: 500;
    }
    .qr-apps {
      font-size: 11px;
      color: #aaa;
      margin-top: 4px;
    }

    .steps {
      background: #f0fdf4;
      border-radius: 12px;
      padding: 14px 16px;
      text-align: left;
      margin-bottom: 20px;
      font-size: 13px;
      color: #374151;
      line-height: 1.8;
    }
    .steps strong { color: #16a34a; }

    .divider { font-size: 11px; color: #d1d5db; margin: 16px 0; letter-spacing: 1px; }

    .upi-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
    }
    .upi-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .upi-id {
      font-family: monospace;
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 4px 0 10px;
      word-break: break-all;
    }
    .copy-btn {
      background: #16a34a;
      border: none;
      border-radius: 8px;
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      color: white;
      width: 100%;
    }
    .copy-btn:active { opacity: 0.85; }

    .footer { font-size: 11px; color: #d1d5db; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="restaurant">${pn}</div>
    <div class="sub">Table Booking Advance</div>

    <div class="amount">₹${am}</div>
    <div class="note">${tn}</div>

    <!-- QR Code — primary payment method -->
    <div class="qr-wrap">
      <img src="${qrDataUrl}" alt="UPI QR Code" />
      <div class="qr-label">📷 Scan to Pay</div>
      <div class="qr-apps">Works with PhonePe · GPay · Paytm · Any UPI app</div>
    </div>

    <!-- How to scan steps -->
    <div class="steps">
      <strong>1.</strong> Open PhonePe / GPay / Paytm<br/>
      <strong>2.</strong> Tap <em>Scan QR</em> or <em>Pay by QR</em><br/>
      <strong>3.</strong> Point camera at the code above<br/>
      <strong>4.</strong> Confirm ₹${am} and enter your UPI PIN
    </div>

    <div class="divider">— CAN'T SCAN? PAY MANUALLY —</div>

    <!-- Manual UPI ID fallback -->
    <div class="upi-box">
      <div class="upi-label">UPI ID</div>
      <div class="upi-id" id="upi-id">${pa}</div>
      <button class="copy-btn" onclick="copyUpi()">📋 Copy UPI ID</button>
    </div>

    <div class="footer">After paying, reply with your UTR / Transaction ID on WhatsApp</div>
  </div>

  <script>
    function copyUpi() {
      navigator.clipboard.writeText('${pa}').then(() => {
        const btn = document.querySelector('.copy-btn')
        btn.textContent = '✅ Copied!'
        setTimeout(() => { btn.textContent = '📋 Copy UPI ID' }, 2000)
      }).catch(() => {
        // Fallback for older browsers
        const el = document.createElement('textarea')
        el.value = '${pa}'
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        const btn = document.querySelector('.copy-btn')
        btn.textContent = '✅ Copied!'
        setTimeout(() => { btn.textContent = '📋 Copy UPI ID' }, 2000)
      })
    }
  </script>
</body>
</html>`

    return reply.type('text/html').send(html)
  })
}
