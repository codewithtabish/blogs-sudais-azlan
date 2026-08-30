// src/app/(pages)/dashboard/users/page.tsx
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getAllUsersAction } from "@/app/actions/users/get-all-users-action";
import { UserTable } from "@/components/app/dashboard/users/users-table";

const DashboardUsersPage = async () => {
  const result = await getAllUsersAction();
  const users = result.success ? result.users : [];

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-semibold">Users</h1>

      {!result.success && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {result.error}
        </p>
      )}

      <UserTable users={users} />
    </div>
  );
};

export default DashboardUsersPage;
