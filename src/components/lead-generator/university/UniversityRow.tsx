
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableRow, TableCell } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { University } from "./types";

interface UniversityRowProps {
  university: University;
  onToggleDefault: (university: University) => void;
  onUpdateDomain: (university: University, domain: string) => void;
  onUpdateROR: (university: University, ror: string) => void;
  onDelete: (id: string) => void;
}

export const UniversityRow = ({ 
  university, 
  onToggleDefault, 
  onUpdateDomain, 
  onUpdateROR, 
  onDelete 
}: UniversityRowProps) => {
  const [domainValue, setDomainValue] = useState(university.domain || "");
  const [rorValue, setRorValue] = useState(university.openalex_ror || "");

  return (
    <TableRow>
      <TableCell>{university.name}</TableCell>
      <TableCell>
        <Input
          value={domainValue}
          onChange={(e) => setDomainValue(e.target.value)}
          placeholder="e.g., university.edu"
          className="max-w-xs"
          onBlur={() => {
            if (domainValue !== university.domain) {
              onUpdateDomain(university, domainValue);
            }
          }}
        />
      </TableCell>
      <TableCell>
        <Input
          value={rorValue}
          onChange={(e) => setRorValue(e.target.value)}
          placeholder="OpenAlex ROR ID"
          className="max-w-xs"
          onBlur={() => {
            if (rorValue !== university.openalex_ror) {
              onUpdateROR(university, rorValue);
            }
          }}
        />
      </TableCell>
      <TableCell className="text-center">
        <Checkbox
          checked={university.is_default}
          onCheckedChange={() => onToggleDefault(university)}
        />
      </TableCell>
      <TableCell className="text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(university.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default UniversityRow;
