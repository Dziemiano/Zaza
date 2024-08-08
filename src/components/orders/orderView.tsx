"use client";

import React, { useState, useTransition } from "react";
import { Button } from "../ui/button";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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

import { Textarea } from "@/components/ui/textarea";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderProductsTable } from "./orderProductsTable";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { OrderForm } from "./ordersForm";

// Define a more specific type for the order object
interface OrderType {
  id: string;
  status: string;
  created_at: string;
  delivery_date: string;
  payment_deadline: string;
  personal_collect: boolean;
  is_proforma: boolean;
  is_paid: boolean;
  customer?: {
    name: string;
  };
  created_by: string;
  foreign_id: string;
  wz_type: string;
  LineItem: any[]; // TODO define LineItem type
  user: {
    firstname: string;
    lastname: string;
  };
}

export interface OrderViewProps {
  customers: any[];
  products: any[];
  order: OrderType;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const OrderView: React.FC<OrderViewProps> = ({
  customers,
  order,
  products,
  isOpen,
  setIsOpen,
}) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const userId = useCurrentUser()?.id;

  console.log(order);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pl-PL");
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
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/6940c2d742c79e36db9201da6abbfd61adfd7423d7f2812f27c9da290dda59cf?"
                className="shrink-0 self-stretch my-auto aspect-square w-[25px]"
                alt="Order icon"
              />
              <div className="self-stretch text-3xl font-bold">
                Zamówienie {order.id}
              </div>
              <div className="flex gap-2 self-stretch my-auto text-sm">
                <div className="shrink-0 my-auto w-2.5 bg-amber-300 rounded-full h-[11px]" />
                <div>{order.status}</div>
              </div>
            </div>
            <div className="flex gap-1 mt-4 text-xs text-neutral-400">
              <div>Pulpit</div>
              <div>/</div>
              <div>Zamówienia</div>
              <div>/</div>
              <div>Zamówienie {order.id}</div>
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col content-between h-[700px]">
          <Tabs defaultValue="order" className="w-full h-full">
            <TabsList>
              <TabsTrigger value="order">Szczegóły zamówienia</TabsTrigger>
              <TabsTrigger value="documents">Dokumenty</TabsTrigger>
              <TabsTrigger value="completion">Realizacja</TabsTrigger>
              <TabsTrigger value="comments">Uwagi</TabsTrigger>
              <OrderForm
                products={products}
                customers={customers || []}
                userId={userId}
                editMode={true}
                order={order}
              />
            </TabsList>
            <TabsContent value="order">
              <div className="flex flex-row  mt-10 mb-5">
                <div className="w-full mr-5">Nr. {order.id}</div>
                <div className="w-full mr-5 gap-1.5 text-bold">
                  <div> {order.customer?.name} </div>
                  <Button className="w-full font-normal h-7" variant="zaza">
                    Panel Klienta
                  </Button>
                </div>
                <div className="w-full mr-5">
                  <div>NIP 111-11-11-111</div>
                  <div className="flex flex-row">
                    <Button className="w-full h-7 font-normal" variant="zaza">
                      Sprawdź NIP
                    </Button>
                    <Button className="w-full h-7 font-normal" variant="zaza">
                      Historia NIP
                    </Button>
                  </div>
                </div>
                <div className="w-full mr-5">
                  <div>
                    {order.user?.firstname} {order.user?.lastname}
                  </div>
                  <div className="w-full">Handlowiec</div>
                </div>
                <div className="w-full mr-5">
                  <div>{formatDate(order.created_at)}</div>
                  <div className="w-full">Data utworzenia</div>
                </div>
                <div className="w-full mr-5">
                  <div>
                    {new Date(order.created_at).toLocaleTimeString("pl-PL")}
                  </div>
                  <div className="w-full">Godzina utworzenia</div>
                </div>
              </div>
              <div className="flex flex-row  mt-5 mb-5">
                <div className="w-full mr-5">
                  <div>{order.foreign_id}</div>
                  <div className="w-full">Numer obcy</div>
                </div>
                <div className="w-full mr-5 gap-1.5 text-bold">
                  <div className="flex flex-row">
                    <div className="shrink-0 my-auto w-2.5 bg-amber-300 rounded-full h-[11px] mr-1" />
                    <div> {order.status} </div>
                  </div>
                  <div>Status</div>
                </div>
                <div className="w-full mr-5">
                  <div>{formatDate(order.delivery_date)}</div>
                  <div className="w-full">Data dostawy</div>
                </div>
                <div className="w-full mr-5">
                  <div>{booleanToYesNo(order.personal_collect)}</div>
                  <div className="w-full">Odbiór osobisty</div>
                </div>
              </div>
              <div className="flex flex-row  mt-5 mb-5">
                <div className="w-full mr-5">
                  <div>{order.wz_type}</div>
                  <div className="w-full">Typ WZ</div>
                </div>
                <div className="w-full mr-5 gap-1.5 text-bold">
                  <div className="flex flex-row">
                    <div> {booleanToYesNo(order.is_proforma)} </div>
                  </div>
                  <div>Proforma</div>
                </div>
                <div className="w-full mr-5">
                  <div>{formatDate(order.payment_deadline)}</div>
                  <div className="w-full">Data płatności</div>
                </div>
                <div className="w-full mr-5">
                  <div>{booleanToYesNo(order.is_paid)}</div>
                  <div className="w-full">Zapłacono</div>
                </div>
              </div>
              <div className="flex flex-col mt-6">
                <div className="flex flex-row w-96">
                  <div className="text-black text-[28px] font-medium mr-4">
                    Produkty
                  </div>
                </div>
                <OrderProductsTable orders={order.LineItem} />
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <div>
                <h1>Dokumenty</h1>
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
                <div className="min-w-[50%] ml-20 flex flex-col gap-1.5">
                  <div className="flex flex-row w-full max-w-sm items-center gap-1.5">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label>Rodzaj uwagi</Label>
                      <Select>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Wybierz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Rodzaj</SelectLabel>
                            <SelectItem value="general">Ogólna</SelectItem>
                            <SelectItem value="transport">Transport</SelectItem>
                            <SelectItem value="warehouse">Magazyn</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label>Gotowe uwagi</Label>
                      <Select>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Wybierz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Uwagi</SelectLabel>
                            <SelectItem value="test">
                              Dzwonić na numer kontaktowy
                            </SelectItem>
                            <SelectItem value="WZU">
                              Zamówienie priorytetowe
                            </SelectItem>
                            <SelectItem value="WZN">Uwaga ogólna</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="message">Your message</Label>
                    <Textarea
                      placeholder="Type your message here."
                      id="message"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="max-h-fit">
            <Button
              variant="zaza"
              className="w-[186px] h-7 px-3 py-2 bg-white rounded-lg shadow justify-center items-center gap-2.5 inline-flex"
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
