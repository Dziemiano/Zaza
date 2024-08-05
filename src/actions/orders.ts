"use server";

import db from "@/db/db";
import fs from "fs/promises";

import { OrderSchema } from "@/schemas";
import { revalidatePath } from "next/cache";
import { getOrdersCount } from "@/data/orders";

export const createOrder = async (
  data: {
    transport_cost: string;
    foreign_id: any;
    customer_id: any;
    status: any;
    is_proforma: any;
    proforma_payment_date: any;
    wz_type: any;
    personal_collect: any;
    payment_deadline: any;
    delivery_date: any;
    created_by: any;
    is_paid: any;
    line_items: [];
  },
  fileF: any[] | FormData
) => {
  const result = OrderSchema.safeParse(Object.fromEntries(fileF.entries()));
  const file = result.data?.file as File;

  let filePath = "";

  console.log(result.data);

  if (file) {
    await fs.mkdir("/tmp/documents", { recursive: true });
    filePath = `/tmp/documents/${crypto.randomUUID()}-${file.name}`;
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  }

  const orderCount = await getOrdersCount();

  const id = `${orderCount + 1}/${
    new Date().getMonth() + 1
  }/${new Date().getFullYear()}`;

  console.log(id);

  const order = await db.order.create({
    data: {
      id: id,
      transport_cost: parseInt(data.transport_cost),
      foreign_id: data.foreign_id,
      customer_id: data.customer_id,
      status: data.status,
      is_proforma: data.is_proforma,
      proforma_payment_date: data.proforma_payment_date,
      wz_type: data.wz_type,
      personal_collect: data.personal_collect,
      payment_deadline: data.payment_deadline,
      delivery_date: data.delivery_date,
      created_by: data.created_by,
      is_paid: data.is_paid,
      document_path: filePath,
      LineItem: {
        create: data.line_items,
      },
    },
  });

  revalidatePath("/orders");
  return {
    success: "Order created",
  };
};

export const updateOrder = async (
  data: {
    id: string;
    transport_cost: string;
    foreign_id: any;
    customer_id: any;
    status: any;
    is_proforma: any;
    proforma_payment_date: any;
    wz_type: any;
    personal_collect: any;
    payment_deadline: any;
    delivery_date: any;
    created_by: any;
    is_paid: any;
    line_items: any[];
  },
  fileF: any[] | FormData
) => {
  const result = OrderSchema.safeParse(Object.fromEntries(fileF.entries()));
  const file = result.data?.file as File;

  let filePath = "";

  console.log(result.data);

  if (file) {
    await fs.mkdir("/tmp/documents", { recursive: true });
    filePath = `/tmp/documents/${crypto.randomUUID()}-${file.name}`;
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  }

  // Fetch existing line items from the database
  const existingLineItems = await db.lineItem.findMany({
    where: { order_id: data.id },
    select: { id: true },
  });

  const incomingLineItemIds = new Set(data.line_items.map((item) => item.id));
  const lineItemsToDelete = existingLineItems.filter(
    (item) => !incomingLineItemIds.has(item.id)
  );

  // Delete line items that are not in the incoming data
  await db.lineItem.deleteMany({
    where: { id: { in: lineItemsToDelete.map((item) => item.id) } },
  });

  // Update or upsert the remaining line items
  const order = await db.order.update({
    where: { id: data.id },
    data: {
      transport_cost: parseInt(data.transport_cost),
      foreign_id: data.foreign_id,
      customer_id: data.customer_id,
      status: data.status,
      is_proforma: data.is_proforma,
      proforma_payment_date: data.proforma_payment_date,
      wz_type: data.wz_type,
      personal_collect: data.personal_collect,
      payment_deadline: data.payment_deadline,
      delivery_date: data.delivery_date,
      created_by: data.created_by,
      is_paid: data.is_paid,
      document_path: filePath,
      LineItem: {
        upsert: data.line_items
          .filter((item) => item.id) // Ensure the item has an id
          .map((item) => ({
            where: { id: item.id },
            update: item,
            create: item,
          })),
      },
    },
  });

  revalidatePath("/orders");
  return {
    success: "Order updated",
  };
};
