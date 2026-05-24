type ExtractionBasicInfo = {
  name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
};

const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phoneRegex = /(?:\+?\d[\d\s-]{7,}\d)/;

export function extractResumeBasics(cleanedText: string): ExtractionBasicInfo {
  const lines = cleanedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const firstMeaningfulLine = lines[0] ?? "";
  const email = cleanedText.match(emailRegex)?.[0] ?? null;
  const phone = cleanedText.match(phoneRegex)?.[0] ?? null;

  return {
    name: firstMeaningfulLine ? firstMeaningfulLine.slice(0, 80) : null,
    phone,
    email,
    city: null
  };
}
