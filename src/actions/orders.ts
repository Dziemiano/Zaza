"use server";

import db from "@/db/db";
import fs from "fs/promises";

import { OrderSchema } from "@/schemas";
import { revalidatePath } from "next/cache";
import { getOrdersCount } from "@/data/orders";
import { randomUUID } from "crypto";
import { logEvent } from "@/actions/logs";

type CommentCategory = "general" | "transport" | "warehouse";

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
    production_date: any;
    delivery_date: any;
    delivery_place_id: any;
    delivery_city: any;
    delivery_street: any;
    delivery_building: any;
    delivery_premises: any;
    delivery_zipcode: any;
    delivery_contact_number: any;
    delivery_contact: any;
    change_warehouse: any;
    warehouse_to_transport: any;
    order_history: any;
    email_content: any;
    created_at: any;
    created_by: any;
    is_paid: any;
    line_items: {}[];
    comments: [];
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

  const id =
    orderCount !== null
      ? `${orderCount + 1}/${
          new Date().getMonth() + 1
        }/${new Date().getFullYear()}`
      : "";

  console.log(id);

  const line_items_with_ids = data.line_items.map((item) => {
    const { order_id, ...rest } = item;
    return {
      ...rest,
      id: randomUUID(),
      helper_quantity: item.helper_quantity ?? "",
      help_quant_unit: item.help_quant_unit ?? "",
    };
  });

  // const mapComments = (comments: { [key in CommentCategory]: string[] }) => {
  //   return Object.entries(comments).flatMap(([category, categoryComments]) => {
  //     return categoryComments.map((commentBody) => ({
  //       id: `${randomUUID()}-${category}`,
  //       body: commentBody,
  //       type: category,
  //     }));
  //   });
  // };

  const order = await db.order.create({
    data: {
      id: id,
      transport_cost: parseInt(data.transport_cost) || 0,
      foreign_id: data.foreign_id,
      customer_id: data.customer_id,
      status: data.status,
      is_proforma: data.is_proforma,
      proforma_payment_date: data.proforma_payment_date,
      wz_type: data.wz_type,
      personal_collect: data.personal_collect,
      payment_deadline: data.payment_deadline,
      production_date: data.production_date,
      delivery_date: data.delivery_date,
      delivery_city: data.delivery_city,
      delivery_street: data.delivery_street,
      delivery_building: data.delivery_building,
      delivery_premises: data.delivery_premises,
      delivery_zipcode: data.delivery_zipcode,
      delivery_contact: data.delivery_contact,
      change_warehouse: data.change_warehouse,
      warehouse_to_transport: data.warehouse_to_transport,
      created_by: data.created_by,
      is_paid: data.is_paid,
      document_path: filePath,
      email_content: data.email_content,
      lineItems: {
        create: line_items_with_ids,
      },
      comments: {
        create: data.comments,
      },
    },
  });

  await logEvent({
    entity: "order",
    entity_id: id,
    entity_name: id,
    eventType: "created",
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
    production_date: any;
    delivery_date: any;
    delivery_place_id: any;
    delivery_city: any;
    delivery_street: any;
    delivery_building: any;
    delivery_premises: any;
    delivery_zipcode: any;
    delivery_contact_number: any;
    delivery_contact: any;
    change_warehouse: any;
    warehouse_to_transport: any;
    order_history: any;
    email_content: any;
    created_at: any;
    created_by: any;
    is_paid: any;
    line_items: any[];
    comments: any[];
  },
  fileF?: any[] | FormData
) => {
  const result = fileF
    ? OrderSchema.safeParse(Object.fromEntries(fileF.entries()))
    : null;
  const file = result?.data?.file as File;

  let filePath = "";

  console.log(data);

  if (file) {
    await fs.mkdir("/tmp/documents", { recursive: true });
    filePath = `/tmp/documents/${crypto.randomUUID()}-${file.name}`;
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  }

  const existingOrder = await db.order.findUnique({ where: { id: data.id } });

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
      production_date: data.production_date,
      delivery_date: data.delivery_date,
      delivery_city: data.delivery_city,
      delivery_street: data.delivery_street,
      delivery_building: data.delivery_building,
      delivery_premises: data.delivery_premises,
      delivery_zipcode: data.delivery_zipcode,
      delivery_contact: data.delivery_contact,
      change_warehouse: data.change_warehouse,
      warehouse_to_transport: data.warehouse_to_transport,
      is_paid: data.is_paid,
      document_path: filePath,
      email_content: data.email_content,
    },
  });

  for (const item of data.line_items) {
    if (!item.id) {
      item.id = randomUUID();
    }
    await db.lineItem.upsert({
      where: { id: item.id },
      create: {
        ...item,
        order_id: order.id,
        id: item.id,
        helper_quantity: item.helper_quantity ?? "",
        help_quant_unit: item.help_quant_unit ?? "",
      },
      update: {
        ...item,
        order_id: order.id,
        id: item.id,
        helper_quantity: item.helper_quantity ?? "",
        help_quant_unit: item.help_quant_unit ?? "",
      },
    });
  }

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

  const existingCommentsIds = new Set(
    (
      await db.comment.findMany({
        where: { order_id: data.id },
        select: { id: true },
      })
    ).map((item) => item.id)
  );
  for (const item of existingCommentsIds) {
    if (!data.comments?.some((comment) => comment.id === item)) {
      await db.comment.delete({ where: { id: item } });
    }
  }

  for (const comment of data.comments ?? []) {
    if (!comment.id) {
      comment.id = randomUUID();
    }
    await db.comment.upsert({
      where: { id: comment.id },
      create: {
        ...comment,
        order_id: order.id,
        id: comment.id,
      },
      update: {
        ...comment,
        order_id: order.id,
        id: comment.id,
      },
    });
  }

  const changedFields: { [key: string]: { old: any; new: any } } = {};
  for (const key in data) {
    if (data[key] !== existingOrder[key]) {
      changedFields[key] = { old: existingOrder[key], new: data[key] };
    }
  }

  await logEvent({
    entity: "order",
    entity_id: data.id,
    entity_name: data.id,
    eventType: "updated",
    changedData: changedFields,
  });

  revalidatePath("/orders");
  return {
    success: "Order updated",
  };
};

export const updateOrderEmail = async (
  data: {
    id: string;
    email_content: string;
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

  const order = await db.order.update({
    where: { id: data.id },
    data: {
      email_content: data.email_content,
      document_path: filePath,
    },
  });

  revalidatePath("/orders");
  return {
    success: "Order updated",
  };
};
