import { auth } from "@/auth";
import { OrdersTable } from "@/components/orders/ordersTable";

import { Button } from "@/components/ui/button";
import {
  getAllOrders,
  getOrdersByUserId,
  getOrdersByCustomerSalesman,
} from "@/data/orders";
import { Suspense } from "react";
import { OrderForm } from "@/components/orders/ordersForm";
import { getAllCustomers } from "@/data/customers";
import { getAllProducts } from "@/data/products";
import Link from "next/link";
import { getAllSalesmen } from "@/data/user";

const OrderPage = async () => {
  const session = await auth();

  if (session === null || session === undefined) {
    throw new Error("Authentication failed");
  }

  const user = {
    id: session.user?.id,
    role: session.user?.role,
  };

  const orders =
    user.role === "SALESMAN" && user.id
      ? [
          ...((await getOrdersByUserId(user.id)) ?? []),
          ...((await getOrdersByCustomerSalesman(user.id)) ?? []),
        ]
      : (await getAllOrders()) ?? [];

  const customers = await getAllCustomers();

  const products = await getAllProducts();

  const salesmem = await getAllSalesmen();

  return (
    <div className="m-5">
      <div className="flex flex-col justify-center">
        <div className="flex gap-4 items-center text-black">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/6940c2d742c79e36db9201da6abbfd61adfd7423d7f2812f27c9da290dda59cf?"
            className="shrink-0 self-stretch my-auto aspect-square w-[25px]"
          />
          <div className="self-stretch text-3xl font-bold">Zamówienia</div>
        </div>
        <div className="flex gap-1 mt-4 text-xs text-neutral-400">
          <div>
            <Link href="/">Pulpit</Link>
          </div>
          <div>/</div>
          <div>Zamówienia</div>
        </div>
      </div>
      <div className="mt-4 mb-4 flex flex-row">
        <div className="min-w-[24%] mr-4">
          <OrderForm
            customers={customers || []}
            user={user}
            products={products || []}
            salesmen={salesmem || []}
          />
        </div>
        <Button variant={"zaza"} className="w-max min-w-[24%] mr-4 font-normal">
          Drukuj zamówienie
        </Button>
        <Button variant={"zaza"} className="w-max min-w-[24%] mr-4 font-normal">
          Drukuj proformę do zamówienia
        </Button>
        <Button variant={"zaza"} className="w-max min-w-[24%] font-normal">
          Przekaż zamówienie do produkcji
        </Button>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <OrdersTable
          customers={customers || []}
          orders={orders || []}
          products={products || []}
        />
      </Suspense>
    </div>
  );
};

export default OrderPage;
