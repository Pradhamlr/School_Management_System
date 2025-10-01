/*
  Warnings:

  - A unique constraint covering the columns `[rollNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `class` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dob` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rollNumber` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "class" TEXT NOT NULL,
ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "rollNumber" TEXT NOT NULL,
ADD COLUMN     "section" TEXT;

-- AlterTable
ALTER TABLE "public"."Teacher" ADD COLUMN     "department" TEXT NOT NULL,
ADD COLUMN     "hireDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "subject" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_rollNumber_key" ON "public"."Student"("rollNumber");
