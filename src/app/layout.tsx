import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Puresport - Natural Sports Supplements",
  description: "Discover natural sports supplements designed for athletes who want to perform For the Long Run.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <header className="fixed top-0 left-0 w-full bg-white z-10">
          <div className="container mx-auto">
            <Image
              src="/new-logo-puresport.svg"
              alt="Puresport"
              width={120}
              height={30}
              className="logo"
              priority
            />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
