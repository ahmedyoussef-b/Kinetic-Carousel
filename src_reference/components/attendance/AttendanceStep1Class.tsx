import React, { Dispatch, SetStateAction } from "react";
import { ClassData } from "./AttendanceManager";


interface AttendanceStep1ClassProps {
  classes: ClassData[]; // Changed type back to ClassData[]
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
  wizardData?: any;
  setWizardData?: Dispatch<SetStateAction<any>>; 
  nextStep?: () => void;
}

const AttendanceStep1Class: React.FC<AttendanceStep1ClassProps> = ({
  classes,
  selectedClassId,
  onSelectClass,
  wizardData,
  setWizardData,
  nextStep,
}) => {
  // Component logic here
  return <div>Attendance Step 1: Select Class</div>;
};

export default AttendanceStep1Class;
