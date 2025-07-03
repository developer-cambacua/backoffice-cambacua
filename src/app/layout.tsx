import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@/css/style.css";
import "react-toastify/dist/ReactToastify.min.css";

import { DevProvider } from "@/context/DevContext";
import { Providers } from "./Providers";
import { AlertProvider } from "@/context/AlertContext";

import { FormProvider } from "@/context/FormContext";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import QueryProvider from "@/context/QueryProvider";
import { UserInitializer } from "@/providers/UserInitializer";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

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
        <DevProvider>
          <AlertProvider>
            <QueryProvider>
              <UserInitializer />
              <html lang="es" className="antialiased">
                <body
                  className={`${openSans.variable} ${GeistSans.variable} ${GeistMono.variable} text-secondary-950 font-openSans bg-slate-50`}>
                  <AntdRegistry>{children}</AntdRegistry>
                  <ReactQueryDevtools initialIsOpen={false} />
                  <Toaster position="top-right" richColors closeButton />
                  <Analytics />
                  <SpeedInsights />
                </body>
              </html>
            </QueryProvider>
          </AlertProvider>
        </DevProvider>
      </FormProvider>
    </Providers>
  );
}
