import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Material } from "@/types/material";

interface MaterialRow {
  id: string;
  user_id: string;
  bucket_id: string;
  object_path: string;
  original_name: string;
  mime_type: "application/pdf";
  size_bytes: number;
  checksum_sha256: string;
  status: "ready";
  created_at: string;
  updated_at: string;
}

function toMaterial(row: MaterialRow): Material {
  return { id: row.id, userId: row.user_id, bucketId: row.bucket_id, objectPath: row.object_path, originalName: row.original_name, mimeType: row.mime_type, sizeBytes: row.size_bytes, checksumSha256: row.checksum_sha256, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}

export async function listMaterials(limit?: number): Promise<Material[]> {
  noStore();
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("Your session has expired. Please sign in again.");
  let query = supabase.from("materials").select("id,user_id,bucket_id,object_path,original_name,mime_type,size_bytes,checksum_sha256,status,created_at,updated_at").eq("user_id", authData.user.id).eq("status", "ready").order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw new Error(`Unable to load your library: ${error.message}`);
  return (data as MaterialRow[]).map(toMaterial);
}
