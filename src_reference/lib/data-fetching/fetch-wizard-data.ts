// src/lib/data-fetching/fetch-wizard-data.ts
import prisma from "@/lib/prisma";
import type { WizardData, ClassWithGrade, TeacherWithDetails, Subject, Classroom, Grade, LessonRequirement, TeacherConstraint, SubjectRequirement, TeacherAssignment, SchoolData, Lesson, Student } from '@/types';
import { getServerSession } from "../auth-utils";

// Helper function to make an object serializable
const toSerializable = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        // Convert Date objects to ISO strings
        if (value && typeof value === 'object' && value.constructor === Date) {
            return value.toISOString();
        }
        return value;
    }));
};

const parseJsonFields = (draft: any) => {
    const parsedData = { ...draft };
    const fieldsToParse: (keyof WizardData | 'rooms')[] = ['schoolConfig', 'classes', 'subjects', 'teachers', 'rooms', 'grades'];
    fieldsToParse.forEach(field => {
        if (typeof parsedData[field] === 'string') {
            try {
                parsedData[field] = JSON.parse(parsedData[field]);
            } catch (e) {
                console.warn(`Could not parse JSON for field ${field} in draft ${draft.id}:`, e);
                // Fallback to empty array or default object if parsing fails
                parsedData[field] = (field === 'schoolConfig') ? {} : []; 
            }
        }
    });

    // Ensure school config has default values if they are missing after parsing
    const defaultSchoolConfig = {
      name: "Collège Riadh 5",
      startTime: '08:00',
      endTime: '18:00',
      sessionDuration: 60,
      schoolDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    };

    parsedData.school = { ...defaultSchoolConfig, ...(parsedData.schoolConfig || {}) };
    parsedData.classrooms = parsedData.rooms || [];
    delete parsedData.schoolConfig; // Remove the redundant field
    delete parsedData.rooms; // Remove the old rooms field to avoid conflicts

    return parsedData;
};


export async function fetchAllDataForWizard(): Promise<WizardData> {
    const session = await getServerSession();
    const userId = session?.user?.id;

    if (userId) {
        // 1. Try to find an active draft for the current user
        const activeDraft = await prisma.scheduleDraft.findFirst({
            where: { userId, isActive: true },
            include: {
                lessons: true,
                lessonRequirements: true,
                teacherConstraints: true,
                subjectRequirements: true,
                teacherAssignments: { include: { classAssignments: { include: { class: true } } } },
            },
        });

        if (activeDraft) {
            console.log("✅ [Data-Fetching] Active draft found, returning parsed draft data.");
            const parsedDraft = parseJsonFields(activeDraft);
            const teacherAssignmentsWithClassIds = parsedDraft.teacherAssignments.map((a: any) => ({
                ...a,
                classIds: a.classAssignments.map((ca: any) => ca.classId),
            }));

            // Make sure students are fetched and added to the draft data
            const students = await prisma.student.findMany({ include: { optionalSubjects: true } });

            return toSerializable({
                scheduleDraftId: parsedDraft.id,
                school: parsedDraft.school,
                classes: parsedDraft.classes || [],
                subjects: parsedDraft.subjects || [],
                teachers: parsedDraft.teachers || [],
                rooms: parsedDraft.classrooms || [],
                grades: parsedDraft.grades || [],
                students: students,
                lessonRequirements: parsedDraft.lessonRequirements || [],
                teacherConstraints: parsedDraft.teacherConstraints || [],
                subjectRequirements: parsedDraft.subjectRequirements || [],
                teacherAssignments: teacherAssignmentsWithClassIds || [],
                schedule: parsedDraft.lessons || [],
            });
        }
    }

    // 2. If no active draft, or no user, fetch from the "live" tables
    console.log("ℹ️ [Data-Fetching] No active draft found. Fetching live data from DB.");
    const [
      school,
      classes,
      subjects,
      teachersFromDb,
      rooms,
      grades,
      students,
      lessons
    ] = await Promise.all([
      prisma.school.findFirst(),
      prisma.class.findMany({ include: { grade: true, _count: { select: { students: true, lessons: true } } } }),
      prisma.subject.findMany({orderBy: {name: 'asc'}}),
      prisma.teacher.findMany({ include: { user: true, subjects: true, lessons: { select: { classId: true }, distinct: ['classId'] } } }),
      prisma.classroom.findMany({orderBy: {name: 'asc'}}),
      prisma.grade.findMany({orderBy: {level: 'asc'}}),
      prisma.student.findMany({ include: { optionalSubjects: true } }), // Fetch students here
      prisma.lesson.findMany() // Fetch the "master" schedule
    ]);
    
    const teachers: TeacherWithDetails[] = await Promise.all(teachersFromDb.map(async (t) => {
        const classIds = new Set(t.lessons.map(l => l.classId));
        const totalLessons = await prisma.lesson.count({ where: { teacherId: t.id }});
        return {
        ...t,
        classes: [],
        _count: {
            subjects: t.subjects.length,
            classes: classIds.size,
            lessons: totalLessons
        },
        };
    }));

    const defaultSchoolConfig: SchoolData = {
      id: school?.id ? Number(school.id) : undefined,
      name: school?.name || "Collège Riadh 5",
      startTime: '08:00',
      endTime: '18:00',
      sessionDuration: 60,
      schoolDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      scheduleDraftId: null,
      schoolConfig: {}
    };

    return toSerializable({
        school: defaultSchoolConfig,
        classes: classes,
        subjects: subjects,
        teachers: teachers,
        rooms: rooms,
        grades: grades,
        students: students,
        lessonRequirements: [],
        teacherConstraints: [],
        subjectRequirements: [],
        teacherAssignments: [],
        schedule: lessons,
        scheduleDraftId: null,
    });
}
