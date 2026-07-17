import { maxPdfBytes, pdfMimeType } from "./constants";

export interface PdfMetadataInput {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

export function validatePdfMetadata(input: PdfMetadataInput): string | undefined {
  const name = input.originalName.trim();
  if (!name || name.length > 255) return "Use a filename between 1 and 255 characters.";
  if (!name.toLowerCase().endsWith(".pdf")) return "Only PDF files are supported.";
  if (input.mimeType !== pdfMimeType) return "The selected file must have the application/pdf MIME type.";
  if (!Number.isSafeInteger(input.sizeBytes) || input.sizeBytes <= 0) return "The selected PDF is empty.";
  if (input.sizeBytes > maxPdfBytes) return "PDF files must be 25 MB or smaller.";
  return undefined;
}

