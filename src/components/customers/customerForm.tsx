"use client";

import { Button } from "../ui/button";

import { cn } from "@/lib/utils";

import { Check, ChevronsUpDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
  DialogTitle,
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  FormMessage,
} from "../ui/form";

import * as z from "zod";
import { FormProvider, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { CustomerSchema } from "@/schemas";

import { useEffect, useState, useTransition } from "react";

import { Input } from "../ui/input";

import { createCustomer, updateCustomer } from "@/actions/customer";
import { ContactPersonFormElement } from "./contactPersonFormElement";
import { BranchFormElement } from "./branchFormElement";
import { DeliveryFormElement } from "./deliveryFormElement";

import { getCustomerFromGus } from "@/lib/regon";

import Link from "next/link";

export const CustomerForm = ({
  editMode,
  userId,
  customer,
  salesmen,
  addByNip,
  nip,
}: {
  editMode?: boolean;
  userId: string;
  customer?: any;
  salesmen: any[];
  addByNip?: boolean;
  nip?: string;
}) => {
  //TODO error handling
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [fetchCustomerError, setFetchCustomerError] = useState<boolean>(false);

  const form = useForm<z.infer<typeof CustomerSchema>>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: customer
      ? { ...customer, payment_punctuality: "ON_TIME" }
      : {
          send_email_invoice: false,
          payment_type: "PREPAID",
          created_by_id: userId,
          payment_punctuality: "ON_TIME",
        },
  });

  const resetForm = () => {
    form.reset({
      send_email_invoice: false,
      payment_type: "PREPAID",
      created_by_id: userId,
      payment_punctuality: "ON_TIME",
    });
  };

  const salesmanList = salesmen?.map((salesman) => {
    return {
      label: `${salesman.firstname} ${salesman.lastname}`,
      value: salesman.id,
    };
  });

  const onSubmit = (values: z.infer<typeof CustomerSchema>) => {
    const data = JSON.parse(JSON.stringify(values));
    setError("");
    setSuccess("");
    startTransition(() => {
      if (customer) {
        updateCustomer(customer.id, data).then((response) => {
          setSuccess(response?.success);
          resetForm();
          setOpen(false);
          setIsConfirmDialogOpen(false);
        });
      } else {
        createCustomer(data)
          .then((response) => {
            if (response?.error) {
              setError(response?.error.message);
              setIsError(true);
              throw new Error(response.error.message);
            }
            setSuccess(response?.success);
            resetForm();
            setOpen(false);
            setIsConfirmDialogOpen(false);
          })
          .catch((error) => {
            setError(error.message);
          });
      }
    });
  };

  useEffect(() => {
    if (nip) {
      form.setValue("nip", nip);
    }
  }, [nip]);

  const fetchNipData = async () => {
    const nip = form.getValues("nip");
    try {
      const data = await getCustomerFromGus(nip);
      if (data) {
        form.reset({
          ...form.getValues(),
          name: data.Nazwa,
          city: data.Miejscowosc,
          postal_code: data.KodPocztowy,
          street: data.Ulica,
          building: data.NrNieruchomosci,
          premises: data.NrLokalu,
        });
        form.setValue("name", data.Nazwa);
        form.setValue("city", data.Miejscowosc);
        form.setValue("postal_code", data.KodPocztowy);
        form.setValue("street", data.Ulica);
        form.setValue("building", data.NrNieruchomosci);
        form.setValue("premises", data.NrLokalu);
      }
    } catch (error) {
      setFetchCustomerError(true);
    }
  };

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
          <Button
            onClick={() => (nip ? fetchNipData() : null)}
            className="w-full font-normal"
            variant="zazaGrey"
          >
            {editMode
              ? `Edytuj klienta ${customer.name}`
              : addByNip
              ? "Dodaj nowego klienta po NIP"
              : "Dodaj nowego klietna"}
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
                  {customer ? `Edytuj ${customer.name}` : `Nowy klient`}
                </div>
                <div className="flex gap-2 self-stretch my-auto text-sm">
                  <div className="shrink-0 my-auto w-2.5 bg-amber-300 rounded-full h-[11px]" />
                  <div>Status </div>
                </div>
              </div>
              <div className="flex gap-1 mt-4 text-xs text-neutral-400">
                <div>
                  <Link href="/">Pulpit</Link>
                </div>
                <div>/</div>
                <div>
                  <Link href="/customers" onClick={() => setOpen(false)}>
                    Klienci
                  </Link>
                </div>
                <div>/</div>
                <div>
                  {customer ? `Edytuj ${customer.name}` : `Nowy klient`}
                </div>
              </div>
            </div>
          </DialogHeader>
          <FormProvider {...form}>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 flex flex-col w-full h-full justify-between"
              >
                <div className="flex flex-col content-between h-[700px]">
                  <Tabs defaultValue="account" className="w-full h-full">
                    <TabsList>
                      <TabsTrigger value="customer">
                        Dane kontaktowe
                      </TabsTrigger>
                      <TabsTrigger value="payment">
                        Rodzaj płatności
                      </TabsTrigger>
                      <TabsTrigger value="contact_person">
                        Osoba kontaktowa
                      </TabsTrigger>
                      <TabsTrigger value="salesman">
                        Przypisany handlowiec
                      </TabsTrigger>
                      <TabsTrigger value="discount">
                        Limity i rabaty
                      </TabsTrigger>
                      <TabsTrigger value="delivery">
                        Filie i adresy dostaw
                      </TabsTrigger>
                      <TabsTrigger value="invoice">Dane do faktury</TabsTrigger>
                      {/* <TabsTrigger value="comments">Uwagi</TabsTrigger> */}
                    </TabsList>

                    <TabsContent value="customer" className="w-full h-[550px]">
                      <div className="text-xl mt-5">Dane postawowe</div>
                      <div className="flex flex-row  mt-5 mb-5 pb-4 border-b-2">
                        <div className="grid w-full mr-5 items-center gap-1.5">
                          <Label>Nazwa firmy*</Label>
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
                        <div className="grid w-full mr-5 items-center gap-1.5">
                          <Label>NIP firmy*</Label>
                          <FormField
                            control={form.control}
                            name="nip"
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
                          <Label>Symbol*</Label>
                          <FormField
                            control={form.control}
                            name="symbol"
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
                          <Label>Rodzaj klienta*</Label>
                          <FormField
                            control={form.control}
                            name="customer_type"
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
                                    <SelectItem value="construction">
                                      Meblowy
                                    </SelectItem>
                                    <SelectItem value="developer">
                                      Hurtownia
                                    </SelectItem>
                                    <SelectItem value="furniture">
                                      Deweloper
                                    </SelectItem>
                                    <SelectItem value="roof">
                                      Dachowy
                                    </SelectItem>
                                    <SelectItem value="contractor">
                                      Wykonawca
                                    </SelectItem>
                                    <SelectItem value="main_contractor">
                                      Wykonawca Generalny
                                    </SelectItem>
                                    <SelectItem value="prepaid">
                                      Przedpłata
                                    </SelectItem>
                                    <SelectItem value="manufakturer">
                                      Producent
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid w-full mr-5 items-center gap-1.5">
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              fetchNipData();
                            }}
                            variant="zaza"
                          >
                            Pobierz z GUS
                          </Button>
                        </div>
                      </div>
                      <div className="text-xl">Dane adresowe</div>
                      <div className="flex flex-row mt-5">
                        <div className="grid w-full mr-5 items-center gap-1.5">
                          <Label>Ulica*</Label>
                          <FormField
                            control={form.control}
                            name="street"
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
                          <Label>Nr budynku*</Label>
                          <FormField
                            control={form.control}
                            name="building"
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
                          <Label>Nr lokalu</Label>
                          <FormField
                            control={form.control}
                            name="premises"
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
                          <Label>Kod pocztowy*</Label>
                          <FormField
                            control={form.control}
                            name="postal_code"
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
                          <Label>Miejscowość*</Label>
                          <FormField
                            control={form.control}
                            name="city"
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
                          <Label>Państwo*</Label>
                          <FormField
                            control={form.control}
                            name="country"
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
                      <div className="text-xl mt-5">Kontakt</div>
                      <div className="flex flex-row mt-5">
                        <div className="grid w-full mr-5 items-center gap-1.5">
                          <Label>Telefon kontaktowy</Label>
                          <FormField
                            control={form.control}
                            name="phone_number"
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
                          <Label>Email</Label>
                          <FormField
                            control={form.control}
                            name="primary_email"
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
                          <Label>Email do wysyłki dokumentów</Label>
                          <FormField
                            control={form.control}
                            name="documents_email"
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
                    </TabsContent>

                    <TabsContent value="payment">
                      <div className="flex flex-row  mt-10 mb-5">
                        <div className="grid w-full mr-5 min-w-64 items-center gap-1.5">
                          <Label>Rodzaj płatności</Label>
                          <FormField
                            control={form.control}
                            name="payment_type"
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
                                    <SelectItem value="PREPAID">
                                      Przedpłata
                                    </SelectItem>
                                    <SelectItem value="WIRE">
                                      Przelew
                                    </SelectItem>
                                    <SelectItem value="CASH">
                                      Gotówka
                                    </SelectItem>
                                  </SelectContent>
                                </Select>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="contact_person">
                      <div className="text-xl mt-5">Osoba kontaktowa</div>
                      <ContactPersonFormElement name="ContactPerson" />
                    </TabsContent>

                    <TabsContent value="salesman">
                      <div className="flex flex-col w-5/12">
                        <div className="text-black text-[28px] font-medium">
                          Handlowiec
                        </div>
                        <FormField
                          control={form.control}
                          name="salesman_id"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-col">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                          "h-10 px-3 py-2 mr-4 mb-4 bg-white rounded-lg shadow justify-center items-center gap-2.5 inline-flex",
                                          !field.value &&
                                            "text-muted-foreground"
                                        )}
                                      >
                                        {field.value
                                          ? salesmanList.find(
                                              (salesman) =>
                                                salesman.value === field.value
                                            )?.label
                                          : "Wybierz handlowca"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
                                    <Command>
                                      <CommandInput placeholder="Znajdź handlowców" />
                                      <CommandList>
                                        <CommandEmpty>
                                          Nie znaleziono handlowców
                                        </CommandEmpty>
                                        <CommandGroup>
                                          {salesmanList.map((salesman) => (
                                            <CommandItem
                                              value={salesman.label}
                                              key={salesman.value}
                                              onSelect={() => {
                                                form.setValue(
                                                  "salesman_id",
                                                  salesman.value
                                                );
                                              }}
                                            >
                                              <Check
                                                key={salesman.value}
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  field.value === salesman.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                              {salesman.label}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="discount">
                      <div className="flex flex-row mt-5">
                        <div className="grid w-full mr-5 items-center gap-1.5">
                          <Label>Limit kredytowy</Label>
                          <FormField
                            control={form.control}
                            name="credit_limit"
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
                          <Label>Maksymalny rabat</Label>
                          <FormField
                            control={form.control}
                            name="max_discount"
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
                    </TabsContent>

                    <TabsContent value="delivery">
                      <BranchFormElement name="branch" />
                      <DeliveryFormElement name="DeliveryAdress" />
                    </TabsContent>

                    <TabsContent value="invoice">
                      <div className="text-xl mt-5">Dane do faktury</div>
                      <div className="flex flex-row mt-5">
                        <div className="grid w-full mr-5 items-center gap-1.5">
                          <Label>Nazwa</Label>
                          <FormField
                            control={form.control}
                            name="invoice_name"
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
                          <Label>NIP</Label>
                          <FormField
                            control={form.control}
                            name="invoice_nip"
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
                          <Label>Ulica</Label>
                          <FormField
                            control={form.control}
                            name="invoice_street"
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
                          <Label>Nr budynku</Label>
                          <FormField
                            control={form.control}
                            name="invoice_building"
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
                          <Label>Nr lokalu</Label>
                          <FormField
                            control={form.control}
                            name="invoice_premises"
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
                          <Label>Miejscowość</Label>
                          <FormField
                            control={form.control}
                            name="invoice_city"
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
                          <Label>Kod poczotwy</Label>
                          <FormField
                            control={form.control}
                            name="invoice_postal_code"
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
                          <Label>Kraj</Label>
                          <FormField
                            control={form.control}
                            name="invoice_country"
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
                    </TabsContent>

                    {/* <TabsContent value="comments">
                    <div className="flex flex-row mt-10">
                      <CommentSection
                        control={form.control}
                        setValue={form.setValue}
                        name="comments"
                      />
                    </div>
                  </TabsContent> */}
                  </Tabs>
                  <DialogFooter className="max-h-fit">
                    <Button
                      type="submit"
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
          </FormProvider>
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
            {customer
              ? "Dane klienta zostały zaktualizowane pomyślnie."
              : "Nowy klient został utworzony pomyślnie."}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSuccessDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isError} onOpenChange={setIsError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Błąd</DialogTitle>
          </DialogHeader>
          <div>{error}</div>
          <DialogFooter>
            <Button onClick={() => setIsError(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={fetchCustomerError} onOpenChange={setFetchCustomerError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Błąd pobierania</DialogTitle>
          </DialogHeader>
          <div>Nie znaleziono danych dla podanego numeru NIP</div>
          <DialogFooter>
            <Button onClick={() => setFetchCustomerError(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
