import PDFParser from "pdf2json";

export async function parsePdfBuffer(fileBuffer: Buffer) {
  const parser = new PDFParser();

  return await new Promise<{ text: string; pageCount: number }>((resolve, reject) => {
    parser.on("pdfParser_dataError", (error: Error | { parserError: Error }) => {
      const parserError = error instanceof Error ? error : error.parserError;
      const reason =
        parserError instanceof Error
          ? parserError.message
          : "Unknown PDF parsing error.";

      reject(new Error(`Failed to parse PDF: ${reason}`));
    });

    parser.on("pdfParser_dataReady", (pdfData: { Pages?: unknown[] } | null | undefined) => {
      const text = parser.getRawTextContent().trim();

      resolve({
        text,
        pageCount: pdfData?.Pages?.length ?? 0
      });
    });

    parser.parseBuffer(fileBuffer);
  });
}
