import type { Dispatch, SetStateAction } from "react";
import type { Student, LessonWithDetails } from "@/types";

export interface AttendanceFormProps {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    students: Pick<Student, 'id' | 'name' | 'surname'>[];
    lessons: Pick<LessonWithDetails, 'id' | 'name'>[];
  };
}

export interface AttendanceFormReturn {
  register: any;
  handleSubmit: any;
  errors: any;
  isLoading: boolean;
  isPresent: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  setValue: any;
  createIsError: boolean;
  updateIsError: boolean;
  createErrorData: any;
  updateErrorData: any;
}