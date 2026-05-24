import { atom } from "jotai";

export const uiDomainStateAtom = atom({
  theme: "light" as "light" | "dark",
  quickPreviewCandidateId: null as string | null
});
