"use client";

import Link from "next/link";
import { Button } from "../ui/button";

interface BackButtonProps {
  label: string;
  href: string;
}
export const BackButton = ({ label, href }: BackButtonProps) => {
  return (
    <Button variant="ghost" className="w-full font-normal" size="sm" asChild>
      <Link href={href} className="w-full">
        {label}
      </Link>
    </Button>
  );
};
