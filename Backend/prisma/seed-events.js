const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding events...');

  // Get existing data
  const teachers = await prisma.teacher.findMany();
  const students = await prisma.student.findMany();

  if (teachers.length === 0 || students.length === 0) {
    console.log('Please run other seed scripts first to create teachers and students');
    return;
  }

  // Clear existing events
  await prisma.eventVolunteer.deleteMany({});
  await prisma.event.deleteMany({});

  const events = [
    {
      title: 'Science Fair 2024',
      description: 'Annual science exhibition showcasing student projects and innovations',
      startDate: new Date('2024-03-15T09:00:00Z'),
      endDate: new Date('2024-03-15T17:00:00Z'),
      location: 'Main Auditorium',
      teacherId: teachers[0]?.id || null,
      volunteers: students.length >= 2 ? [students[0].id, students[1].id] : []
    },
    {
      title: 'Sports Day',
      description: 'Inter-class sports competition with various athletic events',
      startDate: new Date('2024-03-20T08:00:00Z'),
      endDate: new Date('2024-03-20T16:00:00Z'),
      location: 'School Playground',
      teacherId: teachers[1]?.id || null,
      volunteers: students.length >= 4 ? [students[2].id, students[3].id] : []
    },
    {
      title: 'Cultural Festival',
      description: 'Celebration of arts, music, and cultural diversity',
      startDate: new Date('2024-04-05T10:00:00Z'),
      endDate: new Date('2024-04-05T18:00:00Z'),
      location: 'School Hall',
      teacherId: teachers[2]?.id || null,
      volunteers: students.length >= 5 ? [students[0].id, students[4].id] : []
    },
    {
      title: 'Career Guidance Workshop',
      description: 'Professional guidance session for senior students',
      startDate: new Date('2024-02-10T14:00:00Z'),
      endDate: new Date('2024-02-10T16:00:00Z'),
      location: 'Conference Room',
      teacherId: teachers[0]?.id || null,
      volunteers: students.length >= 2 ? [students[1].id] : []
    },
    {
      title: 'Parent-Teacher Meeting',
      description: 'Quarterly meeting to discuss student progress',
      startDate: new Date('2024-01-25T15:00:00Z'),
      endDate: new Date('2024-01-25T18:00:00Z'),
      location: 'Classrooms',
      teacherId: teachers[1]?.id || null,
      volunteers: []
    }
  ];

  for (const eventData of events) {
    const { volunteers, ...eventInfo } = eventData;
    
    const event = await prisma.event.create({
      data: {
        ...eventInfo,
        createdBy: teachers[0]?.id || 1,
        volunteers: volunteers.length > 0 ? {
          create: volunteers.map(studentId => ({
            student: { connect: { id: studentId } }
          }))
        } : undefined
      }
    });

    console.log(`Created event: ${event.title}`);
  }

  console.log('Events seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });