const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connected successfully!');

    // Test query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Test query result:', result);

    // Check if users table exists and has data
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);

    await prisma.$disconnect();
    console.log('Database test completed successfully!');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

testConnection();
