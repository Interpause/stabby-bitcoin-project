import type { Metadata } from "next";
import { Poppins, Roboto_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});export const metadata: Metadata = {
  title: "FNCE313 G4 Grp4",
  description: "Sovereign Bitcoin Tracker by FNCE313 G4 Grp4",
};

import { TooltipProvider } from "@/components/ui/tooltip";
import { MockProvider } from "./mock-provider";
import { Navbar } from "@/components/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body
        className={`${poppins.variable} ${robotoMono.variable} antialiased min-h-screen flex flex-col bg-background`}
      >
        <MockProvider isEnabled={process.env.NEXT_USE_MOCK === 'true'}>
          <TooltipProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </TooltipProvider>
        </MockProvider>
      </body>
    </html>
  );
}
