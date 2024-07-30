import * as z from "zod";

export const NewPasswordSchema = z.object({
  password: z.string().min(6, { message: "Minimum 6 characters" }),
});

export const ResetSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }).min(4),
  password: z.string().min(1, { message: "Password is required" }),
  code: z.optional(z.string().min(6, { message: "Minimum 6 characters" })),
});

export const RegisterSchema = z.object({
  email: z.string().email({ message: "Invalid email" }).min(4),
  password: z.string().min(6, { message: "Minimum 6 characters" }),
  name: z.string().min(3, { message: "Name is required" }),
});

export const TwoFactorSchema = z.object({
  code: z.string().min(6, { message: "Minimum 6 characters" }),
});

export const OrderSchema = z.object({
  id: z.string().optional(),
  foreign_id: z.string().optional(),
  customer_id: z.string().optional(),
  status: z.string().optional(), // TODO: enum for statuses
  is_proforma: z.boolean().optional(),
  proforma_payment_date: z.date().optional(),
  wz_type: z.string().optional(),
  personal_collect: z.boolean().optional(),
  delivery_date: z.date().optional(),
  production_date: z.date().optional(),
  payment_deadline: z.date().optional(),
  delivery_place_id: z.string().optional(),
  delivery_city: z.string().optional(),
  delivery_street: z.string().optional(),
  delivery_building: z.string().optional(),
  delivery_zipcode: z.string().optional(),
  delivery_contact_number: z.string().optional(),
  deliver_time: z.date().optional(),
  transport_cost: z.string().optional(),
  order_history: z.string().optional(),
  created_at: z.date().optional(),
  created_by: z.string().optional(),
  is_paid: z.boolean().optional(),
  document_path: z.any().optional(),
  file: z.instanceof(File).optional(),
  nip: z.string().optional(),
  comments: z
    .object({
      general: z.array(z.string()),
      transport: z.array(z.string()),
      warehouse: z.array(z.string()),
    })
    .optional(),
});

export const CustomerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email" }).min(4),
  phone: z.string().optional(),
  address: z.string().optional(),
  nip: z.string().optional(),
  created_at: z.date().optional(),
  created_by: z.string().optional(),
});

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  sku: z.string().min(1, "SKU is required"),
  unit: z.string().min(1, "Unit is required"),
  secondary_unit: z.string().optional(),
  isForSale: z.boolean(),
  isInProduction: z.boolean(),
  isInternalProduct: z.boolean(),
  isOneTimeProduct: z.boolean(),
  isEntrustedProduct: z.boolean(),
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  packQuantity: z.string().optional(),
  actualShapeVolume: z.string().optional(),
  minProductionQuantity: z.string().optional(),
  salesVolume: z.string().optional(),
  technologicalVolume: z.string().optional(),
  epsType: z.string().optional(),
  weight: z.string().optional(),
  seasoningTime: z.string().optional(),
  producer: z.string().optional(),
  ean: z.string().optional(),
  production_description: z.string().optional(),
  file: z.instanceof(File).optional(),
  raw_material_type: z.string().optional(),
  raw_material_granulation: z.string().optional(),
  packaging_weight: z.string().optional(),
  packaging_type: z.string().optional(),
  created_at: z.date().optional(),
  created_by: z.string().optional(),
  price: z.string().optional(),
  auto_price_translate: z.boolean().optional(),
  min_price: z.string().optional(),
  vat: z.string().optional(),
  price_tolerance: z.string().optional(),
  comments: z
    .object({
      general: z.array(z.string()),
      transport: z.array(z.string()),
      warehouse: z.array(z.string()),
    })
    .optional(),
});
