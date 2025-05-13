
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

interface ResponsiveTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ResponsiveTable({ children, className, ...props }: ResponsiveTableProps) {
  return (
    <div className={cn("w-full overflow-auto rounded-md border", className)} {...props}>
      <Table>{children}</Table>
    </div>
  );
}

ResponsiveTable.displayName = "ResponsiveTable";
