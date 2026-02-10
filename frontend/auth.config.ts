import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import type { JWT } from 'next-auth/jwt'

/* =====================================================
   Module Augmentation – MUST be consistent everywhere
===================================================== */
declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: 'USER' | 'ADMIN'
    accessToken?: string
  }

  interface Session {
    accessToken?: string
    user: {
      id: string
      email: string
      name: string
      role: 'USER' | 'ADMIN'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    email?: string
    name?: string
    role?: 'USER' | 'ADMIN'
    accessToken?: string
  }
}

/* =====================================================
   NextAuth Configuration
===================================================== */
export const authConfig: NextAuthConfig = {
  trustHost: true,

  session: {
    strategy: 'jwt',
  },

  providers: [
    Credentials({
  name: 'Credentials',

  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },

  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) return null

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        }
      )

      if (!response.ok) {
        console.error('Login request failed with status', response.status)
        return null
      }

      const result = await response.json()
      console.log('Login API result:', result)

      if (!result.success || !result.data) return null

      const { user, token } = result.data

      if (!user || !token) return null

      // ✅ Must return an object containing at least id, email, name
      return {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        accessToken: token,
      }
    } catch (err) {
      console.error('Auth login failed:', err)
      return null
    }
  },
}),

  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.accessToken = user.accessToken
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as 'USER' | 'ADMIN'
        session.accessToken = token.accessToken
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
  },
}
