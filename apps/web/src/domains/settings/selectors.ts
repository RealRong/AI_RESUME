import { atom } from "jotai";
import { settingsDomainStateAtom } from "./atoms";

export const aiSettingsAtom = atom((get) => get(settingsDomainStateAtom).ai);
