"use server";

import db from "@/db/db";
import fs from "fs/promises";

import { ProductSchema } from "@/schemas";
import { revalidatePath } from "next/cache";

export const createProduct = async (
  data: {
    id: string;
    name: string;
    category: string;
    sku: string;
    unit: string;
    secondary_unit: string;
    is_sold: boolean;
    is_produced: boolean;
    is_internal: boolean;
    is_one_time: boolean;
    is_entrusted: boolean;
    length: string;
    width: string;
    height: string;
    pack_quantity: string;
    actual_shape_volume: string;
    min_production_quantity: string;
    sales_volume: string;
    technological_volume: string;
    eps_type: string;
    weight: string;
    seasoning_time: string;
    manufacturer: string;
    ean: string;
    description: string;
    file: File;
    raw_material_type: string;
    raw_material_granulation: string;
    packaging_weight: string;
    packaging_type: string;
    created_at: Date;
    created_by: string;
    price?: string;
    auto_price_translate: boolean;
    min_price: string;
    vat: string;
    price_tolerance: string;
    comments?: {};
  },
  fileF: any[] | FormData
) => {
  const result = ProductSchema.safeParse(Object.fromEntries(fileF.entries()));
  const file = result.data?.file as File;

  let filePath = "";

  console.log(result.data);

  if (file) {
    await fs.mkdir("/tmp/documents", { recursive: true });
    filePath = `/tmp/documents/${crypto.randomUUID()}-${file.name}`;
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  }

  const product = await db.product.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      sku: data.sku,
      length: data.length,
      width: data.width,
      height: data.height,
      quantity_in_package: data.pack_quantity,
      actual_volume: data.actual_shape_volume,
      quantity_needed_for_production: data.min_production_quantity,
      sales_volume: data.sales_volume,
      technological_volume: data.technological_volume,
      eps_type: data.eps_type,
      ean: data.ean,
      weight: data.weight,
      seasoning_time: data.seasoning_time,
      manufacturer: data.manufacturer,
      primary_unit: data.unit,
      secondary_unit: data.secondary_unit,
      is_sold: data.is_sold,
      is_produced: data.is_produced,
      is_internal: data.is_internal,
      is_one_time: data.is_one_time,
      is_entrusted: data.is_entrusted,
      image_path: filePath,
      raw_material_type: data.raw_material_type,
      raw_material_granulation: data.raw_material_granulation,
      packaging_weight: data.packaging_weight,
      packaging_type: data.packaging_type,
      price: data.price,
      auto_price_translate: data.auto_price_translate,
      min_price: data.min_price,
      vat: data.vat,
      price_tolerance: data.price_tolerance,
      created_by: data.created_by,
      comments: data.comments,
    },
  });

  revalidatePath("/products");
  return {
    success: "Product created",
  };
};

export const updateProduct = async (
  id: string,
  data: {
    name: string;
    category: string;
    sku: string;
    unit: string;
    secondary_unit: string;
    is_sold: boolean;
    is_produced: boolean;
    is_internal: boolean;
    is_one_time: boolean;
    is_entrusted: boolean;
    length: string;
    width: string;
    height: string;
    pack_quantity: string;
    actual_shape_volume: string;
    min_production_quantity: string;
    sales_volume: string;
    technological_volume: string;
    eps_type: string;
    weight: string;
    seasoning_time: string;
    manufacturer: string;
    ean: string;
    description: string;
    file: File;
    raw_material_type: string;
    raw_material_granulation: string;
    packaging_weight: string;
    packaging_type: string;
    price?: string;
    auto_price_translate: boolean;
    min_price: string;
    vat: string;
    price_tolerance: string;
    comments?: {};
  },
  fileF: any[] | FormData
) => {
  const result = ProductSchema.safeParse(Object.fromEntries(fileF.entries()));
  const file = result.data?.file as File;

  let filePath = "";

  console.log(result.data);

  if (file) {
    await fs.mkdir("/tmp/documents", { recursive: true });
    filePath = `/tmp/documents/${crypto.randomUUID()}-${file.name}`;
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  }

  const updatedProduct = await db.product.update({
    where: {
      id: id,
    },
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      sku: data.sku,
      length: data.length,
      width: data.width,
      height: data.height,
      quantity_in_package: data.pack_quantity,
      actual_volume: data.actual_shape_volume,
      quantity_needed_for_production: data.min_production_quantity,
      sales_volume: data.sales_volume,
      technological_volume: data.technological_volume,
      eps_type: data.eps_type,
      ean: data.ean,
      weight: data.weight,
      seasoning_time: data.seasoning_time,
      manufacturer: data.manufacturer,
      primary_unit: data.unit,
      secondary_unit: data.secondary_unit,
      is_sold: data.is_sold,
      is_produced: data.is_produced,
      is_internal: data.is_internal,
      is_one_time: data.is_one_time,
      is_entrusted: data.is_entrusted,
      image_path: filePath,
      raw_material_type: data.raw_material_type,
      raw_material_granulation: data.raw_material_granulation,
      packaging_weight: data.packaging_weight,
      packaging_type: data.packaging_type,
      price: data.price,
      auto_price_translate: data.auto_price_translate,
      min_price: data.min_price,
      vat: data.vat,
      price_tolerance: data.price_tolerance,
      comments: data.comments,
    },
  });

  revalidatePath("/products");
  return {
    success: "Product updated",
  };
};
