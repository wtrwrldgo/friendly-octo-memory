import { prisma } from '../src/infrastructure/database/prisma.js';

async function debug() {
  const newUserId = '23dc48e0-7c9f-46df-bd12-87b4d43ae5f3';

  // Get the new user
  const newUser = await prisma.user.findUnique({
    where: { id: newUserId },
    select: { id: true, phone: true, name: true, role: true }
  });
  console.log('New User:', newUser);

  // Get the driver with its user
  const driver = await prisma.driver.findFirst({
    include: {
      user: { select: { id: true, phone: true, name: true } }
    }
  });
  console.log('Driver:', driver);

  if (newUser?.phone && driver) {
    console.log('\nComparing phones:');
    console.log('New user phone:', JSON.stringify(newUser.phone));
    console.log('Driver user phone:', JSON.stringify(driver.user.phone));
    console.log('Phones match:', newUser.phone === driver.user.phone);
  }

  await prisma.$disconnect();
}

debug().catch(console.error);
