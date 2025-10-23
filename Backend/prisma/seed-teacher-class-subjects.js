require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTeacherClassSubjects() {
  try {
    // Create Classes
    const class10A = await prisma.class.create({
      data: { name: '10', section: 'A' }
    }).catch(() => prisma.class.findFirst({ where: { name: '10', section: 'A' } }));

    const class11B = await prisma.class.create({
      data: { name: '11', section: 'B' }
    }).catch(() => prisma.class.findFirst({ where: { name: '11', section: 'B' } }));

    const class12A = await prisma.class.create({
      data: { name: '12', section: 'A' }
    }).catch(() => prisma.class.findFirst({ where: { name: '12', section: 'A' } }));

    // Create Subjects
    const mathematics = await prisma.subject.create({
      data: { name: 'Mathematics', code: 'MATH' }
    }).catch(() => prisma.subject.findFirst({ where: { name: 'Mathematics' } }));

    const physics = await prisma.subject.create({
      data: { name: 'Physics', code: 'PHY' }
    }).catch(() => prisma.subject.findFirst({ where: { name: 'Physics' } }));

    const chemistry = await prisma.subject.create({
      data: { name: 'Chemistry', code: 'CHEM' }
    }).catch(() => prisma.subject.findFirst({ where: { name: 'Chemistry' } }));

    // Create Teacher User
    const teacherUser = await prisma.user.create({
      data: {
        name: 'John Teacher',
        email: 'teacher@school.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'TEACHER'
      }
    }).catch(() => prisma.user.findFirst({ where: { email: 'teacher@school.com' } }));

    // Create Teacher
    const teacher = await prisma.teacher.create({
      data: {
        userId: teacherUser.id,
        department: 'Science',
        hireDate: new Date('2020-01-01')
      }
    }).catch(() => prisma.teacher.findFirst({ where: { userId: teacherUser.id } }));

    // Create TeacherClassSubject mappings
    await prisma.teacherClassSubject.create({
      data: {
        teacherId: teacher.id,
        classId: class10A.id,
        subjectId: mathematics.id
      }
    }).catch(() => {});

    await prisma.teacherClassSubject.create({
      data: {
        teacherId: teacher.id,
        classId: class11B.id,
        subjectId: physics.id
      }
    }).catch(() => {});

    await prisma.teacherClassSubject.create({
      data: {
        teacherId: teacher.id,
        classId: class12A.id,
        subjectId: chemistry.id
      }
    }).catch(() => {});

    console.log('Teacher-Class-Subject mappings seeded successfully');
  } catch (error) {
    console.error('Error seeding teacher-class-subjects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTeacherClassSubjects();