const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding notifications...');

  // Get admin user for createdBy
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const createdBy = adminUser?.id || 1;

  // Clear existing notifications
  await prisma.notification.deleteMany();

  const notifications = [
    {
      title: 'Assignment Due Tomorrow',
      message: 'Your Mathematics assignment is due tomorrow. Please submit it on time.',
      targetRole: 'STUDENT',
      createdBy
    },
    {
      title: 'Exam Schedule Released',
      message: 'The mid-term examination schedule has been released. Check your timetable for details.',
      targetRole: 'STUDENT',
      createdBy
    },
    {
      title: 'Library Books Due',
      message: 'You have 2 library books that are due for return by this Friday.',
      targetRole: 'STUDENT',
      createdBy
    },
    {
      title: 'Parent-Teacher Meeting',
      message: 'Parent-teacher meeting is scheduled for next Saturday. Please inform your parents.',
      targetRole: 'STUDENT',
      createdBy
    },
    {
      title: 'Holiday Notice',
      message: 'School will remain closed on Monday due to public holiday.',
      targetRole: 'STUDENT',
      createdBy
    },
    {
      title: 'Sports Day Registration',
      message: 'Registration for annual sports day is now open. Register before Friday.',
      targetRole: 'STUDENT',
      createdBy
    }
  ];

  for (const notification of notifications) {
    await prisma.notification.create({ data: notification });
  }

  console.log('Notifications seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });