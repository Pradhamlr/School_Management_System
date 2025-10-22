const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Running idempotent seed...');

  // Create admin if not exists
  const adminEmail = 'admin@school.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({ data: { name: 'System Administrator', email: adminEmail, password: adminPassword, role: 'ADMIN' } });
    console.log('Admin created');
  }

  // Create few teachers (idempotent)
  const teachers = [
    { name: 'Dr. Sarah Johnson', email: 'sarah@school.com' },
    { name: 'Prof. Michael Chen', email: 'michael@school.com' },
    { name: 'Dr. Emily Davis', email: 'emily@school.com' }
  ];

  const teacherPassword = await bcrypt.hash('teacher123', 10);
  for (const t of teachers) {
    let u = await prisma.user.findUnique({ where: { email: t.email } });
    if (!u) {
      u = await prisma.user.create({ data: { name: t.name, email: t.email, password: teacherPassword, role: 'TEACHER' } });
      console.log('Created teacher user', t.email);
    }
    const existingTeacher = await prisma.teacher.findUnique({ where: { userId: u.id } });
    if (!existingTeacher) {
      await prisma.teacher.create({ data: { userId: u.id, department: 'General', hireDate: new Date() } });
      console.log('Created teacher profile for', t.email);
    }
  }

  // Create a class
  const className = '10';
  const section = 'A';
  let cls = await prisma.class.findFirst({ where: { name: className, section } });
  if (!cls) {
    cls = await prisma.class.create({ data: { name: className, section } });
    console.log('Created class 10-A');
  }

  // Create sample students
  const studentNames = ['Alex Thompson', 'Emma Rodriguez', 'James Wilson'];
  const studentPassword = await bcrypt.hash('student123', 10);
  for (const [i, name] of studentNames.entries()) {
    const email = name.toLowerCase().replace(' ', '.') + '@student.school.com';
    let u = await prisma.user.findUnique({ where: { email } });
    if (!u) {
      u = await prisma.user.create({ data: { name, email, password: studentPassword, role: 'STUDENT' } });
      console.log('Created student user', email);
    }
    const existingStudent = await prisma.student.findUnique({ where: { userId: u.id } });
    if (!existingStudent) {
      await prisma.student.create({ data: { userId: u.id, rollNumber: `RN${100 + i}`, classId: cls.id, dob: new Date('2008-01-01') } });
      console.log('Created student profile for', email);
    }
  }

  console.log('Seed completed');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
