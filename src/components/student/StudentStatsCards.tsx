// src/components/student/StudentStatsCards.tsx
import type { StudentWithDetails } from "@/types/index";
import { BookCopy, GraduationCap, CalendarCheck } from "lucide-react";

interface StudentStatsCardsProps {
  student: StudentWithDetails;
}

export default function StudentStatsCards({ student }: StudentStatsCardsProps) {
  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="bg-card p-4 rounded-lg flex gap-4 w-full shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-muted/50">
        <GraduationCap className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-xl font-semibold">
            {student.grade?.level || 'N/A'}e
          </h1>
          <span className="text-sm text-gray-400">Niveau</span>
        </div>
      </div>
      <div className="bg-card p-4 rounded-lg flex gap-4 w-full shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-muted/50">
        <BookCopy className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-xl font-semibold">
            {student.class?._count.lessons || 'N/A'}
          </h1>
          <span className="text-sm text-gray-400">Cours</span>
        </div>
      </div>
      <div className="bg-card p-4 rounded-lg flex gap-4 w-full shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-muted/50">
        <CalendarCheck className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-xl font-semibold">{student.class?.name || 'N/A'}</h1>
          <span className="text-sm text-gray-400">Classe</span>
        </div>
      </div>
    </div>
  );
}
