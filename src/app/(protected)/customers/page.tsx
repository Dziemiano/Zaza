import { auth } from "@/auth";
import { CustomersTable } from "@/components/customers/customersTable";

import { Suspense } from "react";
import { CustomerForm } from "@/components/customers/customerForm";
import { getAllCustomers } from "@/data/customers";
import { getAllSalesmen } from "@/data/user";
import Link from "next/link";

const OrderPage = async () => {
  const session = await auth();

  const userId = session?.user.id;

  const customers = await getAllCustomers();

  const salesmen = await getAllSalesmen();

  return (
    <div className="m-5">
      <div className="flex flex-col justify-center">
        <div className="flex gap-4 items-center text-black">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/6940c2d742c79e36db9201da6abbfd61adfd7423d7f2812f27c9da290dda59cf?"
            className="shrink-0 self-stretch my-auto aspect-square w-[25px]"
          />
          <div className="self-stretch text-3xl font-bold">Klienci</div>
        </div>
        <div className="flex gap-1 mt-4 text-xs text-neutral-400">
          <div>
            <Link href="/">Pulpit</Link>
          </div>
          <div>/</div>
          <div>Klienci</div>
        </div>
      </div>
      <div className="mt-4 mb-4 flex flex-row">
        <div className="min-w-[24%] mr-4">
          <CustomerForm userId={userId} salesmen={salesmen || []} />
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <CustomersTable customers={customers || []} salesmen={salesmen || []} />
      </Suspense>
    </div>
  );
};

export default OrderPage;
