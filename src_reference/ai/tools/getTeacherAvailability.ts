// src/ai/tools/getTeacherAvailability.ts
import { Day } from '@prisma/client';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { timeToMinutes } from '@/lib/time-utils';

const GetTeacherAvailabilityInputSchema = z.object({
  day: z.nativeEnum(Day).describe("The day of the week to check for availability."),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).describe("The start of the time slot in HH:mm format."),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).describe("The end of the time slot in HH:mm format."),
});

type AvailableTeacher = {
  id: string;
  name: string;
  surname: string;
  subjectsTaught: string[];
};

export const getTeacherAvailability = ai.defineTool({
  name: 'getTeacherAvailability',
  description: 'Retrieves available teachers for a specific day and time range, considering their existing lesson schedules.',
  inputSchema: GetTeacherAvailabilityInputSchema,
  outputSchema: z.array(z.object({
    id: z.string(),
    name: z.string(),
    surname: z.string(),
    subjectsTaught: z.array(z.string()),
  })),
}, async (input) => {
  const { day, startTime, endTime } = input;
  
  const allTeachers = await prisma.teacher.findMany({
    include: {
      lessons: { where: { day } },
      subjects: { select: { name: true } },
    },
  });

  const slotStartMinutes = timeToMinutes(startTime);
  const slotEndMinutes = timeToMinutes(endTime);

  const availableTeachers: AvailableTeacher[] = allTeachers.filter(teacher => {
    return !teacher.lessons.some(lesson => {
      const lessonStartMinutes = lesson.startTime.getUTCHours() * 60 + lesson.startTime.getUTCMinutes();
      const lessonEndMinutes = lesson.endTime.getUTCHours() * 60 + lesson.endTime.getUTCMinutes();
      
      // Check for overlap
      return slotStartMinutes < lessonEndMinutes && slotEndMinutes > lessonStartMinutes;
    });
  }).map(t => ({
      id: t.id,
      name: t.name,
      surname: t.surname,
      subjectsTaught: t.subjects.map(s => s.name),
  }));

  return availableTeachers;
});
