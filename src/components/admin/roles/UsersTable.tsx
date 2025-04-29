
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserProfile, UserRole } from "@/types";
import UserRoleRow from "./UserRoleRow";

interface UsersTableProps {
  users: UserProfile[];
  userRoles: Record<string, UserRole[]>;
  onRoleToggle: (userId: string, role: UserRole, hasRole: boolean) => Promise<void>;
}

const UsersTable = ({ users, userRoles, onRoleToggle }: UsersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Roles</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <UserRoleRow 
            key={user.id} 
            user={user} 
            userRoles={userRoles[user.id] || []} 
            onRoleToggle={onRoleToggle} 
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;
