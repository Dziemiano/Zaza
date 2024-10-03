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

  const replaceCommasInObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map((item) => replaceCommasInObject(item));
    } else if (typeof obj === "object" && obj !== null) {
      const newObj: { [key: string]: any } = {};
      for (const key in obj) {
        newObj[key] = replaceCommasInObject(obj[key]);
      }
      return newObj;
    } else if (typeof obj === "string") {
      return obj.replace(/,/g, ".");
    } else {
      return obj;
    }
  };

  // Replace commas with periods in the entire data object, including nested arrays/objects
  const processedData = replaceCommasInObject(data);

  const line_items_with_ids = processedData.line_items.map((item) => {
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
      transport_cost: parseInt(processedData.transport_cost) || 0,
      foreign_id: processedData.foreign_id,
      customer_id: processedData.customer_id,
      status: processedData.status,
      is_proforma: processedData.is_proforma,
      proforma_payment_date: processedData.proforma_payment_date,
      wz_type: processedData.wz_type,
      personal_collect: processedData.personal_collect,
      payment_deadline: processedData.payment_deadline,
      production_date: processedData.production_date,
      delivery_date: processedData.delivery_date,
      delivery_city: processedData.delivery_city,
      delivery_street: processedData.delivery_street,
      delivery_building: processedData.delivery_building,
      delivery_premises: processedData.delivery_premises,
      delivery_zipcode: processedData.delivery_zipcode,
      delivery_contact: processedData.delivery_contact,
      change_warehouse: processedData.change_warehouse,
      warehouse_to_transport: processedData.warehouse_to_transport,
      created_by: processedData.created_by,
      is_paid: processedData.is_paid,
      document_path: filePath,
      email_content: processedData.email_content,
      lineItems: {
        create: line_items_with_ids,
      },
      comments: {
        create: processedData.comments,
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
  const replaceCommasInObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map((item) => replaceCommasInObject(item));
    } else if (typeof obj === "object" && obj !== null) {
      const newObj: { [key: string]: any } = {};
      for (const key in obj) {
        newObj[key] = replaceCommasInObject(obj[key]);
      }
      return newObj;
    } else if (typeof obj === "string") {
      return obj.replace(/,/g, ".");
    } else {
      return obj;
    }
  };

  // Replace commas with periods in the entire data object, including nested arrays/objects
  const processedData = replaceCommasInObject(data);

  const result = fileF
    ? OrderSchema.safeParse(Object.fromEntries(fileF.entries()))
    : null;
  const file = result?.data?.file as File;

  let filePath = "";

  console.log(processedData);

  if (file) {
    await fs.mkdir("/tmp/documents", { recursive: true });
    filePath = `/tmp/documents/${crypto.randomUUID()}-${file.name}`;
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  }

  const existingOrder = await db.order.findUnique({
    where: { id: processedData.id },
  });

  const existingLineItems = await db.lineItem.findMany({
    where: { order_id: processedData.id },
    select: { id: true },
  });

  const incomingLineItemIds = new Set(
    processedData.line_items.map((item) => item.id).filter((id) => id)
  );
  const lineItemsToDelete = existingLineItems.filter(
    (item) => !incomingLineItemIds.has(item.id)
  );

  const order = await db.order.update({
    where: { id: processedData.id },
    data: {
      transport_cost: parseInt(processedData.transport_cost),
      customer_id: processedData.customer_id,
      foreign_id: processedData.foreign_id,
      status: processedData.status,
      is_proforma: processedData.is_proforma,
      proforma_payment_date: processedData.proforma_payment_date,
      wz_type: processedData.wz_type,
      personal_collect: processedData.personal_collect,
      payment_deadline: processedData.payment_deadline,
      production_date: processedData.production_date,
      delivery_date: processedData.delivery_date,
      delivery_city: processedData.delivery_city,
      delivery_street: processedData.delivery_street,
      delivery_building: processedData.delivery_building,
      delivery_premises: processedData.delivery_premises,
      delivery_zipcode: processedData.delivery_zipcode,
      delivery_contact: processedData.delivery_contact,
      change_warehouse: processedData.change_warehouse,
      warehouse_to_transport: processedData.warehouse_to_transport,
      is_paid: processedData.is_paid,
      document_path: filePath,
      email_content: processedData.email_content,
    },
  });

  for (const item of processedData.line_items) {
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
        where: { order_id: processedData.id },
        select: { id: true },
      })
    ).map((item) => item.id)
  );
  for (const item of existingLineItemsIds) {
    if (!processedData.line_items.some((li) => li.id === item)) {
      await db.lineItem.delete({ where: { id: item } });
    }
  }

  const existingCommentsIds = new Set(
    (
      await db.comment.findMany({
        where: { order_id: processedData.id },
        select: { id: true },
      })
    ).map((item) => item.id)
  );
  for (const item of existingCommentsIds) {
    if (!processedData.comments?.some((comment) => comment.id === item)) {
      await db.comment.delete({ where: { id: item } });
    }
  }

  for (const comment of processedData.comments ?? []) {
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
  for (const key in processedData) {
    if (processedData[key] !== existingOrder[key]) {
      changedFields[key] = { old: existingOrder[key], new: processedData[key] };
    }
  }

  await logEvent({
    entity: "order",
    entity_id: processedData.id,
    entity_name: processedData.id,
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
