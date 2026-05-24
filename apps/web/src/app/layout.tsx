import type { Metadata } from "next";
import "../global.css";
import { InstanceProvider } from "@/instance";

const THEME_INIT_SCRIPT = `
(() => {
  try {
    const storageKey = "ai.resume.theme";
    const savedTheme = window.localStorage.getItem(storageKey);
    const theme = savedTheme === "dark" ? "dark" : "light";
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  } catch {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export const metadata: Metadata = {
  title: "智能简历平台",
  description: "面向招聘流程的简历分析与匹配工作台。"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <InstanceProvider>{children}</InstanceProvider>
      </body>
    </html>
  );
}
