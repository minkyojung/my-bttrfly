import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { CursorWrapper } from "@/components/CursorWrapper";

export const metadata: Metadata = {
  title: "Minkyo Jung",
  description: "A minimal black and white blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <CursorWrapper>
          <NavBar />
          {children}
        </CursorWrapper>
      </body>
    </html>
  );
}
