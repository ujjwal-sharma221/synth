import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";

export const ensureAuthenticated = async () => {
  const user = await isAuthenticated();

  if (!user) redirect("/");
};

export const ensureUnauthenticated = async () => {
  const user = await isAuthenticated();

  if (user) redirect("/projects");
};

export const checkUserAuthentication = async () => {
  const user = await isAuthenticated();
  return user;
};
