import { logEvent } from "@/actions/logs";
import { Button } from "../ui/button";
import { auth, signOut } from "@/auth";

export const SignOutButton = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button
        variant="ghost"
        type="submit"
        className="justify-center self-start px-3 py-2 bg-white rounded-lg shadow-sm"
        size="sm"
      >
        Wyloguj się
      </Button>
    </form>
  );
};
