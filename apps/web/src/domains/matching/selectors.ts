import { atom } from "jotai";
import { matchingDomainStateAtom } from "./atoms";

export const matchingWorkspaceAtom = atom((get) => get(matchingDomainStateAtom).workspace);
export const matchingResultsAtom = atom((get) => get(matchingDomainStateAtom).results);
