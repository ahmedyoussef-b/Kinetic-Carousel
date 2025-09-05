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
    const fieldsToParse: (keyof WizardData | 'rooms' | 'schoolConfig')[] = ['schoolConfig', 'classes', 'subjects', 'teachers', 'rooms', 'grades'];
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

    // Ensure that 'teachers' is an array, converting from an object if necessary.
    if (parsedData.teachers && typeof parsedData.teachers === 'object' && !Array.isArray(parsedData.teachers)) {
        parsedData.teachers = Object.values(parsedData.teachers);
    }


    // Ensure school config has default values if they are missing after parsing
    const defaultSchoolConfig = {
      name: "Collège Riadh 5",
      startTime: '08:00',
      endTime: '18:00',
      sessionDuration: 60,
      schoolDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    };

    parsedData.school = { ...defaultSchoolConfig, ...(parsedData.schoolConfig || {}) };
    // Map rooms to classrooms for consistency
    parsedData.classrooms = parsedData.rooms || [];
    delete parsedData.schoolConfig; // Remove the redundant field
    delete parsedData.rooms;

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
                teacherAssignments: true,
            },
        });

        if (activeDraft) {
            console.log("✅ [Data-Fetching] Active draft found, returning parsed draft data.");
            const parsedDraft = parseJsonFields(activeDraft);
            
            const students = await prisma.student.findMany({ include: { optionalSubjects: true } });

            // Correctly format teachers to include _count
            const teachers: TeacherWithDetails[] = await Promise.all((parsedDraft.teachers || []).map(async (t: any) => {
                const totalLessons = (parsedDraft.lessons || []).filter((l: Lesson) => l.teacherId === t.id).length;
                const classIds = new Set((parsedDraft.lessons || []).filter((l: Lesson) => l.teacherId === t.id).map((l: Lesson) => l.classId));
                return {
                    ...t,
                    classes: [], // Simplified for now, as this is complex to reconstruct from JSON
                    _count: {
                        subjects: (t.subjects || []).length,
                        classes: classIds.size,
                        lessons: totalLessons
                    },
                };
            }));

            return toSerializable({
                scheduleDraftId: parsedDraft.id,
                school: parsedDraft.school,
                classes: parsedDraft.classes || [],
                subjects: parsedDraft.subjects || [],
                teachers: teachers, // Use the correctly formatted teachers array
                rooms: parsedDraft.classrooms || [],
                grades: parsedDraft.grades || [],
                students: students,
                lessonRequirements: parsedDraft.lessonRequirements || [],
                teacherConstraints: parsedDraft.teacherConstraints || [],
                subjectRequirements: parsedDraft.subjectRequirements || [],
                teacherAssignments: parsedDraft.teacherAssignments || [],
                schedule: parsedDraft.lessons || [],
            });
        }
    }

    // 2. If no active draft, or no user, fetch from the "live" tables
    console.log("ℹ️ [Data-Fetching] No active draft found. Fetching live data from DB.");
    const [
      classes,
      subjects,
      teachersFromDb,
      rooms,
      grades,
      students,
      lessons
    ] = await Promise.all([
      prisma.class.findMany({ include: { grade: true, _count: { select: { students: true, lessons: true } } } }),
      prisma.subject.findMany({orderBy: {name: 'asc'}}),
      prisma.teacher.findMany({ include: { user: true, subjects: true, lessons: { select: { classId: true }, distinct: ['classId'] } } }),
      prisma.classroom.findMany({orderBy: {name: 'asc'}}),
      prisma.grade.findMany({orderBy: {level: 'asc'}}),
      prisma.student.findMany({ include: { optionalSubjects: true } }), // Fetch students with their optional subjects
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
      name: "Collège Riadh 5",
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
