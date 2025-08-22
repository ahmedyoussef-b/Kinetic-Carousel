// src/components/forms/StudentForm/StudentForm.tsx
"use client";

import React from 'react';
import FormFields from "./FormFields";
import useStudentForm from "./useStudentForm";
import type { StudentFormProps } from "@/types";
import { Button } from '@/components/ui/button';

const StudentForm = ({ type, data, setOpen, relatedData }: StudentFormProps) => {

  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isLoading,
    setValue,
    imgPreview,
    createErrorData,
    updateErrorData,
  } = useStudentForm({ type, data, setOpen });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
       <h1 className="text-xl font-semibold">
        {type === "create" ? "Créer un Nouvel Étudiant" : "Mettre à jour l'Étudiant"}
      </h1>
      <FormFields
        register={register}
        errors={errors}
        isLoading={isLoading}
        setValue={setValue}
        imgPreview={imgPreview}
        relatedData={relatedData}
        type={type}
        data={data ? {
          email: '', // Add email with empty string
          username: '', // Add username with empty string
          classId: data.classId ?? 0, // Handle null classId and ensure it's a number
          gradeId: data.gradeId ?? 0, // Handle null gradeId and ensure it's a number
          parentId: data.parentId ?? '', // Handle null parentId and ensure it's a string
 ...(data as Omit<typeof data, 'classId' | 'gradeId' | 'parentId'>), // Spread data but omit classId, gradeId, and parentId
        } : undefined}
      />
      {(createErrorData || updateErrorData) && (
        <span className="text-red-500 text-sm mt-2">
          Erreur: {(createErrorData as any)?.data?.message || 
                  (updateErrorData as any)?.data?.message || 
                  "Une erreur s'est produite."}
        </span>
      )}
      <Button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
};

export default StudentForm;
