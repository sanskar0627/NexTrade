import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create crypto assets with $0.10 minimum order value
  const cryptoAssets = [
    { id: 'BTCUSDT', symbol: 'BTCUSDT', name: 'Bitcoin', type: 'crypto', tickSize: 0.01, minNotional: 0.1 },
    { id: 'ETHUSDT', symbol: 'ETHUSDT', name: 'Ethereum', type: 'crypto', tickSize: 0.01, minNotional: 0.1 },
    { id: 'SOLUSDT', symbol: 'SOLUSDT', name: 'Solana', type: 'crypto', tickSize: 0.001, minNotional: 0.1 },
    { id: 'BNBUSDT', symbol: 'BNBUSDT', name: 'BNB', type: 'crypto', tickSize: 0.01, minNotional: 0.1 },
    { id: 'XRPUSDT', symbol: 'XRPUSDT', name: 'XRP', type: 'crypto', tickSize: 0.0001, minNotional: 0.1 },
    { id: 'ADAUSDT', symbol: 'ADAUSDT', name: 'Cardano', type: 'crypto', tickSize: 0.0001, minNotional: 0.1 },
    { id: 'DOGEUSDT', symbol: 'DOGEUSDT', name: 'Dogecoin', type: 'crypto', tickSize: 0.00001, minNotional: 0.1 },
    { id: 'MATICUSDT', symbol: 'MATICUSDT', name: 'Polygon', type: 'crypto', tickSize: 0.0001, minNotional: 0.1 },
    { id: 'LTCUSDT', symbol: 'LTCUSDT', name: 'Litecoin', type: 'crypto', tickSize: 0.01, minNotional: 0.1 },
    { id: 'DOTUSDT', symbol: 'DOTUSDT', name: 'Polkadot', type: 'crypto', tickSize: 0.001, minNotional: 0.1 },
  ];

  // Create stock assets with $0.10 minimum order value
  const stockAssets = [
    { id: 'AAPL', symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', tickSize: 0.01, minNotional: 0.1 },
    { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', tickSize: 0.01, minNotional: 0.1 },
    { id: 'AMZN', symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', tickSize: 0.01, minNotional: 0.1 },
    { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', tickSize: 0.01, minNotional: 0.1 },
    { id: 'TSLA', symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', tickSize: 0.01, minNotional: 0.1 },
    { id: 'NVDA', symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', tickSize: 0.01, minNotional: 0.1 },
    { id: 'META', symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock', tickSize: 0.01, minNotional: 0.1 },
    { id: 'NFLX', symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock', tickSize: 0.01, minNotional: 0.1 },
    { id: 'AMD', symbol: 'AMD', name: 'Advanced Micro Devices', type: 'stock', tickSize: 0.01, minNotional: 0.1 },
    { id: 'JPM', symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', tickSize: 0.01, minNotional: 0.1 },
  ];

  const allAssets = [...cryptoAssets, ...stockAssets];

  // Upsert assets
  for (const asset of allAssets) {
    await prisma.asset.upsert({
      where: { id: asset.id },
      update: asset,
      create: asset,
    });
  }

  console.log(`✅ Created ${allAssets.length} assets (${cryptoAssets.length} crypto, ${stockAssets.length} stocks)`);
  console.log('🌱 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });