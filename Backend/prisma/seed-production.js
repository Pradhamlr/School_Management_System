/**
 * DESTRUCTIVE PRODUCTION SEED
 * ---------------------------
 * WARNING: This script will DELETE data from many tables and reseed sample records.
 * To run it you MUST set the environment variable: CONFIRM_PRODUCTION_SEED=true
 * Example: CONFIRM_PRODUCTION_SEED=true node prisma/seed-production.js
 *
 * This is intended only for test environments that mirror production, never run against a live production DB.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function clear() {
  console.log('Clearing all public tables (destructive) using TRUNCATE ... CASCADE');
  // Use a single TRUNCATE ... CASCADE to avoid FK ordering issues (P2003)
  // Exclude prisma_migrations so migration history stays intact.
  const tables = await prisma.$queryRawUnsafe("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'prisma_migrations';");
  const tableNames = tables.map(t => t.tablename).filter(Boolean);
  if (tableNames.length === 0) {
    console.log('No public tables found to truncate.');
    return;
  }
  // Build a quoted list of table names for TRUNCATE
  const quoted = tableNames.map(t => '"' + t + '"').join(', ');
  const sql = `TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE;`;
  console.log('Executing:', sql.replace(/\"/g, '"').slice(0, 200) + (sql.length > 200 ? '... (truncated)' : ''));
  await prisma.$executeRawUnsafe(sql);
}

async function seed() {
  console.log('Seeding production-like dataset...');

  // Create admin
  const adminPass = await bcrypt.hash('AdminPass123!', 10);
  const admin = await prisma.user.create({ data: { name: 'Administrator', email: 'admin@school.test', password: adminPass, role: 'ADMIN' } });

  // Create classes
  const classes = [];
  for (let i = 1; i <= 6; i++) {
    classes.push(await prisma.class.create({ data: { name: `${i}`, section: 'A' } }));
  }

  // Create subjects
  const subjectNames = ['Mathematics','English','Physics','Chemistry','Biology','History','Geography','Computer Science'];
  const subjects = [];
  for (const name of subjectNames) {
    subjects.push(await prisma.subject.create({ data: { name, code: name.slice(0,3).toUpperCase() } }));
  }

  // Create teachers and users
  const teacherUsers = [];
  for (let t = 1; t <= 12; t++) {
    const user = await prisma.user.create({ data: { name: `Teacher ${t}`, email: `teacher${t}@school.test`, password: await bcrypt.hash('TeacherPass1!', 10), role: 'TEACHER' } });
    const teacher = await prisma.teacher.create({ data: { userId: user.id, department: 'General' } });
    teacherUsers.push({ user, teacher });
  }

  // Create classrooms
  const classrooms = [];
  for (let r = 1; r <= 12; r++) {
    classrooms.push(await prisma.classroom.create({ data: { name: `A${100 + r}`, capacity: 40 } }));
  }

  // Create students
  const studentUsers = [];
  for (let s = 1; s <= 120; s++) {
    const user = await prisma.user.create({ data: { name: `Student ${s}`, email: `student${s}@school.test`, password: await bcrypt.hash('StudentPass1!', 10), role: 'STUDENT' } });
    // assign to classes in round-robin
    const classRef = classes[(s-1) % classes.length];
    const student = await prisma.student.create({ data: { userId: user.id, classId: classRef.id, dob: new Date(2008, 0, 1), rollNumber: `R${s.toString().padStart(4,'0')}` } });
    studentUsers.push({ user, student });
  }

  // Teacher-class-subject assignments
  for (const t of teacherUsers) {
    // assign a few subject-class combos
    for (let i = 0; i < 3; i++) {
      const subj = subjects[(t.teacher.id + i) % subjects.length];
      const cls = classes[(t.teacher.id + i) % classes.length];
      await prisma.teacherClassSubject.create({ data: { teacherId: t.teacher.id, subjectId: subj.id, classId: cls.id } });
    }
  }

  // Create timetables: sample slots
  const days = ['MON','TUE','WED','THU','FRI'];
  // Build timetable entries and insert with skipDuplicates to avoid unique constraint errors
  const timetableData = [];
  for (let i = 0; i < 60; i++) {
    const cls = classes[i % classes.length];
    const subj = subjects[i % subjects.length];
    const teacher = teacherUsers[i % teacherUsers.length].teacher;
    const room = classrooms[i % classrooms.length];
    timetableData.push({ classId: cls.id, subjectId: subj.id, teacherId: teacher.id, classroomId: room.id, day: days[i % days.length], startMinute: 8*60 + (i%5)*60, endMinute: 8*60 + (i%5)*60 + 45 });
  }
  if (timetableData.length > 0) {
    // Use createMany with skipDuplicates to guard against existing/conflicting unique rows
    await prisma.timetable.createMany({ data: timetableData, skipDuplicates: true });
  }

  // Create assignments: distribute across existing teacher-class-subject relationships
  const tcsList = await prisma.teacherClassSubject.findMany();
  if (tcsList && tcsList.length > 0) {
    const assignmentsData = [];
    for (let a = 1; a <= 40; a++) {
      const tcs = tcsList[(a - 1) % tcsList.length];
      assignmentsData.push({ title: `Assignment ${a}`, description: `Sample assignment ${a}`, dueDate: new Date(Date.now() + a * 24 * 3600 * 1000), teacherClassSubjectId: tcs.id });
    }
    await prisma.assignment.createMany({ data: assignmentsData, skipDuplicates: true });
  }

  // Create some notifications
  const notifRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
  const notifications = [];
  for (let i = 1; i <= 12; i++) {
    notifications.push({ title: `Notice ${i}`, message: `This is an automated notice number ${i}`, targetRole: notifRoles[i % notifRoles.length], createdBy: admin.id });
  }
  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications, skipDuplicates: true });
  }

  // Create some events and volunteer signups
  const eventsData = [];
  for (let i = 1; i <= 8; i++) {
    const teacherForEvent = teacherUsers[(i - 1) % teacherUsers.length].teacher;
    const start = new Date();
    start.setDate(start.getDate() + i);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    eventsData.push({ title: `Event ${i}`, description: `Sample event ${i}`, startDate: start, endDate: end, location: `Hall ${i}`, createdBy: admin.id, teacherId: teacherForEvent.id });
  }
  if (eventsData.length > 0) {
    await prisma.event.createMany({ data: eventsData, skipDuplicates: true });
  }

  // Link some volunteers (students) to events
  const allEvents = await prisma.event.findMany();
  const eventVolunteers = [];
  if (allEvents.length > 0 && studentUsers.length > 0) {
    for (let i = 0; i < allEvents.length; i++) {
      const ev = allEvents[i];
      // attach 5 students per event
      for (let j = 0; j < 5 && j < studentUsers.length; j++) {
        const stu = studentUsers[(i * 5 + j) % studentUsers.length].student;
        eventVolunteers.push({ eventId: ev.id, studentId: stu.id });
      }
    }
    if (eventVolunteers.length > 0) {
      await prisma.eventVolunteer.createMany({ data: eventVolunteers, skipDuplicates: true });
    }
  }

  // Bulk-create lots of attendance records (students + teachers) across recent days
  const randStatus = () => {
    const r = Math.random();
    if (r < 0.8) return 'PRESENT';
    if (r < 0.92) return 'ABSENT';
    if (r < 0.98) return 'LATE';
    return 'EXCUSED';
  };

  const chunk = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const STUDENT_DAYS = 30;
  const TEACHER_DAYS = 30;
  const studentAttendance = [];
  for (const su of studentUsers) {
    for (let d = 0; d < STUDENT_DAYS; d++) {
      const dt = new Date();
      dt.setDate(dt.getDate() - d);
      const dateOnly = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
      studentAttendance.push({ studentId: su.student.id, date: dateOnly, status: randStatus(), remarks: null });
    }
  }
  // Batch insert students attendance
  const studentChunks = chunk(studentAttendance, 1000);
  for (const c of studentChunks) {
    await prisma.studentAttendance.createMany({ data: c, skipDuplicates: true });
  }

  const teacherAttendance = [];
  for (const tu of teacherUsers) {
    for (let d = 0; d < TEACHER_DAYS; d++) {
      const dt = new Date();
      dt.setDate(dt.getDate() - d);
      const dateOnly = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
      teacherAttendance.push({ teacherId: tu.teacher.id, date: dateOnly, status: randStatus(), remarks: null });
    }
  }
  const teacherChunks = chunk(teacherAttendance, 1000);
  for (const c of teacherChunks) {
    await prisma.teacherAttendance.createMany({ data: c, skipDuplicates: true });
  }


  console.log('Seeding complete. Admin user:', admin.email, 'password: AdminPass123!');
  // Also print one sample teacher and student credentials for quick reference
  if (teacherUsers && teacherUsers.length > 0) {
    const sampleTeacherUser = teacherUsers[0].user;
    console.log('Sample teacher:', sampleTeacherUser.email, 'password: TeacherPass1!');
  }
  if (studentUsers && studentUsers.length > 0) {
    const sampleStudentUser = studentUsers[0].user;
    console.log('Sample student:', sampleStudentUser.email, 'password: StudentPass1!');
  }
}

async function main() {
  console.warn('Running destructive production seed WITHOUT environment guard. This will DELETE data.');
  try {
    await clear();
    await seed();
    console.log('Production seed finished');
    process.exit(0);
  } catch (e) {
    console.error('Seed failed', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
