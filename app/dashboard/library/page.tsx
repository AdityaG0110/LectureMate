import { LibraryWorkspace } from "@/components/dashboard/library-workspace";
import { listMaterials } from "@/lib/materials/queries";

export const dynamic = "force-dynamic";

export default async function Page() {
  try {
    return <LibraryWorkspace materials={await listMaterials()} />;
  } catch (error) {
    return <LibraryWorkspace materials={[]} loadError={error instanceof Error ? error.message : "Unable to load your library."} />;
  }
}
