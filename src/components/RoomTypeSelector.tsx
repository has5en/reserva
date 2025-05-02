
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Computer, Beaker, BookOpen, Users, Presentation, Swords, MapPin, GraduationCap } from "lucide-react";
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
        variant={selectedType === "classroom" ? "default" : "outline"}
        size="sm"
        className="flex items-center"
        onClick={() => onChange("classroom")}
      >
        <BookOpen className="mr-2 h-4 w-4" />
        Salle de classe
      </Button>
      <Button
        variant={selectedType === "training_room" ? "default" : "outline"}
        size="sm"
        className="flex items-center"
        onClick={() => onChange("training_room")}
      >
        <Presentation className="mr-2 h-4 w-4" />
        Salle de formation
      </Button>
      <Button
        variant={selectedType === "computer_lab" ? "default" : "outline"}
        size="sm"
        className="flex items-center"
        onClick={() => onChange("computer_lab")}
      >
        <Computer className="mr-2 h-4 w-4" />
        Laboratoire informatique
      </Button>
      <Button
        variant={selectedType === "science_lab" ? "default" : "outline"}
        size="sm"
        className="flex items-center"
        onClick={() => onChange("science_lab")}
      >
        <Beaker className="mr-2 h-4 w-4" />
        Laboratoire scientifique
      </Button>
      <Button
        variant={selectedType === "weapons_room" ? "default" : "outline"}
        size="sm"
        className="flex items-center"
        onClick={() => onChange("weapons_room")}
      >
        <Swords className="mr-2 h-4 w-4" />
        Salle d'armes
      </Button>
      <Button
        variant={selectedType === "tactical_room" ? "default" : "outline"}
        size="sm"
        className="flex items-center"
        onClick={() => onChange("tactical_room")}
      >
        <MapPin className="mr-2 h-4 w-4" />
        Salle tactique
      </Button>
      <Button
        variant={selectedType === "meeting_room" ? "default" : "outline"}
        size="sm"
        className="flex items-center"
        onClick={() => onChange("meeting_room")}
      >
        <Users className="mr-2 h-4 w-4" />
        Salle de réunion
      </Button>
    </div>
  );
};

export default RoomTypeSelector;
