//src/components/forms/StudentForm/useStudentForm.ts
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { SubmitHandler, UseFormRegister, UseFormHandleSubmit, FieldErrors, UseFormSetValue } from "react-hook-form";
import type { StudentSchema, StudentFormProps } from "@/types/index";
import { studentSchema } from "@/lib/formValidationSchemas";
import {
  useCreateStudentMutation,
  useUpdateStudentMutation,
} from "@/lib/redux/api/entityApi"; 
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { toast } from "@/hooks/use-toast";
import * as paths from "@/lib/image-paths";

export interface StudentFormReturn {
  register: UseFormRegister<StudentSchema>;
  handleSubmit: UseFormHandleSubmit<StudentSchema>;
  errors: FieldErrors<StudentSchema>;
  isLoading: boolean;
  onSubmit: SubmitHandler<StudentSchema>;
  setValue: UseFormSetValue<StudentSchema>;
  imgPreview: string | null | undefined;
  createErrorData: FetchBaseQueryError | SerializedError | undefined;
  updateErrorData: FetchBaseQueryError | SerializedError | undefined;
}

const useStudentForm = ({
  type,
  data,
  setOpen,
}: StudentFormProps): StudentFormReturn => {
  const router = useRouter();

  const [createStudent, {
    isLoading: isCreating,
    isSuccess: createSuccess,
    isError: createIsError,
    error: createErrorData
  }] = useCreateStudentMutation();

  const [updateStudent, {
    isLoading: isUpdating,
    isSuccess: updateSuccess,
    isError: updateIsError,
    error: updateErrorData
  }] = useUpdateStudentMutation();

  const isLoading = isCreating || isUpdating;

  const form = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
    defaultValues: data ? {
      ...data,
      birthday: data.birthday ? new Date(data.birthday).toISOString().split('T')[0] as any : '', 
      classId: data.classId ?? undefined, 
      gradeId: data.gradeId ?? undefined, 
      parentId: data.parentId ?? undefined, 
    } : {},
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;
  const [imgPreview, setImgPreview] = useState<string | null | undefined>(data?.img || paths.noAvatarIcon);
  const watchedImg = watch("img");

  useEffect(() => {
    if (data?.img) { 
      setImgPreview(data.img);
    }
  }, [data]);

  const onSubmit: SubmitHandler<StudentSchema> = async (formData) => {
    try {
      if (type === "create") {
        await createStudent(formData).unwrap();
      } else if (data?.id) {
        await updateStudent({ ...formData, id: data.id }).unwrap();
      }
      setOpen(false);
      router.refresh();
      toast({
        title: `${type === "create" ? "Étudiant créé" : "Étudiant mis à jour"} avec succès !`,
      });
    } catch (err) {
      // Error is handled by the useEffect below
    }
  };

  useEffect(() => {
      if (watchedImg && typeof watchedImg === 'string' && watchedImg !== imgPreview) {
          setImgPreview(watchedImg);
      }
  }, [watchedImg, imgPreview]);


  useEffect(() => {
    if (createIsError || updateIsError) {
      const apiError = (createErrorData || updateErrorData) as any;
      const errorMessage = apiError?.data?.message || `Failed to ${type === "create" ? "create" : "update"} student.`;
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    }
  }, [createIsError, updateIsError, createErrorData, updateErrorData, type]);

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isLoading,
    setValue,
    imgPreview,
    createErrorData: createErrorData as FetchBaseQueryError | SerializedError | undefined,
    updateErrorData: updateErrorData as FetchBaseQueryError | SerializedError | undefined,
  };
};

export default useStudentForm;
