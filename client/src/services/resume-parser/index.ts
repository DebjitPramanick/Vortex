import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type {
  TextItem,
  TextMarkedContent,
} from "pdfjs-dist/types/src/display/api";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export class ResumeParser {
  private file: File;

  constructor(inputFile: File) {
    this.file = inputFile;
  }

  public parse = async (): Promise<string> => {
    if (!this.file) {
      console.error("No file to parse");
      return "";
    }
    const arrayBuffer = await this.file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: TextItem | TextMarkedContent) =>
          "str" in item ? item.str : "",
        )
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText.trim();
  };
}
