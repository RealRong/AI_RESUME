import { atom } from "jotai";
import type { UploadDomainState } from "./types";

export const uploadDomainStateAtom = atom<UploadDomainState>({
  queue: [],
  activeEventSourceIds: []
});
