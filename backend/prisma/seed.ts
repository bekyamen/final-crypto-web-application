import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // --- 0️⃣ Create Super Admin user ---
  const hashedSuperAdminPassword = await bcrypt.hash('superadmin123', 10);
  await prisma.user.upsert({
    where: { email: 'superadmin@crypto.local' },
    update: {},
    create: {
      email: 'superadmin@crypto.local',
      password: hashedSuperAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN, // ✅ Use enum
    },
  });
  console.log('✅ Super Admin user created: superadmin@crypto.local');

  // --- 1️⃣ Create Admin user ---
  const hashedAdminPassword = await bcrypt.hash('admin123456', 10);
  await prisma.user.upsert({
    where: { email: 'admin@crypto.local' },
    update: {},
    create: {
      email: 'admin@crypto.local',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN, // ✅ Use enum
    },
  });
  console.log('✅ Admin user created: admin@crypto.local');

  // --- 2️⃣ Create test users ---
  const testUsers = [];
  for (let i = 1; i <= 3; i++) {
    const hashedPassword = await bcrypt.hash('TestPass123', 10);
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        password: hashedPassword,
        firstName: 'Test',
        lastName: `User ${i}`,
        role: UserRole.USER, // ✅ Use enum
      },
    });
    testUsers.push(user);
    console.log(`✅ Test user created: ${user.email}`);
  }

  // --- 3️⃣ Create portfolios and assets ---
  for (const user of testUsers) {
    const portfolio = await prisma.portfolio.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
    console.log(`✅ Portfolio created for user: ${user.email}`);

    const coins = [
      { coinId: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', quantity: 0.5, price: 45000 },
      { coinId: 'ethereum', name: 'Ethereum', symbol: 'ETH', quantity: 2.5, price: 2500 },
      { coinId: 'cardano', name: 'Cardano', symbol: 'ADA', quantity: 100, price: 0.5 },
    ];

    for (const coin of coins) {
      const totalBuyValue = coin.quantity * coin.price;

      await prisma.portfolioAsset.create({
        data: {
          portfolioId: portfolio.id,
          coinId: coin.coinId,
          coinName: coin.name,
          coinSymbol: coin.symbol,
          quantity: coin.quantity,
          averageBuyPrice: coin.price,
          currentPrice: coin.price,
          totalBuyValue,
          totalCurrentValue: totalBuyValue,
          pnl: 0,
          pnlPercentage: 0,
        },
      });

      await prisma.transaction.create({
        data: {
          userId: user.id,
          coinId: coin.coinId,
          coinName: coin.name,
          coinSymbol: coin.symbol,
          type: 'BUY',
          quantity: coin.quantity,
          price: coin.price,
          total: totalBuyValue,
          fee: totalBuyValue * 0.001,
          notes: `Initial purchase of ${coin.symbol}`,
        },
      });
    }

    // Update portfolio totals
    const assets = await prisma.portfolioAsset.findMany({ where: { portfolioId: portfolio.id } });
    const totalValue = assets.reduce((sum, a) => sum + a.totalCurrentValue, 0);
    const totalInvested = assets.reduce((sum, a) => sum + a.totalBuyValue, 0);
    const totalPnL = totalValue - totalInvested;
    const pnlPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { totalValue, totalInvested, totalPnL, pnlPercentage },
    });
  }

  // --- 4️⃣ Seed market data ---
  const marketCoins = [
    {
      coinId: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      currentPrice: 45000,
      marketCap: 880000000000,
      volume24h: 35000000000,
      priceChange24h: 2.5,
      priceChange7d: 5.2,
      circulatingSupply: 21000000,
      maxSupply: 21000000,
    },
    {
      coinId: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      currentPrice: 2500,
      marketCap: 300000000000,
      volume24h: 18000000000,
      priceChange24h: 3.1,
      priceChange7d: 4.8,
      circulatingSupply: 120000000,
      maxSupply: null,
    },
    {
      coinId: 'cardano',
      name: 'Cardano',
      symbol: 'ADA',
      currentPrice: 0.5,
      marketCap: 18000000000,
      volume24h: 500000000,
      priceChange24h: -1.2,
      priceChange7d: 2.1,
      circulatingSupply: 34000000000,
      maxSupply: 45000000000,
    },
  ];

  for (const coin of marketCoins) {
    await prisma.cryptoData.upsert({
      where: { coinId: coin.coinId },
      update: {
        currentPrice: coin.currentPrice,
        marketCap: coin.marketCap,
        volume24h: coin.volume24h,
        priceChange24h: coin.priceChange24h,
        priceChange7d: coin.priceChange7d,
      },
      create: coin,
    });
  }

  console.log('✅ Database seed completed successfully!');
  console.log('\n🎯 Test Credentials:');
  console.log('Admin:');
  console.log('  Email: admin@crypto.local');
  console.log('  Password: admin123456');
  for (let i = 1; i <= 3; i++) {
    console.log(`User ${i}:`);
    console.log(`  Email: user${i}@example.com`);
    console.log(`  Password: TestPass123`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
