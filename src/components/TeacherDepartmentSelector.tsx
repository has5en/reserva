
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getDepartments } from '@/services/departments/departmentService';
import { Department } from '@/data/models';

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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();

    if (defaultValue) {
      onChange(defaultValue);
    }
  }, [defaultValue]);

  return (
    <div className={className}>
      {label && <Label htmlFor="department-select" className="mb-1 block">{label}</Label>}
      <Select onValueChange={onChange} defaultValue={defaultValue || undefined} disabled={loading}>
        <SelectTrigger id="department-select">
          <SelectValue placeholder={loading ? "Chargement..." : "Sélectionner un département"} />
        </SelectTrigger>
        <SelectContent>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {loading && <p className="text-xs text-muted-foreground mt-1">Chargement des départements...</p>}
    </div>
  );
};

export default TeacherDepartmentSelector;
