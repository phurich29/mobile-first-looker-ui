
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, UserRole } from "../types";
import { UserRow } from "./UserRow";

interface UserTableProps {
  users: User[];
  isProcessing: boolean;
  isSuperAdmin: boolean;
  onApproveUser: (userId: string) => void;
  onOpenResetDialog: (userId: string, email: string) => void;
  onOpenDeleteDialog: (userId: string, email: string) => void;
  onChangeUserRole: (userId: string, role: UserRole, isAdding: boolean) => void;
}

export function UserTable({
  users,
  isProcessing,
  isSuperAdmin,
  onApproveUser,
  onOpenResetDialog,
  onOpenDeleteDialog,
  onChangeUserRole
}: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-2/3 py-1 text-xs">ข้อมูลผู้ใช้</TableHead>
            <TableHead className="w-1/3 text-right py-1 text-xs">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isSuperAdmin={isSuperAdmin}
              isProcessing={isProcessing}
              onApproveUser={onApproveUser}
              onOpenResetDialog={onOpenResetDialog}
              onOpenDeleteDialog={onOpenDeleteDialog}
              onChangeUserRole={onChangeUserRole}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
