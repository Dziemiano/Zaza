"use server";

import db from "@/db/db";
import fs from "fs/promises";

import { CustomerSchema } from "@/schemas";
import { revalidatePath } from "next/cache";
import { connect } from "http2";

export type PaymentType = {
  PREPAID: "Przedpłata";
  WIRE: "Przelew";
  CASH: "Gotówka";
};

export type CustomerType = {
  nip: string;
  symbol: string;
  name: string;
  primary_email: string;
  documents_email?: string;
  phone_number?: string;
  street: string;
  building: string;
  premises?: string;
  city: string;
  postal_code: string;
  country: string;
  payment_type: PaymentType;
  customer_type?: string;
  payment_punctuality?: string;
  comments?: [];
  salesman: [];
  branch: [];
  credit_limit?: string;
  max_discount?: string;
  send_email_invoice: boolean;
  invoice_name?: string;
  invoice_nip?: string;
  invoice_street: string;
  invoice_building: string;
  invoice_premises: string;
  invoice_city: string;
  invoice_postal_code: string;
  invoice_country: string;
  created_by_id: string;
  contactPerson: [];
  DeliveryAdress: [];
};

export const createCustomer = async (data: CustomerType) => {
  const result = CustomerSchema.safeParse(data);

  console.log(result.data);

  const customer = await db.customer.create({
    data: {
      nip: data.nip,
      symbol: data.symbol,
      name: data.name,
      primary_email: data.primary_email,
      documents_email: data.documents_email,
      phone_number: data.phone_number,
      street: data.street,
      building: data.building,
      premises: data.premises,
      city: data.city,
      postal_code: data.postal_code,
      country: data.country,
      payment_type: data.payment_type,
      customer_type: data.customer_type,
      payment_punctuality: data.payment_punctuality,
      // comments: data.comments,
      salesman: { connect: data.salesman.map((id) => ({ id: id })) },
      credit_limit: data.credit_limit,
      max_discount: data.max_discount,
      send_email_invoice: data.send_email_invoice,
      invoice_name: data.invoice_name,
      invoice_nip: data.invoice_nip,
      invoice_street: data.invoice_street,
      invoice_building: data.invoice_building,
      invoice_premises: data.invoice_premises,
      invoice_city: data.invoice_city,
      invoice_postal_code: data.invoice_postal_code,
      invoice_country: data.invoice_country,
      created_by_id: data.created_by_id,
      DeliveryAdress: {
        create: data.DeliveryAdress,
      },
      branch: {
        create: data.branch,
      },
      ContactPerson: {
        create: data.contactPerson,
      },
    },
  });

  revalidatePath("/customers");
  return {
    success: "Klient utworzony",
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
    },
  });

  revalidatePath("/orders");
  return {
    success: "Order created",
  };
};
