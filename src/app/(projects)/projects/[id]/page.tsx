import { ensureAuthenticated } from "@/modules/auth/functions";
import { Id } from "../../../../../convex/_generated/dataModel";
import { ProjectIdView } from "@/modules/projects/components/project-id-view";

const Page = async ({
  params,
}: {
  params: Promise<{ id: Id<"projects"> }>;
}) => {
  await ensureAuthenticated();

  const { id } = await params;

  return <ProjectIdView projectId={id} />;
};

export default Page;
