import type { AiProviderConfig } from "@ai-resume/shared-types";

export type AiSettingsDraft = AiProviderConfig;

export type SettingsDomainState = {
  ai: {
    dialogOpen: boolean;
    hydrated: boolean;
    savedConfig: AiProviderConfig | null;
    draft: AiSettingsDraft;
  };
};
