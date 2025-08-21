/*
  Warnings:

  - You are about to drop the column `supervisorId` on the `Class` table. All the data in the column will be lost.
  - You are about to alter the column `hours` on the `LessonRequirement` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - The primary key for the `School` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `School` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `SessionParticipant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `SessionParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `requiresRoom` on the `Subject` table. All the data in the column will be lost.
  - The `allowedRoomIds` column on the `SubjectRequirement` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `_StudentOptionalSubjects` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `OptionalSubject` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[passwordResetToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `description` on table `Announcement` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `classId` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `classId` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Made the column `subjectId` on table `Lesson` required. This step will fail if there are existing NULL values in that column.
  - Made the column `classId` on table `Lesson` required. This step will fail if there are existing NULL values in that column.
  - Made the column `teacherId` on table `Lesson` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `Parent` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `schoolConfig` to the `School` table without a default value. This is not possible if the table is not empty.
  - Made the column `weeklyHours` on table `Subject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `coefficient` on table `Subject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstName` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `twoFactorEnabled` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `B` on the `_StudentOptionalSubjects` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_optionalSubjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_scheduleDraftId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LessonRequirement" DROP CONSTRAINT "LessonRequirement_scheduleDraftId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LessonRequirement" DROP CONSTRAINT "LessonRequirement_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OptionalSubject" DROP CONSTRAINT "OptionalSubject_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Result" DROP CONSTRAINT "Result_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SubjectRequirement" DROP CONSTRAINT "SubjectRequirement_scheduleDraftId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SubjectRequirement" DROP CONSTRAINT "SubjectRequirement_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherAssignment" DROP CONSTRAINT "TeacherAssignment_scheduleDraftId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherAssignment" DROP CONSTRAINT "TeacherAssignment_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherAssignment" DROP CONSTRAINT "TeacherAssignment_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherConstraint" DROP CONSTRAINT "TeacherConstraint_scheduleDraftId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherConstraint" DROP CONSTRAINT "TeacherConstraint_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_StudentOptionalSubjects" DROP CONSTRAINT "_StudentOptionalSubjects_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_StudentOptionalSubjects" DROP CONSTRAINT "_StudentOptionalSubjects_B_fkey";

-- DropIndex
DROP INDEX "public"."Announcement_classId_idx";

-- DropIndex
DROP INDEX "public"."Assignment_lessonId_idx";

-- DropIndex
DROP INDEX "public"."Attendance_lessonId_idx";

-- DropIndex
DROP INDEX "public"."Attendance_studentId_idx";

-- DropIndex
DROP INDEX "public"."ChatroomMessage_chatroomSessionId_idx";

-- DropIndex
DROP INDEX "public"."ChatroomSession_hostId_idx";

-- DropIndex
DROP INDEX "public"."Class_gradeId_idx";

-- DropIndex
DROP INDEX "public"."Class_name_key";

-- DropIndex
DROP INDEX "public"."ClassAssignment_teacherAssignmentId_classId_key";

-- DropIndex
DROP INDEX "public"."Classroom_name_key";

-- DropIndex
DROP INDEX "public"."Event_classId_idx";

-- DropIndex
DROP INDEX "public"."Exam_lessonId_idx";

-- DropIndex
DROP INDEX "public"."Lesson_classId_idx";

-- DropIndex
DROP INDEX "public"."Lesson_classroomId_idx";

-- DropIndex
DROP INDEX "public"."Lesson_subjectId_idx";

-- DropIndex
DROP INDEX "public"."Lesson_teacherId_idx";

-- DropIndex
DROP INDEX "public"."LessonRequirement_scheduleDraftId_subjectId_classId_key";

-- DropIndex
DROP INDEX "public"."Result_assignmentId_idx";

-- DropIndex
DROP INDEX "public"."Result_examId_idx";

-- DropIndex
DROP INDEX "public"."Result_studentId_idx";

-- DropIndex
DROP INDEX "public"."ScheduleDraft_userId_idx";

-- DropIndex
DROP INDEX "public"."SessionParticipant_userId_chatroomSessionId_key";

-- DropIndex
DROP INDEX "public"."Student_classId_idx";

-- DropIndex
DROP INDEX "public"."Student_gradeId_idx";

-- DropIndex
DROP INDEX "public"."Student_parentId_idx";

-- DropIndex
DROP INDEX "public"."Student_userId_idx";

-- DropIndex
DROP INDEX "public"."Subject_name_key";

-- DropIndex
DROP INDEX "public"."Teacher_userId_idx";

-- DropIndex
DROP INDEX "public"."TeacherAssignment_scheduleDraftId_teacherId_subjectId_key";

-- DropIndex
DROP INDEX "public"."User_email_idx";

-- AlterTable
ALTER TABLE "public"."Announcement" ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Assignment" ADD COLUMN     "classId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."ChatroomSession" ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Class" DROP COLUMN "supervisorId";

-- AlterTable
ALTER TABLE "public"."Classroom" ADD COLUMN     "abbreviation" TEXT;

-- AlterTable
ALTER TABLE "public"."Event" ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Exam" ADD COLUMN     "classId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Lesson" ALTER COLUMN "subjectId" SET NOT NULL,
ALTER COLUMN "classId" SET NOT NULL,
ALTER COLUMN "teacherId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."LessonRequirement" ALTER COLUMN "hours" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."Parent" ALTER COLUMN "address" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."ScheduleDraft" ALTER COLUMN "classrooms" SET DATA TYPE JSONB;

-- AlterTable
ALTER TABLE "public"."School" DROP CONSTRAINT "School_pkey",
ADD COLUMN     "schoolConfig" JSONB NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "School_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."SessionParticipant" DROP CONSTRAINT "SessionParticipant_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "SessionParticipant_pkey" PRIMARY KEY ("userId", "chatroomSessionId");

-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "optionalGroupId" TEXT;

-- AlterTable
ALTER TABLE "public"."Subject" DROP COLUMN "requiresRoom",
ALTER COLUMN "weeklyHours" SET NOT NULL,
ALTER COLUMN "coefficient" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."SubjectRequirement" DROP COLUMN "allowedRoomIds",
ADD COLUMN     "allowedRoomIds" INTEGER[],
ALTER COLUMN "timePreference" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "active" SET DEFAULT true,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "firstName" SET DEFAULT '',
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "lastName" SET DEFAULT '',
ALTER COLUMN "twoFactorEnabled" SET NOT NULL,
ALTER COLUMN "twoFactorEnabled" SET DEFAULT false;

-- AlterTable
ALTER TABLE "public"."_StudentOptionalSubjects" DROP CONSTRAINT "_StudentOptionalSubjects_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL,
ADD CONSTRAINT "_StudentOptionalSubjects_AB_pkey" PRIMARY KEY ("A", "B");

-- DropTable
DROP TABLE "public"."OptionalSubject";

-- CreateTable
CREATE TABLE "public"."OptionalSubjectGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "teacherId" TEXT,
    "gradeId" INTEGER NOT NULL,

    CONSTRAINT "OptionalSubjectGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Poll" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "chatroomSessionId" TEXT NOT NULL,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PollOption" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "votes" JSONB NOT NULL DEFAULT '[]',
    "pollId" TEXT NOT NULL,

    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "chatroomSessionId" TEXT NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuizQuestion" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correctAnswer" INTEGER NOT NULL,
    "timeLimit" INTEGER NOT NULL DEFAULT 30,
    "quizId" TEXT NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuizAnswer" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "quizId" TEXT NOT NULL,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OptionalSubjectGroup_name_key" ON "public"."OptionalSubjectGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "public"."User"("passwordResetToken");

-- CreateIndex
CREATE INDEX "_StudentOptionalSubjects_B_index" ON "public"."_StudentOptionalSubjects"("B");

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_optionalGroupId_fkey" FOREIGN KEY ("optionalGroupId") REFERENCES "public"."OptionalSubjectGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OptionalSubjectGroup" ADD CONSTRAINT "OptionalSubjectGroup_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OptionalSubjectGroup" ADD CONSTRAINT "OptionalSubjectGroup_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OptionalSubjectGroup" ADD CONSTRAINT "OptionalSubjectGroup_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_scheduleDraftId_fkey" FOREIGN KEY ("scheduleDraftId") REFERENCES "public"."ScheduleDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonRequirement" ADD CONSTRAINT "LessonRequirement_scheduleDraftId_fkey" FOREIGN KEY ("scheduleDraftId") REFERENCES "public"."ScheduleDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherConstraint" ADD CONSTRAINT "TeacherConstraint_scheduleDraftId_fkey" FOREIGN KEY ("scheduleDraftId") REFERENCES "public"."ScheduleDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubjectRequirement" ADD CONSTRAINT "SubjectRequirement_scheduleDraftId_fkey" FOREIGN KEY ("scheduleDraftId") REFERENCES "public"."ScheduleDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_scheduleDraftId_fkey" FOREIGN KEY ("scheduleDraftId") REFERENCES "public"."ScheduleDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Poll" ADD CONSTRAINT "Poll_chatroomSessionId_fkey" FOREIGN KEY ("chatroomSessionId") REFERENCES "public"."ChatroomSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "public"."Poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_chatroomSessionId_fkey" FOREIGN KEY ("chatroomSessionId") REFERENCES "public"."ChatroomSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAnswer" ADD CONSTRAINT "QuizAnswer_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_StudentOptionalSubjects" ADD CONSTRAINT "_StudentOptionalSubjects_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_StudentOptionalSubjects" ADD CONSTRAINT "_StudentOptionalSubjects_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
