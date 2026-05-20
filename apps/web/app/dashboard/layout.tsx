import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar restaurantName={restaurant?.name ?? 'My Restaurant'} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
