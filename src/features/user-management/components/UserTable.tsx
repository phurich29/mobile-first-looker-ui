
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRow } from "./UserRow";
import { User, UserRole } from "../types";
import { useTranslation } from "@/hooks/useTranslation";

interface UserTableProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  isProcessing: boolean;
  isSuperAdmin: boolean;
  onApproveUser: (userId: string) => void;
  onOpenResetDialog: (userId: string, email: string) => void;
  onOpenDeleteDialog: (userId: string, email: string) => void;
  onChangeUserRole: (userId: string, role: UserRole, isAdding: boolean) => void;
}

export function UserTable({
  users,
  setUsers,
  isProcessing,
  isSuperAdmin,
  onApproveUser,
  onOpenResetDialog,
  onOpenDeleteDialog,
  onChangeUserRole
}: UserTableProps) {
  const { t } = useTranslation();
  return (
    <Table>
      <TableHeader>
        <TableRow className="dark:border-slate-700">
          <TableHead className="text-xs font-medium text-gray-900 dark:text-gray-200">{t('userManagement', 'userTableUser')}</TableHead>
          <TableHead className="text-xs font-medium text-gray-900 dark:text-gray-200 text-right">{t('userManagement', 'userTableActions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            users={users}
            setUsers={setUsers}
            isSuperAdmin={isSuperAdmin}
            onApproveUser={onApproveUser}
            onOpenResetDialog={onOpenResetDialog}
            onOpenDeleteDialog={onOpenDeleteDialog}
          />
        ))}
      </TableBody>
    </Table>
  );
}
