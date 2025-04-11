
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Computer, Beaker, BookOpen, Users } from "lucide-react";
import { RoomType } from "@/data/models";

interface RoomTypeSelectorProps {
  selectedType: string;
  onChange: (type: string) => void;
  className?: string;
  includeAll?: boolean;
}

const RoomTypeSelector = ({ selectedType, onChange, className, includeAll = false }: RoomTypeSelectorProps) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {includeAll && (
        <Button
          variant={selectedType === "all" ? "default" : "outline"}
          size="sm"
          className="flex items-center"
          onClick={() => onChange("all")}
        >
          Toutes les salles
        </Button>
      )}
      <Button
        variant={selectedType === "computer_lab" ? "default" : "outline"}
        size="sm"
        className="flex items-center"
        onClick={() => onChange("computer_lab")}
      >
        <Computer className="mr-2 h-4 w-4" />
        Informatique
      </Button>
      <Button
        variant={selectedType === "science_lab" ? "default" : "outline"}
        size="sm"
        className="flex items-center"
        onClick={() => onChange("science_lab")}
      >
        <Beaker className="mr-2 h-4 w-4" />
        Laboratoire
      </Button>
      <Button
        variant={selectedType === "classroom" ? "default" : "outline"}
        size="sm"
        className="flex items-center"
        onClick={() => onChange("classroom")}
      >
        <BookOpen className="mr-2 h-4 w-4" />
        Classe
      </Button>
      <Button
        variant={selectedType === "meeting_room" ? "default" : "outline"}
        size="sm"
        className="flex items-center"
        onClick={() => onChange("meeting_room")}
      >
        <Users className="mr-2 h-4 w-4" />
        Réunion
      </Button>
    </div>
  );
};

export default RoomTypeSelector;
