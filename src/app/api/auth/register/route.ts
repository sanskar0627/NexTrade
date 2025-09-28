import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
  country: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName, country } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and demo account with $5,000 balance
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          displayName,
          country,
        },
      });

      // Create demo USD account with $5,000 starting balance
      const demoAccount = await tx.account.create({
        data: {
          userId: user.id,
          currency: 'USD',
          balance: 5000.00, // $5,000 demo balance
        },
      });

      // Create ledger entry for demo credit
      await tx.ledger.create({
        data: {
          userId: user.id,
          accountId: demoAccount.id,
          change: 5000.00,
          balanceAfter: 5000.00,
          refType: 'demo_credit',
          meta: {
            description: 'Demo account initial balance',
          },
        },
      });

      return { user, demoAccount };
    });

    console.log('✅ User registered with demo account:', {
      userId: result.user.id,
      email: result.user.email,
      demoBalance: result.demoAccount.balance.toString()
    });

    return NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        displayName: result.user.displayName,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}