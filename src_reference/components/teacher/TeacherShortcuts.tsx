// src/components/teacher/TeacherShortcuts.tsx
import Link from "next/link";
import type { TeacherWithDetails } from "@/types/index";
import Performance from "../Performance";

interface TeacherShortcutsProps {
  teacherId: string;
}

export default function TeacherShortcuts({ teacherId }: TeacherShortcutsProps) {
  return (
    <>
      <div className="bg-white p-4 rounded-md">
        <h1 className="text-xl font-semibold">Raccourcis</h1>
        <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
          <Link
            className="p-3 rounded-md bg-lamaPurpleLight shadow-sm hover:shadow-md hover:scale-105 transform transition-all duration-200 ease-out"
            href={`/list/classes?teacherId=${teacherId}`}
          >
            Mes Classes
          </Link>
          <Link
            className="p-3 rounded-md bg-lamaYellowLight shadow-sm hover:shadow-md hover:scale-105 transform transition-all duration-200 ease-out"
            href={`/list/lessons?teacherId=${teacherId}`}
          >
            Mes Cours
          </Link>
          <Link
            className="p-3 rounded-md bg-pink-50 shadow-sm hover:shadow-md hover:scale-105 transform transition-all duration-200 ease-out"
            href={`/list/exams?teacherId=${teacherId}`}
          >
            Mes Examens
          </Link>
          <Link
            className="p-3 rounded-md bg-lamaSkyLight shadow-sm hover:shadow-md hover:scale-105 transform transition-all duration-200 ease-out"
            href={`/list/assignments?teacherId=${teacherId}`}
          >
            Mes Devoirs
          </Link>
        </div>
      </div>
      <Performance title="Performance" />
    </>
  );
}
