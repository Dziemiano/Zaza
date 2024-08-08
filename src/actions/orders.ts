"use server";

import db from "@/db/db";
import fs from "fs/promises";

import { OrderSchema } from "@/schemas";
import { revalidatePath } from "next/cache";
import { getOrdersCount } from "@/data/orders";
import { randomUUID } from "crypto";

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

  console.log(data);

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

  const line_items_with_ids = data.line_items.map((item, index) => {
    return {
      ...item,
      id: randomUUID(),
    };
  });

  console.log(line_items_with_ids);
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
        create: line_items_with_ids,
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

  console.log(data);

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

  const incomingLineItemIds = new Set(
    data?.line_items.map((item) => item.id).filter((id) => id)
  ); // Ensure ids are defined
  const lineItemsToDelete = existingLineItems.filter(
    (item) => !incomingLineItemIds.has(item.id)
  );
  console.log(existingLineItems, incomingLineItemIds, lineItemsToDelete);
  console.log(data.line_items);

  // Update or upsert the remaining line items
  const order = await db.order.update({
    where: { id: data.id },
    data: {
      transport_cost: parseInt(data.transport_cost),
      customer_id: data.customer_id,
      foreign_id: data.foreign_id,
      status: data.status,
      is_proforma: data.is_proforma,
      proforma_payment_date: data.proforma_payment_date,
      wz_type: data.wz_type,
      personal_collect: data.personal_collect,
      payment_deadline: data.payment_deadline,
      delivery_date: data.delivery_date,
      is_paid: data.is_paid,
      document_path: filePath,
    },
  });

  // Upsert line items
  for (const item of data.line_items) {
    if (!item.id) {
      item.id = randomUUID(); // Generate a new ID if it's missing
    }
    await db.lineItem.upsert({
      where: { id: item.id },
      create: { ...item, order_id: order.id, id: item.id },
      update: { ...item, order_id: order.id, id: item.id },
    });
  }

  // Delete line items that are not in the incoming data
  const existingLineItemsIds = new Set(
    (
      await db.lineItem.findMany({
        where: { order_id: data.id },
        select: { id: true },
      })
    ).map((item) => item.id)
  );
  for (const item of existingLineItemsIds) {
    if (!data.line_items.some((li) => li.id === item)) {
      await db.lineItem.delete({ where: { id: item } });
    }
  }

  revalidatePath("/orders");
  return {
    success: "Order updated",
  };
};
