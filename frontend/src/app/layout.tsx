import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/lib/web3-provider";
import { Navigation } from "@/components/navigation";
import { DebugInfo } from "@/components/debug-info";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Proof of Merit",
  description: "A decentralized platform for developers to prove their skills and for recruiters to find top talent with verified credentials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow bg-white pb-16">
              {children}
            </main>
            <Footer />
            <DebugInfo />
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
