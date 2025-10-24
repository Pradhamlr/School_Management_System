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

  // Create subjects first
  const subjectNames = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];
  for (const subjectName of subjectNames) {
    await prisma.subject.upsert({
      where: { name: subjectName },
      update: {},
      create: { name: subjectName, code: subjectName.substring(0, 3).toUpperCase() }
    });
  }
  console.log('Subjects created');

  // Seed timetables (destructive)
  console.log('Seeding timetables...');
  
  // Create classrooms first
  const classrooms = await Promise.all([
    prisma.classroom.upsert({ where: { name: 'A101' }, update: {}, create: { name: 'A101', capacity: 40 } }),
    prisma.classroom.upsert({ where: { name: 'A102' }, update: {}, create: { name: 'A102', capacity: 35 } }),
    prisma.classroom.upsert({ where: { name: 'B201' }, update: {}, create: { name: 'B201', capacity: 30 } }),
    prisma.classroom.upsert({ where: { name: 'LAB1' }, update: {}, create: { name: 'LAB1', capacity: 25 } }),
  ]);

  // Get existing data
  const classes = await prisma.class.findMany();
  const subjects = await prisma.subject.findMany();
  const teachers = await prisma.teacher.findMany();

  if (classes.length > 0 && subjects.length > 0 && teachers.length > 0) {
    // Clear existing timetables
    await prisma.timetable.deleteMany();

    // Create 8 periods per day schedule
    const periods = [
      { start: 480, end: 520 },   // 8:00-8:40
      { start: 520, end: 560 },   // 8:40-9:20
      { start: 560, end: 600 },   // 9:20-10:00
      { start: 615, end: 655 },   // 10:15-10:55
      { start: 655, end: 695 },   // 10:55-11:35
      { start: 695, end: 735 },   // 11:35-12:15
      { start: 795, end: 835 },   // 13:15-13:55
      { start: 835, end: 875 }    // 13:55-14:35
    ];

    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
    const timetableData = [];

    // Create complete timetable for each class
    for (const classItem of classes) {
      console.log(`Creating timetable for class ${classItem.id}`);
      
      // Create all 8 periods for each day
      for (const day of days) {
        for (let p = 0; p < periods.length; p++) {
          await prisma.timetable.create({
            data: {
              classId: classItem.id,
              subjectId: subjects[p % subjects.length].id,
              teacherId: teachers[p % teachers.length].id,
              classroomId: classrooms[p % classrooms.length].id,
              day: day,
              startMinute: periods[p].start,
              endMinute: periods[p].end
            }
          });
        }
        console.log(`Created 8 periods for ${day} - class ${classItem.id}`);
      }
      
      console.log(`Completed timetable for class ${classItem.id}`);
    }
    console.log('Timetables seeded successfully!');
  }

  console.log('Seed completed');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
