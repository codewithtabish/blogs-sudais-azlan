import { Suspense } from "react";

import { SecondContainer } from "@/components/app/general/layouts/second-container";
import { Navbar } from "@/components/app/general/navbar/navbar";
import { NavbarSkeleton } from "@/components/app/general/navbar/navbar-skeleton";
import AtativeFooter from "@/components/app/general/footer/full-footer";
import { Container } from "@/components/app/general/layouts/container";

const MainPublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <SecondContainer>
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar />
        </Suspense>
        <Container>{children}</Container>
        <AtativeFooter />
      </SecondContainer>
    </main>
  );
};

export default MainPublicLayout;
