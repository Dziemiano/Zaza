"use server";

import db from "@/db/db";

import { CustomerSchema } from "@/schemas";
import { revalidatePath } from "next/cache";
import { logEvent } from "./logs";

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
  salesman_id?: string;
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

  if (!result.success) {
    return {
      error: result.error.issues[0].message,
    };
  }

  try {
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
        salesman_id: data.salesman_id,
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

    await logEvent({
      entity: "customer",
      entity_id: customer.id,
      entity_name: customer.symbol,
      eventType: "created",
    });

    revalidatePath("/customers");
    return {
      success: "Klient utworzony",
    };
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target === "Customer_nip_key") {
      return {
        error: {
          code: "P2002",
          message: "Klient o tym samym numerze NIP istnieje w bazie danych.",
        },
      };
      throw new Error(
        "Klient o tym samym numerze NIP istnieje już w bazie danych."
      );
    }

    console.log(error);
    throw new Error("Nie udało się stworzyć klienta"); // Generic error if it's not the NIP issue
  }
};

export const updateCustomer = async (id: string, data: CustomerType) => {
  const result = CustomerSchema.safeParse(data);

  console.log(result.data);

  const existingCustomer = await db.customer.findUnique({
    where: {
      id: id,
    },
  });

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
      salesman_id: data.salesman_id,
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
        upsert: data.DeliveryAdress.map((address) => {
          const { id, customer_id, ...addressData } = address;
          return {
            where: { id: id || "new-id" },
            update: addressData,
            create: addressData,
          };
        }),
      },
      branch: {
        upsert: data.branch.map((branch) => {
          const { id, customer_id, ...branchData } = branch;
          return {
            where: { id: id || "new-id" },
            update: branchData,
            create: branchData,
          };
        }),
      },
      ContactPerson: {
        upsert: data.ContactPerson.map((person) => {
          const { id, customer_id, ...personData } = person;
          return {
            where: { id: id || "new-id" },
            update: personData,
            create: personData,
          };
        }),
      },
    },
  });

  const changedFields: { [key: string]: { old: any; new: any } } = {};
  for (const key in data) {
    if (data[key] !== existingCustomer[key]) {
      changedFields[key] = {
        old: existingCustomer[key],
        new: data[key],
      };
    }
  }

  await logEvent({
    entity: "customer",
    entity_id: id,
    entity_name: data.symbol,
    eventType: "updated",
    changedData: changedFields,
  });

  revalidatePath("/customers");
  return {
    success: "Klient zaktualizowany",
  };
};
