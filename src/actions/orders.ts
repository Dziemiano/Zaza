"use server";

import db from "@/db/db";
import fs from "fs/promises";

import { OrderSchema } from "@/schemas";
import { revalidatePath } from "next/cache";

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

  const order = await db.order.create({
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
    },
  });

  revalidatePath("/orders");
  return {
    success: "Order created",
  };
};

export const addData = async (data: {
  productData: any;
  orderData?: {
    foreign_id: string;
    customer_id: string;
    status: string;
    is_proforma: boolean;
    proforma_payment_date: string;
    wz_type: string;
    personal_collect: boolean;
    delivey_date: string;
    production_date: string;
    payment_deadline: string;
    delivery_place_id: string;
    delivery_city: string;
    delivery_street: string;
    delivery_building: string;
    delivery_zipcode: string;
    delivery_contact_number: string;
    delivery_date: string;
    deliver_time: string;
    transport_cost: number;
    order_history: string;
    created_by: string;
    is_paid: boolean;
  };
  lineItems: any;
  foreign_id?: any;
  customer_id?: any;
  status?: any;
  is_proforma?: any;
  proforma_payment_date?: any;
  wz_type?: any;
  personal_collect?: any;
  production_date?: any;
  payment_deadline?: any;
  delivery_place_id?: any;
  delivery_city?: any;
  delivery_street?: any;
  delivery_building?: any;
  delivery_zipcode?: any;
  delivery_contact_number?: any;
  delivery_date?: any;
  deliver_time?: any;
  transport_cost?: any;
  order_history?: any;
  created_by?: any;
  is_paid?: any;
}) => {
  // Create a new Product
  const product = await db.product.create({
    data: {
      name: data.productData.name,
      description: data.productData.description,
      price: data.productData.price,
      created_by: data.productData.created_by,
      category: data.productData.category,
    },
  });

  // Create a new Order
  const order = await db.order.create({
    data: {
      foreign_id: data.foreign_id,
      customer_id: data.customer_id,
      status: data.status,
      is_proforma: data.is_proforma,
      proforma_payment_date: data.proforma_payment_date,
      wz_type: data.wz_type,
      personal_collect: data.personal_collect,
      production_date: data.production_date,
      payment_deadline: data.payment_deadline,
      delivery_place_id: data.delivery_place_id,
      delivery_city: data.delivery_city,
      delivery_street: data.delivery_street,
      delivery_building: data.delivery_building,
      delivery_zipcode: data.delivery_zipcode,
      delivery_contact_number: data.delivery_contact_number,
      delivery_date: data.delivery_date,
      deliver_time: data.deliver_time,
      transport_cost: data.transport_cost,
      order_history: data.order_history,
      created_by: data.created_by,
      is_paid: data.is_paid,
    },
  });

  // Create LineItems for the Order
  const lineItemsData = data.lineItems.map((item: any) => ({
    ...item,
    order_id: order.id,
    product_id: product.id,
  }));

  const createdLineItems = await db.lineItem.createMany({
    data: lineItemsData,
  });
};
