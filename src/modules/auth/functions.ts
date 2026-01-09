import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";

export const ensureAuthenticated = async () => {
  const user = await isAuthenticated();
  console.log(user);

  if (!user) redirect("/");
};

export const ensureUnauthenticated = async () => {
  const user = await isAuthenticated();
  console.log(user);

  if (user) redirect("/");
};

export const checkUserAuthentication = async () => {
  const user = await isAuthenticated();
  return user;
};
