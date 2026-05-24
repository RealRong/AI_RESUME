"use client";

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
type PdfJsWorkerModule = typeof import("pdfjs-dist/legacy/build/pdf.worker.mjs");

async function loadPdfJs() {
  const [pdfjs, pdfjsWorker] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs") as Promise<PdfJsModule>,
    import("pdfjs-dist/legacy/build/pdf.worker.mjs") as Promise<PdfJsWorkerModule>
  ]);

  if (typeof window !== "undefined" && !("pdfjsWorker" in globalThis)) {
    Object.assign(globalThis, {
      pdfjsWorker: pdfjsWorker
    });
  }

  return pdfjs;
}

export async function createPdfThumbnail(file: File, width = 144) {
  if (typeof window === "undefined") {
    throw new Error("PDF 缩略图只能在浏览器环境生成。");
  }

  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;

  try {
    const page = await pdf.getPage(1);
    const initialViewport = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: width / initialViewport.width });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas context unavailable.");
    }

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({
      canvas,
      canvasContext: context,
      viewport
    }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => {
        if (!value) {
          reject(new Error("Failed to export thumbnail."));
          return;
        }

        resolve(value);
      }, "image/png");
    });

    return {
      thumbnailUrl: URL.createObjectURL(blob),
      pageCount: pdf.numPages
    };
  } finally {
    await pdf.destroy();
  }
}
