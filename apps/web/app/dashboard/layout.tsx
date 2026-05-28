import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Sidebar from '@/components/Sidebar'
import TopHeader from '@/components/TopHeader'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.id },
    select: { name: true, setupComplete: true, botActive: true },
  })

  if (!restaurant?.setupComplete) redirect('/setup')

  const name = restaurant?.name ?? 'My Restaurant'

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar restaurantName={name} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopHeader restaurantName={name} botActive={restaurant?.botActive ?? true} />
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
