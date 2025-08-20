//src/components/forms/SubjectForm/types.ts
import type { Dispatch, SetStateAction } from "react";
import type { Subject, Teacher } from "@/types/index";
import type { UseFormSetValue, UseFormRegister, UseFormHandleSubmit, FieldErrors, SubmitHandler } from "react-hook-form";
import type { SubjectSchema } from "@/lib/formValidationSchemas";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { UseMutation } from "@reduxjs/toolkit/dist/query/react/buildHooks";
import { MutationDefinition } from "@reduxjs/toolkit/query";

export interface SubjectFormProps {
  type: "create" | "update";
  data?: Subject & { teachers?: Pick<Teacher, 'id'>[] };
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { 
    teachers?: Teacher[];
  };
}

export interface UseSubjectFormProps extends SubjectFormProps {
    createSubject: UseMutation<MutationDefinition<any, any, any, any>>;
    updateSubject: UseMutation<MutationDefinition<any, any, any, any>>;
}


export interface SubjectFormReturn {
  register: UseFormRegister<SubjectSchema>;
  handleSubmit: UseFormHandleSubmit<SubjectSchema>;
  errors: FieldErrors<SubjectSchema>;
  setValue: UseFormSetValue<SubjectSchema>;
  selectedTeachers: string[];
  onSubmit: SubmitHandler<SubjectSchema>;
}
