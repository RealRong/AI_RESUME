import type { AiProviderConfig } from "@ai-resume/shared-types";
import { createAiTextStream } from "./ai-provider.service";

export type ResumeStructuredExtraction = {
  basic: {
    name: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
  };
  education: Array<{
    school: string;
    major: string | null;
    degree: string | null;
    graduationDate: string | null;
  }>;
  workExperiences: Array<{
    companyName: string;
    title: string | null;
    startDate: string | null;
    endDate: string | null;
    summary: string | null;
  }>;
  skills: Array<{
    name: string;
    type: string;
  }>;
  projects: Array<{
    projectName: string;
    techStack: string[];
    roleSummary: string | null;
    highlights: string[];
  }>;
};

type ExtractionStage = "basic" | "education" | "workExperiences" | "skills" | "projects";

const SECTION_ORDER: ExtractionStage[] = [
  "basic",
  "education",
  "workExperiences",
  "skills",
  "projects"
];

function createEmptyExtraction(): ResumeStructuredExtraction {
  return {
    basic: {
      name: null,
      phone: null,
      email: null,
      city: null
    },
    education: [],
    workExperiences: [],
    skills: [],
    projects: []
  };
}

function getSectionStartTag(stage: ExtractionStage) {
  return `<<<SECTION:${stage}>>>`;
}

const SECTION_END_TAG = "<<<ENDSECTION>>>";

function normalizeArray<T>(value: unknown, mapper: (item: unknown) => T | null) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(mapper).filter((item): item is T => item !== null);
}

function normalizeSection(stage: ExtractionStage, value: unknown) {
  if (stage === "basic") {
    const basic = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;

    return {
      name: typeof basic.name === "string" ? basic.name.trim() || null : null,
      phone: typeof basic.phone === "string" ? basic.phone.trim() || null : null,
      email: typeof basic.email === "string" ? basic.email.trim() || null : null,
      city: typeof basic.city === "string" ? basic.city.trim() || null : null
    };
  }

  if (stage === "education") {
    return normalizeArray(value, (item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const row = item as Record<string, unknown>;
      const school =
        typeof row.school === "string" ? row.school.trim() : "";

      if (!school) {
        return null;
      }

      return {
        school,
        major: typeof row.major === "string" ? row.major.trim() || null : null,
        degree: typeof row.degree === "string" ? row.degree.trim() || null : null,
        graduationDate:
          typeof row.graduationDate === "string" ? row.graduationDate.trim() || null : null
      };
    });
  }

  if (stage === "workExperiences") {
    return normalizeArray(value, (item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const row = item as Record<string, unknown>;
      const companyName =
        typeof row.companyName === "string" ? row.companyName.trim() : "";

      if (!companyName) {
        return null;
      }

      return {
        companyName,
        title: typeof row.title === "string" ? row.title.trim() || null : null,
        startDate: typeof row.startDate === "string" ? row.startDate.trim() || null : null,
        endDate: typeof row.endDate === "string" ? row.endDate.trim() || null : null,
        summary: typeof row.summary === "string" ? row.summary.trim() || null : null
      };
    });
  }

  if (stage === "skills") {
    return normalizeArray(value, (item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const row = item as Record<string, unknown>;
      const name = typeof row.name === "string" ? row.name.trim() : "";

      if (!name) {
        return null;
      }

      return {
        name,
        type: typeof row.type === "string" && row.type.trim() ? row.type.trim() : "general"
      };
    });
  }

  return normalizeArray(value, (item) => {
    if (!item || typeof item !== "object") {
      return null;
    }

    const row = item as Record<string, unknown>;
    const projectName =
      typeof row.projectName === "string" ? row.projectName.trim() : "";

    if (!projectName) {
      return null;
    }

    return {
      projectName,
      techStack: normalizeArray(row.techStack, (tech) =>
        typeof tech === "string" && tech.trim() ? tech.trim() : null
      ),
      roleSummary:
        typeof row.roleSummary === "string" ? row.roleSummary.trim() || null : null,
      highlights: normalizeArray(row.highlights, (highlight) =>
        typeof highlight === "string" && highlight.trim() ? highlight.trim() : null
      )
    };
  });
}

export async function extractStructuredResumeWithAi(params: {
  cleanedText: string;
  config: AiProviderConfig;
  onSection: (payload: { stage: ExtractionStage; data: unknown }) => Promise<void> | void;
}) {
  const extraction = createEmptyExtraction();
  let buffer = "";
  let nextStageIndex = 0;

  async function flushSections() {
    while (nextStageIndex < SECTION_ORDER.length) {
      const stage = SECTION_ORDER[nextStageIndex];
      if (!stage) {
        return;
      }
      const startTag = getSectionStartTag(stage);
      const startIndex = buffer.indexOf(startTag);

      if (startIndex === -1) {
        return;
      }

      const contentStart = startIndex + startTag.length;
      const endIndex = buffer.indexOf(SECTION_END_TAG, contentStart);

      if (endIndex === -1) {
        return;
      }

      const rawJson = buffer.slice(contentStart, endIndex).trim();

      try {
        const parsed = JSON.parse(rawJson) as unknown;
        const normalized = normalizeSection(stage, parsed);

        if (stage === "basic") {
          extraction.basic = normalized as ResumeStructuredExtraction["basic"];
        } else if (stage === "education") {
          extraction.education = normalized as ResumeStructuredExtraction["education"];
        } else if (stage === "workExperiences") {
          extraction.workExperiences = normalized as ResumeStructuredExtraction["workExperiences"];
        } else if (stage === "skills") {
          extraction.skills = normalized as ResumeStructuredExtraction["skills"];
        } else if (stage === "projects") {
          extraction.projects = normalized as ResumeStructuredExtraction["projects"];
        }

        await params.onSection({
          stage,
          data: normalized
        });

        buffer = buffer.slice(endIndex + SECTION_END_TAG.length);
        nextStageIndex += 1;
      } catch (error) {
        throw new Error(
          `Failed to parse AI extraction section "${stage}": ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  }

  await createAiTextStream({
    config: params.config,
    systemPrompt: [
      "你是一个中文简历结构化提取器。",
      "你必须严格按以下顺序输出 5 个 section，每个 section 使用固定包裹格式。",
      "不要输出任何解释、Markdown、代码块标记或多余文本。",
      "格式如下：",
      "<<<SECTION:basic>>>",
      '{"name":null,"phone":null,"email":null,"city":null}',
      "<<<ENDSECTION>>>",
      "<<<SECTION:education>>>",
      '[{"school":"","major":null,"degree":null,"graduationDate":null}]',
      "<<<ENDSECTION>>>",
      "<<<SECTION:workExperiences>>>",
      '[{"companyName":"","title":null,"startDate":null,"endDate":null,"summary":null}]',
      "<<<ENDSECTION>>>",
      "<<<SECTION:skills>>>",
      '[{"name":"","type":"general"}]',
      "<<<ENDSECTION>>>",
      "<<<SECTION:projects>>>",
      '[{"projectName":"","techStack":[],"roleSummary":null,"highlights":[]}]',
      "<<<ENDSECTION>>>",
      "字段缺失时 basic 用 null，其余列表返回空数组。skills 的 type 只允许 technical、tool、language、general。"
    ].join("\n"),
    userPrompt: [
      "请从下面的简历文本中提取结构化信息，并严格使用指定 section 包裹格式输出：",
      params.cleanedText.slice(0, 24000)
    ].join("\n\n"),
    async onText(text) {
      buffer += text;
      await flushSections();
    }
  });
  await flushSections();

  return extraction;
}
