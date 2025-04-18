
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TeacherFilterSelectProps {
  type: 'department' | 'class';
  items: Array<{ id: string; name: string }>;
  onChange: (value: string) => void;
}

export const TeacherFilterSelect = ({ type, items, onChange }: TeacherFilterSelectProps) => {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder={`Filtrer par ${type === 'department' ? 'département' : 'classe'}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Tous</SelectItem>
        {items.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
