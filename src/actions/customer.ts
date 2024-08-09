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
  ContactPerson: [];
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
        create: data.ContactPerson,
      },
    },
  });

  revalidatePath("/customers");
  return {
    success: "Klient utworzony",
  };
};

export const updateCustomer = async (id: string, data: CustomerType) => {
  const result = CustomerSchema.safeParse(data);

  console.log(result.data);

  const updatedCustomer = await db.customer.update({
    where: {
      id: id,
    },
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
      salesman: {
        set: data.salesman.map((id) => ({ id: id })),
      },
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
      DeliveryAdress: {
        deleteMany: {},
        create: data.DeliveryAdress,
      },
      branch: {
        deleteMany: {},
        create: data.branch,
      },
      ContactPerson: {
        deleteMany: {},
        create: data.ContactPerson,
      },
    },
  });

  revalidatePath("/customers");
  return {
    success: "Klient zaktualizowany",
  };
};
