import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { restaurantName, whatsappNumber, waPhoneNumberId, waAccessToken, adminEmail, adminPassword } =
    await req.json()

  if (!restaurantName || !whatsappNumber || !waPhoneNumberId || !waAccessToken || !adminEmail || !adminPassword) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  if (adminPassword.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const [existingEmail, existingPhone, existingNumber] = await Promise.all([
    prisma.restaurant.findUnique({ where: { adminEmail } }),
    prisma.restaurant.findUnique({ where: { waPhoneNumberId } }),
    prisma.restaurant.findUnique({ where: { whatsappNumber } }),
  ])

  if (existingEmail) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
  if (existingPhone) return NextResponse.json({ error: 'This WhatsApp Phone Number ID is already registered' }, { status: 409 })
  if (existingNumber) return NextResponse.json({ error: 'This WhatsApp number is already registered' }, { status: 409 })

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  await prisma.restaurant.create({
    data: {
      name: restaurantName,
      whatsappNumber,
      waPhoneNumberId,
      waAccessToken,
      adminEmail,
      adminPassword: hashedPassword,
      businessHours: {},
      botActive: false,
      setupComplete: false,
    },
  })

  return NextResponse.json({ ok: true })
}
