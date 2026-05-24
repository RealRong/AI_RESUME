import { WorkspaceFrame } from "@/components/common/workspace-frame";

export default function DashboardLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceFrame>{children}</WorkspaceFrame>;
}
