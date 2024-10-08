import { Status } from "@/types/orders.types";
import { de } from "date-fns/locale";
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
  id: z.string().optional().nullable(),
  ordinal_number: z.number().optional().nullable(),
  order_id: z.string().optional().nullable(),
  product_id: z.string().optional().nullable(),
  product_name: z.string().optional().nullable(),
  quantity: z
    .string({
      required_error: "Ilość jest wymagana",
    })
    .min(1, { message: "Ilość jest wymagana" })
    .nullable(),
  quant_unit: z.string().optional().nullable(),
  helper_quantity: z.string().optional().nullable(),
  help_quant_unit: z.string().optional().nullable(),
  discount: z.string().optional().nullable(),
  netto_cost: z.string().optional().nullable(),
  brutto_cost: z.string().optional().nullable(),
  vat_percentage: z.string().optional().nullable(),
  vat_cost: z.string().optional().nullable(),
});

export const OrderSchema = z.object({
  id: z.string().optional(),
  foreign_id: z.string().min(4, "Numer obcy jest wymagany"),
  customer_id: z.string().optional(),
  status: z.nativeEnum(Status, {
    errorMap: () => ({ message: "Wybierz status" }),
  }),
  is_proforma: z.boolean().optional(),
  proforma_payment_date: z.date().optional().nullable(),
  wz_type: z.string().optional(),
  personal_collect: z.boolean().optional(),
  delivery_date: z.date().optional(),
  production_date: z.any().optional(),
  payment_deadline: z.date().optional(),
  delivery_place_id: z.any().optional(),
  delivery_city: z.any().optional(),
  delivery_street: z.any().optional(),
  delivery_building: z.any().optional(),
  delivery_premises: z.any().optional(),
  delivery_zipcode: z.any().optional(),
  delivery_contact_number: z.any().optional(),
  deliver_time: z.any().optional(),
  delivery_contact: z.any().optional(),
  change_warehouse: z.any().optional(),
  warehouse_to_transport: z.any().optional(),
  transport_cost: z.any(),
  order_history: z.any().optional(),
  created_at: z.date().optional(),
  created_by: z.string().optional(),
  created_by_id: z.string().optional(),
  is_paid: z.boolean().optional(),
  email_content: z.string().optional().nullable(),
  document_path: z.any().optional(),
  file: z.instanceof(File).optional(),
  nip: z.string().optional(),
  comments: z.any().optional(),
  line_items: z.array(LineItemSchema).optional(),
  lineItems: z.array(LineItemSchema).optional(),
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
  salesman_id: z.string().optional().nullable(),
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
  id: z.string().optional().nullable(),
  nip: z.string().nullable(),
  symbol: z.string({ message: "Symbol jest wymagany" }).nullable(),
  name: z.string().min(3, { message: "Nazwa jest wymagana" }).nullable(),
  primary_email: z
    .string()
    .email({ message: "Niepoprawny email" })
    .min(4)
    .optional()
    .nullable(),
  documents_email: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  building: z.string().optional().nullable(),
  premises: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string({ message: "Kraj jest wymagany" }).nullable(),
  payment_type: z.string().optional().nullable(),
  customer_type: z.string().optional().nullable(),
  payment_punctuality: z.string().optional().nullable(),
  salesman: z.object({ id: z.string() }).optional().nullable(),
  branch: z.array(CompanyBranchSchema).optional().default([]).nullable(),
  credit_limit: z.string().optional().nullable(),
  max_discount: z.string().optional().nullable(),
  send_email_invoice: z.boolean().optional().default(false).nullable(),
  invoice_name: z.string().optional().nullable(),
  invoice_nip: z.string().optional().nullable(),
  invoice_street: z.string().optional().nullable(),
  invoice_building: z.string().optional().nullable(),
  invoice_premises: z.string().optional().nullable(),
  invoice_city: z.string().optional().nullable(),
  invoice_postal_code: z.string().optional().nullable(),
  invoice_country: z.string().optional().nullable(),
  created_at: z.date().optional().nullable(),
  created_by_id: z.string().optional().nullable(),
  salesman_id: z.string().optional().nullable(),
  Orders: z.array(OrderSchema).optional().default([]).nullable(),
  ContactPerson: z
    .array(ContactPersonSchema)
    .transform(transformContactPersons)
    .optional()
    .default([])
    .nullable(),
  DeliveryAdress: z
    .array(DeliveryAdressSchema)
    .optional()
    .default([])
    .nullable(),
  comments: z.any().optional().nullable(),
});

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({ required_error: "Pole wymagane" })
    .min(1, "Nazwa jest wymagana"),
  category: z
    .string({ required_error: "Pole wymagane" })
    .min(1, "Kategoria jest wymagana"),
  subcategory: z.string().optional().nullable(),
  sku: z
    .string({ required_error: "Pole wymagane" })
    .min(1, "SKU jest wymagane"),
  primary_unit: z
    .string({ required_error: "Pole wymagane" })
    .min(1, "Jednostka podstawowa jest wymagana"),
  first_helper_unit: z.string().optional().nullable(),
  first_helper_unit_value: z.string().optional().nullable(),
  second_helper_unit: z.string().optional().nullable(),
  second_helper_unit_value: z.string().optional().nullable(),
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
  comments: z.any().optional(),
  created_by: z.string().optional(),
  created_at: z.date().optional(),
});

export const WzSchema = z.object({
  id: z.string().optional(),
  doc_number: z.string().optional(),
  type: z.string(),
  issue_date: z.date().optional(),
  unit_type: z.string().optional(),
  status: z.string().optional(),
  created_at: z.date().optional(),
  out_date: z.date().optional(),
  order_id: z.string().optional(),
  driver: z.string().optional(),
  car: z.string().optional(),
  cargo_person: z.string().optional(),
  pallet_type: z.string().optional(),
  pallet_count: z.string().optional(),
  additional_info: z.string().optional(),
  created_by: z.string().optional(),
  line_items: z.array(LineItemSchema).optional(),
});
