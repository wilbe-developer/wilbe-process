
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/types";

interface UserRoleFilterProps {
  filter: UserRole | 'all';
  onFilterChange: (value: UserRole | 'all') => void;
  roleCounts?: Record<UserRole | 'all', number>;
}

const UserRoleFilter = ({ filter, onFilterChange, roleCounts = {} }: UserRoleFilterProps) => {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium text-gray-700 mb-1 block">Filter by role</label>
      <Select
        value={filter}
        onValueChange={(value) => onFilterChange(value as UserRole | 'all')}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users ({roleCounts['all'] || 0})</SelectItem>
          <SelectItem value="admin">Admins ({roleCounts['admin'] || 0})</SelectItem>
          <SelectItem value="user">Members ({roleCounts['user'] || 0})</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserRoleFilter;
