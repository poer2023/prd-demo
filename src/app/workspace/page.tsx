import { redirect } from "next/navigation";
import { getPublicProjects } from "@/config/projects";

export default function WorkspaceEntryPage() {
  const [defaultProject] = getPublicProjects();

  if (defaultProject) {
    redirect(`/workspace/${defaultProject.slug}`);
  }

  redirect("/");
}
