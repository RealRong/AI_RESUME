"use client";

import { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { setThemeAtom, toggleThemeAtom } from "./actions";
import { uiDomainStateAtom } from "./atoms";

export function useUiState() {
  return useAtomValue(uiDomainStateAtom);
}

export function useUiActions() {
  const setTheme = useSetAtom(setThemeAtom);
  const toggleTheme = useSetAtom(toggleThemeAtom);

  return useMemo(
    () => ({
      setTheme,
      toggleTheme
    }),
    [setTheme, toggleTheme]
  );
}
