import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import FaqsClient from './FaqsClient'

export default async function FaqsPage() {
  const session = await auth()
  const restaurantId = session!.user.id

  const faqs = await prisma.faq.findMany({
    where: { restaurantId },
    orderBy: { priority: 'desc' },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">FAQs</h1>
      <p className="text-sm text-gray-500 mb-6">Keywords trigger instant answers without using AI.</p>
      <FaqsClient faqs={faqs} restaurantId={restaurantId} />
    </div>
  )
}
