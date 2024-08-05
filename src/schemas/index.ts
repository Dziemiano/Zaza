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
  firstname: z.string().min(3, { message: "Name is required" }),
});

export const TwoFactorSchema = z.object({
  code: z.string().min(6, { message: "Minimum 6 characters" }),
});

export const LineItemSchema = z.object({
  id: z.string().optional(),
  order_id: z.string().optional(),
  product_id: z.string().optional(),
  product_name: z.string().optional(),
  quantity: z.string().optional(),
  quant_unit: z.string().optional(),
  helper_quantity: z.string().optional(),
  help_quant_unit: z.string().optional(),
  discount: z.string().optional(),
  netto_cost: z.string().optional(),
  brutto_cost: z.string().optional(),
  vat_percentage: z.string().optional(),
  vat_cost: z.string().optional(),
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
  production_date: z.any().optional(),
  payment_deadline: z.date().optional(),
  delivery_place_id: z.any().optional(),
  delivery_city: z.any().optional(),
  delivery_street: z.any().optional(),
  delivery_building: z.any().optional(),
  delivery_zipcode: z.any().optional(),
  delivery_contact_number: z.any().optional(),
  deliver_time: z.any().optional(),
  transport_cost: z.any().optional(),
  order_history: z.any().optional(),
  created_at: z.date().optional(),
  created_by: z.string().optional(),
  created_by_id: z.string().optional(),
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
  line_items: z.array(LineItemSchema).optional(),
  LineItem: z.array(LineItemSchema).optional(),
  user: z.any().optional(),
  customer: z.any().optional(),
});

export const ContactPersonSchema = z.object({
  id: z.string().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().optional(),
  customer_id: z.string().optional(),
});

export const DeliveryAdressSchema = z.object({
  id: z.string().optional(),
  street: z.string().optional(),
  building: z.string().optional(),
  premises: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  customer_id: z.string().optional(),
});

export const CompanyBranchSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  customer_id: z.string().optional(),
  salesman_id: z.string().optional(),
  street: z.string().optional(),
  building: z.string().optional(),
  premises: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  person: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().optional(),
});

export const CustomerSchema = z.object({
  id: z.string().optional(),
  nip: z.string(),
  symbol: z.string().optional(),
  name: z.string().min(3, { message: "Name is required" }),
  primary_email: z
    .string()
    .email({ message: "Invalid email" })
    .min(4)
    .optional(),
  documents_email: z.string().optional(),
  phone_number: z.string().optional(),
  street: z.string().optional(),
  building: z.string().optional(),
  premises: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  payment_type: z.string().optional(),
  customer_type: z.string().optional(),
  payment_punctuality: z.string().optional(),
  salesman: z.array(z.string()).optional().default([]),
  branch: z.array(CompanyBranchSchema).optional().default([]),
  credit_limit: z.string().optional(),
  max_discount: z.string().optional(),
  send_email_invoice: z.boolean().optional().default(false),
  invoice_name: z.string().optional(),
  invoice_nip: z.string().optional(),
  invoice_street: z.string().optional(),
  invoice_building: z.string().optional(),
  invoice_premises: z.string().optional(),
  invoice_city: z.string().optional(),
  invoice_postal_code: z.string().optional(),
  invoice_country: z.string().optional(),
  created_at: z.date().optional(),
  created_by: z.string().optional(),
  created_by_id: z.string().optional(),
  Orders: z.array(OrderSchema).optional().default([]),
  contactPerson: z.array(ContactPersonSchema).optional().default([]),
  DeliveryAdress: z.array(DeliveryAdressSchema).optional().default([]),
  comments: z
    .object({
      general: z.array(z.string()),
      transport: z.array(z.string()),
      warehouse: z.array(z.string()),
    })
    .optional(),
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
