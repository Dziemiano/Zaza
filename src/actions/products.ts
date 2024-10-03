"use server";

import db from "@/db/db";
import fs from "fs/promises";

import { ProductSchema } from "@/schemas";
import { revalidatePath } from "next/cache";
import { logEvent } from "./logs";

export const createProduct = async (
  data: {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    sku: string;
    primary_unit: string;
    first_helper_unit?: string;
    first_helper_unit_value?: string;
    second_helper_unit?: string;
    second_helper_unit_value?: string;
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
  console.log(data);

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
  console.log(processedData);

  if (file) {
    await fs.mkdir("/tmp/documents", { recursive: true });
    filePath = `/tmp/documents/${crypto.randomUUID()}-${file.name}`;
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  }

  if (processedData.is_one_time) {
    const product = await db.product.create({
      data: {
        id: processedData.id,
        name: processedData.name,
        description: processedData.description,
        category: processedData.category,
        subcategory: processedData.subcategory,
        sku: processedData.sku,
        length: processedData.length,
        width: processedData.width,
        height: processedData.height,
        quantity_in_package: processedData.pack_quantity,
        actual_volume: processedData.actual_shape_volume,
        quantity_needed_for_production: processedData.min_production_quantity,
        sales_volume: processedData.sales_volume,
        technological_volume: processedData.technological_volume,
        eps_type: processedData.eps_type,
        ean: processedData.ean,
        weight: processedData.weight,
        seasoning_time: processedData.seasoning_time,
        manufacturer: processedData.manufacturer,
        primary_unit: processedData.primary_unit,
        first_helper_unit: processedData.first_helper_unit,
        first_helper_unit_value: processedData.first_helper_unit_value,
        second_helper_unit: processedData.second_helper_unit,
        second_helper_unit_value: processedData.second_helper_unit_value,
        is_sold: processedData.is_sold,
        is_produced: processedData.is_produced,
        is_internal: processedData.is_internal,
        is_one_time: processedData.is_one_time,
        is_entrusted: processedData.is_entrusted,
        image_path: filePath,
        raw_material_type: processedData.raw_material_type,
        raw_material_granulation: processedData.raw_material_granulation,
        packaging_weight: processedData.packaging_weight,
        packaging_type: processedData.packaging_type,
        price: processedData.price,
        auto_price_translate: processedData.auto_price_translate,
        min_price: processedData.min_price,
        vat: processedData.vat,
        price_tolerance: processedData.price_tolerance,
        created_by: processedData.created_by,
        comments: processedData.comments,
      },
    });
    await logEvent({
      entity: "product",
      entity_id: product.id,
      entity_name: product.name,
      eventType: "created",
    });
  } else {
    const product = await db.product.create({
      data: {
        name: processedData.name,
        description: processedData.description,
        category: processedData.category,
        subcategory: processedData.subcategory,
        sku: processedData.sku,
        length: processedData.length,
        width: processedData.width,
        height: processedData.height,
        quantity_in_package: processedData.pack_quantity,
        actual_volume: processedData.actual_shape_volume,
        quantity_needed_for_production: processedData.min_production_quantity,
        sales_volume: processedData.sales_volume,
        technological_volume: processedData.technological_volume,
        eps_type: processedData.eps_type,
        ean: processedData.ean,
        weight: processedData.weight,
        seasoning_time: processedData.seasoning_time,
        manufacturer: processedData.manufacturer,
        primary_unit: processedData.primary_unit,
        first_helper_unit: processedData.first_helper_unit,
        first_helper_unit_value: processedData.first_helper_unit_value,
        second_helper_unit: processedData.second_helper_unit,
        second_helper_unit_value: processedData.second_helper_unit_value,
        is_sold: processedData.is_sold,
        is_produced: processedData.is_produced,
        is_internal: processedData.is_internal,
        is_one_time: processedData.is_one_time,
        is_entrusted: processedData.is_entrusted,
        image_path: filePath,
        raw_material_type: processedData.raw_material_type,
        raw_material_granulation: processedData.raw_material_granulation,
        packaging_weight: processedData.packaging_weight,
        packaging_type: processedData.packaging_type,
        price: processedData.price,
        auto_price_translate: processedData.auto_price_translate,
        min_price: processedData.min_price,
        vat: processedData.vat,
        price_tolerance: processedData.price_tolerance,
        created_by: processedData.created_by,
        comments: processedData.comments,
      },
    });
    await logEvent({
      entity: "product",
      entity_id: product.id,
      entity_name: product.name,
      eventType: "created",
    });
    revalidatePath("/products");
  }
  return {
    success: "Product created",
  };
};

export const updateProduct = async (
  id: string,
  data: {
    name: string;
    category: string;
    subcategory: string;
    sku: string;
    primary_unit: string;
    first_helper_unit?: string;
    first_helper_unit_value?: string;
    second_helper_unit?: string;
    second_helper_unit_value?: string;
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

  const existingProduct = await db.product.findUnique({
    where: {
      id: id,
    },
  });

  let filePath = "";

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
      name: processedData.name,
      description: processedData.description,
      category: processedData.category,
      subcategory: processedData.subcategory,
      sku: processedData.sku,
      length: processedData.length,
      width: processedData.width,
      height: processedData.height,
      quantity_in_package: processedData.pack_quantity,
      actual_volume: processedData.actual_shape_volume,
      quantity_needed_for_production: processedData.min_production_quantity,
      sales_volume: processedData.sales_volume,
      technological_volume: processedData.technological_volume,
      eps_type: processedData.eps_type,
      ean: processedData.ean,
      weight: processedData.weight,
      seasoning_time: processedData.seasoning_time,
      manufacturer: processedData.manufacturer,
      primary_unit: processedData.primary_unit,
      first_helper_unit: processedData.first_helper_unit,
      first_helper_unit_value: processedData.first_helper_unit_value,
      second_helper_unit: processedData.second_helper_unit,
      second_helper_unit_value: processedData.second_helper_unit_value,
      is_sold: processedData.is_sold,
      is_produced: processedData.is_produced,
      is_internal: processedData.is_internal,
      is_one_time: processedData.is_one_time,
      is_entrusted: processedData.is_entrusted,
      image_path: filePath,
      raw_material_type: processedData.raw_material_type,
      raw_material_granulation: processedData.raw_material_granulation,
      packaging_weight: processedData.packaging_weight,
      packaging_type: processedData.packaging_type,
      price: processedData.price,
      auto_price_translate: processedData.auto_price_translate,
      min_price: processedData.min_price,
      vat: processedData.vat,
      price_tolerance: processedData.price_tolerance,
      comments: processedData.comments,
    },
  });

  const changedFields: { [key: string]: { old: any; new: any } } = {};
  for (const key in data) {
    if (data[key] !== existingProduct[key]) {
      changedFields[key] = {
        old: existingProduct[key],
        new: data[key],
      };
    }
  }

  await logEvent({
    entity: "product",
    entity_id: updatedProduct.id,
    entity_name: updatedProduct.name,
    changedData: changedFields,
    eventType: "updated",
  });

  revalidatePath("/products");
  return {
    success: "Product updated",
  };
};
