import type { Metadata } from "next";
import "./globals.css";
import ErrorSuppressor from "@/components/ErrorSuppressor";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Service Business Website",
  description: "Service business website builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </head>
      <body>
        <ErrorSuppressor />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}

