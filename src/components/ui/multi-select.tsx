
import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Sélectionner...",
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = (option: string) => {
    onChange(selected.filter((s) => s !== option));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "" && selected.length > 0) {
          onChange(selected.slice(0, -1));
        }
      }
      if (e.key === "Escape") {
        input.blur();
      }
    }
  };

  const selectables = options.filter((option) => !selected.includes(option.value));

  return (
    <div className={`border border-input p-1 rounded-md flex flex-wrap gap-1 relative ${className}`}>
      {selected.map((item) => {
        const option = options.find((o) => o.value === item);
        return (
          <Badge
            key={item}
            variant="secondary"
            className="rounded-sm"
          >
            {option?.label || item}
            <button
              className="ml-1 rounded-full outline-none inline-flex items-center justify-center hover:bg-muted/20"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUnselect(item);
                }
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={() => handleUnselect(item)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}
      <CommandPrimitive onKeyDown={handleKeyDown}>
        <div className="flex-1 flex items-center">
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={selected.length === 0 ? placeholder : ""}
            className="bg-transparent p-1 outline-none flex-1 text-sm"
          />
        </div>
        <div className="relative">
          {open && selectables.length > 0 && (
            <div className="absolute top-0 z-10 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none mt-2">
              <Command>
                <CommandGroup className="max-h-60 overflow-auto">
                  {selectables.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        onChange([...selected, option.value]);
                        setInputValue("");
                      }}
                      className={"cursor-pointer"}
                    >
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </div>
          )}
        </div>
      </CommandPrimitive>
    </div>
  );
}
