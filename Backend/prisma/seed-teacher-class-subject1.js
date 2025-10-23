const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTeacherClassSubject() {
  try {
    console.log('🌱 Seeding TeacherClassSubject mappings...');

    // Clear existing data
    await prisma.teacherClassSubject.deleteMany({});
    console.log('✅ Cleared existing TeacherClassSubject data');

    // Get existing data
    const teachers = await prisma.teacher.findMany();
    const classes = await prisma.class.findMany();
    const subjects = await prisma.subject.findMany();

    if (teachers.length === 0 || classes.length === 0 || subjects.length === 0) {
      console.log('❌ Missing required data. Please ensure teachers, classes, and subjects exist.');
      return;
    }

    // Create mappings
    const mappings = [];
    
    // Assign first teacher to first class with all subjects
    if (teachers[0] && classes[0]) {
      for (const subject of subjects) {
        mappings.push({
          teacherId: teachers[0].id,
          classId: classes[0].id,
          subjectId: subject.id
        });
      }
    }

    // Assign second teacher to second class if they exist
    if (teachers[1] && classes[1]) {
      for (const subject of subjects.slice(0, 2)) { // First 2 subjects
        mappings.push({
          teacherId: teachers[1].id,
          classId: classes[1].id,
          subjectId: subject.id
        });
      }
    }

    // Create the mappings
    for (const mapping of mappings) {
      await prisma.teacherClassSubject.create({
        data: mapping
      });
    }

    console.log(`✅ Created ${mappings.length} TeacherClassSubject mappings`);

    // Verify the data
    const created = await prisma.teacherClassSubject.findMany({
      include: {
        teacher: { include: { user: true } },
        class: true,
        subject: true
      }
    });

    console.log('📋 Created mappings:');
    created.forEach(mapping => {
      console.log(`  - ${mapping.teacher.user.name} teaches ${mapping.subject.name} to ${mapping.class.name}-${mapping.class.section}`);
    });

  } catch (error) {
    console.error('❌ Error seeding TeacherClassSubject:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTeacherClassSubject();