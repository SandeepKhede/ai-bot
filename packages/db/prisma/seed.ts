import { config } from 'dotenv'
import { join } from 'path'
config({ path: join(process.cwd(), '../../.env') })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const phoneNumberId = process.env.PHONE_NUMBER_ID
  const accessToken = process.env.WA_ACCESS_TOKEN

  if (!phoneNumberId || !accessToken) {
    throw new Error('PHONE_NUMBER_ID and WA_ACCESS_TOKEN must be set in .env')
  }

  // Clean slate
  await prisma.messageLog.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.session.deleteMany()
  await prisma.faq.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.restaurant.deleteMany()

  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Spice Garden',
      whatsappNumber: '+919876543210',
      waPhoneNumberId: phoneNumberId,
      waAccessToken: accessToken,
      address: '14, MG Road, Indiranagar, Bangalore, Karnataka 560038',
      locationLink: 'https://maps.google.com/?q=Spice+Garden+Indiranagar+Bangalore',
      businessHours: {
        mon: '11am – 11pm',
        tue: '11am – 11pm',
        wed: '11am – 11pm',
        thu: '11am – 11pm',
        fri: '11am – 12am',
        sat: '11am – 12am',
        sun: '12pm – 10pm',
      },
      plan: 'STARTER',
      botActive: true,
    },
  })

  console.log(`Created restaurant: ${restaurant.name} (${restaurant.id})`)

  // Menu items
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        category: 'Starters',
        name: 'Paneer Tikka',
        pricePaise: 29900,
        description: 'Char-grilled cottage cheese marinated in yoghurt and spices',
        available: true,
      },
      {
        restaurantId: restaurant.id,
        category: 'Starters',
        name: 'Chicken Wings',
        pricePaise: 34900,
        description: 'Crispy wings tossed in our signature chilli-garlic sauce',
        available: true,
      },
      {
        restaurantId: restaurant.id,
        category: 'Main Course',
        name: 'Butter Chicken',
        pricePaise: 42000,
        description: 'Tender chicken in rich tomato-butter gravy, best with naan',
        available: true,
      },
      {
        restaurantId: restaurant.id,
        category: 'Main Course',
        name: 'Dal Makhani',
        pricePaise: 32000,
        description: 'Slow-cooked black lentils in cream and butter — our signature dish',
        available: true,
      },
      {
        restaurantId: restaurant.id,
        category: 'Desserts',
        name: 'Gulab Jamun',
        pricePaise: 14900,
        description: 'Soft milk dumplings soaked in rose syrup, served warm',
        available: true,
      },
    ],
  })

  console.log('Created 5 menu items')

  // FAQs
  await prisma.faq.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        question: 'Do you take reservations?',
        answer: "Yes! We accept table reservations. Just say *book a table* and I'll help you set one up. 😊",
        keywords: ['book', 'reserve', 'reservation', 'table', 'booking', 'seat'],
        priority: 10,
      },
      {
        restaurantId: restaurant.id,
        question: 'Is parking available?',
        answer: 'Yes, we have free parking for up to 2 hours in the basement. Entry from the lane behind the building. 🚗',
        keywords: ['parking', 'park', 'car', 'vehicle', 'bike', 'two-wheeler'],
        priority: 5,
      },
      {
        restaurantId: restaurant.id,
        question: 'Do you have vegetarian options?',
        answer: 'Absolutely! We have a great vegetarian menu. Our *Paneer Tikka* and *Dal Makhani* are customer favourites. 🌿',
        keywords: ['veg', 'vegetarian', 'vegan', 'no meat', 'plant', 'paneer'],
        priority: 5,
      },
    ],
  })

  console.log('Created 3 FAQs')
  console.log('\nSpice Garden seeded successfully!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
