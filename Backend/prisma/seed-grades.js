require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function destructiveSeedGrades() {
  try {
    // DESTRUCTIVE: Clear existing data in correct order
    await prisma.result.deleteMany({});
    await prisma.assignmentSubmission.deleteMany({});
    await prisma.assignment.deleteMany({});
    await prisma.exam.deleteMany({});
    await prisma.teacherClassSubject.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.teacher.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.user.deleteMany({ where: { role: { in: ['STUDENT', 'TEACHER'] } } });
    
    console.log('Cleared existing data');

    // Create subjects
    const mathSubject = await prisma.subject.create({
      data: { name: 'Mathematics', code: 'MATH101' }
    });

    const physicsSubject = await prisma.subject.create({
      data: { name: 'Physics', code: 'PHY101' }
    });

    const chemistrySubject = await prisma.subject.create({
      data: { name: 'Chemistry', code: 'CHEM101' }
    });

    // Create classes
    const class10A = await prisma.class.create({
      data: { name: '10', section: 'A' }
    });

    const class10B = await prisma.class.create({
      data: { name: '10', section: 'B' }
    });

    const class11A = await prisma.class.create({
      data: { name: '11', section: 'A' }
    });

    // Create teacher user
    const teacherUser = await prisma.user.create({
      data: {
        name: 'John Teacher',
        email: 'teacher@school.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'TEACHER'
      }
    });

    // Create teacher
    const teacher = await prisma.teacher.create({
      data: {
        userId: teacherUser.id,
        department: 'Science'
      }
    });

    // Create teacher-class-subject mappings
    await prisma.teacherClassSubject.create({
      data: {
        teacherId: teacher.id,
        classId: class10A.id,
        subjectId: mathSubject.id
      }
    });

    await prisma.teacherClassSubject.create({
      data: {
        teacherId: teacher.id,
        classId: class10B.id,
        subjectId: physicsSubject.id
      }
    });

    // Create student users
    const student1User = await prisma.user.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@school.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'STUDENT'
      }
    });

    const student2User = await prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@school.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'STUDENT'
      }
    });

    const student3User = await prisma.user.create({
      data: {
        name: 'Carol Davis',
        email: 'carol@school.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'STUDENT'
      }
    });

    const student4User = await prisma.user.create({
      data: {
        name: 'David Wilson',
        email: 'david@school.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'STUDENT'
      }
    });

    // Create students
    const student1 = await prisma.student.create({
      data: {
        userId: student1User.id,
        rollNumber: '10A001',
        classId: class10A.id,
        dob: new Date('2008-05-15')
      }
    });

    const student2 = await prisma.student.create({
      data: {
        userId: student2User.id,
        rollNumber: '10A002',
        classId: class10A.id,
        dob: new Date('2008-03-22')
      }
    });

    const student3 = await prisma.student.create({
      data: {
        userId: student3User.id,
        rollNumber: '10B001',
        classId: class10B.id,
        dob: new Date('2008-07-10')
      }
    });

    const student4 = await prisma.student.create({
      data: {
        userId: student4User.id,
        rollNumber: '11A001',
        classId: class11A.id,
        dob: new Date('2008-01-05')
      }
    });

    // Create exams
    const mathExam1 = await prisma.exam.create({
      data: {
        name: 'Mathematics Midterm',
        date: new Date('2024-03-15'),
        classId: class10A.id,
        subjectId: mathSubject.id,
        totalMarks: 100
      }
    });

    const mathExam2 = await prisma.exam.create({
      data: {
        name: 'Mathematics Final',
        date: new Date('2024-05-20'),
        classId: class10A.id,
        subjectId: mathSubject.id,
        totalMarks: 100
      }
    });

    const physicsExam = await prisma.exam.create({
      data: {
        name: 'Physics Unit Test',
        date: new Date('2024-04-10'),
        classId: class10B.id,
        subjectId: physicsSubject.id,
        totalMarks: 50
      }
    });

    const chemExam = await prisma.exam.create({
      data: {
        name: 'Chemistry Quiz',
        date: new Date('2024-04-05'),
        classId: class11A.id,
        subjectId: chemistrySubject.id,
        totalMarks: 25
      }
    });

    // Create results (grades)
    await prisma.result.create({
      data: {
        examId: mathExam1.id,
        studentId: student1.id,
        marks: 85,
        grade: 'A'
      }
    });

    await prisma.result.create({
      data: {
        examId: mathExam1.id,
        studentId: student2.id,
        marks: 78,
        grade: 'B+'
      }
    });

    await prisma.result.create({
      data: {
        examId: mathExam2.id,
        studentId: student1.id,
        marks: 92,
        grade: 'A+'
      }
    });

    await prisma.result.create({
      data: {
        examId: physicsExam.id,
        studentId: student3.id,
        marks: 42,
        grade: 'A'
      }
    });

    await prisma.result.create({
      data: {
        examId: chemExam.id,
        studentId: student4.id,
        marks: 20,
        grade: 'B'
      }
    });

    console.log('✅ Destructive grade seed completed successfully!');
    console.log('📚 Created 3 subjects: Mathematics, Physics, Chemistry');
    console.log('🏫 Created 3 classes: 10-A, 10-B, 11-A');
    console.log('👨🏫 Created 1 teacher with subject mappings');
    console.log('👥 Created 4 students across different classes');
    console.log('📝 Created 4 exams across different subjects and classes');
    console.log('📊 Created 5 grade results for testing');
  } catch (error) {
    console.error('❌ Error in destructive grade seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

destructiveSeedGrades();