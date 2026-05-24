import { PDFParse } from "pdf-parse";

export async function parsePdfBuffer(fileBuffer: Buffer) {
  const parser = new PDFParse({ data: fileBuffer });
  const textResult = await parser.getText();
  await parser.destroy();

  return {
    text: textResult.text ?? "",
    pageCount: textResult.total ?? 0
  };
}
