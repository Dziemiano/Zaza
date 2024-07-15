import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function Home() {
  return (
    <main className="regular flex min-h-screen flex-col items-center justify-between p-24">
      <Button variant={"zaza"} size={"zaza"} asChild>
        <Link href="/login">Zaloguj się</Link>
      </Button>
    </main>
  );
}
