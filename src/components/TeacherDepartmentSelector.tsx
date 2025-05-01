
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TeacherDepartmentSelectorProps {
  onChange: (department: string) => void;
  defaultValue?: string;
  label?: string;
  className?: string;
}

export const TeacherDepartmentSelector = ({ 
  onChange, 
  defaultValue = '',
  label = 'Département',
  className = ''
}: TeacherDepartmentSelectorProps) => {
  const [departments, setDepartments] = useState([
    { id: 'police', name: 'Police' },
    { id: 'gendarmerie', name: 'Gendarmerie' },
    { id: 'militaire', name: 'Forces Armées' },
    { id: 'securite', name: 'Sécurité Civile' },
    { id: 'autre', name: 'Autre' }
  ]);

  useEffect(() => {
    if (defaultValue) {
      onChange(defaultValue);
    }
  }, [defaultValue]);

  return (
    <div className={className}>
      {label && <Label htmlFor="department-select" className="mb-1 block">{label}</Label>}
      <Select onValueChange={onChange} defaultValue={defaultValue || undefined}>
        <SelectTrigger id="department-select">
          <SelectValue placeholder="Sélectionner un département" />
        </SelectTrigger>
        <SelectContent>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TeacherDepartmentSelector;
