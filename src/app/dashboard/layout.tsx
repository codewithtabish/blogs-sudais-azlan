// src/app/dashboard/layout.tsx
import DashboardSidebar from "@/components/app/dashboard/sidebar/app-sidebar";
import { SecondContainer } from "@/components/app/general/layouts/second-container";
import type { ReactNode } from "react";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <SecondContainer>{children}</SecondContainer>
      </main>
    </div>
  );
};

export default DashboardLayout;
