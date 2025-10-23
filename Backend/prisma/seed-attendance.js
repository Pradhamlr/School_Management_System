const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding attendance data...');

  // Get students and teachers
  const students = await prisma.student.findMany();
  const teachers = await prisma.teacher.findMany();

  if (students.length === 0 || teachers.length === 0) {
    console.log('Please run other seed scripts first to create students and teachers');
    return;
  }

  // Clear existing attendance
  await prisma.studentAttendance.deleteMany();
  await prisma.teacherAttendance.deleteMany();

  const statuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
  
  // Generate attendance for last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Student attendance (90% present rate)
    for (const student of students) {
      const status = Math.random() < 0.9 ? 'PRESENT' : 
                    Math.random() < 0.7 ? 'ABSENT' : 
                    Math.random() < 0.5 ? 'LATE' : 'EXCUSED';
      
      await prisma.studentAttendance.create({
        data: {
          studentId: student.id,
          date,
          status,
          remarks: status === 'ABSENT' ? 'Sick leave' : 
                  status === 'LATE' ? 'Traffic delay' : null
        }
      });
    }

    // Teacher attendance (95% present rate)
    for (const teacher of teachers) {
      const status = Math.random() < 0.95 ? 'PRESENT' : 
                    Math.random() < 0.6 ? 'ABSENT' : 'LATE';
      
      await prisma.teacherAttendance.create({
        data: {
          teacherId: teacher.id,
          date,
          status,
          remarks: status === 'ABSENT' ? 'Personal work' : null
        }
      });
    }
  }

  console.log('Attendance data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });