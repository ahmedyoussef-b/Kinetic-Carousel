import type { Dispatch, SetStateAction, BaseSyntheticEvent } from "react";
import type { UseFormRegister, FieldErrors, SubmitHandler, UseFormHandleSubmit } from "react-hook-form";
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { AssignmentSchema } from '@/types/schemas';


export interface AssignmentFormProps {
  type: "create" | "update";
  data?: any; // Consider replacing with a more specific type
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { lessons: { id: number; name: string }[] };
}

export interface AssignmentFormReturn {
  register: UseFormRegister<AssignmentSchema>;
  errors: FieldErrors<AssignmentSchema>;
  isLoading: boolean;
  handleSubmit: UseFormHandleSubmit<AssignmentSchema>;
  actualOnSubmit: SubmitHandler<AssignmentSchema>;
  createIsError: boolean;
  updateIsError: boolean;
  createErrorData: FetchBaseQueryError | SerializedError | undefined;
  updateErrorData: FetchBaseQueryError | SerializedError | undefined;
}
