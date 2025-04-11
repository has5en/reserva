
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Computer, Beaker, BookOpen, Users } from "lucide-react";

interface RoomTypeSelectorProps {
  selectedType: string;
  onChange: (type: string) => void;
  className?: string;
}

const RoomTypeSelector: React.FC<RoomTypeSelectorProps> = ({ 
  selectedType, 
  onChange,
  className
}) => {
  const types = [
    { id: 'computer_lab', name: 'Salle informatique', icon: Computer },
    { id: 'science_lab', name: 'Laboratoire scientifique', icon: Beaker },
    { id: 'classroom', name: 'Salle de classe', icon: BookOpen },
    { id: 'meeting_room', name: 'Salle de réunion', icon: Users }
  ];

  return (
    <div className={className}>
      <RadioGroup 
        value={selectedType}
        onValueChange={onChange}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {types.map((type) => {
          const Icon = type.icon;
          return (
            <div key={type.id} className="relative">
              <RadioGroupItem
                value={type.id}
                id={`room-type-${type.id}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`room-type-${type.id}`}
                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Icon className="mb-2 h-6 w-6" />
                <span className="text-center text-sm">{type.name}</span>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default RoomTypeSelector;
