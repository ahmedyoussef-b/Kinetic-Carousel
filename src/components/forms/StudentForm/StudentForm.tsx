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

  // Create a flattened object for the form, converting nulls to undefined
  // to match Zod's optional field expectations and prevent type errors.
  const studentDataForFields = data ? {
    ...data,
    username: data.user?.username ?? '',
    email: data.user?.email ?? '',
    classId: data.classId ?? undefined,
    gradeId: data.gradeId ?? undefined,
    parentId: data.parentId ?? undefined,
    phone: data.phone ?? undefined,
    address: data.address ?? undefined,
    img: data.img ?? undefined,
    bloodType: data.bloodType ?? undefined,
    birthday: data.birthday ? new Date(data.birthday) : undefined,
    sex: data.sex ?? undefined,
  } : undefined;


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
        data={studentDataForFields}
      />
      {(createErrorData || updateErrorData) && (
        <span className="text-red-500 text-sm mt-2">
          Erreur: {(createErrorData as any)?.data?.message || 
                  (updateErrorData as any)?.data?.message || 
                  "Une erreur s'est produite."}
        </span>
      )}
      <Button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    </form>
  );
};

export default StudentForm;
