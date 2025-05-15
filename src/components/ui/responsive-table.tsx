
import { cn } from "@/lib/utils";
import { Table } from "./table";

interface ResponsiveTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ResponsiveTable({ children, className, ...props }: ResponsiveTableProps) {
  return (
    <div className={cn("w-full overflow-x-auto", className)} {...props}>
      <Table className="min-w-full">{children}</Table>
    </div>
  );
}

ResponsiveTable.displayName = "ResponsiveTable";
