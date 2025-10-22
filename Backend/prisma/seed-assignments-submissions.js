require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function destructiveSeedAssignments() {
  try {
    // DESTRUCTIVE: Clear existing data
    await prisma.assignmentSubmission.deleteMany({});
    await prisma.assignment.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.user.deleteMany({ where: { role: 'STUDENT' } });
    
    console.log('Cleared existing assignments, submissions, and students');

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

    // Get existing class
    const class10A = await prisma.class.findFirst({ where: { name: '10', section: 'A' } });

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
        rollNumber: '10A003',
        classId: class10A.id,
        dob: new Date('2008-07-10')
      }
    });

    // Get teacher class subject
    const teacherClassSubject = await prisma.teacherClassSubject.findFirst({
      where: { classId: class10A.id }
    });

    // Create assignments
    const assignment1 = await prisma.assignment.create({
      data: {
        title: 'Quadratic Equations Test',
        description: 'Solve all quadratic equation problems',
        dueDate: new Date('2024-02-15'),
        teacherClassSubjectId: teacherClassSubject.id
      }
    });

    const assignment2 = await prisma.assignment.create({
      data: {
        title: 'Algebra Homework',
        description: 'Complete chapter 5 exercises',
        dueDate: new Date('2024-02-20'),
        teacherClassSubjectId: teacherClassSubject.id
      }
    });

    // Create submissions with different statuses
    await prisma.assignmentSubmission.create({
      data: {
        assignmentId: assignment1.id,
        studentId: student1.id,
        fileUrl: 'https://example.com/alice-math-test.pdf',
        remarks: 'Submitted on time, good work',
        status: 'SUBMITTED'
      }
    });

    await prisma.assignmentSubmission.create({
      data: {
        assignmentId: assignment1.id,
        studentId: student2.id,
        fileUrl: 'https://example.com/bob-math-test.pdf',
        remarks: 'Excellent understanding of concepts',
        status: 'GRADED',
        grade: '88'
      }
    });

    await prisma.assignmentSubmission.create({
      data: {
        assignmentId: assignment2.id,
        studentId: student1.id,
        fileUrl: 'https://example.com/alice-algebra.pdf',
        remarks: 'Perfect solutions',
        status: 'GRADED',
        grade: '95'
      }
    });

    await prisma.assignmentSubmission.create({
      data: {
        assignmentId: assignment2.id,
        studentId: student3.id,
        fileUrl: 'https://example.com/carol-algebra.pdf',
        remarks: 'Good effort, minor errors',
        status: 'GRADED',
        grade: '78'
      }
    });

    console.log('✅ Destructive seed completed successfully!');
    console.log('📚 Created 2 assignments with 4 submissions');
    console.log('👥 Created 3 students: Alice, Bob, Carol');
    console.log('📊 Submissions: 1 SUBMITTED, 3 GRADED');
  } catch (error) {
    console.error('❌ Error in destructive seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

destructiveSeedAssignments();