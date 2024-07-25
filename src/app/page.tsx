import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { AddBut } from "./(protected)/orders/addBut";
export default function Home() {
  return (
    <main className="regular flex min-h-screen flex-col items-center justify-between p-24">
      <Button variant={"zaza"} size={"zaza"} asChild>
        <Link href="/login">Zaloguj się</Link>
      </Button>
      <AddBut />
    </main>
  );
}
