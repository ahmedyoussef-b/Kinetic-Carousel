import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Day } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to adjust lesson dates to the current week
export const adjustScheduleToCurrentWeek = (lessons: any[]) => {
  if (!lessons) return [];

  const now = new Date();
  const currentDay = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  monday.setHours(0, 0, 0, 0);

  const dayMapping: Record<Day, number> = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
    SATURDAY: 5,
    SUNDAY: 6,
  };

  return lessons.map(lesson => {
    const lessonDate = new Date(monday);
    lessonDate.setDate(monday.getDate() + dayMapping[lesson.day as Day]);

    const start = new Date(lesson.startTime);
    const end = new Date(lesson.endTime);

    const adjustedStart = new Date(lessonDate);
    adjustedStart.setUTCHours(start.getUTCHours(), start.getUTCMinutes(), start.getUTCSeconds());

    const adjustedEnd = new Date(lessonDate);
    adjustedEnd.setUTCHours(end.getUTCHours(), end.getUTCMinutes(), end.getUTCSeconds());

    return {
      title: `${lesson.subject.name} (${lesson.class.name})`,
      start: adjustedStart,
      end: adjustedEnd,
    };
  });
};
