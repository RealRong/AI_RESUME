import { atom } from "jotai";
import { candidateListStateAtom } from "./atoms";

export const candidateQueryAtom = atom((get) => get(candidateListStateAtom).query);
export const candidateSelectionAtom = atom((get) => get(candidateListStateAtom).selection);
export const candidateRemoteAtom = atom((get) => get(candidateListStateAtom).remote);
