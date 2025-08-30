-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'VISITOR');

-- CreateEnum
CREATE TYPE "public"."UserSex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."Day" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "public"."TimePreference" AS ENUM ('ANY', 'AM', 'PM');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "public"."Role" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "img" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "twoFactorEnabled" BOOLEAN DEFAULT false,
    "twoFactorCode" TEXT,
    "twoFactorCodeExpires" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "phone" TEXT,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teachers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "img" TEXT,
    "bloodType" TEXT,
    "birthday" TIMESTAMP(3),

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "img" TEXT,
    "bloodType" TEXT,
    "birthday" TIMESTAMP(3),
    "sex" "public"."UserSex",
    "classId" INTEGER,
    "gradeId" INTEGER,
    "parentId" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "img" TEXT,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grades" (
    "id" SERIAL NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."classes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "capacity" INTEGER NOT NULL,
    "gradeId" INTEGER NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subjects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "weeklyHours" INTEGER,
    "coefficient" INTEGER,
    "isOptional" BOOLEAN DEFAULT false,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."optional_subject_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gradeId" INTEGER NOT NULL,

    CONSTRAINT "optional_subject_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."classrooms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "capacity" INTEGER NOT NULL,
    "building" TEXT,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lessons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "day" "public"."Day" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "classId" INTEGER,
    "teacherId" TEXT NOT NULL,
    "classroomId" INTEGER,
    "scheduleDraftId" TEXT,
    "optionalSubjectId" INTEGER,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exams" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "lessonId" INTEGER NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assignments" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "lessonId" INTEGER NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."results" (
    "id" SERIAL NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "studentId" TEXT NOT NULL,
    "examId" INTEGER,
    "assignmentId" INTEGER,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendances" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "present" BOOLEAN NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" INTEGER NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."announcements" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "classId" INTEGER,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "classId" INTEGER,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schedule_drafts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "schoolConfig" JSONB,
    "classes" JSONB,
    "subjects" JSONB,
    "teachers" JSONB,
    "classrooms" JSONB,
    "grades" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lesson_requirements" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "hours" INTEGER NOT NULL,
    "scheduleDraftId" TEXT,

    CONSTRAINT "lesson_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subject_requirements" (
    "id" SERIAL NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "allowedRoomIds" INTEGER[],
    "timePreference" "public"."TimePreference" NOT NULL DEFAULT 'ANY',
    "scheduleDraftId" TEXT,

    CONSTRAINT "subject_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teacher_constraints" (
    "id" SERIAL NOT NULL,
    "teacherId" TEXT NOT NULL,
    "day" "public"."Day" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "description" TEXT,
    "scheduleDraftId" TEXT,

    CONSTRAINT "teacher_constraints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teacher_assignments" (
    "id" SERIAL NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "scheduleDraftId" TEXT,

    CONSTRAINT "teacher_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_assignments" (
    "id" SERIAL NOT NULL,
    "teacherAssignmentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "class_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chatroom_sessions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "classId" INTEGER,
    "hostId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatroom_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_participants" (
    "id" TEXT NOT NULL,
    "chatroomSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "isMuted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."raised_hands" (
    "id" TEXT NOT NULL,
    "chatroomSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raised_hands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chatroom_messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "chatroomSessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatroom_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reactions" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatroomSessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."polls" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "votes" JSONB NOT NULL,
    "chatroomSessionId" TEXT NOT NULL,
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
    "chatroomSessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_TeacherSubjects" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TeacherSubjects_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_OptionalSubjectChoices" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OptionalSubjectChoices_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "public"."users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_userId_key" ON "public"."admins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_userId_key" ON "public"."teachers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "public"."students"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "parents_userId_key" ON "public"."parents"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "grades_level_key" ON "public"."grades"("level");

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_key" ON "public"."classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_drafts_userId_name_key" ON "public"."schedule_drafts"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "subject_requirements_subjectId_key" ON "public"."subject_requirements"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_assignments_teacherId_subjectId_key" ON "public"."teacher_assignments"("teacherId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "class_assignments_teacherAssignmentId_classId_key" ON "public"."class_assignments"("teacherAssignmentId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "session_participants_chatroomSessionId_userId_key" ON "public"."session_participants"("chatroomSessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "raised_hands_chatroomSessionId_userId_key" ON "public"."raised_hands"("chatroomSessionId", "userId");

-- CreateIndex
CREATE INDEX "_TeacherSubjects_B_index" ON "public"."_TeacherSubjects"("B");

-- CreateIndex
CREATE INDEX "_OptionalSubjectChoices_B_index" ON "public"."_OptionalSubjectChoices"("B");
