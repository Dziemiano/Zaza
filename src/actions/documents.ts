"use server";

import db from "@/db/db";
import { revalidatePath } from "next/cache";
import { getWzCountByType } from "@/data/documents";
import { logEvent } from "./logs";
import { postOptimaDocument } from "@/lib/optima";

export const createWz = async (data: {
  type: string;
  unit_type: string;
  created_by: string;
  order_id: string;
  created_at: Date;
  status: string;
  out_date: Date;
  issue_date: Date;
  driver: string;
  car: string;
  cargo_person: string;
  pallet_type: string;
  pallet_count: string;
  additional_info: string;
  line_items: Array<{
    id: string;
    product_id: string;
    product_name: string;
    order_id: string;
    wz_quantity: string;
    remaining_quantity: string;
    helper_quantity: string;
    help_quant_unit: string;
    wz_unit: string;
    price: number;
    vat: number;
    is_used: boolean;
  }>;
}) => {
  // ISSUE ON SERVER TO BE FIXED
  const issueDate = new Date(data.issue_date);
  if (isNaN(issueDate.getTime())) {
    throw new Error("Invalid issue_date provided");
  }
  const adjustedIssueDate = new Date(issueDate.getTime() + 2 * 60 * 60 * 1000);

  console.log("Original Issue Date:", issueDate);
  console.log("Adjusted Issue Date:", adjustedIssueDate);
  console.log("out_date:", data.out_date);

  const documentCount = await getWzCountByType(data.type, adjustedIssueDate);

  const month = adjustedIssueDate.getUTCMonth() + 1;
  const year = adjustedIssueDate.getUTCFullYear();
  const doc_number = `${(documentCount ?? 0) + 1}/${month
    .toString()
    .padStart(2, "0")}/${year}`;

  console.log(
    "Document Number:",
    doc_number,
    "Adjusted Issue Date:",
    adjustedIssueDate
  );
  console.log(data);
  const result = await db.$transaction(async (tx) => {
    const wz = await tx.wz.create({
      data: {
        doc_number: doc_number,
        type: data.type,
        unit_type: data.unit_type,
        created_by: data.created_by,
        order_id: data.order_id,
        created_at: data.created_at,
        status: data.status,
        out_date: data.out_date,
        issue_date: adjustedIssueDate,
        driver: data.driver,
        car: data.car,
        cargo_person: data.cargo_person,
        pallet_type: data.pallet_type,
        pallet_count: parseInt(data.pallet_count),
        additional_info: data.additional_info,
      },
    });

    for (const item of data.line_items) {
      await tx.lineItem.create({
        data: {
          product_id: item.product_id,
          product_name: item.product_name,
          order_id: item.order_id,
          wz_id: wz.id,
          quantity: item.wz_quantity,
          quant_unit: item.wz_unit,
          helper_quantity: item.helper_quantity,
          help_quant_unit: item.help_quant_unit,
          included_in_wz: true,
        },
      });

      if (parseFloat(item.remaining_quantity) > 0) {
        await tx.lineItem.create({
          data: {
            product_id: item.product_id,
            product_name: item.product_name,
            order_id: item.order_id,
            quantity: item.remaining_quantity,
            quant_unit: item.wz_unit,
            included_in_wz: false,
          },
        });
      }

      await tx.lineItem.update({
        where: { id: item.id },
        data: { is_used: true },
      });
    }

    return wz;
  });

  await logEvent({
    entity: "wz",
    entity_id: result.id,
    entity_name: doc_number,
    eventType: "created",
  });

  revalidatePath("/orders");
  revalidatePath("/documents");

  return { success: "WZ document created successfully" };
};
