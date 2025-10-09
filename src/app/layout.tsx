import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "@/css/style.css";
import "react-toastify/dist/ReactToastify.min.css";
import { Providers } from "./Providers";
import { FormProvider } from "@/context/FormContext";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import QueryProvider from "@/context/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/scrollToTop/ScrollToTop";
import { AppDataWrapper } from "@/context/AppDataProvider";
import { RealtimeProvider } from "@/context/RealtimeProvider";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-openSans",
});

export const metadata: Metadata = {
  title: "Cambacuá Backoffice",
  description: "Sitio oficial del backoffice de Cambacuá B&B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <FormProvider>
        <QueryProvider>
          <RealtimeProvider>
            <html lang="es" className="antialiased">
              <body
                className={`${openSans.variable} text-secondary-950 font-openSans bg-slate-50`}>
                <AppDataWrapper>{children}</AppDataWrapper>
                <ReactQueryDevtools initialIsOpen={false} />
                <Toaster position="top-right" richColors closeButton />
                <ScrollToTop />
              </body>
            </html>
          </RealtimeProvider>
        </QueryProvider>
      </FormProvider>
    </Providers>
  );
}
