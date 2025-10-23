/**
 * Destructive seed script for assignments & submissions
 * WARNING: This script deletes data in related tables (assignments, submissions, teacherClassSubject,
 * and optionally recreates minimal classes/subjects/teachers/students). Run only in development.
 *
 * Usage:
 *   node prisma/seed-assignments.js
 *
 * This script expects the Prisma client to be configured via the project's .env DATABASE_URL.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function findOrCreateUser({ name, email, role, password }) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const hashed = await bcrypt.hash(password || 'password123', 10);
    user = await prisma.user.create({ data: { name, email, password: hashed, role } });
  }
  return user;
}

async function findOrCreateTeacher(user) {
  let teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
  if (!teacher) {
    teacher = await prisma.teacher.create({ data: { userId: user.id, department: 'General' } });
  }
  return teacher;
}

async function findOrCreateStudent(user, classId) {
  let student = await prisma.student.findUnique({ where: { userId: user.id } });
  if (!student) {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 15);
    const roll = `R-${user.id}-${Math.floor(Math.random() * 1000)}`;
    student = await prisma.student.create({
      data: { userId: user.id, classId, dob, rollNumber: roll }
    });
  }
  return student;
}

async function main() {
  console.log('Running destructive assignment seed...');

  // Delete dependent data in safe order
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.teacherClassSubject.deleteMany();

  // We'll keep classes/subjects/users mostly intact, but create test ones if missing
  // Ensure at least one class exists
  let cls = await prisma.class.findFirst();
  if (!cls) {
    cls = await prisma.class.create({ data: { name: '10', section: 'A' } });
    console.log('Created class:', cls.id);
  }

  // Ensure at least one subject exists
  let subject = await prisma.subject.findFirst();
  if (!subject) {
    subject = await prisma.subject.create({ data: { name: 'Mathematics', code: 'MATH101' } });
    console.log('Created subject:', subject.id);
  }

  // Helper to find or create an extra class/subject so we can seed multiple TeacherClassSubject rows
  async function findOrCreateClass({ name, section }) {
    let c = await prisma.class.findFirst({ where: { name, section } });
    if (!c) {
      c = await prisma.class.create({ data: { name, section } });
      console.log('Created extra class:', c.id);
    }
    return c;
  }

  async function findOrCreateSubject({ name, code }) {
    let s = await prisma.subject.findUnique({ where: { code } });
    if (!s) {
      s = await prisma.subject.create({ data: { name, code } });
      console.log('Created extra subject:', s.id);
    }
    return s;
  }

  // Ensure at least one teacher user exists or create a test teacher
  const teacherUser = await findOrCreateUser({
    name: 'Seed Teacher',
    email: 'seed.teacher@school.com',
    role: 'TEACHER',
    password: 'teacher123'
  });

  const teacher = await findOrCreateTeacher(teacherUser);

  // Create TeacherClassSubject linking teacher, subject and class
  const tcs = await prisma.teacherClassSubject.create({
    data: {
      teacherId: teacher.id,
      subjectId: subject.id,
      classId: cls.id
    }
  });

  // Create an extra class/subject and link the same teacher to it so multiple mappings exist
  const extraClass = await findOrCreateClass({ name: cls.name + 'B', section: 'B' });
  const extraSubject = await findOrCreateSubject({ name: 'Science', code: 'SCI101' });

  // Only create the second mapping if it doesn't violate the unique constraint
  let tcs2 = await prisma.teacherClassSubject.findFirst({ where: { teacherId: teacher.id, subjectId: extraSubject.id } });
  if (!tcs2) {
    tcs2 = await prisma.teacherClassSubject.create({
      data: {
        teacherId: teacher.id,
        subjectId: extraSubject.id,
        classId: extraClass.id
      }
    });
    console.log('Created additional teacherClassSubject:', tcs2.id);
  } else {
    console.log('Found existing additional teacherClassSubject:', tcs2.id);
  }

  // Also ensure Physics and Chemistry subjects/mappings exist so frontend fallback (Physics/Chemistry) matches DB
  const physSubject = await findOrCreateSubject({ name: 'Physics', code: 'PHY101' });
  const chemSubject = await findOrCreateSubject({ name: 'Chemistry', code: 'CHEM101' });

  // Create teacherClassSubject mappings for Physics and Chemistry in the primary class if missing
  let tcsPhysics = await prisma.teacherClassSubject.findFirst({ where: { teacherId: teacher.id, subjectId: physSubject.id } });
  if (!tcsPhysics) {
    tcsPhysics = await prisma.teacherClassSubject.create({
      data: { teacherId: teacher.id, subjectId: physSubject.id, classId: cls.id }
    });
    console.log('Created teacherClassSubject for Physics:', tcsPhysics.id);
  }

  let tcsChem = await prisma.teacherClassSubject.findFirst({ where: { teacherId: teacher.id, subjectId: chemSubject.id } });
  if (!tcsChem) {
    tcsChem = await prisma.teacherClassSubject.create({
      data: { teacherId: teacher.id, subjectId: chemSubject.id, classId: extraClass.id }
    });
    console.log('Created teacherClassSubject for Chemistry:', tcsChem.id);
  }

  // Ensure at least one student user exists or create a test student
  const studentUser = await findOrCreateUser({
    name: 'Seed Student',
    email: 'seed.student@school.com',
    role: 'STUDENT',
    password: 'student123'
  });

  const student = await findOrCreateStudent(studentUser, cls.id);

  // Create a couple of assignments for this teacherClassSubject
  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Algebra Homework 1',
      description: 'Solve the attached algebra problems.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      teacherClassSubjectId: tcs.id
    }
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Geometry Worksheet',
      description: 'Complete the geometry worksheet and show steps.',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      teacherClassSubjectId: tcs.id
    }
  });

  // Create one assignment for the second teacherClassSubject mapping so frontend has multiple options
  const assignment3 = await prisma.assignment.create({
    data: {
      title: 'Science Lab Report',
      description: 'Complete the lab report with observations.',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      teacherClassSubjectId: tcs2.id
    }
  });

  console.log('Created assignments:', assignment1.id, assignment2.id);
  console.log('Created additional assignment for second mapping:', assignment3.id);

  // Create submissions: one text-only, one with a fileUrl placeholder
  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: student.id,
      submittedAt: new Date(),
      fileUrl: null,
      remarks: 'Text submission: solutions included inline.',
      status: 'SUBMITTED'
    }
  });

  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment2.id,
      studentId: student.id,
      submittedAt: new Date(),
      fileUrl: 'https://example.com/uploads/seed/sample-homework.pdf',
      remarks: null,
      status: 'SUBMITTED'
    }
  });

  console.log('Created sample submissions for student id:', student.id);
  console.log('Destructive assignment seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
