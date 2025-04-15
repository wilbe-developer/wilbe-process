
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Module } from "@/types";

interface ModuleSelectProps {
  modules: Module[];
  value: string;
  onChange: (value: string) => void;
}

const ModuleSelect = ({ modules, value, onChange }: ModuleSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a module" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Videos</SelectItem>
        {modules.map((module) => (
          <SelectItem key={module.id} value={module.id}>
            {module.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ModuleSelect;
