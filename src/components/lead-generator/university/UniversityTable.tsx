
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UniversityRow } from "./UniversityRow";
import { University } from "./types";

interface UniversityTableProps {
  universities: University[];
  loading: boolean;
  onToggleDefault: (university: University) => void;
  onUpdateDomain: (university: University, domain: string) => void;
  onUpdateROR: (university: University, ror: string) => void;
  onDelete: (id: string) => void;
}

export const UniversityTable = ({
  universities,
  loading,
  onToggleDefault,
  onUpdateDomain,
  onUpdateROR,
  onDelete,
}: UniversityTableProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>University Name</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>OpenAlex ROR</TableHead>
            <TableHead className="w-[120px] text-center">Default</TableHead>
            <TableHead className="w-[100px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {universities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No universities found
              </TableCell>
            </TableRow>
          ) : (
            universities.map((university) => (
              <UniversityRow
                key={university.id}
                university={university}
                onToggleDefault={onToggleDefault}
                onUpdateDomain={onUpdateDomain}
                onUpdateROR={onUpdateROR}
                onDelete={onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UniversityTable;
