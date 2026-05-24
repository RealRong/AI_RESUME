import { WorkspaceFrame } from "@/components/common/workspace-frame";

export default function UploadLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceFrame>{children}</WorkspaceFrame>;
}
