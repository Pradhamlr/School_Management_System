const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
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

  if (classes.length === 0 || subjects.length === 0 || teachers.length === 0) {
    console.log('Please run other seed scripts first to create classes, subjects, and teachers');
    return;
  }

  // Clear existing timetables
  await prisma.timetable.deleteMany();

  // Create 8 periods per day schedule (8:00 AM to 4:00 PM)
  const periods = [
    { start: 480, end: 520 },   // 8:00-8:40
    { start: 520, end: 560 },   // 8:40-9:20
    { start: 560, end: 600 },   // 9:20-10:00
    { start: 615, end: 655 },   // 10:15-10:55 (15 min break)
    { start: 655, end: 695 },   // 10:55-11:35
    { start: 695, end: 735 },   // 11:35-12:15
    { start: 795, end: 835 },   // 13:15-13:55 (1 hour lunch)
    { start: 835, end: 875 }    // 13:55-14:35
  ];

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const timetableData = [];

  // Create timetable for each class
  for (const classItem of classes) {
    for (const day of days) {
      for (let periodIndex = 0; periodIndex < periods.length; periodIndex++) {
        const period = periods[periodIndex];
        const subject = subjects[periodIndex % subjects.length];
        const teacher = teachers[periodIndex % teachers.length];
        const classroom = classrooms[periodIndex % classrooms.length];

        timetableData.push({
          classId: classItem.id,
          subjectId: subject.id,
          teacherId: teacher.id,
          classroomId: classroom.id,
          day: day,
          startMinute: period.start,
          endMinute: period.end
        });
      }
    }
  }

  // Create all timetable entries
  await prisma.timetable.createMany({ data: timetableData });

  console.log('Timetables seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });