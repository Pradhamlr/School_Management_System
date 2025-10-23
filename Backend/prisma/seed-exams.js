const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding exams and results...');

  // Get existing data
  const classes = await prisma.class.findMany();
  const subjects = await prisma.subject.findMany();
  const students = await prisma.student.findMany();

  if (classes.length === 0 || subjects.length === 0 || students.length === 0) {
    console.log('Please run other seed scripts first to create classes, subjects, and students');
    return;
  }

  // Clear existing exams and results
  await prisma.result.deleteMany();
  await prisma.exam.deleteMany();

  // Create sample exams
  const examData = [
    { name: 'Mid-term Exam', date: new Date('2024-02-15'), totalMarks: 100 },
    { name: 'Final Exam', date: new Date('2024-05-20'), totalMarks: 100 },
    { name: 'Unit Test 1', date: new Date('2024-01-10'), totalMarks: 50 },
    { name: 'Unit Test 2', date: new Date('2024-03-15'), totalMarks: 50 },
    { name: 'Quarterly Exam', date: new Date('2024-04-10'), totalMarks: 80 },
  ];

  const createdExams = [];

  // Create exams for each class-subject combination
  for (const examTemplate of examData) {
    for (const classItem of classes) {
      for (const subject of subjects.slice(0, 3)) { // Limit to first 3 subjects
        const exam = await prisma.exam.create({
          data: {
            name: `${examTemplate.name} - ${subject.name}`,
            date: examTemplate.date,
            classId: classItem.id,
            subjectId: subject.id,
            totalMarks: examTemplate.totalMarks
          }
        });
        createdExams.push(exam);
      }
    }
  }

  // Create results for students
  for (const exam of createdExams) {
    // Get students from the exam's class
    const classStudents = students.filter(s => s.classId === exam.classId);
    
    for (const student of classStudents) {
      // Generate realistic marks (70-95% range)
      const percentage = 70 + Math.random() * 25;
      const marks = Math.round((percentage / 100) * exam.totalMarks);
      
      // Calculate grade
      const grade = percentage >= 90 ? 'A+' :
                   percentage >= 80 ? 'A' :
                   percentage >= 70 ? 'B' :
                   percentage >= 60 ? 'C' :
                   percentage >= 50 ? 'D' : 'F';

      await prisma.result.create({
        data: {
          examId: exam.id,
          studentId: student.id,
          marks: marks,
          grade: grade
        }
      });
    }
  }

  console.log('Exams and results seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });