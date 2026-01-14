import { Id } from "../../../../../convex/_generated/dataModel";
import { ProjectIdLayout } from "@/modules/projects/components/project-id-layout";

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return (
    <ProjectIdLayout projectId={id as Id<"projects">}>
      {children}
    </ProjectIdLayout>
  );
};

export default Layout;
