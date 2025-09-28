import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        // Check if user needs demo balance credit
        const existingAccount = await prisma.account.findFirst({
          where: { userId: user.id, currency: 'USD' },
        });

        if (!existingAccount) {
          // Credit demo balance on first login
          await prisma.$transaction(async (tx: any) => {
            const account = await tx.account.create({
              data: {
                userId: user.id,
                currency: 'USD',
                balance: 5000.00,
              },
            });

            await tx.ledger.create({
              data: {
                userId: user.id,
                accountId: account.id,
                change: 5000.00,
                balanceAfter: 5000.00,
                refType: 'demo_credit',
                meta: { reason: 'Initial demo balance credit' },
              },
            });
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName || user.email,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};