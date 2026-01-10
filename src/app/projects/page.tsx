import { ensureAuthenticated } from "@/modules/auth/functions";
import { ProjectView } from "@/modules/project/components/project-view";

const Page = async () => {
  await ensureAuthenticated();

  return <ProjectView />;
};

export default Page;
