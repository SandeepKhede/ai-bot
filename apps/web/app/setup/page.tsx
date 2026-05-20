import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import SetupWizard from './SetupWizard'

export default async function SetupPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.id },
    select: { name: true, waPhoneNumberId: true, setupComplete: true },
  })

  if (!restaurant) redirect('/login')
  if (restaurant.setupComplete) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <div className="text-3xl mb-2">🤖</div>
        <h1 className="text-2xl font-bold text-gray-900">Set Up Your Restaurant Bot</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete these steps to get your WhatsApp assistant live
        </p>
      </div>
      <SetupWizard
        restaurantId={session.user.id}
        restaurantName={restaurant.name}
        waPhoneNumberId={restaurant.waPhoneNumberId}
      />
    </div>
  )
}
