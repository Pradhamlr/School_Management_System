const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function upsertUser(email, name, password, role = 'STUDENT') {
  // hash password only for create; when user exists, don't overwrite password to avoid re-hashing
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, role },
    create: { email, name, password: hashed, role }
  });
}

async function main() {
  console.log('Starting seed...');

  // Users
  const admin = await upsertUser('admin@school.test', 'Admin User', 'password123', 'ADMIN');
  const teacherUser = await upsertUser('teacher1@school.test', 'Alice Teacher', 'password123', 'TEACHER');
  const studentUser1 = await upsertUser('student1@school.test', 'Bob Student', 'password123', 'STUDENT');
  const studentUser2 = await upsertUser('student2@school.test', 'Carol Student', 'password123', 'STUDENT');

  // Teachers (profile)
  console.log('About to upsert teacher; prisma.teacher exists?', !!prisma.teacher);
  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: { department: 'Mathematics' },
    create: { userId: teacherUser.id, department: 'Mathematics', hireDate: new Date() }
  });

  // Class - create this before students so foreign keys exist
  console.log('About to upsert class; prisma.class exists?', !!prisma.class);
  const cls = await prisma.class.upsert({
    where: { id: 1 },
    update: { name: '10', section: 'A', classTeacherId: teacher.id },
    create: { id: 1, name: '10', section: 'A', classTeacherId: teacher.id }
  });

  // Students (profiles)
  console.log('About to upsert student1; prisma.student exists?', !!prisma.student);
  const student1 = await prisma.student.upsert({
    where: { userId: studentUser1.id },
    update: { classId: cls.id, dob: new Date('2008-01-01'), rollNumber: 'S1001' },
    create: { userId: studentUser1.id, classId: cls.id, dob: new Date('2008-01-01'), rollNumber: 'S1001' }
  });

  console.log('About to upsert student2; prisma.student exists?', !!prisma.student);
  const student2 = await prisma.student.upsert({
    where: { userId: studentUser2.id },
    update: { classId: cls.id, dob: new Date('2008-02-02'), rollNumber: 'S1002' },
    create: { userId: studentUser2.id, classId: cls.id, dob: new Date('2008-02-02'), rollNumber: 'S1002' }
  });

  // Subjects
  const math = await prisma.subject.upsert({
    where: { code: 'MATH-10' },
    update: { name: 'Mathematics' },
    create: { name: 'Mathematics', code: 'MATH-10' }
  });

  const eng = await prisma.subject.upsert({
    where: { code: 'ENG-10' },
    update: { name: 'English' },
    create: { name: 'English', code: 'ENG-10' }
  });

  // TeacherClassSubject mapping (find or create)
  let tcs = await prisma.teacherClassSubject.findFirst({ where: { teacherId: teacher.id, subjectId: math.id } });
  if (!tcs) {
    tcs = await prisma.teacherClassSubject.create({ data: { teacherId: teacher.id, subjectId: math.id, classId: cls.id } });
  }

  // Assignment
  const assignment = await prisma.assignment.upsert({
    where: { id: 1 },
    update: { title: 'Math Homework 1', description: 'Chapter 1 exercises', dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000), teacherClassSubjectId: tcs.id },
    create: { id: 1, title: 'Math Homework 1', description: 'Chapter 1 exercises', dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000), teacherClassSubjectId: tcs.id }
  });

  // Exam
  const exam = await prisma.exam.upsert({
    where: { id: 1 },
    update: { name: 'Midterm Math', date: new Date(Date.now() + 10 * 24 * 3600 * 1000), classId: cls.id, subjectId: math.id, totalMarks: 100 },
    create: { id: 1, name: 'Midterm Math', date: new Date(Date.now() + 10 * 24 * 3600 * 1000), classId: cls.id, subjectId: math.id, totalMarks: 100 }
  });

  // Results (for both students)
  await prisma.result.upsert({
    where: { examId_studentId: { examId: exam.id, studentId: student1.id } },
    update: { marks: 78, grade: 'B' },
    create: { examId: exam.id, studentId: student1.id, marks: 78, grade: 'B' }
  });

  await prisma.result.upsert({
    where: { examId_studentId: { examId: exam.id, studentId: student2.id } },
    update: { marks: 85, grade: 'A' },
    create: { examId: exam.id, studentId: student2.id, marks: 85, grade: 'A' }
  });

  // Submission for assignment by student1
  await prisma.assignmentSubmission.upsert({
    where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: student1.id } },
    update: { fileUrl: 'https://example.com/submissions/s1_hw1.pdf', status: 'SUBMITTED' },
    create: { assignmentId: assignment.id, studentId: student1.id, fileUrl: 'https://example.com/submissions/s1_hw1.pdf', status: 'SUBMITTED' }
  });

  console.log('Seed finished.');
}

// execute
main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });