import { CustomerType, PaymentType } from "@/types/customer.types";
import { Status, WZType, HelperUnit, PalletType } from "@/types/orders.types";
import {
  Category,
  EpsTypes,
  PrimaryUnit,
  RawMaterials,
  ShapeSubcategory,
  SlopeSubcategory,
  StyrofeltSubcategory,
} from "@/types/product.types";
import { de } from "date-fns/locale";
import * as z from "zod";

const errors = {
  required: "Pole jest wymagane",
  max: (number: number) => "Pole może mieć maksymalnie " + number + " znaków",
  min: (number: number) => "Pole musi mieć minimalnie " + number + " znaki",
  number: "Wprowadź cyfry",
  nonNeg: "Wprowadź dodatnią liczbę",
  phone: 'Numer telefonu może zawierać jedynie liczby, spacje, "+" oraz "-"',
  email: "Niepoprawny email",
};

const phoneRegex = /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/;

const nonNegNumber = z.coerce
  .number({ invalid_type_error: errors.nonNeg })
  .min(0, errors.nonNeg)
  .optional()
  .nullable();

const nonNegNumberReq = z.coerce
  .number({
    required_error: errors.required,
    invalid_type_error: errors.nonNeg,
  })
  .min(0, errors.nonNeg)
  .nullable();

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
  quantity: nonNegNumberReq,
  quant_unit: z.string().optional().nullable(),
  helper_quantity: nonNegNumber,
  help_quant_unit: z
    .union([z.string().length(0), z.nativeEnum(HelperUnit)])
    .optional()
    .nullable(),
  discount: z.string().optional().nullable(),
  netto_cost: nonNegNumber,
  brutto_cost: nonNegNumber,
  vat_percentage: z.string().optional().nullable(),
  vat_cost: z.string().optional().nullable(),
});

export const CommentSchema = z.object({
  id: z.string().nullable(),
  type: z.string().nullable(),
  body: z.string().nullable(),
  order_id: z.string().optional().nullable(),
  product_id: z.string().optional().nullable(),
  customer_id: z.string().optional().nullable(),
});

export const OrderSchema = z.object({
  id: z.string().optional().nullable(),
  foreign_id: z
    .string({ required_error: errors.required })
    .min(1, errors.required)
    .min(4, errors.min(4))
    .nullable(),
  customer_id: z
    .string({ required_error: errors.required })
    .min(1, { message: errors.required })
    .nullable(),
  status: z
    .nativeEnum(Status, {
      errorMap: () => ({ message: "Wybierz status" }),
    })
    .nullable()
    .or(z.literal("")),
  is_proforma: z.boolean().optional().nullable(),
  proforma_payment_date: z.date().optional().nullable(),
  wz_type: z.nativeEnum(WZType).optional().nullable(),
  personal_collect: z.boolean().optional().nullable(),
  production_date: z.date().optional().nullable(),
  payment_deadline: z.date({ required_error: errors.required }).nullable(),
  delivery_date: z.date({ required_error: errors.required }).nullable(),
  delivery_place_id: z.string().optional().nullable(),
  delivery_city: z.string().optional().nullable(),
  delivery_street: z.string().optional().nullable(),
  delivery_building: z.string().optional().nullable(),
  delivery_premises: z.string().optional().nullable(),
  delivery_zipcode: z.string().optional().nullable(),
  delivery_contact_number: z
    .string()
    .refine((val) => !val || phoneRegex.test(val ?? ""), errors.phone)
    .optional()
    .nullable(),
  deliver_time: z.date().optional().nullable(),
  delivery_contact: z
    .string()
    .refine((val) => !val || phoneRegex.test(val ?? ""), errors.phone)
    .optional()
    .nullable(),
  change_warehouse: z.boolean().optional().nullable(),
  warehouse_to_transport: z.string().optional().nullable(),
  transport_cost: nonNegNumber,
  order_history: z.string().optional().nullable(),
  created_at: z.date().optional().nullable(),
  created_by: z.string().optional().nullable(),
  created_by_id: z.string().optional().nullable(),
  is_paid: z.boolean().optional().nullable(),
  email_content: z.string().optional().nullable(),
  document_path: z.string().optional().nullable(),
  file: z.any().optional(),
  nip: z
    .string()
    .refine((val) => !val || val.length === 10, "Numer powinien mieć 10 cyfr")
    .refine(
      (val) => !val || /^\d+$/.test(val),
      "Numer powinien zawierać same cyfry"
    )
    .optional()
    .nullable(),
  comments: z.array(CommentSchema).optional().nullable(),
  //LINE ITEMS TO BE REWORKED
  line_items: z
    .array(LineItemSchema)
    .min(1, { message: "Wybierz przynajmniej jeden produkt" }),
  lineItems: z.any().optional().nullable(),
  user: z.any().optional().nullable(),
  customer: z.any().optional().nullable(),
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
  nip: z
    .string({ required_error: errors.required })
    .min(1, errors.required)
    .refine((val) => val.length === 10, "Numer powinien mieć 10 cyfr")
    .refine((val) => /^\d+$/.test(val), "Numer powinien zawierać same cyfry")
    .nullable(),
  symbol: z
    .string({ required_error: errors.required })
    .min(1, errors.required)
    .max(40, errors.max(40))
    .nullable(),
  name: z
    .string({ required_error: errors.required })
    .min(1, { message: errors.required })
    .min(3, { message: errors.min(3) })
    .nullable(),
  primary_email: z
    .string()
    .email({ message: errors.email })
    .min(3, { message: errors.min(3) })
    .optional()
    .nullable(),
  documents_email: z
    .string()
    .email({ message: errors.email })
    .min(3, { message: errors.min(3) })
    .optional()
    .nullable(),
  phone_number: z
    .string()
    .refine((val) => !val || phoneRegex.test(val ?? ""), errors.phone)
    .optional()
    .nullable(),
  street: z
    .string({ required_error: errors.required })
    .min(1, { message: errors.required })
    .nullable(),
  building: z
    .string({ required_error: errors.required })
    .min(1, { message: errors.required })
    .nullable(),
  premises: z.string().optional().nullable(),
  city: z
    .string({ required_error: errors.required })
    .min(1, { message: errors.required })
    .nullable(),
  postal_code: z
    .string({ required_error: errors.required })
    .min(1, { message: errors.required })
    .nullable(),
  country: z
    .string({ required_error: errors.required })
    .min(1, { message: errors.required })
    .nullable(),
  payment_type: z
    .nativeEnum(PaymentType)
    .optional()
    .nullable()
    .or(z.literal("")),
  customer_type: z
    .nativeEnum(CustomerType, {
      errorMap: () => ({ message: errors.required }),
    })
    .nullable()
    .or(z.literal("")),
  payment_punctuality: z.string().optional().nullable(),
  salesman: z.object({ id: z.string() }).optional().nullable(),
  branch: z.array(CompanyBranchSchema).optional().default([]).nullable(),
  credit_limit: nonNegNumber,
  max_discount: nonNegNumber,
  send_email_invoice: z.boolean().optional().default(false).nullable(),
  invoice_name: z.string().optional().nullable(),
  invoice_nip: z
    .string()
    .refine((val) => !val || val.length === 10, "Numer powinien mieć 10 cyfr")
    .refine(
      (val) => !val || /^\d+$/.test(val),
      "Numer powinien zawierać same cyfry"
    )
    .optional()
    .nullable(),
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
  id: z.string().optional().nullable(),
  name: z
    .string({ required_error: errors.required })
    .min(1, errors.required)
    .nullable(),
  category: z
    .nativeEnum(Category, {
      errorMap: () => ({ message: "Wybierz status" }),
    })
    .refine((val) => val !== undefined && val !== null, {
      message: errors.required,
    })
    .nullable()
    .or(z.literal("")),
  subcategory: z
    .union([
      z.nativeEnum(ShapeSubcategory),
      z.nativeEnum(StyrofeltSubcategory),
      z.nativeEnum(SlopeSubcategory),
    ])
    .optional()
    .nullable()
    .or(z.literal("")),
  sku: z
    .string({ required_error: errors.required })
    .min(1, "SKU jest wymagane")
    .nullable(),
  primary_unit: z
    .nativeEnum(PrimaryUnit, {
      errorMap: () => ({ message: "Wybierz jednostkę" }),
    })
    .nullable()
    .or(z.literal("")),
  first_helper_unit: z.string().optional().nullable(),
  first_helper_unit_value: z.string().optional().nullable(),
  second_helper_unit: z.string().optional().nullable(),
  second_helper_unit_value: z.string().optional().nullable(),
  is_sold: z.boolean().nullable(),
  is_produced: z.boolean().nullable(),
  is_internal: z.boolean().nullable(),
  is_one_time: z.boolean().nullable(),
  is_entrusted: z.boolean().nullable(),
  length: nonNegNumberReq,
  width: nonNegNumberReq,
  height: nonNegNumberReq,
  pack_quantity: nonNegNumberReq,
  actual_shape_volume: nonNegNumber,
  min_production_quantity: nonNegNumber,
  sales_volume: nonNegNumber,
  technological_volume: nonNegNumber,
  eps_type: z
    .nativeEnum(EpsTypes, {
      errorMap: () => ({ message: "Wybierz rodzaj" }),
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  weight: nonNegNumber,
  // seasoning_time: nonNegNumber,
  seasoning_time: z.string().nullable().optional(),
  manufacturer: z.string().nullable().optional(),
  ean: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  file: z.any().optional(),
  raw_material_type: z
    .nativeEnum(RawMaterials, {
      errorMap: () => ({ message: "Wybierz rodzaj" }),
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  raw_material_granulation: z.string().nullable().optional(),
  packaging_weight: z.string().nullable().optional(),
  packaging_type: z.string().nullable().optional(),
  price: nonNegNumberReq,
  auto_price_translate: z.boolean().optional().default(false),
  min_price: nonNegNumber,
  vat: z.coerce
    .number({
      required_error: errors.required,
      invalid_type_error: errors.nonNeg,
    })
    .min(0, errors.nonNeg)
    .max(100, "Max 100")
    .nullable()
    .default(23),
  price_tolerance: z.coerce
    .number({ invalid_type_error: errors.nonNeg })
    .min(0, errors.nonNeg)
    .max(100, "Max 100")
    .optional()
    .nullable(),
  comments: z.any().optional().nullable(),
  created_by: z.string().optional().nullable(),
  created_at: z.date().optional().nullable(),
});

const PalletEntrySchema = z.object({
  type: z.string(),
  count: z.number().min(0),
});

export const WzSchema = z.object({
  id: z.string().optional().nullable(),
  doc_number: z.string().optional().nullable(),
  type: z
    .nativeEnum(WZType, {
      errorMap: () => ({ message: "Wybierz status" }),
    })
    .refine((val) => val !== undefined && val !== null, {
      message: errors.required,
    })
    .nullable()
    .or(z.literal("")),
  issue_date: z.date({ required_error: errors.required }).nullable(),
  unit_type: z.string().optional().nullable(),
  status: z.string({ required_error: errors.required }).nullable(),
  created_at: z.date().optional().nullable(),
  out_date: z.date({ required_error: errors.required }).nullable(),
  order_id: z.string().optional().nullable(),
  driver: z.string().optional().nullable(),
  car: z.string().optional().nullable(),
  cargo_person: z.string().optional().nullable(),
  pallets: z.array(PalletEntrySchema).default([]),
  pallet_type: z.nativeEnum(PalletType).optional().nullable().or(z.literal("")),
  pallet_count: nonNegNumber,
  additional_info: z.string().optional().nullable(),
  created_by: z.string().optional().nullable(),
  line_items: z.array(LineItemSchema).optional().nullable(),
});
