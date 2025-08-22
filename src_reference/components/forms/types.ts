// src/components/forms/types.ts
import type { EntityType } from "@/lib/redux/api/entityApi/config";

// This is the new centralized type definition for the props.
export interface FormContainerProps {
  table: EntityType;
  type: "create" | "update" | "delete";
  data?: any; // The initial data for an "update" form.
  id?: string | number; // The ID for a "delete" operation.
  relatedData?: any; // Any extra data the form might need (e.g., list of teachers for a subject form).
}
