// Proper PDF text extraction using pdfjs-dist
export async function extractTextFromPDF(file) {
  try {
    // Dynamically import pdfjs
    const pdfjsLib = await import("pdfjs-dist/build/pdf");

    // Must set worker source — use unpkg CDN which is always available
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf         = await loadingTask.promise;

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page    = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      // Join all text items on this page
      const pageText = content.items
        .map(item => {
          // Handle text with transform (position info)
          if (item.str !== undefined) return item.str;
          return "";
        })
        .join(" ");

      fullText += pageText + "\n";
    }

    // Clean up the extracted text
    const cleaned = fullText
      .replace(/\s{3,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return cleaned;

  } catch (error) {
    console.error("pdfjs extraction error:", error.message);

    // Fallback: try reading as text directly
    try {
      const text = await file.text();
      if (text && text.length > 100) {
        return text
          .replace(/[^\x20-\x7E\n\r\t]/g, " ")
          .replace(/\s{3,}/g, " ")
          .trim();
      }
    } catch {}

    throw new Error(
      "Could not read this PDF. Please open your resume, select all text (Ctrl+A), copy it (Ctrl+C), then paste it in the text box instead."
    );
  }
}