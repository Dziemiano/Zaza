import { auth } from "@/auth";

import { ProductsTable } from "@/components/products/productsTable";

import { Button } from "@/components/ui/button";
import { addData } from "@/actions/orders";
import { getAllOrders } from "@/data/orders";
import { Suspense } from "react";
import { OrderView } from "@/components/orders/orderView";
import { useState } from "react";
import { ProductForm } from "@/components/products/productsForm";
import { getAllCustomers } from "@/data/customers";
import { getAllProducts } from "@/data/products";
import Link from "next/link";

const ProductsPage = async () => {
  const session = await auth();

  const userId = session.user?.id;

  const orders = await getAllOrders();

  const customers = await getAllCustomers();

  const products = await getAllProducts();
  return (
    <div className="m-5">
      <div className="flex flex-col justify-center">
        <div className="flex gap-4 items-center text-black">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/6940c2d742c79e36db9201da6abbfd61adfd7423d7f2812f27c9da290dda59cf?"
            className="shrink-0 self-stretch my-auto aspect-square w-[25px]"
          />
          <div className="self-stretch text-3xl font-bold">Produkty</div>
        </div>
        <div className="flex gap-1 mt-4 text-xs text-neutral-400">
          <div>
            <Link href="/">Pulpit</Link>
          </div>
          <div>/</div>
          <div>Produkty</div>
        </div>
      </div>
      <div className="mt-4 mb-4 flex flex-row">
        <div className="min-w-[24%] mr-4">
          <ProductForm />
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductsTable products={products || []} />
      </Suspense>
    </div>
  );
};

export default ProductsPage;
