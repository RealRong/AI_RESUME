import { atom } from "jotai";
import type { AiProviderConfig } from "@ai-resume/shared-types";
import { settingsDomainStateAtom } from "./atoms";

function createDefaultDraft() {
  return {
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    model: "gpt-5.4"
  };
}

export const hydrateAiSettingsAtom = atom(
  null,
  (_get, set, config: AiProviderConfig | null) => {
    set(settingsDomainStateAtom, (prev) => ({
      ...prev,
      ai: {
        ...prev.ai,
        hydrated: true,
        savedConfig: config,
        draft: config ?? createDefaultDraft()
      }
    }));
  }
);

export const openAiSettingsDialogAtom = atom(null, (_get, set) => {
  set(settingsDomainStateAtom, (prev) => ({
    ...prev,
    ai: {
      ...prev.ai,
      dialogOpen: true,
      draft: prev.ai.savedConfig ?? prev.ai.draft
    }
  }));
});

export const closeAiSettingsDialogAtom = atom(null, (_get, set) => {
  set(settingsDomainStateAtom, (prev) => ({
    ...prev,
    ai: {
      ...prev.ai,
      dialogOpen: false,
      draft: prev.ai.savedConfig ?? createDefaultDraft()
    }
  }));
});

export const updateAiSettingsDraftAtom = atom(
  null,
  (_get, set, patch: Partial<AiProviderConfig>) => {
    set(settingsDomainStateAtom, (prev) => ({
      ...prev,
      ai: {
        ...prev.ai,
        draft: {
          ...prev.ai.draft,
          ...patch
        }
      }
    }));
  }
);

export const saveAiSettingsAtom = atom(
  null,
  (_get, set, config: AiProviderConfig) => {
    set(settingsDomainStateAtom, (prev) => ({
      ...prev,
      ai: {
        ...prev.ai,
        dialogOpen: false,
        savedConfig: config,
        draft: config
      }
    }));
  }
);

export const clearAiSettingsAtom = atom(null, (_get, set) => {
  set(settingsDomainStateAtom, (prev) => ({
    ...prev,
    ai: {
      ...prev.ai,
      dialogOpen: false,
      savedConfig: null,
      draft: createDefaultDraft()
    }
  }));
});
