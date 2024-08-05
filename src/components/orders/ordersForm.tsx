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

import { useEffect, useState, useTransition } from "react";
import { CustomerCombo } from "./customerCombo";
import { OrderProductsTable } from "./orderProductsTable";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";

import { getAllCustomers } from "@/data/customers";
import { createOrder } from "@/actions/orders";
import { updateOrder } from "@/actions/orders";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { CommentSection } from "./commentsFormElement";
import { LineItemFormElement } from "./lineItemForm";

export type OrderFormProps = {
  customers: any[];
  userId: string;
  editMode?: boolean;
  order?: z.infer<typeof OrderSchema>;
  products: [];
};

export const OrderForm = ({
  customers,
  userId,
  editMode,
  order,
  products,
}: OrderFormProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof OrderSchema>>({
    resolver: zodResolver(OrderSchema),
    reValidateMode: "onChange",
    defaultValues: order || {
      created_by: userId,
      personal_collect: false,
      is_paid: false,
      is_proforma: false,
      line_items: [],
    },
  });

  const customerList = customers.map((customer) => {
    return {
      label: customer.name,
      value: customer.id,
    };
  });

  useEffect(() => {
    console.log(form.getValues());
    console.log(form.formState);
  }, [form.getValues()]);

  const onSubmit = (values: z.infer<typeof OrderSchema>) => {
    //TODO rethink file upload
    let formData = new FormData();
    console.log(values);

    if (values.file) {
      formData.append("file", values.file);
    }

    const data = JSON.parse(JSON.stringify(values));

    setError("");
    setSuccess("");

    startTransition(() => {
      if (order) {
        // Call an update function instead of create
        updateOrder(data, formData).then((response) => {
          setSuccess(response?.success);
          setOpen(false);
        });
        console.log("Order updated successfully");
        console.log(values);
      } else {
        createOrder(data, formData).then((response) => {
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
          {editMode ? "Edytuj zamówienie" : "Utwórz nowe zamówienie"}
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
                {order ? "Edytuj zamówienie" : "Nowe zamówienie"}
              </div>
              <div className="flex gap-2 self-stretch my-auto text-sm">
                <div className="shrink-0 my-auto w-2.5 bg-amber-300 rounded-full h-[11px]" />
                <div>Status </div>
              </div>
            </div>
            <div className="flex gap-1 mt-4 text-xs text-neutral-400">
              <div>Pulpit</div>
              <div>/</div>
              <div>Zamówienia</div>
              <div>/</div>
              <div>Nowe zamówienie</div>
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
                  <TabsTrigger value="customer">Dane Klienta</TabsTrigger>
                  <TabsTrigger value="products">Produkty</TabsTrigger>
                  <TabsTrigger value="order">Szczegóły zamówienia</TabsTrigger>
                  <TabsTrigger value="documents">Dokumenty</TabsTrigger>
                  <TabsTrigger value="comments">Uwagi</TabsTrigger>
                </TabsList>

                <TabsContent value="customer" className="w-full h-[550px]">
                  <div className="flex flex-row mt-6 mb-10">
                    <div className="flex flex-col w-5/12">
                      <div className="text-black text-[28px] font-medium">
                        Klient
                      </div>
                      <FormField
                        control={form.control}
                        name="customer_id"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "h-10 px-3 py-2 mr-4 mb-4 bg-white rounded-lg shadow justify-center items-center gap-2.5 inline-flex",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value
                                      ? customerList.find(
                                          (customer) =>
                                            customer.value === field.value
                                        )?.label
                                      : "Wybierz klienta"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
                                <Command>
                                  <CommandInput placeholder="Znajdź klienta" />
                                  <CommandList>
                                    <CommandEmpty>
                                      Nie znaleziono klientów
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {customerList.map((customer) => (
                                        <CommandItem
                                          value={customer.label}
                                          key={customer.value}
                                          onSelect={() => {
                                            form.setValue(
                                              "customer_id",
                                              customer.value
                                            );
                                          }}
                                        >
                                          <Check
                                            key={customer.value}
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              customer.value === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {customer.label}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex flex-row">
                        <Button
                          variant={"zaza"}
                          className="w-max font-normal mr-4"
                        >
                          Wybierz Klienta
                        </Button>
                        <Button variant={"zaza"} className="w-max font-normal">
                          Dodaj Klienta po NIP
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-black text-[28px] font-medium">
                        NIP
                      </div>
                      <FormField
                        control={form.control}
                        name="nip"
                        render={({ field }) => (
                          <FormItem className="flex flex-col mb-4">
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
                      <div className="flex flex-row">
                        <Button
                          variant={"zaza"}
                          className="w-max font-normal mr-4"
                        >
                          Sprawdź NIP
                        </Button>
                        <Button variant={"zaza"} className="w-max font-normal">
                          Historia NIP
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col mt-6">
                    <div className="flex flex-row w-96">
                      <div className="text-black text-[28px] font-medium mr-4">
                        Produkty
                      </div>
                      {/* <Button variant={"zaza"} className="min-w-80 font-normal">
                        Dodaj produkty
                      </Button> */}
                    </div>
                    <OrderProductsTable orders={[]} />
                  </div>
                </TabsContent>

                <TabsContent value="products">
                  <LineItemFormElement
                    name="line_items"
                    products={products}
                    line_items={order?.LineItem}
                  />
                </TabsContent>

                <TabsContent value="order">
                  <div className="flex flex-row  mt-10 mb-5">
                    <div className="grid w-full mr-5 items-center gap-1.5">
                      <Label>Numer obcy</Label>
                      <FormField
                        control={form.control}
                        name="foreign_id"
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
                      <Label>Status</Label>
                      <FormField
                        control={form.control}
                        name="status"
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
                                <SelectItem value="created">
                                  Utworzone
                                </SelectItem>
                                <SelectItem value="in_production">
                                  W produkcji
                                </SelectItem>
                                <SelectItem value="in_transport">
                                  W transporcie
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label>Zapłacono</Label>
                      <FormField
                        control={form.control}
                        name="is_paid"
                        render={({ field }) => (
                          <FormItem className="flex flex-row">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid w-full  items-center gap-1.5">
                      <Label>Proforma</Label>
                      <FormField
                        control={form.control}
                        name="is_proforma"
                        render={({ field }) => (
                          <FormItem className="flex flex-row">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label>Typ WZ</Label>
                      <FormField
                        control={form.control}
                        name="wz_type"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
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
                                <SelectGroup>
                                  <SelectItem value="WZS">WZS</SelectItem>
                                  <SelectItem value="WZU">WZU</SelectItem>
                                  <SelectItem value="WZN">WZN</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex flex-row">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label>Data dostawy</Label>
                      <FormField
                        control={form.control}
                        name="delivery_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-[240px] pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(new Date(field.value), "PPP")
                                    ) : (
                                      <span>Wybierz datę</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={
                                    field.value
                                      ? new Date(field.value)
                                      : undefined
                                  }
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label>Data płatnosci</Label>
                      <FormField
                        control={form.control}
                        name="payment_deadline"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-[240px] pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(new Date(field.value), "PPP")
                                    ) : (
                                      <span>Wybierz datę</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid w-full max-w-sm mr-5 items-center gap-1.5">
                      <Label>Koszt transportu</Label>
                      <FormField
                        control={form.control}
                        name="transport_cost"
                        render={({ field }) => (
                          <FormItem className="flex flex-row">
                            <FormControl>
                              <Input
                                type="number"
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
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label>Data płatnosci proformy</Label>
                      <FormField
                        control={form.control}
                        name="proforma_payment_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-[240px] pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(new Date(field.value), "PPP")
                                    ) : (
                                      <span>Wybierz datę</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents">
                  <div>
                    <h1>Dokumenty</h1>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label>Dodaj dokument</Label>
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
                  // disabled={!form.formState.isValid}
                  variant="zaza"
                  className="w-[186px] h-7 px-3 py-2 bg-white rounded-lg shadow justify-center items-center gap-2.5 inline-flex"
                  size="sm"
                >
                  {editMode ? "Zapisz" : "Utwórz"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
