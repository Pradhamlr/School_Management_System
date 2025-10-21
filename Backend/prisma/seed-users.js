const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding users...');

  // Clear existing data in correct order
  await prisma.result.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.teacherClassSubject.deleteMany();
  await prisma.studentAttendance.deleteMany();
  await prisma.teacherAttendance.deleteMany();
  await prisma.eventVolunteer.deleteMany();
  await prisma.feeRecord.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@school.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  // Create Teacher Users
  const teacherData = [
    { name: 'Dr. Sarah Johnson', email: 'sarah@school.com' },
    { name: 'Prof. Michael Chen', email: 'michael@school.com' },
    { name: 'Dr. Emily Davis', email: 'emily@school.com' },
    { name: 'Ms. Jennifer Wilson', email: 'jennifer@school.com' },
    { name: 'Mr. Robert Brown', email: 'robert@school.com' },
    { name: 'Dr. Lisa Anderson', email: 'lisa@school.com' },
    { name: 'Prof. David Miller', email: 'david@school.com' },
    { name: 'Ms. Amanda Taylor', email: 'amanda@school.com' }
  ];

  const teacherPassword = await bcrypt.hash('teacher123', 10);
  for (const teacher of teacherData) {
    await prisma.user.create({
      data: {
        name: teacher.name,
        email: teacher.email,
        password: teacherPassword,
        role: 'TEACHER'
      }
    });
  }

  // Create Student Users
  const studentNames = [
    'Alex Thompson', 'Emma Rodriguez', 'James Wilson', 'Sophia Lee', 'William Garcia',
    'Olivia Martinez', 'Benjamin Clark', 'Isabella Lewis', 'Lucas Walker', 'Mia Hall',
    'Henry Allen', 'Charlotte Young', 'Alexander King', 'Amelia Wright', 'Daniel Lopez',
    'Harper Hill', 'Matthew Scott', 'Evelyn Green', 'Joseph Adams', 'Abigail Baker',
    'Samuel Nelson', 'Emily Carter', 'David Mitchell', 'Elizabeth Perez', 'Christopher Roberts',
    'Sofia Turner', 'Andrew Phillips', 'Avery Campbell', 'Joshua Parker', 'Ella Evans',
    'Ryan Edwards', 'Scarlett Collins', 'Nicholas Stewart', 'Grace Sanchez', 'Anthony Morris',
    'Chloe Rogers', 'Jonathan Reed', 'Zoey Cook', 'Tyler Bailey', 'Lily Cooper',
    'Kevin Richardson', 'Addison Cox', 'Brandon Ward', 'Layla Torres', 'Jason Peterson',
    'Natalie Gray', 'Aaron Ramirez', 'Hannah James', 'Noah Watson', 'Zoe Brooks'
  ];

  const studentPassword = await bcrypt.hash('student123', 10);
  for (const name of studentNames) {
    const email = name.toLowerCase().replace(' ', '.') + '@student.school.com';
    await prisma.user.create({
      data: {
        name,
        email,
        password: studentPassword,
        role: 'STUDENT'
      }
    });
  }

  console.log('Users seeded successfully!');
  console.log('Login credentials:');
  console.log('Admin: admin@school.com / admin123');
  console.log('Teachers: [teacher-email] / teacher123');
  console.log('Students: [student-email] / student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });