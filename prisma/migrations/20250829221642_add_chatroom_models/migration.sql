/*
  Warnings:

  - You are about to drop the column `abbreviation` on the `Classroom` table. All the data in the column will be lost.
  - You are about to drop the column `building` on the `Classroom` table. All the data in the column will be lost.
  - You are about to drop the column `optionalGroupId` on the `Student` table. All the data in the column will be lost.
  - The `allowedRoomIds` column on the `SubjectRequirement` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ChatroomMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatroomSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OptionalSubjectGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `School` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SessionParticipant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId,lessonId,date]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - Made the column `classId` on table `Lesson` required. This step will fail if there are existing NULL values in that column.
  - Made the column `scheduleDraftId` on table `LessonRequirement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `weeklyHours` on table `Subject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `coefficient` on table `Subject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isOptional` on table `Subject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `scheduleDraftId` on table `SubjectRequirement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `scheduleDraftId` on table `TeacherAssignment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `scheduleDraftId` on table `TeacherConstraint` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstName` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."ChatroomMessage" DROP CONSTRAINT "ChatroomMessage_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatroomMessage" DROP CONSTRAINT "ChatroomMessage_chatroomSessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatroomSession" DROP CONSTRAINT "ChatroomSession_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatroomSession" DROP CONSTRAINT "ChatroomSession_hostId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClassAssignment" DROP CONSTRAINT "ClassAssignment_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LessonRequirement" DROP CONSTRAINT "LessonRequirement_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LessonRequirement" DROP CONSTRAINT "LessonRequirement_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OptionalSubjectGroup" DROP CONSTRAINT "OptionalSubjectGroup_subjectId_fkey";

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
ALTER TABLE "public"."SubjectRequirement" DROP CONSTRAINT "SubjectRequirement_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherAssignment" DROP CONSTRAINT "TeacherAssignment_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherConstraint" DROP CONSTRAINT "TeacherConstraint_teacherId_fkey";

-- DropIndex
DROP INDEX "public"."ClassAssignment_teacherAssignmentId_classId_key";

-- DropIndex
DROP INDEX "public"."ScheduleDraft_name_key";

-- AlterTable
ALTER TABLE "public"."Classroom" DROP COLUMN "abbreviation",
DROP COLUMN "building";

-- AlterTable
ALTER TABLE "public"."Lesson" ALTER COLUMN "classId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."LessonRequirement" ALTER COLUMN "scheduleDraftId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "optionalGroupId";

-- AlterTable
ALTER TABLE "public"."Subject" ALTER COLUMN "weeklyHours" SET NOT NULL,
ALTER COLUMN "coefficient" SET NOT NULL,
ALTER COLUMN "isOptional" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."SubjectRequirement" ALTER COLUMN "scheduleDraftId" SET NOT NULL,
DROP COLUMN "allowedRoomIds",
ADD COLUMN     "allowedRoomIds" INTEGER[];

-- AlterTable
ALTER TABLE "public"."TeacherAssignment" ALTER COLUMN "scheduleDraftId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."TeacherConstraint" ALTER COLUMN "scheduleDraftId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;

-- DropTable
DROP TABLE "public"."ChatroomMessage";

-- DropTable
DROP TABLE "public"."ChatroomSession";

-- DropTable
DROP TABLE "public"."OptionalSubjectGroup";

-- DropTable
DROP TABLE "public"."School";

-- DropTable
DROP TABLE "public"."SessionParticipant";

-- CreateTable
CREATE TABLE "public"."chatroom_sessions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "classId" INTEGER,
    "hostId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatroom_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_participants" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."raised_hands" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raised_hands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chatroom_messages" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatroom_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reactions" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."polls" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "votes" JSONB NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quizzes" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "participants" JSONB NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_participants_sessionId_userId_key" ON "public"."session_participants"("sessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "raised_hands_sessionId_userId_key" ON "public"."raised_hands"("sessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_lessonId_date_key" ON "public"."Attendance"("studentId", "lessonId", "date");

-- CreateIndex
CREATE INDEX "Lesson_classId_day_startTime_idx" ON "public"."Lesson"("classId", "day", "startTime");

-- CreateIndex
CREATE INDEX "Lesson_teacherId_day_startTime_idx" ON "public"."Lesson"("teacherId", "day", "startTime");

-- CreateIndex
CREATE INDEX "Result_studentId_idx" ON "public"."Result"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "public"."Subject"("name");

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonRequirement" ADD CONSTRAINT "LessonRequirement_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubjectRequirement" ADD CONSTRAINT "SubjectRequirement_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chatroom_sessions" ADD CONSTRAINT "chatroom_sessions_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_participants" ADD CONSTRAINT "session_participants_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."chatroom_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_participants" ADD CONSTRAINT "session_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."raised_hands" ADD CONSTRAINT "raised_hands_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."chatroom_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."raised_hands" ADD CONSTRAINT "raised_hands_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chatroom_messages" ADD CONSTRAINT "chatroom_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chatroom_messages" ADD CONSTRAINT "chatroom_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."chatroom_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reactions" ADD CONSTRAINT "reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reactions" ADD CONSTRAINT "reactions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."chatroom_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."polls" ADD CONSTRAINT "polls_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."chatroom_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quizzes" ADD CONSTRAINT "quizzes_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."chatroom_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
