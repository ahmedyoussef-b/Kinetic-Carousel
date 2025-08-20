// src/ai/flows/find-replacement-teacher.ts
'use server';

import { Day } from '@prisma/client';
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import prisma from '../../lib/prisma';
import { getTeacherAvailability } from '../tools/getTeacherAvailability';

const FindReplacementTeacherInputSchema = z.object({
  absentTeacherId: z.string(),
  date: z.string().describe("The date of absence, in 'YYYY-MM-DD' format."),
});
export type FindReplacementTeacherInput = z.infer<typeof FindReplacementTeacherInputSchema>;

const FindReplacementTeacherOutputSchema = z.object({
  suggestions: z.array(z.object({
    lessonId: z.number(),
    lessonName: z.string(),
    subjectName: z.string(),
    time: z.string().describe("e.g., '09:00 - 10:00'"),
    suggestedReplacements: z.array(z.object({
      teacherId: z.string(),
      name: z.string(),
      reason: z.string().describe("A brief, logical reason for the suggestion."),
    })),
    alternativeSolution: z.string().optional().describe("A practical alternative if no teacher is found."),
  })),
});
export type FindReplacementTeacherOutput = z.infer<typeof FindReplacementTeacherOutputSchema>;


export async function findReplacementTeacher(input: FindReplacementTeacherInput): Promise<FindReplacementTeacherOutput> {
  return findReplacementTeacherFlow(input);
}


const findReplacementTeacherFlow = ai.defineFlow(
  {
    name: 'findReplacementTeacherFlow',
    inputSchema: FindReplacementTeacherInputSchema,
    outputSchema: FindReplacementTeacherOutputSchema,
  },
  async ({ absentTeacherId, date }) => {
    
    const dayOfWeek = new Date(date).getDay();
    const dayMapping: Day[] = [Day.SUNDAY, Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY, Day.SATURDAY];
    const day: Day = dayMapping[dayOfWeek];

    if (!day) {
      throw new Error("Invalid date provided.");
    }

    const absentTeacher = await prisma.teacher.findUnique({ where: { id: absentTeacherId }});
    if (!absentTeacher) throw new Error("Absent teacher not found.");
    
    const lessons = await prisma.lesson.findMany({
      where: { teacherId: absentTeacherId, day },
      include: { subject: true },
      orderBy: { startTime: 'asc' },
    });

    if (lessons.length === 0) {
      return { suggestions: [] };
    }

    const formattedLessons = lessons.map(lesson => ({
      lessonId: lesson.id,
      lessonName: lesson.name,
      startTime: lesson.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: lesson.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    }));
    
    
  const { output } = await ai.generate({
    prompt: `The teacher ${absentTeacher.name} ${absentTeacher.surname} is absent today, ${date}.
    They have the following lessons that need coverage:
    ${JSON.stringify(formattedLessons, null, 2)}

    Use the 'getTeacherAvailability' tool to find available teachers for today.
    Then, for each lesson needing coverage, suggest 1-2 suitable replacement teachers from the list of available teachers.
    Provide a brief reason for each suggestion.`,
    tools: [getTeacherAvailability], // Pass the tool in the tools array
    output: {
      schema: FindReplacementTeacherOutputSchema,
    },
  });

    if (!output) {
      throw new Error("Failed to generate replacement suggestions.");
    }

    return output;
  }
);
