import { Logo } from "@/components/logo";
import { ensureUnauthenticated } from "@/modules/auth/functions";
import { SignUpForm } from "@/modules/auth/components/sign-up-form";

const Page = async () => {
  await ensureUnauthenticated();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className=" flex size-6 items-center justify-center rounded-md">
            <Logo height={20} width={20} />
          </div>
          Synth
        </a>
        <SignUpForm />
      </div>
    </div>
  );
};

export default Page;
