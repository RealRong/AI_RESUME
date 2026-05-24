import { atom } from "jotai";
import { uploadDomainStateAtom } from "./atoms";

export const uploadQueueAtom = atom((get) => get(uploadDomainStateAtom).queue);
