const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();

async function main() {
  // Delete in dependency order
  await prisma.studentAttendance.deleteMany({});
  await prisma.teacherAttendance.deleteMany({});
  await prisma.teacherClassSubject.deleteMany({});

  await prisma.student.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("All data deleted successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
