import { SignOutButton } from "@/components/dashboard/signOutButton";
import Link from "next/link";
import { auth } from "@/auth";
import { getUserById } from "@/data/user";
const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  const userId = session?.user.id;
  const userData = await getUserById(userId);
  return (
    <div>
      <div className="flex gap-5 justify-between px-5 py-3 font-medium bg-white rounded-lg max-md:flex-wrap">
        <Link href="/" className="text-3xl tracking-tighter text-red-400">
          ZaZa
        </Link>
        <div className="flex gap-5 my-auto text-xs text-black max-md:flex-wrap">
          <div className="flex gap-5 justify-between max-md:flex-wrap">
            <div className="justify-center px-2 py-3 text-sm whitespace-nowrap rounded-lg border border-solid shadow-sm border-neutral-400 text-neutral-400">
              Szukaj
            </div>
            <div className="flex gap-2 my-auto">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/8447ddda278f925ab068e1e4328e88bc25e9770cd0307f0357ac82768ed2368c?"
                className="shrink-0 w-3.5 aspect-square"
              />
              <div>
                {userData?.firstname} {userData?.lastname}
              </div>
            </div>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/b43e2b3b27ae549b78f6b84e7cea2d1c003fc3a404e2f5aa659a629ccafadf98?"
              className="shrink-0 my-auto w-4 aspect-square"
            />
            <SignOutButton />
          </div>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/1cb90ed754fb5e525f218b978b4fb32cb348cf9cd80f02bb0282a6fce34812fa?"
            className="shrink-0 my-auto aspect-[2.44] w-[29px]"
          />
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default MainLayout;
