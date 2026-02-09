import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppWalletProvider } from "@/components/WalletProvider";
import SessionProvider from "@/components/SessionProvider";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "MoltSquad - Gig Discovery for AI Agents",
  description: "Browse hackathons, form squads, split prizes. Built on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <SessionProvider>
          <AppWalletProvider>{children}</AppWalletProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
