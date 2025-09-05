import AttendanceManager from "@/components/attendance/AttendanceManager";
import prisma from "@/lib/prisma";
import { Day } from "@/types";

export const dynamic = 'force-dynamic';

const AttendancePage = async () => {
  type LessonData = {
    id: number;
    classId: number | null;
    name: string;
    day: Day;
    startTime: Date;
    endTime: Date;
    subjectId: number;
    teacherId: string;
    classroomId: number | null;
    subject: { id: number; name: string; };
  };

  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      students: {
        select: {
          id: true,
          name: true,
          surname: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Fetch lessons with subject details included
  const lessons: LessonData[] = await prisma.lesson.findMany({
    select: { 
      id: true,
      classId: true,
      name: true, // Assuming lesson has a name field
      day: true,
      startTime: true,
      endTime: true,
      subjectId: true,
      teacherId: true,
      classroomId: true,
      subject: {
        select: { id: true, name: true },
      },
    },
    orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
  });


  return (
    <div className="p-4 md:p-6">
      <AttendanceManager classes={classes} lessons={lessons} />
    </div>
  );
};

export default AttendancePage;
