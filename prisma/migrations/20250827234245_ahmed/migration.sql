/*
  Warnings:

  - You are about to drop the column `classId` on the `Assignment` table. All the data in the column will be lost.
  - The primary key for the `ChatroomMessage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ChatroomMessage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `classId` on the `Exam` table. All the data in the column will be lost.
  - The primary key for the `OptionalSubjectGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gradeId` on the `OptionalSubjectGroup` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `OptionalSubjectGroup` table. All the data in the column will be lost.
  - The `id` column on the `OptionalSubjectGroup` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `schoolConfig` on the `School` table. All the data in the column will be lost.
  - The primary key for the `SessionParticipant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `optionalGroupId` column on the `Student` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `allowedRoomIds` column on the `SubjectRequirement` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Poll` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PollOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quiz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TeacherSubjects` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[teacherAssignmentId,classId]` on the table `ClassAssignment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[classId,subjectId,scheduleDraftId]` on the table `LessonRequirement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,subjectId]` on the table `OptionalSubjectGroup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,chatroomSessionId]` on the table `SessionParticipant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subjectId]` on the table `SubjectRequirement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacherId,subjectId,scheduleDraftId]` on the table `TeacherAssignment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endTime` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolDays` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionDuration` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `School` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `SessionParticipant` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "public"."Announcement" DROP CONSTRAINT "Announcement_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Assignment" DROP CONSTRAINT "Assignment_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Assignment" DROP CONSTRAINT "Assignment_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatroomMessage" DROP CONSTRAINT "ChatroomMessage_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatroomMessage" DROP CONSTRAINT "ChatroomMessage_chatroomSessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatroomSession" DROP CONSTRAINT "ChatroomSession_hostId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClassAssignment" DROP CONSTRAINT "ClassAssignment_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClassAssignment" DROP CONSTRAINT "ClassAssignment_teacherAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Exam" DROP CONSTRAINT "Exam_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Exam" DROP CONSTRAINT "Exam_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_scheduleDraftId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OptionalSubjectGroup" DROP CONSTRAINT "OptionalSubjectGroup_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OptionalSubjectGroup" DROP CONSTRAINT "OptionalSubjectGroup_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Poll" DROP CONSTRAINT "Poll_chatroomSessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PollOption" DROP CONSTRAINT "PollOption_pollId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quiz" DROP CONSTRAINT "Quiz_chatroomSessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuizAnswer" DROP CONSTRAINT "QuizAnswer_quizId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuizQuestion" DROP CONSTRAINT "QuizQuestion_quizId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Result" DROP CONSTRAINT "Result_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Result" DROP CONSTRAINT "Result_examId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SessionParticipant" DROP CONSTRAINT "SessionParticipant_chatroomSessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SessionParticipant" DROP CONSTRAINT "SessionParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_optionalGroupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TeacherSubjects" DROP CONSTRAINT "_TeacherSubjects_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TeacherSubjects" DROP CONSTRAINT "_TeacherSubjects_B_fkey";

-- DropIndex
DROP INDEX "public"."OptionalSubjectGroup_name_key";

-- DropIndex
DROP INDEX "public"."User_passwordResetToken_key";

-- AlterTable
ALTER TABLE "public"."Announcement" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Assignment" DROP COLUMN "classId";

-- AlterTable
ALTER TABLE "public"."ChatroomMessage" DROP CONSTRAINT "ChatroomMessage_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ChatroomMessage_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Event" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Exam" DROP COLUMN "classId";

-- AlterTable
ALTER TABLE "public"."Lesson" ALTER COLUMN "classId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."LessonRequirement" ALTER COLUMN "scheduleDraftId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."OptionalSubjectGroup" DROP CONSTRAINT "OptionalSubjectGroup_pkey",
DROP COLUMN "gradeId",
DROP COLUMN "teacherId",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "OptionalSubjectGroup_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Parent" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."School" DROP COLUMN "schoolConfig",
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "schoolDays" JSONB NOT NULL,
ADD COLUMN     "sessionDuration" INTEGER NOT NULL,
ADD COLUMN     "startTime" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SessionParticipant" DROP CONSTRAINT "SessionParticipant_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "leftAt" TIMESTAMP(3),
ADD CONSTRAINT "SessionParticipant_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Student" ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "sex" DROP NOT NULL,
ALTER COLUMN "birthday" DROP NOT NULL,
ALTER COLUMN "bloodType" DROP NOT NULL,
DROP COLUMN "optionalGroupId",
ADD COLUMN     "optionalGroupId" INTEGER;

-- AlterTable
ALTER TABLE "public"."Subject" ALTER COLUMN "weeklyHours" DROP NOT NULL,
ALTER COLUMN "coefficient" DROP NOT NULL,
ALTER COLUMN "isOptional" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."SubjectRequirement" ALTER COLUMN "scheduleDraftId" DROP NOT NULL,
ALTER COLUMN "timePreference" SET DEFAULT 'ANY',
DROP COLUMN "allowedRoomIds",
ADD COLUMN     "allowedRoomIds" JSONB;

-- AlterTable
ALTER TABLE "public"."TeacherAssignment" ALTER COLUMN "scheduleDraftId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."TeacherConstraint" ALTER COLUMN "scheduleDraftId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "password",
DROP COLUMN "passwordResetExpires",
DROP COLUMN "passwordResetToken",
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'STUDENT',
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "firstName" DROP DEFAULT,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP DEFAULT,
ALTER COLUMN "twoFactorEnabled" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."Poll";

-- DropTable
DROP TABLE "public"."PollOption";

-- DropTable
DROP TABLE "public"."Quiz";

-- DropTable
DROP TABLE "public"."QuizAnswer";

-- DropTable
DROP TABLE "public"."QuizQuestion";

-- DropTable
DROP TABLE "public"."_TeacherSubjects";

-- CreateTable
CREATE TABLE "public"."_SubjectToTeacher" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubjectToTeacher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SubjectToTeacher_B_index" ON "public"."_SubjectToTeacher"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ClassAssignment_teacherAssignmentId_classId_key" ON "public"."ClassAssignment"("teacherAssignmentId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonRequirement_classId_subjectId_scheduleDraftId_key" ON "public"."LessonRequirement"("classId", "subjectId", "scheduleDraftId");

-- CreateIndex
CREATE UNIQUE INDEX "OptionalSubjectGroup_name_subjectId_key" ON "public"."OptionalSubjectGroup"("name", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionParticipant_userId_chatroomSessionId_key" ON "public"."SessionParticipant"("userId", "chatroomSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectRequirement_subjectId_key" ON "public"."SubjectRequirement"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAssignment_teacherId_subjectId_scheduleDraftId_key" ON "public"."TeacherAssignment"("teacherId", "subjectId", "scheduleDraftId");

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_optionalGroupId_fkey" FOREIGN KEY ("optionalGroupId") REFERENCES "public"."OptionalSubjectGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_scheduleDraftId_fkey" FOREIGN KEY ("scheduleDraftId") REFERENCES "public"."ScheduleDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonRequirement" ADD CONSTRAINT "LessonRequirement_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonRequirement" ADD CONSTRAINT "LessonRequirement_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherConstraint" ADD CONSTRAINT "TeacherConstraint_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubjectRequirement" ADD CONSTRAINT "SubjectRequirement_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassAssignment" ADD CONSTRAINT "ClassAssignment_teacherAssignmentId_fkey" FOREIGN KEY ("teacherAssignmentId") REFERENCES "public"."TeacherAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassAssignment" ADD CONSTRAINT "ClassAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatroomSession" ADD CONSTRAINT "ChatroomSession_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatroomSession" ADD CONSTRAINT "ChatroomSession_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionParticipant" ADD CONSTRAINT "SessionParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionParticipant" ADD CONSTRAINT "SessionParticipant_chatroomSessionId_fkey" FOREIGN KEY ("chatroomSessionId") REFERENCES "public"."ChatroomSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatroomMessage" ADD CONSTRAINT "ChatroomMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatroomMessage" ADD CONSTRAINT "ChatroomMessage_chatroomSessionId_fkey" FOREIGN KEY ("chatroomSessionId") REFERENCES "public"."ChatroomSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SubjectToTeacher" ADD CONSTRAINT "_SubjectToTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SubjectToTeacher" ADD CONSTRAINT "_SubjectToTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
