export type MaterialStatus = "ready";

export interface Material {
  id: string;
  userId: string;
  bucketId: string;
  objectPath: string;
  originalName: string;
  mimeType: "application/pdf";
  sizeBytes: number;
  checksumSha256: string;
  status: MaterialStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UploadTicket {
  objectPath: string;
  signedUrl: string;
}

