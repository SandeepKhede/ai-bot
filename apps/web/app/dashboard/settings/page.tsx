import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const session = await auth()
  const restaurantId = session!.user.id

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: {
      name: true,
      address: true,
      locationLink: true,
      businessHours: true,
      botActive: true,
      humanHandoff: true,
      whatsappNumber: true,
      waPhoneNumberId: true,
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <SettingsClient restaurant={restaurant!} restaurantId={restaurantId} />
    </div>
  )
}
