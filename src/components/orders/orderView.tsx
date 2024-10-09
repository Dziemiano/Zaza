"use client";

import React, { useState, useTransition } from "react";
import { Button } from "../ui/button";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderProductsTable } from "./orderProductsTable";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { OrderForm } from "./ordersForm";
import { WzDocForm } from "../documents/wzDocForm";
import Link from "next/link";
import { OrderCheckPdf } from "../documents/orderCheckPdf";
import { EmailContentForm } from "./emailContentForm";
import { CommentSection } from "../reusable/commentsFormElement";
import { LogDialog } from "../reusable/logsDialog";
import OrderCompletionElement from "./orderCompletionElement";
import { OrderWzList } from "../documents/orderWzList";

interface OrderType {
  id: string;
  status: string;
  created_at: string;
  delivery_date: string;
  delivery_city: string | null;
  delivery_street: string | null;
  delivery_building: string | null;
  delivery_premises: string | null;
  delivery_zipcode: string | null;
  delivery_contact_number: string | null;
  delivery_contact: string | null;
  change_warehouse: boolean | null;
  warehouse_to_transport: string | null;
  payment_deadline: string;
  personal_collect: boolean;
  is_proforma: boolean;
  is_paid: boolean;
  email_content: string | null;
  customer?: {
    name: string;
  };
  created_by: string;
  foreign_id: string;
  wz_type: string;
  lineItems: any[];
  user: {
    firstname: string;
    lastname: string;
  };
  comments: {
    general: string[];
    transport: string[];
    warehouse: string[];
    production: string[];
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
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const userId = useCurrentUser()?.id;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  const booleanToYesNo = (value: boolean): string => {
    return value ? "Tak" : "Nie";
  };

  const filteredLineItems = order?.lineItems?.filter(
    (lineItem) => lineItem?.included_in_wz === null
  );

  const documentsLineItems = order?.lineItems?.filter(
    (lineItem) => lineItem?.included_in_wz !== null
  );

  const deliveredItems = documentsLineItems?.filter(
    (item) => item.included_in_wz
  );
  const deliveredQuantities = deliveredItems?.reduce(
    (total, item) => total + parseFloat(item.quantity || "0"),
    0
  );
  const totalQuantities = documentsLineItems?.reduce(
    (total, item) => total + parseFloat(item.quantity),
    0
  );
  const realization = isNaN(deliveredQuantities / totalQuantities)
    ? 0
    : Math.round((deliveredQuantities / totalQuantities) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="min-w-[90%] min-h-[90%] max-h-[95vh] flex flex-col content-start overflow-y-auto">
        <DialogHeader className="flex justify-between bg-white rounded-2xl shadow-sm max-md:flex-wrap max-md:pr-5 max-h-[30%]">
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
                Zamówienie {order?.id}
              </div>
              <div className="flex gap-2 self-stretch my-auto text-sm">
                <div className="shrink-0 my-auto w-2.5 bg-amber-300 rounded-full h-[11px]" />
                <div>{order?.status}</div>
              </div>
            </div>
            <div className="flex gap-1 mt-4 text-xs text-neutral-400">
              <div>
                <Link href="/">Pulpit</Link>
              </div>
              <div>/</div>
              <div>
                <Link href="/orders" onClick={() => setIsOpen(false)}>
                  Zamówienia
                </Link>
              </div>
              <div>/</div>
              <div>Zamówienie {order?.id}</div>
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col content-between h-[700px] flex-grow overflow-y-auto">
          <Tabs defaultValue="order" className="w-full h-full">
            <TabsList>
              <TabsTrigger value="order">Szczegóły zamówienia</TabsTrigger>
              {/* <TabsTrigger value="email">Korespondencja z klientem</TabsTrigger> */}
              <TabsTrigger value="documents">Dokumenty</TabsTrigger>
              <TabsTrigger value="completion">
                Realizacja {realization}%
              </TabsTrigger>
              <TabsTrigger value="comments">Uwagi</TabsTrigger>
              <OrderForm
                products={products}
                customers={customers || []}
                userId={userId}
                editMode={true}
                order={order}
              />
              <OrderForm
                products={products}
                customers={customers || []}
                userId={userId}
                copyMode={true}
                order={order}
              />
              {/* {order?.wz?.length ? (
                <WzCheckPdf wzData={order} />
              ) : ( */}
              <WzDocForm editMode={false} order={order} />
              {/* )} */}
              <OrderWzList order={order} />
              <OrderCheckPdf wzData={order} />
              <EmailContentForm order={order} />
              <LogDialog entity="order" entity_id={order?.id} />
            </TabsList>
            <TabsContent value="order">
              <div className="flex flex-row  mt-10 mb-5">
                <div className="w-full mr-5">Nr. {order?.id}</div>
                <div className="w-full mr-5 gap-1.5 text-bold">
                  <div> {order?.customer?.symbol} </div>
                  {/*  TODO : Link to customer view */}
                  {/* <Button className="w-full font-normal h-7" variant="zaza">
                    Panel Klienta
                  </Button> */}
                  <div>Klient</div>
                </div>
                <div className="w-full mr-5">
                  <div>NIP {order?.customer?.nip}</div>
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
                    {order?.user?.firstname} {order?.user?.lastname}
                  </div>
                  <div className="w-full">Handlowiec</div>
                </div>
                <div className="w-full mr-5">
                  <div>{formatDate(order?.created_at)}</div>
                  <div className="w-full">Data utworzenia</div>
                </div>
                <div className="w-full mr-5">
                  <div>
                    {new Date(order?.created_at).toLocaleTimeString("pl-PL")}
                  </div>
                  <div className="w-full">Godzina utworzenia</div>
                </div>
              </div>
              <div className="flex flex-row  mt-5 mb-5">
                <div className="w-full mr-5">
                  <div>{order?.foreign_id}</div>
                  <div className="w-full">Numer obcy</div>
                </div>
                <div className="w-full mr-5 gap-1.5 text-bold">
                  <div className="flex flex-row">
                    <div className="shrink-0 my-auto w-2.5 bg-amber-300 rounded-full h-[11px] mr-1" />
                    <div> {order?.status} </div>
                  </div>
                  <div>Status</div>
                </div>
                <div className="w-full mr-5">
                  <div>{formatDate(order?.delivery_date)}</div>
                  <div className="w-full">Data dostawy</div>
                </div>
                <div className="w-full mr-5">
                  <div>{booleanToYesNo(order?.personal_collect)}</div>
                  <div className="w-full">Odbiór osobisty</div>
                </div>
              </div>
              <div className="flex flex-row  mt-5 mb-5">
                <div className="w-full mr-5">
                  <div>{order?.wz_type}</div>
                  <div className="w-full">Typ WZ</div>
                </div>
                <div className="w-full mr-5 gap-1.5 text-bold">
                  <div className="flex flex-row">
                    <div> {booleanToYesNo(order?.is_proforma)} </div>
                  </div>
                  <div>Proforma</div>
                </div>
                <div className="w-full mr-5">
                  <div>{formatDate(order?.payment_deadline)}</div>
                  <div className="w-full">Data płatności</div>
                </div>
                <div className="w-full mr-5">
                  <div>{booleanToYesNo(order?.is_paid)}</div>
                  <div className="w-full">Zapłacono</div>
                </div>
              </div>
              <div className="flex flex-row  mt-5 mb-5">
                <div className="w-full mr-5">
                  <div>{booleanToYesNo(order?.change_warehouse)}</div>
                  <div className="w-full">Zmiana magazynu</div>
                </div>
                {order?.change_warehouse && (
                  <div className="w-full mr-5">
                    <div>{order?.warehouse_to_transport}</div>
                    <div className="w-full">Magazyn do transportu</div>
                  </div>
                )}
                <div className="w-full mr-5 gap-1.5 text-bold">
                  <div className="flex flex-row">
                    <div>
                      {" "}
                      {order?.delivery_street} {order?.delivery_building}{" "}
                      {order?.delivery_premises} {order?.delivery_zipcode}{" "}
                      {order?.delivery_city} {order?.delivery_zipcode}
                    </div>
                  </div>
                  <div>Adres Dostawy</div>
                </div>
                <div className="w-full mr-5">
                  <div>{order?.delivery_contact}</div>
                  <div className="w-full">Kontakt do dostawy</div>
                </div>
              </div>
              <div className="flex flex-col mt-6">
                <div className="flex flex-row w-96">
                  <div className="text-black text-[28px] font-medium mr-4">
                    Produkty
                  </div>
                </div>
                <OrderProductsTable orders={filteredLineItems} />
              </div>
            </TabsContent>

            <TabsContent value="completion">
              <div>
                <h1 className="mt-5">Realizacja</h1>
                <div className="text-black text-justify text-[14px] font-small mr-4 mt-5">
                  <OrderCompletionElement lineItems={documentsLineItems} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <div>
                <h1>Dokumenty</h1>
              </div>
            </TabsContent>

            <TabsContent value="comments">
              <CommentSection
                name="comments"
                comments={order?.comments}
                viewOnly={true}
              />
            </TabsContent>
          </Tabs>
          <DialogFooter className="max-h-fit mt-auto">
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
