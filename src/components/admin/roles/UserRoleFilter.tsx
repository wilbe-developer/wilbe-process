
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/types";

interface UserRoleFilterProps {
  filter: UserRole | 'all';
  onFilterChange: (value: UserRole | 'all') => void;
}

const UserRoleFilter = ({ filter, onFilterChange }: UserRoleFilterProps) => {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium text-gray-700 mb-1 block">Filter by role</label>
      <Select
        value={filter}
        onValueChange={(value) => onFilterChange(value as UserRole | 'all')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          <SelectItem value="admin">Admins</SelectItem>
          <SelectItem value="user">Members</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserRoleFilter;
