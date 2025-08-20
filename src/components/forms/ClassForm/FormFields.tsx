import InputField from "@/components/InputField";
import { Label } from "@/components/ui/label";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { ClassSchema } from "@/lib/formValidationSchemas";
import { MultiSelectField } from "../MultiSelectField";

interface FormFieldsProps {
  register: UseFormRegister<ClassSchema>;
  errors: FieldErrors<ClassSchema>;
  isLoading: boolean;
  grades: { id: number; level: number }[];
  students: { id: string; name: string; surname: string }[];
  setValue: UseFormSetValue<ClassSchema>;
  selectedStudents: string[];
}

const FormFields = ({ 
  register, 
  errors, 
  isLoading, 
  grades, 
  students,
  setValue,
  selectedStudents,
}: FormFieldsProps) => {

  const studentOptions = students.map(s => ({ value: s.id, label: `${s.name} ${s.surname}` }));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Nom de la Classe"
          name="name"
          register={register as any}
          error={errors?.name}
          disabled={isLoading}
        />
        <InputField
          label="Capacité"
          name="capacity"
          type="number"
          register={register as any}
          error={errors?.capacity}
          disabled={isLoading}
        />
      </div>
      
      <MultiSelectField
        label="Élèves assignés"
        options={studentOptions}
        selected={selectedStudents}
        onChange={(selected) => setValue("studentIds", selected, { shouldValidate: true })}
        placeholder="Rechercher et sélectionner des élèves..."
        disabled={isLoading}
      />
    </>
  );
};

export default FormFields;
