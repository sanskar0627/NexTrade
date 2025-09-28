import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create demo markets
  const solUsdcMarket = await prisma.market.upsert({
    where: { symbol: 'SOL_USDC' },
    update: {},
    create: {
      symbol: 'SOL_USDC',
      baseAsset: 'SOL',
      quoteAsset: 'USDC',
      lastPrice: '100.00',
    },
  });

  const btcUsdcMarket = await prisma.market.upsert({
    where: { symbol: 'BTC_USDC' },
    update: {},
    create: {
      symbol: 'BTC_USDC',
      baseAsset: 'BTC',
      quoteAsset: 'USDC',
      lastPrice: '45000.00',
    },
  });

  console.log('Markets created:', { solUsdcMarket, btcUsdcMarket });

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@nextrade.com' },
    update: {},
    create: {
      email: 'demo@nextrade.com',
      username: 'demo',
      password: hashedPassword,
      balances: {
        create: [
          { asset: 'USDC', available: '5000.00', locked: '0.00' },
          { asset: 'SOL', available: '0.00', locked: '0.00' },
          { asset: 'BTC', available: '0.00', locked: '0.00' },
        ],
      },
    },
  });

  console.log('Demo user created:', demoUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
