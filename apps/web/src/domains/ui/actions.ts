import { atom } from "jotai";
import { uiDomainStateAtom } from "./atoms";

export const setThemeAtom = atom(null, (_get, set, theme: "light" | "dark") => {
  set(uiDomainStateAtom, (prev) => ({
    ...prev,
    theme
  }));
});

export const toggleThemeAtom = atom(null, (get, set) => {
  const nextTheme = get(uiDomainStateAtom).theme === "light" ? "dark" : "light";
  set(uiDomainStateAtom, (prev) => ({
    ...prev,
    theme: nextTheme
  }));
});
