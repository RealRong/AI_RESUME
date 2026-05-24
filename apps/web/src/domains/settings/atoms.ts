import { atom } from "jotai";
import type { SettingsDomainState } from "./types";

export const settingsDomainStateAtom = atom<SettingsDomainState>({
  ai: {
    dialogOpen: false,
    hydrated: false,
    savedConfig: null,
    draft: {
      baseUrl: "https://api.openai.com/v1",
      apiKey: "",
      model: "gpt-5.4"
    }
  }
});
