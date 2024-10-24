import type { Metadata } from "next";
import "./globals.css";

import localFont from "next/font/local";
import { Suspense } from "react";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const objectivity = localFont({
  src: "../../public/fonts/objectivity.regular.otf",
  variable: "--font-objectivity",
});

export const metadata: Metadata = {
  title: "Zaza",
  description: "Zaza",
};

export default function RootLayout({
  children,
  session,
}: Readonly<{
  children: React.ReactNode;
  session: any;
}>) {
  return (
    <html lang="en" translate="no">
      <SessionProvider session={session}>
        <Suspense fallback={<div>Loading...</div>}>
          <TooltipProvider>
            <body className={`${objectivity.variable} font-sans`}>
              {children}
              <Toaster />
            </body>
          </TooltipProvider>
        </Suspense>
      </SessionProvider>
    </html>
  );
}
