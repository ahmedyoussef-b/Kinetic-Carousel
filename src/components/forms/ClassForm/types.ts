import type { Dispatch, SetStateAction } from "react";

export interface ClassFormProps {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { 
    grades: { id: number; level: number }[]
  };
}

export interface ClassFormReturn {
  register: any;
  handleSubmit: any;
  errors: any;
  isLoading: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  createIsError: boolean;
  updateIsError: boolean;
  createErrorData: any;
  updateErrorData: any;
}