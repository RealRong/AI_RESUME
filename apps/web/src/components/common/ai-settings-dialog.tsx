"use client";

import { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSettingsState } from "@/domains/settings/hooks";
import { useInstance } from "@/instance";

export function AiSettingsDialog() {
  const instance = useInstance();
  const { ai } = useSettingsState();
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (ai.dialogOpen) {
      setSaveError(null);
    }
  }, [ai.dialogOpen]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      instance.settings.openAiDialog();
      return;
    }

    instance.settings.closeAiDialog();
  }

  function handleSave() {
    try {
      instance.settings.saveAiConfig();
      setSaveError(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "AI 配置保存失败。");
    }
  }

  return (
    <Dialog open={ai.dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-muted/40 p-2 text-fg-muted">
              <Bot className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <DialogTitle>AI 配置</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <section className="space-y-2">
            <label className="text-sm font-medium text-foreground">Base URL</label>
            <Input
              value={ai.draft.baseUrl}
              onChange={(event) => instance.settings.updateAiDraft({ baseUrl: event.target.value })}
              placeholder="https://api.openai.com/v1"
            />
          </section>

          <section className="space-y-2">
            <label className="text-sm font-medium text-foreground">API Key</label>
            <Input
              type="password"
              value={ai.draft.apiKey}
              onChange={(event) => instance.settings.updateAiDraft({ apiKey: event.target.value })}
              placeholder="sk-..."
            />
          </section>

          <section className="space-y-2">
            <label className="text-sm font-medium text-foreground">Model</label>
            <Input
              value={ai.draft.model}
              onChange={(event) => instance.settings.updateAiDraft({ model: event.target.value })}
              placeholder="gpt-5.4"
            />
          </section>

          {saveError ? (
            <p className="text-sm leading-6 text-destructive">{saveError}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => instance.settings.clearAiConfig()}>
            清空配置
          </Button>
          <Button variant="outline" onClick={() => instance.settings.closeAiDialog()}>
            取消
          </Button>
          <Button onClick={handleSave}>保存配置</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
