import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import MenuClient from './MenuClient'

export default async function MenuPage() {
  const session = await auth()
  const restaurantId = session!.user.id

  const items = await prisma.menuItem.findMany({
    where: { restaurantId },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Menu</h1>
      <MenuClient items={items} restaurantId={restaurantId} />
    </div>
  )
}
