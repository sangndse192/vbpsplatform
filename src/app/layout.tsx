import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { AgentationWrapper } from "@/components/dev/agentation-wrapper";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam-pro",
});

export const metadata: Metadata = {
  title: "VBSP Platform",
  description: "VietinBank Policy Document Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-be-vietnam-pro)]">
        {children}
        <AgentationWrapper />
      </body>
    </html>
  );
}
