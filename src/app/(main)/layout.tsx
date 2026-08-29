import { Container } from "@/components/app/general/layouts/container";
import React from "react";

const MainPublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <Container>{children}</Container>
    </main>
  );
};

export default MainPublicLayout;
