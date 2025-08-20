import InputField from "@/components/InputField";
import { Label } from "@/components/ui/label";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { ClassSchema } from "@/lib/formValidationSchemas";

interface FormFieldsProps {
  register: UseFormRegister<ClassSchema>;
  errors: FieldErrors<ClassSchema>;
  isLoading: boolean;
  grades: { id: number; level: number }[];
}

const FormFields = ({ register, errors, isLoading, grades }: FormFieldsProps) => {
  return (
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
      <div className="flex flex-col gap-2 w-full">
        <Label>Niveau</Label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full disabled:opacity-50"
          {...register("gradeLevel")}
          disabled={isLoading}
        >
          <option value="">Sélectionner un niveau</option>
          {grades.map((grade) => (
            <option value={grade.level} key={grade.id}>
              {grade.level}
            </option>
          ))}
        </select>
        {errors.gradeLevel?.message && (
          <p className="text-xs text-red-400">
            {errors.gradeLevel.message?.toString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormFields;
