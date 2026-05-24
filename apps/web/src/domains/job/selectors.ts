import { atom } from "jotai";
import { jobDomainStateAtom } from "./atoms";

export const jobListAtom = atom((get) => get(jobDomainStateAtom).list);
export const jobEditorAtom = atom((get) => get(jobDomainStateAtom).editor);
