import * as z from "zod";

export const NewPasswordSchema = z.object({
  password: z.string().min(6, { message: "Minimum 6 characters" }),
});

export const ResetSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy email" }).min(4),
  password: z.string().min(1, { message: "Hasło jest wymagane" }),
  code: z.optional(z.string().min(6, { message: "Minimum 6 characters" })),
});

export const RegisterSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy email" }).min(4),
  password: z.string().min(6, { message: "Minimum 8 znaków" }),
  firstname: z.string().min(3, { message: "Imię wymagane" }),
});

export const TwoFactorSchema = z.object({
  code: z.string().min(6, { message: "Minimum 6 characters" }),
});

export const LineItemSchema = z.object({
  id: z.string().optional(),
  order_id: z.string().optional(),
  product_id: z.string().optional(),
  product_name: z.string().optional(),
  quantity: z
    .string({
      required_error: "Ilość jest wymagana",
    })
    .min(1, { message: "Ilość jest wymagana" }),
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
  foreign_id: z.string().min(4, "Numer obcy jest wymagany"),
  customer_id: z.string().optional(),
  status: z.string(), // TODO: enum for statuses
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
  transport_cost: z.number(),
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

const transformContactPersons = (value: unknown) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "object" && value !== null) {
    return [value];
  }
  return [];
};

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
  name: z.string().min(3, { message: "Nazwa jest wymagana" }),
  primary_email: z
    .string()
    .email({ message: "Niepoprawny email" })
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
  created_by_id: z.string().optional(),
  Orders: z.array(OrderSchema).optional().default([]),
  ContactPerson: z
    .array(ContactPersonSchema)
    .transform(transformContactPersons),
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
  name: z
    .string({ required_error: "Pole wymagane" })
    .min(1, "Nazwa jest wymagana"),
  category: z
    .string({ required_error: "Pole wymagane" })
    .min(1, "Kategoria jest wymagana"),
  sku: z
    .string({ required_error: "Pole wymagane" })
    .min(1, "SKU jest wymagane"),
  unit: z
    .string({ required_error: "Pole wymagane" })
    .min(1, "Jednostka podstawowa jest wymagana"),
  secondary_unit: z.string().nullable().optional(),
  is_sold: z.boolean(),
  is_produced: z.boolean(),
  is_internal: z.boolean(),
  is_one_time: z.boolean(),
  is_entrusted: z.boolean(),
  length: z.string().nullable().optional(),
  width: z.string().nullable().optional(),
  height: z.string().nullable().optional(),
  pack_quantity: z.string().nullable().optional(),
  actual_shape_volume: z.string().nullable().optional(),
  min_production_quantity: z.string().nullable().optional(),
  sales_volume: z.string().nullable().optional(),
  technological_volume: z.string().nullable().optional(),
  eps_type: z.string().nullable().optional(),
  weight: z.string().nullable().optional(),
  seasoning_time: z.string().nullable().optional(),
  manufacturer: z.string().nullable().optional(),
  ean: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  file: z.any().optional(),
  raw_material_type: z.string().nullable().optional(),
  raw_material_granulation: z.string().nullable().optional(),
  packaging_weight: z.string().nullable().optional(),
  packaging_type: z.string().nullable().optional(),
  price: z
    .string({
      required_error: "Pole wymagane",
    })
    .nullable(),
  auto_price_translate: z.boolean().optional().default(false),
  min_price: z.string().nullable().optional(),
  vat: z.string().nullable().default("23"),
  price_tolerance: z.string().nullable().optional(),
  comments: z
    .object({
      general: z.array(z.string()),
      transport: z.array(z.string()),
      warehouse: z.array(z.string()),
    })
    .optional(),
  created_by: z.string().optional(),
  created_at: z.date().optional(),
});
