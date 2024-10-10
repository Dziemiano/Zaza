"use client";

import { Button } from "../ui/button";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "../ui/spinner";

import { Switch } from "@/components/ui/switch";

import { Textarea } from "@/components/ui/textarea";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormTabError,
} from "../ui/form";

import * as z from "zod";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Category,
  EpsTypes,
  RawMaterials,
  ShapeSubcategory,
  StyrofeltSubcategory,
  SlopeSubcategory,
} from "@/types/product.types";
import { parseNumbersForSubmit } from "@/lib/utils";

import { useEffect, useState, useTransition } from "react";
import { Input } from "../ui/input";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { CommentSection } from "../reusable/commentsFormElement";

import { ProductSchema } from "@/schemas";
import { createProduct, updateProduct } from "@/actions/products";
import SelectFormElement from "../reusable/selectFormElement";
import Link from "next/link";

type ProductFormProps = {
  editMode?: boolean;
  oneTime?: boolean;
  product?: z.infer<typeof ProductSchema>;
  onProductCreated?: any;
  id?: string;
};

const errorNames = {
  product: [
    "name",
    "category",
    "sku",
    "primary_unit",
    "length",
    "width",
    "height",
    "pack_quantity",
    "actual_shape_volume",
    "min_production_quantity",
    "sales_volume",
    "technological_volume",
    "eps_type",
    "weight",
    "seasoning_time",
    "manufacturer",
    "ean",
    "raw_material_type",
    "raw_material_granulation",
  ],
  sales: ["price", "min_price", "vat", "price_tolerance"],
  images: ["file"],
  comments: ["comments"],
};

const valuesToParseForSubmit = [
  "height",
  "length",
  "width",
  "height",
  "pack_quantity",
  "actual_shape_volume",
  "min_production_quantity",
  "sales_volume",
  "technological_volume",
  "weight",
  "seasoning_time",
  "price",
  "min_price",
  "vat",
  "price_tolerance",
];

export const ProductForm = ({
  editMode,
  oneTime,
  product,
  onProductCreated,
  id,
}: ProductFormProps) => {
  //TODO: add form validation, error handling
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const userId = useCurrentUser()?.id;

  const form = useForm<z.infer<typeof ProductSchema>>({
    resolver: zodResolver(ProductSchema),
    defaultValues: product
      ? {
          ...product,
          is_sold: product.is_sold ?? false,
          is_produced: product.is_produced ?? false,
          is_internal: product.is_internal ?? false,
          is_one_time: product.is_one_time ?? false,
          is_entrusted: product.is_entrusted ?? false,
          primary_unit: product.primary_unit ?? "m3",
          first_helper_unit: product.first_helper_unit ?? "",
          first_helper_unit_value: product.first_helper_unit_value ?? "",
          second_helper_unit: product.second_helper_unit ?? "",
          second_helper_unit_value: product.second_helper_unit_value ?? "",
          length: product.length ?? "",
          width: product.width ?? "",
          height: product.height ?? "",
          pack_quantity: product.pack_quantity ?? "",
          actual_shape_volume: product.actual_shape_volume ?? "",
          min_production_quantity: product.min_production_quantity ?? "",
          sales_volume: product.sales_volume ?? "",
          technological_volume: product.technological_volume ?? "",
          eps_type: product.eps_type ?? "",
          weight: product.weight ?? "",
          seasoning_time: product.seasoning_time ?? "",
          manufacturer: product.manufacturer ?? "",
          ean: product.ean ?? "",
          description: product.description ?? "",
          raw_material_type: product.raw_material_type ?? "",
          raw_material_granulation: product.raw_material_granulation ?? "",
          packaging_weight: product.packaging_weight ?? "",
          packaging_type: product.packaging_type ?? "",
          price: product.price ?? "",
          min_price: product.min_price ?? "",
          vat: product.vat ?? "",
          price_tolerance: product.price_tolerance ?? "",
          auto_price_translate: product.auto_price_translate ?? false,
          created_by: product.created_by || userId,
        }
      : {
          created_by: userId,
          is_sold: false,
          is_produced: false,
          is_internal: false,
          is_one_time: false,
          is_entrusted: false,
          primary_unit: "m3",
        },
  });

  useEffect(() => {
    if (oneTime) {
      form.setValue("is_one_time", true);
      form.setValue("id", id);
    }
  });
  const resetForm = () => {
    form.reset({
      created_by: userId,
      is_sold: false,
      is_produced: false,
      is_internal: false,
      is_one_time: false,
      is_entrusted: false,
      primary_unit: "m3",
    });
  };

  const onSubmit = (values: z.infer<typeof ProductSchema>) => {
    setIsLoading(true);

    let formData = new FormData();

    if (values.file) {
      formData.append("file", values.file);
    }

    const data = parseNumbersForSubmit(
      valuesToParseForSubmit,
      JSON.parse(JSON.stringify(values))
    );

    startTransition(() => {
      if (product && product.id) {
        updateProduct(product.id, data, formData)
          .then((response) => {
            setSuccess(response?.success);
            setOpen(false);
            setIsConfirmDialogOpen(false);
            resetForm();
          })
          .finally(() => setIsLoading(false));
        console.log("Order updated successfully");
      } else if (oneTime) {
        createProduct(data, formData)
          .then((response) => {
            setSuccess(response?.success);
            setOpen(false);
            setIsConfirmDialogOpen(false);
            resetForm();
            onProductCreated(data);
          })
          .finally(() => setIsLoading(false));
      } else {
        createProduct(data, formData)
          .then((response) => {
            setSuccess(response?.success);
            setOpen(false);
            setIsConfirmDialogOpen(false);
            resetForm();
          })
          .finally(() => setIsLoading(false));
      }
    });
  };
  const generateSKU = () => {
    const category = form.getValues("category") || "";
    const subcategory = form.getValues("subcategory") || "";
    const epsType = form.getValues("eps_type") || "";
    const length = form.getValues("length") || "";
    const width = form.getValues("width") || "";
    const height = form.getValues("height") || "";

    let firstThreeLetters;
    if (
      ([Category.ShapedForms, Category.Slant] as string[]).includes(category)
    ) {
      const subcategorySanitized =
        subcategory === ShapeSubcategory.AngleBracket
          ? "Katownik"
          : subcategory;
      firstThreeLetters = subcategorySanitized.slice(0, 3).toUpperCase();
    } else {
      firstThreeLetters = category.slice(0, 3).toUpperCase();
    }

    let formattedEpsType = "";
    const epsMatch = epsType.match(
      /EPS(?:\s(\d{1,3})(?:-?(\d{1,3}))?)?(?:\s([A-Z]))?/
    );

    if (epsMatch) {
      const [, firstNum, secondNum, letter] = epsMatch;
      if (firstNum && secondNum) {
        // Case: EPS ZZZ-ZZZ or EPS ZZZ-ZZZ A
        formattedEpsType = `EPS${firstNum.padStart(3, "0")}${secondNum.padStart(
          3,
          "0"
        )}${letter || "X"}`;
      } else if (firstNum && letter) {
        // Case: EPS ZZZ A
        formattedEpsType = `EPS000${firstNum.padStart(3, "0")}${letter}`;
      } else if (firstNum) {
        // Case: EPS ZZZ
        formattedEpsType = `EPS000${firstNum.padStart(3, "0")}X`;
      } else if (letter) {
        // Case: EPS A
        formattedEpsType = `EPS000000${letter}`;
      } else {
        // Case: Just EPS
        formattedEpsType = "EPS000000X";
      }
    } else {
      // If it doesn't match the expected pattern, use the original logic
      formattedEpsType = epsType
        .replace(/\s/g, "")
        .replace(/-/g, "")
        .replace(/\//g, "")
        .padStart(9, "0")
        .slice(0, 9);
    }

    const dimensions = `${length}x${width}x${height}`;

    let skuEnding;
    if (category === Category.Styrofoam) {
      if (subcategory === StyrofeltSubcategory.OneSide) {
        skuEnding = "X1";
      } else if (subcategory === StyrofeltSubcategory.TwoSide) {
        skuEnding = "X2";
      } else {
        skuEnding = "XX";
      }
    } else {
      skuEnding = "XX";
    }

    const sku = `${firstThreeLetters}${formattedEpsType}${dimensions}${skuEnding}`;

    form.setValue("sku", sku);
  };

  useEffect(() => {
    generateSKU();
  }, [
    form.watch("category"),
    form.watch("subcategory"),
    form.watch("eps_type"),
    form.watch("length"),
    form.watch("width"),
    form.watch("height"),
  ]);

  useEffect(() => {
    generateSKU();
  }, [
    form.watch("category"),
    form.watch("subcategory"),
    form.watch("eps_type"),
    form.watch("length"),
    form.watch("width"),
    form.watch("height"),
  ]);

  const category = [
    { label: Category.Styrofoam, value: "styrofoam" },
    { label: Category.Styrofelt, value: "styrofelt" },
    { label: Category.RawMaterial, value: "raw material" },
    { label: Category.Sheets, value: "sheets" },
    { label: Category.ShapedForms, value: "shaped forms" },
    { label: Category.Transport, value: "transport" },
    { label: Category.Granulate, value: "granulate" },
    { label: Category.Wool, value: "wool" },
    { label: Category.Slant, value: "slant" },
    { label: Category.Others, value: "others" },
  ];

  const eps_types = [
    { label: EpsTypes.EPS045, value: "eps_045" },
    { label: EpsTypes.EPS045S, value: "eps_045_s" },
    { label: EpsTypes.EPS042, value: "eps_042" },
    { label: EpsTypes.EPS042S, value: "eps_042_s" },
    { label: EpsTypes.EPS040, value: "eps_040" },
    { label: EpsTypes.EPS040S, value: "eps_040_s" },
    { label: EpsTypes.EPS070038, value: "eps_070_038" },
    { label: EpsTypes.EPS070038S, value: "eps_070_038_s" },
    { label: EpsTypes.EPS080038, value: "eps_080_038" },
    { label: EpsTypes.EPS080038S, value: "eps_080_038_s" },
    { label: EpsTypes.EPS10017S, value: "eps_100_017_s" },
    { label: EpsTypes.EPS100037, value: "eps_100_037" },
    { label: EpsTypes.EPS100035, value: "eps_100_035" },
    { label: EpsTypes.EPS120035, value: "eps_120_035" },
    { label: EpsTypes.EPS150035, value: "eps_150_035" },
    { label: EpsTypes.EPS200034, value: "eps_200_034" },
    { label: EpsTypes.EPS100035AQUA, value: "eps_100_035_aqua" },
    { label: EpsTypes.EPS120035AQUA, value: "eps_120_035_aqua" },
    { label: EpsTypes.EPS150035AQUA, value: "eps_150_035_aqua" },
    { label: EpsTypes.EPS200034AQUA, value: "eps_200_034_aqua" },
    { label: EpsTypes.EPS031GRAFIT, value: "eps_031_grafit" },
    { label: EpsTypes.EPS033GRAFIT, value: "eps_033_grafit" },
    { label: EpsTypes.EPS100030GRAFIT, value: "eps_100_030_grafit" },
    { label: EpsTypes.EPSTAcustic, value: "eps_t_acustic" },
  ];

  const raw_materials = [
    {
      label: RawMaterials.FlammableNonConstruction,
      value: "flammable/non-construction",
    },
    {
      label: RawMaterials.NonFlammableConstruction,
      value: "non-flammable/construction",
    },
    { label: RawMaterials.Fine, value: "fine" },
    { label: RawMaterials.Coarse, value: "coarse" },
    { label: RawMaterials.FoodGrade, value: "food-grade" },
    { label: RawMaterials.Graphite, value: "graphite" },
  ];

  const shape_subcategory = [
    { label: ShapeSubcategory.ShapedForm, value: "shaped_form" },
    { label: ShapeSubcategory.AngleBracket, value: "angle_bracket" },
    { label: ShapeSubcategory.Profile, value: "profile" },
    { label: ShapeSubcategory.Izoklin, value: "izoklin" },
    { label: ShapeSubcategory.Plug, value: "plug" },
  ];

  const styrofelt_subcategory = [
    { label: StyrofeltSubcategory.OneSide, value: "one_side" },
    { label: StyrofeltSubcategory.TwoSide, value: "two_side" },
  ];

  const slope_subcategory = [
    { label: SlopeSubcategory.Slant, value: "slant" },
    { label: SlopeSubcategory.Slope, value: "slope" },
    { label: SlopeSubcategory.Contraslope, value: "contraslope" },
  ];

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            setIsConfirmDialogOpen(true);
          } else {
            setOpen(true);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button className="w-full font-normal" variant="zazaGrey">
            {editMode
              ? "Edytuj produkt"
              : oneTime
              ? "Dodaj produkt jednorazowy"
              : "Dodaj produkt"}
          </Button>
        </DialogTrigger>
        <DialogContent className="min-w-[90%] min-h-[90%] max-h-[95vh] flex flex-col content-start overflow-y-auto">
          <DialogHeader className="flex justify-between bg-white rounded-2xl shadow-sm max-md:flex-wrap max-md:pr-5 max-h-[30%]">
            <div className="flex flex-col justify-center">
              <div className="flex gap-4 items-center text-black">
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/6940c2d742c79e36db9201da6abbfd61adfd7423d7f2812f27c9da290dda59cf?"
                  className="shrink-0 self-stretch my-auto aspect-square w-[25px]"
                />
                <div className="self-stretch text-3xl font-bold">
                  {editMode
                    ? `Edytuj ${product?.name}`
                    : oneTime
                    ? "Nowy produkt jednorazowy"
                    : "Nowy produkt"}
                </div>
              </div>
              <div className="flex gap-1 mt-4 text-xs text-neutral-400">
                <div>
                  <Link href="/">Pulpit</Link>
                </div>
                <div>/</div>
                <div>
                  <Link href="/products" onClick={() => setOpen(false)}>
                    Produkty
                  </Link>
                </div>
                <div>/</div>
                <div>
                  {editMode
                    ? `${product?.name}`
                    : oneTime
                    ? "Nowy produkt jednorazowy"
                    : "Nowy produkt"}
                </div>
              </div>
            </div>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 flex flex-col w-full h-full justify-between"
            >
              <div className="flex flex-col content-between h-[700px]">
                <Tabs defaultValue="account" className="w-full h-full">
                  <TabsList>
                    <TabsTrigger value="product">
                      Produkt <FormTabError fields={errorNames.product} />
                    </TabsTrigger>
                    <TabsTrigger value="sales">
                      Sprzedaż <FormTabError fields={errorNames.sales} />
                    </TabsTrigger>
                    <TabsTrigger value="images">
                      Zdjęcia i dokumenty
                      <FormTabError fields={errorNames.images} />
                    </TabsTrigger>
                    <TabsTrigger value="visibility">Widoczność</TabsTrigger>
                    <TabsTrigger value="recipes">Receptury</TabsTrigger>
                    <TabsTrigger value="comments">
                      Uwagi
                      <FormTabError fields={errorNames.comments} />
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="product" className="w-full">
                    <div className="flex flex-row mt-5 mb-5">
                      <div className="flex w-full items-center">
                        <FormField
                          control={form.control}
                          name="is_one_time"
                          render={({ field }) => (
                            <FormItem className="flex flex-row mr-2">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={oneTime}
                              />
                            </FormItem>
                          )}
                        />
                        <Label>Produkt jednorazowy</Label>
                      </div>
                      <div className="flex w-full items-center">
                        <FormField
                          control={form.control}
                          name="is_sold"
                          render={({ field }) => (
                            <FormItem className="flex flex-row mr-2">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                        <Label>W sprzedaży</Label>
                      </div>
                      <div className="flex w-full items-center">
                        <FormField
                          control={form.control}
                          name="is_produced"
                          render={({ field }) => (
                            <FormItem className="flex flex-row mr-2">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                        <Label>W produkcji</Label>
                      </div>
                      <div className="flex w-full items-center">
                        <FormField
                          control={form.control}
                          name="is_internal"
                          render={({ field }) => (
                            <FormItem className="flex flex-row mr-2">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                        <Label>Produkt wewnętrzny</Label>
                      </div>
                      <div className="flex w-full items-center">
                        <FormField
                          control={form.control}
                          name="is_entrusted"
                          render={({ field }) => (
                            <FormItem className="flex flex-row mr-2">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                        <Label>Produkt powierzony</Label>
                      </div>
                    </div>
                    <div className="flex flex-row mt-5 mb-5 pb-4 border-b-2">
                      <SelectFormElement
                        label="Kategoria produktu *"
                        items={category}
                        form={form}
                        name="category"
                      />
                      {form.getValues("category") === "Kształtki" && (
                        <SelectFormElement
                          label="Podkategoria"
                          items={shape_subcategory}
                          form={form}
                          name="subcategory"
                        />
                      )}
                      {form.getValues("category") === "Styropapa" && (
                        <SelectFormElement
                          label="Podkategoria"
                          items={styrofelt_subcategory}
                          form={form}
                          name="subcategory"
                        />
                      )}
                      {form.getValues("category") === "Skos" && (
                        <SelectFormElement
                          label="Podkategoria"
                          items={slope_subcategory}
                          form={form}
                          name="subcategory"
                        />
                      )}
                      <div className="grid w-full mr-5 min-w-64 items-center gap-1.5">
                        <Label>Jednostka podstawowa *</Label>
                        <FormField
                          control={form.control}
                          name="primary_unit"
                          render={({ field }) => (
                            <FormItem className="flex flex-row">
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Wybierz" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="m2">m2</SelectItem>
                                  <SelectItem value="m3">m3</SelectItem>
                                  <SelectItem value="kg">kg</SelectItem>
                                  <SelectItem value="l">l</SelectItem>
                                  <SelectItem value="szt">szt</SelectItem>
                                </SelectContent>
                              </Select>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row mb-5 pb-4 border-b-2">
                      <div className="grid w-full mr-5 items-center gap-1.5 min-w-[300px]">
                        <Label>Nazwa produktu *</Label>
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid w-full mr-5 items-center gap-1.5 min-w-[300px]">
                        <Label>SKU / Kod</Label>
                        <FormField
                          control={form.control}
                          name="sku"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={true}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-xl">Właściwości produktu</div>
                    <div className="flex flex-row mt-5">
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Grubość *</Label>
                        <FormField
                          control={form.control}
                          name="height"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  type="number"
                                  step=".0001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Szerokość *</Label>
                        <FormField
                          control={form.control}
                          name="width"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  type="number"
                                  step=".0001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Długość *</Label>
                        <FormField
                          control={form.control}
                          name="length"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  pattern="[0-9]+([,.][0-9]+)?"
                                  className="w-full"
                                  disabled={isPending}
                                  type="number"
                                  step=".0001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Ilość w paczce *</Label>
                        <FormField
                          control={form.control}
                          name="pack_quantity"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  type="number"
                                  step=".0001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Faktyczna objętość kształtki</Label>
                        <FormField
                          control={form.control}
                          name="actual_shape_volume"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  type="number"
                                  step=".0001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row mt-5">
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Min do wyprodukowania</Label>
                        <FormField
                          control={form.control}
                          name="min_production_quantity"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  type="number"
                                  step=".0001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Objętość sprzedażowa</Label>
                        <FormField
                          control={form.control}
                          name="sales_volume"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  type="number"
                                  step=".0001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Objętość technologiczna</Label>
                        <FormField
                          control={form.control}
                          name="technological_volume"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  type="number"
                                  step=".0001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <SelectFormElement
                        label="Rodzaj EPS"
                        form={form}
                        name="eps_type"
                        items={eps_types}
                      />
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Waga (kg)</Label>
                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  type="number"
                                  step=".0001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row mt-5">
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Czas sezonowania (h)</Label>
                        <FormField
                          control={form.control}
                          name="seasoning_time"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  // type="number"
                                  // step=".01"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Producent</Label>
                        <FormField
                          control={form.control}
                          name="manufacturer"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>EAN</Label>
                        <FormField
                          control={form.control}
                          name="ean"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <SelectFormElement
                        label="Rodzaj surowca"
                        form={form}
                        name="raw_material_type"
                        items={raw_materials}
                      />
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Granulacja surowca</Label>
                        <FormField
                          control={form.control}
                          name="raw_material_granulation"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row mt-5">
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Opis</Label>
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Textarea disabled={isPending} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row"></div>
                    <div className="flex flex-row"></div>
                  </TabsContent>

                  <TabsContent value="images">
                    <div>
                      <h1>Zdjęcia</h1>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Dodaj zdjęcie</Label>
                        <FormField
                          control={form.control}
                          name="file"
                          render={({
                            field: { value, onChange, ...fieldProps },
                          }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...fieldProps}
                                  placeholder="file"
                                  type="file"
                                  onChange={(event) =>
                                    onChange(
                                      event.target.files &&
                                        event.target.files[0]
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="sales">
                    <div className="flex flex-row mt-10 mb-5">
                      <div className="flex w-full items-center">
                        <FormField
                          control={form.control}
                          name="auto_price_translate"
                          render={({ field }) => (
                            <FormItem className="flex flex-row mr-2">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                        <Label>Automatyczne przeliczanie ceny</Label>
                      </div>
                    </div>
                    <div className="flex flex-row  mt-10 mb-5 pb-4 border-b-2">
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Cena domyślna *</Label>
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  type="number"
                                  step=".01"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full mr-5 min-w-64 items-center gap-1.5">
                        <Label>Cena minimalna</Label>
                        <FormField
                          control={form.control}
                          name="min_price"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  type="number"
                                  step=".01"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Stawka VAT</Label>
                        <FormField
                          control={form.control}
                          name="vat"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  type="number"
                                  step=".01"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full mr-5 min-w-64 items-center gap-1.5">
                        <Label>Tolerancja ceny %</Label>
                        <FormField
                          control={form.control}
                          name="price_tolerance"
                          render={({ field }) => (
                            <FormItem className="flex flex-row">
                              <Input
                                className="w-full"
                                disabled={isPending}
                                type="number"
                                step=".01"
                                {...field}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row mt-5">
                      <div className="text-xl">Grupy cenowe</div>
                    </div>
                  </TabsContent>

                  <TabsContent value="comments">
                    <div className="flex flex-row mt-10">
                      <CommentSection name="comments" />
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter className="max-h-fit">
                  <Button
                    type="submit"
                    variant="zaza"
                    className="w-[186px] h-7 px-3 py-2 bg-white rounded-lg shadow justify-center items-center gap-2.5 inline-flex mt-2 mb-2"
                    size="sm"
                    disabled={isLoading}
                  >
                    {editMode ? "Zapisz" : "Utwórz"}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Czy na pewno chcesz zamknąć?</DialogTitle>
            <DialogDescription>
              Niezapisane zmiany zostaną utracone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsConfirmDialogOpen(false);
                setOpen(false);
                resetForm();
              }}
            >
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sukces!</DialogTitle>
          </DialogHeader>
          <div>
            {product
              ? "Produkt został zaktualizowany pomyślnie."
              : "Nowy produkt został utworzony pomyślnie."}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSuccessDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Spinner isLoading={isLoading} />
    </>
  );
};
