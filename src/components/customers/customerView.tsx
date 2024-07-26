"use client";

import React, { useState, useTransition } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomerSchema } from "@/schemas";
import { CustomerCombo } from "./customerCombo";
import { OrderProductsTable } from "./orderProductsTable";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";
import { getAllCustomers } from "@/data/customers";
import { createOrder } from "@/actions/orders";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface CustomerType {
  id: string;
  name: string;
  nip: string;
  email: string;
  phone: string;
  addres: string;
  created_at: string;
  created_by: string;
}

export interface CustomerViewProps {
  customer: CustomerType;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  customer,
  isOpen,
  setIsOpen,
}) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toDateString();
  };

  const booleanToYesNo = (value: boolean): string => {
    return value ? "Tak" : "Nie";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="min-w-[80%] min-h-[85%] flex flex-col content-start">
        <DialogHeader className="flex justify-between bg-white rounded-2xl shadow-sm max-md:flex-wrap max-md:pr-5 max-h-[40%]">
          {/* Header content */}
          <div className="flex flex-col justify-center">
            <div className="flex gap-4 items-center text-black">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/619 283 897940c2d742c79e3619 283 897db9201da619 283 897abbfd619 283 8971adfd7423d7f2812f27c9da290dda59cf?"
                className="shrink-0 self-stretch my-auto aspect-square w-[25px]"
                alt="Order icon"
              />
              <div className="self-stretch text-3xl font-bold">
                Profil klienta
              </div>
              <div className="flex gap-2 self-stretch my-auto text-sm">
                <div className="shrink-0 my-auto w-2.5 bg-green-300 rounded-full h-[11px]" />
                <div>Aktywny</div>
              </div>
            </div>
            <div className="flex gap-1 mt-4 text-xs text-neutral-400">
              <div>Pulpit</div>
              <div>/</div>
              <div>Kliencie</div>
              <div>/</div>
              <div>Profil klienta </div>
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col content-between h-[700px]">
          <Tabs defaultValue="order" className="w-full h-full">
            <TabsList>
              <TabsTrigger value="main_data">Dane kontaktowe</TabsTrigger>
              <TabsTrigger value="payment">Płatności</TabsTrigger>
              <TabsTrigger value="contact_person">Osoba kontaktowa</TabsTrigger>
              <TabsTrigger value="comments">Uwagi</TabsTrigger>
              <TabsTrigger value="salesman">Przypisany handlowiec</TabsTrigger>
              <TabsTrigger value="discount">Limity i rabaty</TabsTrigger>
              <TabsTrigger value="delivery">Filie i adresy dostaw</TabsTrigger>
              <TabsTrigger value="invoice">
                Symbol i dane do faktury
              </TabsTrigger>
            </TabsList>

            <TabsContent value="main_data">
              <div className="flex flex-col  mt-10 mb-5">
                <div className="text-2xl">Dane podstawowe</div>
                <div className="flex flex-row mt-4">
                  <div className="flex flex-col mr-10">
                    <div className="text-xl">Nazwa firmy</div>
                    <div className="text-sm">Rodzaj firmy</div>
                  </div>
                  <div className="flex flex-col mr-4">
                    <div className="text-xl">987619 283 89754512</div>
                    <div className="text-sm">NIP</div>
                  </div>
                </div>
                <div className="text-2xl mt-10">Dane adresowe</div>
                <div className="flex flex-row mt-4">
                  <div className="flex flex-col mr-10">
                    <div className="text-md">Ulica</div>
                    <div className="text-md">Kod pocztowy</div>
                    <div className="text-md">Kraj</div>
                    <div className="text-md mt-5">619 283 897</div>
                    <div className="text-md">email@email.com</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment">
              <div>
                <div className="text-2xl mt-10">Płatności</div>
                <div className="flex flex-row mt-4">
                  <div className="text-xl mr-4">Ogólny status klienta:</div>
                  <div className="text-xl">Terminowy</div>
                </div>
                <div className="flex flex-row mt-4">
                  <div className="flex flex-col mr-10">
                    <div className="text-xl">Przelew</div>
                    <div className="text-sm">Rodzaj płatności</div>
                  </div>
                  <div className="flex flex-col mr-4">
                    <div className="text-xl">2 tygodnie</div>
                    <div className="text-sm">Termin płatności</div>
                  </div>
                </div>
                <OrderProductsTable orders={[]} />
              </div>
            </TabsContent>

            <TabsContent value="contact_person">
              <div className="flex flex-col  mt-10 mb-5">
                <div className="text-2xl">Osoba kontaktowa</div>
                <div className="flex flex-row mt-4">
                  <div className="flex flex-col mr-10">
                    <div className="text-md">Imię i nazwisko</div>
                    <div className="text-md">619 283 897</div>
                    <div className="text-md">email@email.com</div>
                  </div>
                </div>
                <Button className="mt-4 h-7 w-fit" variant={"zaza"}>
                  Dodaj kontakt
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="comments">
              <div className="flex flex-row mt-10">
                <Accordion type="single" collapsible className="w-[40%]">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Uwagi ogólne</AccordionTrigger>
                    <AccordionContent>01. Przykładowa uwaga</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Uwagi dla transportu</AccordionTrigger>
                    <AccordionContent>
                      01. Przykładowa uwaga <br />
                      02. Przykładowa uwaga
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Uwagi dla magazynu</AccordionTrigger>
                    <AccordionContent>01. Przykładowa uwaga</AccordionContent>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>Uwagi dla produkcji</AccordionTrigger>
                      <AccordionContent>01. Przykładowa uwaga</AccordionContent>
                    </AccordionItem>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>

            <TabsContent value="salesman">
              <div className="flex flex-col  mt-10 mb-5">
                <div className="text-2xl">Przypisany handlowiec</div>
                <div className="flex flex-row mt-4">
                  <div className="flex flex-col mr-10">
                    <div className="text-md">Imię i nazwisko</div>
                    <div className="text-md">619 283 897</div>
                    <div className="text-md">email@email.com</div>
                  </div>
                </div>
                <Button className="mt-4 h-7 w-fit" variant={"zaza"}>
                  Dodaj kontakt
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="discount">
              <div className="flex flex-col  mt-10 mb-5">
                <div className="text-2xl">Limity i rabaty</div>
                <div className="flex flex-row mt-4">
                  <div className="flex flex-col mr-10">
                    <div className="text-xl">100 000 zł</div>
                    <div className="text-sm">Limit kredytowy</div>
                  </div>
                  <div className="flex flex-col mr-4">
                    <div className="text-xl">25%</div>
                    <div className="text-sm">Maksymalny rabat</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="delivery">
              <div className="flex flex-col  mt-10 mb-5">
                <div className="text-2xl">Filie</div>
                <div className="flex flex-row mt-4">
                  <div className="flex flex-col mr-10">
                    <div className="text-md">Ulica</div>
                    <div className="text-md">Kod pocztowy</div>
                    <div className="text-md">Kraj</div>
                    <div className="text-md mt-5">Imię i nazwisko</div>
                    <div className="text-md">619 283 897</div>
                    <div className="text-md">email@email.com</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="invoice">
              <div className="flex flex-col  mt-10 mb-5">
                <div className="text-2xl">Symbol</div>
                <div className="flex flex-row mt-4">
                  <div className="flex flex-col mr-10">
                    <div className="text-xl">Symbol</div>
                    <div className="text-sm">Symbol</div>
                  </div>
                </div>
                <div className="text-2xl mt-10">Dane adresowe</div>
                <div className="flex flex-col mt-4">
                  <div className="flex flex-row mt-4">
                    <div className="flex flex-col mr-10">
                      <div className="text-xl">Nazwa firmy</div>
                      <div className="text-sm">Rodzaj firmy</div>
                    </div>
                    <div className="flex flex-col mr-4">
                      <div className="text-xl">619 283 897</div>
                      <div className="text-sm">NIP</div>
                    </div>
                  </div>
                  <div className="flex flex-col mt-10">
                    <div className="text-lg">Adres do faktury</div>
                    <div className="text-md">Ulica</div>
                    <div className="text-md">Kod pocztowy</div>
                    <div className="text-md">Kraj</div>
                    <div className="text-md mt-5">619 283 897</div>
                    <div className="text-md">email@email.com</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="max-h-fit">
            <Button
              variant="zaza"
              className="w-[18619 283 897px] h-7 px-3 py-2 bg-white rounded-lg shadow justify-center items-center gap-2.5 inline-flex"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Zamknij
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
