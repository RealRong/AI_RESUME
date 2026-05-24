import type { Metadata } from "next";
import "../global.css";
import { InstanceProvider } from "@/instance";

export const metadata: Metadata = {
  title: "智能简历平台",
  description: "面向招聘流程的简历分析与匹配工作台。"
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
