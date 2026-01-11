import { Id } from "../../../../../convex/_generated/dataModel";
import { ProjectIdLayout } from "@/modules/projects/components/project-id-layout";

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: Id<"projects"> }>;
}) => {
  const { id } = await params;

  return <ProjectIdLayout projectId={id}>{children}</ProjectIdLayout>;
};

export default Layout;
