-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "teacherId" INTEGER;

-- CreateTable
CREATE TABLE "public"."EventVolunteer" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "EventVolunteer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventVolunteer_eventId_studentId_key" ON "public"."EventVolunteer"("eventId", "studentId");

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventVolunteer" ADD CONSTRAINT "EventVolunteer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventVolunteer" ADD CONSTRAINT "EventVolunteer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
