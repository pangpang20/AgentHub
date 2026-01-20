const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    console.log('Users in database:');
    console.log(JSON.stringify(users, null, 2));
    console.log(`Total users: ${users.length}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
}

checkUsers();
