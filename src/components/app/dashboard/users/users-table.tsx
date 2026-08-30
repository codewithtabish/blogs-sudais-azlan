// src/app/(pages)/dashboard/users/_components/user-table.tsx
import { UserListItem } from "@/app/actions/users/get-all-users-action";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UserTableProps = {
  users: UserListItem[];
};

const roleBadgeClasses: Record<string, string> = {
  ADMIN:
    "bg-amber-600/15 text-amber-700 hover:bg-amber-600/15 dark:bg-amber-500/15 dark:text-amber-400",
  USER: "bg-muted text-muted-foreground hover:bg-muted",
};

export function UserTable({ users }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">No users yet</p>
        <p className="text-sm text-muted-foreground">Users will appear here once they sign up.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Role</TableHead>
            <TableHead className="text-right">Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.firstName || "—"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="secondary"
                  className={roleBadgeClasses[user.role] ?? roleBadgeClasses.USER}
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }).format(new Date(user.createdAt))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
