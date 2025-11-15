import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Bargain Hunter",
  description: "Prototype Craigslist bargain finder for Denver",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
