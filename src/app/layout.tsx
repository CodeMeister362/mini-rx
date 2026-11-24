import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { NavBar } from "./_components/NavBar";

export const metadata: Metadata = {
  title: "Mini Rx",
  description: "Prescription request queue",
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <TRPCReactProvider>
          <NavBar />
          <main>{children}</main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
