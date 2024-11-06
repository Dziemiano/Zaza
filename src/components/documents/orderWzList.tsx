"use client";

import { Button } from "../ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { useState, useTransition } from "react";

import { useCurrentUser } from "@/hooks/useCurrentUser";

import { OrderSchema } from "@/schemas";
import { WzCheckPdf } from "./wznCheckPdf";
import { z } from "zod";
import OptimaIntegrationButton from "./optimaButton";

import { useCurrentRole } from "@/hooks/useCurrentRole";
import { UserRole } from "@prisma/client";
type OrderWzListProps = {
  order?: z.infer<typeof OrderSchema>;
};

export const OrderWzList = ({ order }: OrderWzListProps) => {
  //TODO: add form validation, error handling
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const userId = useCurrentUser()?.id;
  const user_role = useCurrentRole();
  console.log(user_role);
  console.log(useCurrentUser());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full font-normal" variant="zazaGrey">
          {"Wystawione WZ"}
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[70%] h-[70vh] flex flex-col overflow-auto">
        <DialogHeader className="flex-shrink-0">
          <div className="flex flex-col justify-center">
            <div className="flex gap-4 items-center text-black">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/6940c2d742c79e36db9201da6abbfd61adfd7423d7f2812f27c9da290dda59cf?"
                className="shrink-0 self-stretch my-auto aspect-square w-[25px]"
              />
              <div className="self-stretch text-3xl font-bold">
                {"Wystawione dokumenty WZ do zamówienia " + order?.id}
              </div>
            </div>
          </div>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow className="bg-white">
              <TableHead>Nazwa produktu</TableHead>
              <TableHead>Jednostka WZ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order?.wz?.map((item, index) => {
              return (
                <TableRow key={item.key}>
                  <TableCell>{item.type + " " + item.doc_number}</TableCell>
                  <TableCell>
                    <WzCheckPdf wzData={order} index={index} />
                    <OptimaIntegrationButton
                      wz={item}
                      order={order}
                      type={item.type}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};
