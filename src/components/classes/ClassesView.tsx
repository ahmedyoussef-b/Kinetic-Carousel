// src/components/classes/ClassesView.tsx
'use client'; 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FormContainer from "@/components/FormContainer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Layers3, Users, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import GradeCard from "@/components/classes/GradeCard";
import type { GradeWithCounts, ClassWithDetails } from '@/app/(dashboard)/list/classes/page';
import { Role as AppRole } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ClassesViewProps {
    grades: GradeWithCounts[];
    classes: ClassWithDetails[];
    userRole?: AppRole;
    initialGradeIdParam: string | null;
    isTeacherFilteredView: boolean;
    teacherName?: string;
}

const DetailCard = ({ title, count, icon: Icon, href }: { title: string, count: number, icon: React.ElementType, href: string }) => (
    <Link href={href} className="block group">
        <Card className="h-full shadow-lg hover:shadow-xl hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {title}
                    </CardTitle>
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
               <p className="text-4xl font-bold text-foreground">{count}</p>
               <p className="text-sm text-muted-foreground mt-1">
                 {count > 1 ? 'éléments' : 'élément'}
               </p>
            </CardContent>
        </Card>
    </Link>
);


const ClassesView: React.FC<ClassesViewProps> = ({ grades, classes, userRole, initialGradeIdParam, isTeacherFilteredView, teacherName }) => {
  const router = useRouter();
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(initialGradeIdParam ? Number(initialGradeIdParam) : null);

  const selectedGrade = selectedGradeId ? grades.find(g => g.id === selectedGradeId) : null;
  const classesInGrade = selectedGradeId ? classes.filter(c => c.gradeId === selectedGradeId) : [];
  
  const handleGradeSelect = (gradeId: number) => {
    setSelectedGradeId(gradeId);
  };
  
  const handleBackToGrades = () => {
    setSelectedGradeId(null);
  };

  if (isTeacherFilteredView) {
    return (
       <div className="p-4 md:p-6 animate-in fade-in-0 duration-500">
        <div className="flex items-center justify-between mb-6">
           <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">
            {`Classes de ${teacherName}`} 
          </h1>
          <div></div>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Aucune classe assignée à cet enseignant.</p> 
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {classes.map((classItem) => (
              <ClassCard key={classItem.id} classItem={classItem}  />
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // MAIN VIEW
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Layers3 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Niveaux Scolaires</h1> 
              <p className="text-muted-foreground text-sm">Organisez et gérez les niveaux et les classes de votre établissement.</p>
            </div>
        </div>
        {!selectedGradeId && userRole === AppRole.ADMIN && (
          <FormContainer table="grade" type="create" />
        )}
         {selectedGradeId && (
            <Button variant="outline" size="sm" onClick={handleBackToGrades}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux Niveaux 
            </Button>
         )}
      </div>
      
      {/* GRADES GRID */}
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-500",
         selectedGradeId ? 'grid-rows-1' : ''
      )}>
        {grades.map((grade) => ( 
          <div
            key={grade.id}
            className={cn(
              "transition-all duration-500 ease-in-out",
              selectedGradeId && selectedGradeId !== grade.id ? "opacity-0 scale-90" : "opacity-100 scale-100",
              selectedGradeId === grade.id ? "col-span-full" : ""
            )}
          >
            <GradeCard 
              grade={grade} 
              userRole={userRole} 
              onSelect={() => handleGradeSelect(grade.id)}
              isSelected={selectedGradeId === grade.id}
            />
          </div>
        ))}
        {grades.length === 0 && !selectedGradeId && (
            <div className="col-span-full text-center py-16 bg-muted/50 rounded-lg">
                <p className="text-lg text-muted-foreground">Aucun niveau trouvé.</p> 
                {userRole === AppRole.ADMIN && <p className="text-sm mt-2 text-muted-foreground">Pensez à ajouter le premier niveau pour commencer.</p>} 
            </div>
        )}
      </div>
      
       {/* DETAIL CARDS (Conditional Rendering) */}
      {selectedGrade && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in-50 duration-500">
              <DetailCard 
                  title="Classes" 
                  count={selectedGrade._count.classes} 
                  icon={Layers3}
                  href={`/list/classes?viewGradeId=${selectedGrade.id}`}
              />
              <DetailCard 
                  title="Professeurs" 
                  count={selectedGrade.teachers?.length || 0}
                  icon={Users}
                  href={`/list/teachers?gradeId=${selectedGrade.id}`}
              />
              <DetailCard 
                  title="Élèves" 
                  count={selectedGrade._count.students}
                  icon={GraduationCap}
                  href={`/list/students?gradeId=${selectedGrade.id}`}
              />
          </div>
      )}
    </div>
  );
};

export default ClassesView;
