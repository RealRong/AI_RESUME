import { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  clearAiSettingsAtom,
  closeAiSettingsDialogAtom,
  hydrateAiSettingsAtom,
  openAiSettingsDialogAtom,
  saveAiSettingsAtom,
  updateAiSettingsDraftAtom
} from "./actions";
import { aiSettingsAtom } from "./selectors";

export function useSettingsState() {
  return {
    ai: useAtomValue(aiSettingsAtom)
  };
}

export function useSettingsActions() {
  const hydrateAi = useSetAtom(hydrateAiSettingsAtom);
  const openAiDialog = useSetAtom(openAiSettingsDialogAtom);
  const closeAiDialog = useSetAtom(closeAiSettingsDialogAtom);
  const updateAiDraft = useSetAtom(updateAiSettingsDraftAtom);
  const saveAi = useSetAtom(saveAiSettingsAtom);
  const clearAi = useSetAtom(clearAiSettingsAtom);

  return useMemo(
    () => ({
      hydrateAi,
      openAiDialog,
      closeAiDialog,
      updateAiDraft,
      saveAi,
      clearAi
    }),
    [clearAi, closeAiDialog, hydrateAi, openAiDialog, saveAi, updateAiDraft]
  );
}
