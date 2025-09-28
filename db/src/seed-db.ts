import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const { Client } = require('pg');

const prisma = new PrismaClient();

const client = new Client({
    user: 'your_user',
    host: 'localhost',
    database: 'my_database',
    password: 'your_password',
    port: 5432,
});

async function initializeDB() {
    await client.connect();

    await client.query(`
        DROP TABLE IF EXISTS "tata_prices";
        CREATE TABLE "tata_prices"(
            time            TIMESTAMP WITH TIME ZONE NOT NULL,
            price   DOUBLE PRECISION,
            volume      DOUBLE PRECISION,
            currency_code   VARCHAR (10)
        );
        
        SELECT create_hypertable('tata_prices', 'time', 'price', 2);
    `);

    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1m AS
        SELECT
            time_bucket('1 minute', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            currency_code
        FROM tata_prices
        GROUP BY bucket, currency_code;
    `);

    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1h AS
        SELECT
            time_bucket('1 hour', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            currency_code
        FROM tata_prices
        GROUP BY bucket, currency_code;
    `);

    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1w AS
        SELECT
            time_bucket('1 week', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            currency_code
        FROM tata_prices
        GROUP BY bucket, currency_code;
    `);

    await client.end();
    console.log("Database initialized successfully");
}

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

initializeDB()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
