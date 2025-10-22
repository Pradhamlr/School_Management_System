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

  // Create sample timetable entries
  const timetableData = [
    // Monday
    { classId: classes[0].id, subjectId: subjects[0].id, teacherId: teachers[0].id, classroomId: classrooms[0].id, day: 'MON', startMinute: 540, endMinute: 600 }, // 9:00-10:00
    { classId: classes[0].id, subjectId: subjects[1].id, teacherId: teachers[1].id, classroomId: classrooms[0].id, day: 'MON', startMinute: 600, endMinute: 660 }, // 10:00-11:00
    { classId: classes[0].id, subjectId: subjects[2].id, teacherId: teachers[0].id, classroomId: classrooms[0].id, day: 'MON', startMinute: 720, endMinute: 780 }, // 12:00-13:00
    
    // Tuesday
    { classId: classes[0].id, subjectId: subjects[1].id, teacherId: teachers[1].id, classroomId: classrooms[1].id, day: 'TUE', startMinute: 540, endMinute: 600 },
    { classId: classes[0].id, subjectId: subjects[0].id, teacherId: teachers[0].id, classroomId: classrooms[1].id, day: 'TUE', startMinute: 600, endMinute: 660 },
    { classId: classes[0].id, subjectId: subjects[2].id, teacherId: teachers[0].id, classroomId: classrooms[1].id, day: 'TUE', startMinute: 720, endMinute: 780 },
    
    // Wednesday
    { classId: classes[0].id, subjectId: subjects[2].id, teacherId: teachers[0].id, classroomId: classrooms[2].id, day: 'WED', startMinute: 540, endMinute: 600 },
    { classId: classes[0].id, subjectId: subjects[0].id, teacherId: teachers[0].id, classroomId: classrooms[2].id, day: 'WED', startMinute: 600, endMinute: 660 },
    { classId: classes[0].id, subjectId: subjects[1].id, teacherId: teachers[1].id, classroomId: classrooms[2].id, day: 'WED', startMinute: 720, endMinute: 780 },
    
    // Thursday
    { classId: classes[0].id, subjectId: subjects[0].id, teacherId: teachers[0].id, classroomId: classrooms[3].id, day: 'THU', startMinute: 540, endMinute: 600 },
    { classId: classes[0].id, subjectId: subjects[2].id, teacherId: teachers[0].id, classroomId: classrooms[3].id, day: 'THU', startMinute: 600, endMinute: 660 },
    { classId: classes[0].id, subjectId: subjects[1].id, teacherId: teachers[1].id, classroomId: classrooms[3].id, day: 'THU', startMinute: 720, endMinute: 780 },
    
    // Friday
    { classId: classes[0].id, subjectId: subjects[1].id, teacherId: teachers[1].id, classroomId: classrooms[0].id, day: 'FRI', startMinute: 540, endMinute: 600 },
    { classId: classes[0].id, subjectId: subjects[0].id, teacherId: teachers[0].id, classroomId: classrooms[0].id, day: 'FRI', startMinute: 600, endMinute: 660 },
    { classId: classes[0].id, subjectId: subjects[2].id, teacherId: teachers[0].id, classroomId: classrooms[0].id, day: 'FRI', startMinute: 720, endMinute: 780 },
  ];

  for (const data of timetableData) {
    await prisma.timetable.create({ data });
  }

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