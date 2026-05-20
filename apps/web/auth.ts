import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { authConfig } from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string
        const password = credentials?.password as string
        if (!email || !password) return null

        const restaurant = await prisma.restaurant.findUnique({
          where: { adminEmail: email },
        })
        if (!restaurant?.adminPassword) return null

        const valid = await bcrypt.compare(password, restaurant.adminPassword)
        if (!valid) return null

        return { id: restaurant.id, email, name: restaurant.name }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) token.restaurantId = user.id
      return token
    },
    session({ session, token }) {
      session.user.id = token.restaurantId as string
      return session
    },
  },
})
