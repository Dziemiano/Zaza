"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Button } from "../ui/button";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CustomerPaymentTable } from "./customerPaymentTable";
import { CustomerForm } from "./customerForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";

interface CustomerType {
  id: string;
  nip: string;
  symbol: string;
  name: string;
  primary_email: string;
  documents_email: string;
  phone_number: string;
  street: string;
  building: string;
  premises: string | null;
  city: string;
  postal_code: string;
  country: string;
  payment_type: string;
  customer_type: string | null;
  payment_punctuality: string;
  comments: string;
  salesman: { name: string; email: string; phone: string };
  branch: { name: string };
  credit_limit: string;
  max_discount: string;
  send_email_invoice: boolean;
  invoice_street: string;
  invoice_building: string;
  invoice_city: string;
  invoice_postal_code: string;
  invoice_country: string;
  created_at: Date;
  created_by: { name: string };
  ContactPerson: { name: string; email: string; phone: string }[];
  DeliveryAdress: {
    street: string;
    building: string;
    city: string;
    postal_code: string;
    country: string;
  }[];
  Orders: any;
}

export interface CustomerViewProps {
  customer: CustomerType;
  salesmen: any[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CustomerView = ({
  customer,
  salesmen,
  isOpen,
  setIsOpen,
}: CustomerViewProps) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const user = useCurrentUser();

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toDateString();
  };

  const booleanToYesNo = (value: boolean): string => {
    return value ? "Tak" : "Nie";
  };

  const payment_type: { [key: string]: string } = {
    PREPAID: "Przedpłata",
    WIRE: "Przelew",
    CASH: "Gotówka",
  };

  const payment_punctuality: { [key: string]: string } = {
    ON_TIME: "Terminowy",
    OK: "Ok",
    WARNING: "Uwaga",
    LATE: "Nieterminowy",
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="min-w-[90%] min-h-[90%] max-h-[95vh] flex flex-col content-start overflow-y-auto">
        <DialogHeader className="flex justify-between bg-white rounded-2xl shadow-sm max-md:flex-wrap max-md:pr-5 max-h-[30%]">
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
              <div>
                <Link href="/">Pulpit</Link>
              </div>
              <div>/</div>
              <div>
                <Link href="/customers" onClick={() => setIsOpen(false)}>
                  Klienci
                </Link>
              </div>
              <div>/</div>
              <div>{customer?.name}</div>
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
              <CustomerForm
                customer={customer}
                userId={user?.id ?? ""}
                salesmen={salesmen || []}
                editMode
              />
            </TabsList>

            <TabsContent value="main_data">
              <div className="flex flex-col mt-10 mb-5">
                <div className="text-2xl">Dane podstawowe</div>
                <div className="flex flex-row mt-4">
                  <div className="flex flex-col mr-10">
                    <div className="text-xl">{customer.name}</div>
                    <div className="text-sm">
                      {customer.customer_type || "Rodzaj firmy"}
                    </div>
                  </div>
                  <div className="flex flex-col mr-4">
                    <div className="text-xl">{customer.nip}</div>
                    <div className="text-sm">NIP</div>
                  </div>
                </div>
                <div className="text-2xl mt-10">Dane adresowe</div>
                <div className="flex flex-row mt-4">
                  <div className="flex flex-col mr-10">
                    <div className="text-md">
                      {customer.street} {customer.building} {customer.premises}
                    </div>
                    <div className="text-md">{customer.city}</div>
                    <div className="text-md">{customer.postal_code}</div>
                    <div className="text-md">{customer.country}</div>
                    <div className="text-md mt-5">{customer.phone_number}</div>
                    <div className="text-md">{customer.primary_email}</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment">
              <div>
                <div className="text-2xl mt-10">Płatności</div>
                <div className="flex flex-row mt-4">
                  <div className="text-xl mr-4">Ogólny status klienta:</div>
                  <div className="text-xl">
                    {payment_punctuality[customer.payment_punctuality] ||
                      "Brak danych"}
                  </div>
                </div>
                <div className="flex flex-row mt-4">
                  <div className="flex flex-col mr-10">
                    <div className="text-xl">
                      {payment_type[customer.payment_type]}
                    </div>
                    <div className="text-sm">Rodzaj płatności</div>
                  </div>
                  <div className="flex flex-col mr-4">
                    <div className="text-xl">
                      {customer.payment_punctuality || "Brak danych"}
                    </div>
                    <div className="text-sm">Termin płatności</div>
                  </div>
                </div>
                <CustomerPaymentTable orders={[]} />
              </div>
            </TabsContent>

            <TabsContent value="contact_person">
              <div className="flex flex-col mt-10 mb-5">
                <div className="text-2xl">Osoba kontaktowa</div>
                {customer.ContactPerson?.map((person, index) => (
                  <div className="flex flex-row mt-4" key={index}>
                    <div className="flex flex-col mr-10">
                      <div className="text-md">{person.name}</div>
                      <div className="text-md">{person.phone}</div>
                      <div className="text-md">{person.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="comments">
              <div className="flex flex-row mt-10">
                <Accordion type="single" collapsible className="w-[40%]">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Uwagi</AccordionTrigger>
                    <AccordionContent>
                      {customer.comments || "Brak uwag"}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>

            <TabsContent value="salesman">
              <div className="flex flex-col mt-10">
                <div className="text-2xl">Handlowiec</div>
                <div className="text-md mt-4">
                  {customer.salesman?.firstname ||
                    "Brak przypisanego handlowca"}
                </div>
                <div className="text-md">
                  {customer.salesman?.phone || "Brak telefonu"}
                </div>
                <div className="text-md">
                  {customer.salesman?.email || "Brak e-maila"}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="discount">
              <div className="flex flex-col mt-10">
                <div className="text-2xl">Limity kredytowe</div>
                <div className="text-md mt-4">
                  Limit kredytowy: {formatNumber(customer.credit_limit)}
                </div>
                <div className="text-md mt-4">
                  Maksymalny rabat: {formatNumber(customer.max_discount)}%
                </div>
              </div>
            </TabsContent>

            <TabsContent value="delivery">
              <div className="flex flex-col mt-10">
                <div className="text-2xl">Adresy dostaw</div>
                {customer.DeliveryAdress?.map((address, index) => (
                  <div className="flex flex-row mt-4" key={index}>
                    <div className="flex flex-col mr-10">
                      <div className="text-md">
                        {address.street} {address.building}
                      </div>
                      <div className="text-md">{address.city}</div>
                      <div className="text-md">{address.postal_code}</div>
                      <div className="text-md">{address.country}</div>
                    </div>
                  </div>
                ))}
                <Button className="mt-4 h-7 w-fit" variant={"zaza"}>
                  Dodaj adres
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="invoice">
              <div className="flex flex-col mt-10">
                <div className="text-2xl">Dane do faktury</div>
                <div className="text-md mt-4">
                  Ulica: {customer.invoice_street} {customer.invoice_building}
                </div>
                <div className="text-md">Miasto: {customer.invoice_city}</div>
                <div className="text-md">
                  Kod pocztowy: {customer.invoice_postal_code}
                </div>
                <div className="text-md">Kraj: {customer.invoice_country}</div>
                <div className="text-md mt-4">
                  Wysyłka faktury na email:{" "}
                  {booleanToYesNo(customer.send_email_invoice)}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
