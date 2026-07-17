"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { materialsBucket, pdfMimeType } from "@/lib/materials/constants";
import { type PdfMetadataInput, validatePdfMetadata } from "@/lib/materials/validation";
import type { Material, UploadTicket } from "@/types/material";

interface ActionResult<T = undefined> {
  data?: T;
  error?: string;
}

async function authenticatedClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { error: "Your session has expired. Please sign in again." } as const;
  return { supabase, user: data.user } as const;
}

function validOwnedObjectPath(path: string, userId: string) {
  return new RegExp(`^${userId}/[0-9a-f-]{36}\\.pdf$`).test(path);
}

export async function createPdfUploadTicket(input: PdfMetadataInput): Promise<ActionResult<UploadTicket>> {
  const validationError = validatePdfMetadata(input);
  if (validationError) return { error: validationError };
  const auth = await authenticatedClient();
  if ("error" in auth) return { error: auth.error };

  const objectPath = `${auth.user.id}/${randomUUID()}.pdf`;
  const { data, error } = await auth.supabase.storage.from(materialsBucket).createSignedUploadUrl(objectPath);
  if (error || !data) return { error: "Unable to prepare the secure upload. Confirm that the Storage migration has been applied." };
  return { data: { objectPath, signedUrl: data.signedUrl } };
}

export async function completePdfUpload(input: PdfMetadataInput & { objectPath: string }): Promise<ActionResult<Material>> {
  const validationError = validatePdfMetadata(input);
  if (validationError) return { error: validationError };
  const auth = await authenticatedClient();
  if ("error" in auth) return { error: auth.error };
  if (!validOwnedObjectPath(input.objectPath, auth.user.id)) return { error: "The uploaded file path is invalid." };

  const bucket = auth.supabase.storage.from(materialsBucket);
  const { data: exists, error: existsError } = await bucket.exists(input.objectPath);
  if (existsError || !exists) return { error: "The PDF upload could not be verified." };

  const { data: storedPdf, error: downloadError } = await bucket.download(input.objectPath);
  if (downloadError || !storedPdf) return { error: "The uploaded PDF could not be verified securely." };
  const storedBytes = new Uint8Array(await storedPdf.arrayBuffer());
  const signature = new TextDecoder().decode(storedBytes.subarray(0, 5));
  if (storedBytes.byteLength !== input.sizeBytes || signature !== "%PDF-") {
    const { error: cleanupError } = await bucket.remove([input.objectPath]);
    return { error: cleanupError ? "The stored file failed PDF verification and automatic cleanup failed." : "The stored file failed PDF verification and was removed." };
  }
  const checksumSha256 = createHash("sha256").update(storedBytes).digest("hex");

  const { data: inserted, error: insertError } = await auth.supabase.from("materials").insert({
    user_id: auth.user.id,
    bucket_id: materialsBucket,
    object_path: input.objectPath,
    original_name: input.originalName.trim(),
    mime_type: pdfMimeType,
    size_bytes: input.sizeBytes,
    checksum_sha256: checksumSha256,
    status: "ready",
  }).select("id,user_id,bucket_id,object_path,original_name,mime_type,size_bytes,checksum_sha256,status,created_at,updated_at").single();

  if (insertError || !inserted) {
    const { error: cleanupError } = await bucket.remove([input.objectPath]);
    return { error: cleanupError ? "Metadata could not be saved and automatic cleanup failed. Please try deleting the file from Storage." : "Metadata could not be saved. The uploaded object was cleaned up safely." };
  }

  revalidatePath("/dashboard/upload");
  revalidatePath("/dashboard/library");
  revalidatePath("/dashboard");
  return { data: { id: inserted.id, userId: inserted.user_id, bucketId: inserted.bucket_id, objectPath: inserted.object_path, originalName: inserted.original_name, mimeType: inserted.mime_type, sizeBytes: inserted.size_bytes, checksumSha256: inserted.checksum_sha256, status: inserted.status, createdAt: inserted.created_at, updatedAt: inserted.updated_at } as Material };
}

export async function createMaterialDownloadUrl(materialId: string): Promise<ActionResult<{ url: string }>> {
  const auth = await authenticatedClient();
  if ("error" in auth) return { error: auth.error };
  const { data: material, error } = await auth.supabase.from("materials").select("object_path,original_name").eq("id", materialId).eq("user_id", auth.user.id).single();
  if (error || !material) return { error: "File not found or access denied." };
  const { data, error: signedError } = await auth.supabase.storage.from(materialsBucket).createSignedUrl(material.object_path, 60, { download: material.original_name });
  if (signedError || !data) return { error: "Unable to create a secure download link." };
  return { data: { url: data.signedUrl } };
}

export async function deleteMaterial(materialId: string): Promise<ActionResult> {
  const auth = await authenticatedClient();
  if ("error" in auth) return { error: auth.error };
  const { data: material, error } = await auth.supabase.from("materials").select("object_path").eq("id", materialId).eq("user_id", auth.user.id).single();
  if (error || !material || !validOwnedObjectPath(material.object_path, auth.user.id)) return { error: "File not found or access denied." };

  const { error: storageError } = await auth.supabase.storage.from(materialsBucket).remove([material.object_path]);
  if (storageError) return { error: "The stored PDF could not be deleted. No library record was removed." };
  const { error: rowError } = await auth.supabase.from("materials").delete().eq("id", materialId).eq("user_id", auth.user.id);
  if (rowError) return { error: "The PDF was removed, but its library record could not be deleted." };

  revalidatePath("/dashboard/upload");
  revalidatePath("/dashboard/library");
  revalidatePath("/dashboard");
  return { data: undefined };
}
