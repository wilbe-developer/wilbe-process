
import { useState, useRef, useEffect } from "react";
import { Check, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export const MultiSelect = ({ options, selected, onChange, placeholder = "Search..." }: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const removeOption = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="relative" ref={ref}>
      <div 
        className="border rounded-md p-1 flex flex-wrap gap-1 min-h-10 cursor-text"
        onClick={() => setOpen(true)}
      >
        {selected.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-1">
              {selected.map((value) => (
                <Badge key={value} variant="secondary" className="flex items-center gap-1">
                  {options.find(option => option.value === value)?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(value);
                    }}
                  />
                </Badge>
              ))}
            </div>
            <div className="ml-auto flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-1"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
              >
                Clear
              </Button>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground px-2 py-1.5 flex items-center gap-2">
            <Search className="h-4 w-4" />
            {placeholder}
          </div>
        )}
      </div>
      
      {open && (
        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md">
          <div className="p-2">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border"
              autoFocus
            />
          </div>
          <Command>
            <CommandList className="max-h-60 overflow-auto">
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border ${
                        selected.includes(option.value) ? "bg-primary border-primary" : "border-input"
                      }`}
                    >
                      {selected.includes(option.value) && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};
