"use client";

import { Button } from "../ui/button";

import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Switch } from "@/components/ui/switch";

import { Textarea } from "@/components/ui/textarea";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

import * as z from "zod";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { OrderSchema } from "@/schemas";

import { useState, useTransition } from "react";
import { CustomerCombo } from "./customerCombo";
import { OrderProductsTable } from "./orderProductsTable";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";

import { getAllCustomers } from "@/data/customers";
import { createOrder } from "@/actions/orders";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { CommentSection } from "./commentsFormElement";

import { ProductSchema } from "@/schemas";
import { createProduct } from "@/actions/products";

type ProductFormProps = {
  isOpen: boolean;
  editMode?: boolean;
  product?: z.infer<typeof ProductSchema>;
};

export const ProductForm = ({
  isOpen,
  editMode,
  product,
}: ProductFormProps) => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const userId = useCurrentUser()?.id;

  const form = useForm<z.infer<typeof ProductSchema>>({
    resolver: zodResolver(ProductSchema),
    defaultValues: product || {
      // name: "Product Name",
      // sku: "12321441",
      // category: "opakowanie",
      created_by: userId,
      isForSale: false,
      isInProduction: false,
      isInternalProduct: false,
      isOneTimeProduct: false,
      isEntrustedProduct: false,
    },
  });

  const onSubmit = (values: z.infer<typeof ProductSchema>) => {
    let formData = new FormData();
    console.log(values);

    if (values.file) {
      formData.append("file", values.file);
    }

    const data = JSON.parse(JSON.stringify(values));

    startTransition(() => {
      if (product) {
        // Call an update function instead of create
        // updateOrder(order.id, data, formData).then((response) => {
        //   setSuccess(response?.success);
        //   setOpen(false);
        // }); console.log("Order updated successfully");
      } else {
        createProduct(data, formData).then((response) => {
          setSuccess(response?.success);
          setOpen(false);
        });
      }
    });
  };

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
                        name="isForSale"
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
                        name="isInProduction"
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
                        name="isInternalProduct"
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
                        name="isOneTimeProduct"
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
                        name="isEntrustedProduct"
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
                    <div className="grid w-full mr-5 min-w-64 items-center gap-1.5">
                      <Label>Kategoria produktu</Label>
                      <FormField
                        control={form.control}
                        name="category"
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
                                <SelectItem value="Styropian">
                                  Styropian
                                </SelectItem>
                                <SelectItem value="Opakowanie">
                                  Opakowanie
                                </SelectItem>
                                <SelectItem value="Kształtka">
                                  Kształtka
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                        name="packQuantity"
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
                        name="actualShapeVolume"
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
                        name="minProductionQuantity"
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
                        name="salesVolume"
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
                        name="technologicalVolume"
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
                      <Label>Rodzaj EPS</Label>
                      <FormField
                        control={form.control}
                        name="epsType"
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
                        name="seasoningTime"
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
                        name="producer"
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
                    <div className="grid w-full mr-5 items-center gap-1.5">
                      <Label>Rodzaj surowca</Label>
                      <FormField
                        control={form.control}
                        name="raw_material_type"
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
                        name="production_description"
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
                      <Label>Tolerancja ceny</Label>
                      <FormField
                        control={form.control}
                        name="price_tolerance"
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
