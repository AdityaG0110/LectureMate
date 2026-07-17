import { UploadWorkspace } from "@/components/dashboard/upload-workspace";
import { listMaterials } from "@/lib/materials/queries";

export const dynamic = "force-dynamic";

export default async function Page() {
  const materials = await listMaterials();
  return <UploadWorkspace recentMaterials={materials.slice(0, 3)} totalBytes={materials.reduce((total, material) => total + material.sizeBytes, 0)} />;
}
