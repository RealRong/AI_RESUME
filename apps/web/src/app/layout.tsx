import type { Metadata } from "next";
import "../global.css";
import { InstanceProvider } from "@/instance";

export const metadata: Metadata = {
  title: "AI Resume Platform",
  description: "AI-powered resume analysis platform."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <InstanceProvider>{children}</InstanceProvider>
      </body>
    </html>
  );
}
