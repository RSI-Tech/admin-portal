import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "User Management Portal",
  description: "Professional user management system with SQL Server integration",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-gray-50`}>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            <div className="max-w-screen-xl mx-auto px-8">
              {children}
            </div>
          </main>
          <footer className="py-6 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="max-w-screen-xl mx-auto px-8">
              <p className="text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} GovPremiere User Management Portal. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}