"use client";

import { usePathname } from "next/navigation";

export const Main = ({ children }: React.PropsWithChildren) => {
  const pathname = usePathname();

  return (
    <main
      className={`${
        pathname !== "/"
          ? "container-cambacua"
          : "container mx-auto px-6 sm:px-12"
      } py-8`}>
      {children}
    </main>
  );
};
