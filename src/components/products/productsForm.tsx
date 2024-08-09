"use client";

import { Button } from "../ui/button";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";

import { Textarea } from "@/components/ui/textarea";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";

import * as z from "zod";
import { useForm, useFormContext, useFieldArray } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useEffect, useState, useTransition } from "react";
import { Input } from "../ui/input";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { CommentSection } from "../reusable/commentsFormElement";

import { ProductSchema } from "@/schemas";
import { createProduct, updateProduct } from "@/actions/products";
import SelectFormElement from "../reusable/selectFormElement";

type ProductFormProps = {
  editMode?: boolean;
  product?: z.infer<typeof ProductSchema>;
};

export const ProductForm = ({ editMode, product }: ProductFormProps) => {
  //TODO: add form validation, error handling
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const userId = useCurrentUser()?.id;

  const form = useForm<z.infer<typeof ProductSchema>>({
    resolver: zodResolver(ProductSchema),
    defaultValues: product
      ? {
          ...product,
          // Convert null values to empty strings for input fields
          unit: product.unit ?? "m3",
          secondary_unit: product.secondary_unit ?? "",
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
        }
      : {
          created_by: userId,
          is_sold: false,
          is_produced: false,
          is_internal: false,
          is_one_time: false,
          is_entrusted: false,
          unit: "m3",
        },
  });

  useEffect(() => {
    if (product) {
      console.log(product);
      // console.log(fields);
      console.log(form);
    }
  });

  const onSubmit = (values: z.infer<typeof ProductSchema>) => {
    let formData = new FormData();

    if (values.file) {
      formData.append("file", values.file);
    }

    const data = JSON.parse(JSON.stringify(values));

    startTransition(() => {
      if (product && product.id) {
        updateProduct(product.id, data, formData).then((response) => {
          setSuccess(response?.success);
          setOpen(false);
        });
        console.log("Order updated successfully");
      } else {
        createProduct(data, formData).then((response) => {
          setSuccess(response?.success);
          setOpen(false);
        });
      }
    });
  };

  const materials = [
    { label: "Styropian", value: "styrofoam" },
    { label: "Styropapa", value: "styrofelt" },
    { label: "Surowiec", value: "raw material" },
    { label: "Formatki", value: "sheets" },
    { label: "Kształtki", value: "shaped forms" },
    { label: "Transport", value: "transport" },
    { label: "Granulat", value: "granulate" },
    { label: "Wełna", value: "wool" },
    { label: "Skos", value: "slope" },
    { label: "Inne", value: "others" },
  ];

  const eps_types = [
    { label: "EPS 045", value: "eps_045" },
    { label: "EPS 045 S", value: "eps_045_s" },
    { label: "EPS 042", value: "eps_042" },
    { label: "EPS 042 S", value: "eps_042_s" },
    { label: "EPS 040", value: "eps_040" },
    { label: "EPS 040 S", value: "eps_040_s" },
    { label: "EPS 070-038", value: "eps_070_038" },
    { label: "EPS 070-038 S", value: "eps_070_038_s" },
    { label: "EPS 080-038", value: "eps_080_038" },
    { label: "EPS 080-038 S", value: "eps_080_038_s" },
    { label: "EPS 100/17 S", value: "eps_100_017_s" },
    { label: "EPS 100-037", value: "eps_100_037" },
    { label: "EPS 100-035", value: "eps_100_035" },
    { label: "EPS 120-035", value: "eps_120_035" },
    { label: "EPS 150-035", value: "eps_150_035" },
    { label: "EPS 200-034", value: "eps_200_034" },
    { label: "EPS 100-035 AQUA", value: "eps_100_035_aqua" },
    { label: "EPS 120-035 AQUA", value: "eps_120_035_aqua" },
    { label: "EPS 150-035 AQUA", value: "eps_150_035_aqua" },
    { label: "EPS 200-034 AQUA", value: "eps_200_034_aqua" },
    { label: "EPS 031 GRAFIT", value: "eps_031_grafit" },
    { label: "EPS 033 GRAFIT", value: "eps_033_grafit" },
    { label: "EPS 100-030 GRAFIT", value: "eps_100_030_grafit" },
    { label: "EPS T - Akustyczny", value: "eps_t_acustic" },
  ];

  const raw_materials = [
    { label: "Palny/niebudowlany", value: "flammable/non-construction" },
    { label: "Niepalny/budowlany", value: "non-flammable/construction" },
    { label: "Drobny", value: "fine" },
    { label: "Gruby", value: "coarse" },
    { label: "Spożywczy", value: "food-grade" },
    { label: "Grafitowy", value: "graphite" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full font-normal" variant="zazaGrey">
          {editMode ? "Edytuj produkt" : "Dodaj produkt"}
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[80%] min-h-[85%] flex flex-col content-start">
        <DialogHeader className="flex justify-between  bg-white rounded-2xl shadow-sm max-md:flex-wrap max-md:pr-5 max-h-[40%]">
          <div className="flex flex-col justify-center">
            <div className="flex gap-4 items-center text-black">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/6940c2d742c79e36db9201da6abbfd61adfd7423d7f2812f27c9da290dda59cf?"
                className="shrink-0 self-stretch my-auto aspect-square w-[25px]"
              />
              <div className="self-stretch text-3xl font-bold">
                {editMode ? `Edytuj ${product?.name}` : "Nowy produkt"}
              </div>
            </div>
            <div className="flex gap-1 mt-4 text-xs text-neutral-400">
              <div>Pulpit</div>
              <div>/</div>
              <div>Produkty</div>
              <div>/</div>
              <div>{editMode ? `${product?.name}` : "Nowy produkt"}</div>
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
                  <TabsTrigger value="product">Produkt</TabsTrigger>
                  <TabsTrigger value="sales">Sprzedaż</TabsTrigger>
                  <TabsTrigger value="images">Zdjęcia i dokumenty</TabsTrigger>
                  <TabsTrigger value="visibility">Widocznośc</TabsTrigger>
                  <TabsTrigger value="recipes">Receptury</TabsTrigger>
                  <TabsTrigger value="comments">Uwagi</TabsTrigger>
                </TabsList>

                <TabsContent value="product" className="w-full h-[550px]">
                  <div className="flex flex-row mt-10 mb-5">
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
                        name="is_one_time"
                        render={({ field }) => (
                          <FormItem className="flex flex-row mr-2">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormItem>
                        )}
                      />
                      <Label>Produkt jednorazowy</Label>
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
                  <div className="flex flex-row  mt-10 mb-5 pb-4 border-b-2">
                    <div className="grid w-full mr-5 items-center gap-1.5">
                      <Label>Nazwa produktu</Label>
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
                    <SelectFormElement
                      label="Kategoria produktu"
                      items={materials}
                      form={form}
                      name="category"
                    />
                    <div className="grid w-full mr-5 items-center gap-1.5">
                      <Label>SKU / Kod</Label>
                      <FormField
                        control={form.control}
                        name="sku"
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
                    <div className="grid w-full mr-5 min-w-64 items-center gap-1.5">
                      <Label>Jednostka podstawowa</Label>
                      <FormField
                        control={form.control}
                        name="unit"
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
                    <div className="grid w-full mr-5 items-center gap-1.5">
                      <Button variant={"zaza"}>
                        Kopiuj pozycję asortymentową
                      </Button>
                    </div>
                  </div>
                  <div className="text-xl">Właściwości produktu</div>
                  <div className="flex flex-row mt-5">
                    <div className="grid w-full mr-5 items-center gap-1.5">
                      <Label>Długość</Label>
                      <FormField
                        control={form.control}
                        name="length"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                pattern="[0-9]+([,.][0-9]+)?"
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
                      <Label>Szerokość</Label>
                      <FormField
                        control={form.control}
                        name="width"
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
                      <Label>Wysokość</Label>
                      <FormField
                        control={form.control}
                        name="height"
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
                      <Label>Ilość w paczce</Label>
                      <FormField
                        control={form.control}
                        name="pack_quantity"
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
                      <Label>Waga</Label>
                      <FormField
                        control={form.control}
                        name="weight"
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
                      <Label>Czas sezonowania</Label>
                      <FormField
                        control={form.control}
                        name="seasoning_time"
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
                                    event.target.files && event.target.files[0]
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
                      <Label>Cena domyślna</Label>
                      <FormField
                        control={form.control}
                        name="price"
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
                    <CommentSection
                      control={form.control}
                      setValue={form.setValue}
                      name="comments"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="max-h-fit">
                <Button
                  type="submit"
                  variant="zaza"
                  className="w-[186px] h-7 px-3 py-2 bg-white rounded-lg shadow justify-center items-center gap-2.5 inline-flex"
                  size="sm"
                >
                  {editMode ? "Edytuj" : "Utwórz"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
