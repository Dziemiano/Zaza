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
  SelectGroup,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "../ui/calendar";

import { cn } from "@/lib/utils";

import { CalendarIcon } from "lucide-react";

import { Switch } from "@/components/ui/switch";

import { Textarea } from "@/components/ui/textarea";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Spinner } from "../ui/spinner";

import * as z from "zod";
import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useState, useTransition, useMemo } from "react";
import { Input } from "../ui/input";

import { useCurrentUser } from "@/hooks/useCurrentUser";

import { OrderSchema, WzSchema } from "@/schemas";
import { createWz } from "@/actions/documents";
import { WzCheckPdf } from "./wznCheckPdf";
import WzLineItemsComponent from "./wzLineItemElement";
import { useToast } from "@/hooks/useToast";
import { ToastVariants } from "../ui/toast";

import { PalletManagement } from "./palletManagementElement";

import {
  getOptimaItemByCode,
  postOptimaDocument,
  postOptimaItem,
  changeOptimaDocumentStatus,
  getOptimaDocumentsByType,
  getOptimaCustomerByCode,
  postOptimaCustomer,
  getOptimaToken,
  getOptimaCustomerByNip,
} from "@/lib/optima";

import { Category } from "@/types/product.types";

type WzDocFormProps = {
  editMode?: boolean;
  order?: z.infer<typeof OrderSchema>;
};

export const WzDocForm = ({ editMode, order }: WzDocFormProps) => {
  //TODO: add form validation, error handling
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const userId = useCurrentUser()?.id;

  const form = useForm<z.infer<typeof WzSchema>>({
    resolver: zodResolver(WzSchema),
    defaultValues: {
      unit_type: "main",
      created_by: userId,
      order_id: order?.id,
      created_at: new Date(),
      type: order?.wz_type,
      line_items: order?.lineItems
        ?.filter((item) => !item.is_used && item.wz === null)
        .map((item) => ({
          ...item,
          included_in_wz: false,
          wz_quantity: "",
          wz_unit: item.quant_unit,
        })),
    },
  });

  const resetForm = () => {
    form.reset({
      created_by: userId,
    });
  };

  console.log(form.getValues().line_items);
  const getSelectedLineItems = () => {
    const formValues = form.getValues();
    return formValues.line_items?.filter((item) => item.included_in_wz);
  };

  const formValues = useWatch({ control: form.control });

  const wzData = useMemo(() => {
    const processedLineItems =
      formValues.line_items
        ?.map((item) => {
          if (item.included_in_wz) {
            const originalQuantity = parseFloat(item.quantity);
            const wzQuantity = parseFloat(item.wz_quantity);

            if (wzQuantity < originalQuantity) {
              return {
                ...item,
                quantity: item.wz_quantity,
              };
            }
          }
          return item;
        })
        .filter((item) => item.included_in_wz) || [];

    return {
      ...order,
      wz: [{ ...formValues, line_items: processedLineItems }],
    };
  }, [formValues, order]);

  const splitCustomerName = (fullName) => {
    const name = fullName.toUpperCase();
    let name1 = "";
    let name2 = "";
    let name3 = "";

    // Split the full name into words
    const words = name.split(" ");

    // Build name1 (first 50 chars)
    let currentLength = 0;
    let wordIndex = 0;

    // Build name1
    while (wordIndex < words.length) {
      const word = words[wordIndex];
      const wordWithSpace = wordIndex > 0 ? " " + word : word;

      if (currentLength + wordWithSpace.length <= 50) {
        name1 += wordWithSpace;
        currentLength += wordWithSpace.length;
        wordIndex++;
      } else {
        break;
      }
    }

    // Build name2 (next 50 chars)
    if (wordIndex < words.length) {
      currentLength = 0;
      const startIndex = wordIndex;

      while (wordIndex < words.length) {
        const word = words[wordIndex];
        const wordWithSpace = wordIndex > startIndex ? " " + word : word;

        if (currentLength + wordWithSpace.length <= 50) {
          name2 += wordWithSpace;
          currentLength += wordWithSpace.length;
          wordIndex++;
        } else {
          break;
        }
      }
    }

    // Build name3 (remaining words)
    if (wordIndex < words.length) {
      name3 = words.slice(wordIndex).join(" ");
    }

    return { name1, name2, name3 };
  };

  const createOptimaDocument = async (
    items,
    data,
    foreign_id,
    customerData
  ) => {
    const { name1, name2, name3 } = splitCustomerName(customerData.name);

    const token = await getOptimaToken(data.type);
    if (!token && data.type !== "WZU") {
      throw new Error("Failed to get token");
    }

    try {
      // Step 1: Check and create customer if needed
      try {
        const existingCustomerResponse = await getOptimaCustomerByCode(
          customerData.symbol.toUpperCase(),
          token ?? "",
          data.type
        );

        // Create customer if not found
        if (existingCustomerResponse.status === 404) {
          const newCustomer = await postOptimaCustomer(
            {
              code: customerData.symbol.toUpperCase(),
              name1: name1,
              name2: name2,
              name3: name3,
              country: customerData.country,
              city: customerData.city,
              street: customerData.street,
              houseNumber: customerData.building,
              flatNumber: customerData.premises,
              postCode: customerData.postal_code,
              vatNumber: customerData.nip,
              countrycode: "PL",
              // Add other customer fields as needed from customerData
            },
            token ?? "",
            data.type
          );

          if (!newCustomer) {
            throw new Error(`Failed to create customer: ${customerData.code}`);
          }
        }
      } catch (customerError) {
        console.error(
          "Error processing customer:",
          customerData.code,
          customerError
        );
        throw customerError;
      }

      // Step 2: Process each item sequentially
      for (const item of items) {
        // Check if item exists in Optima
        try {
          const existingItemResponse = await getOptimaItemByCode(
            item.product_sku.toUpperCase(),
            token ?? "",
            data.type
          );

          console.log(item);
          console.log("create data", data);
          // Only create new item if response is 404 (item not found)
          if (existingItemResponse.status === 404) {
            const newItem = await postOptimaItem(
              {
                type: 1,
                inactive: 0,
                code: item.product_sku.toUpperCase(),
                name: item.product_name,
                manufacturerCode: "Amitec",
                vatRate: 23.0,
                unit:
                  item.product_category === Category.ShapedForms ||
                  item.product_category === Category.Sheets
                    ? "szt"
                    : "m3",
                barcode: "",
                description: "",
                prices: [
                  {
                    number: 2,
                    type: 1,
                    name: "hurtowa 1",
                    value: 0,
                  },
                  {
                    number: 3,
                    type: 1,
                    name: "hurtowa 2",
                    value: 0,
                  },
                  {
                    number: 4,
                    type: 1,
                    name: "hurtowa 3",
                    value: 0,
                  },
                  {
                    number: 5,
                    type: 2,
                    name: "detaliczna",
                    value:
                      item.price === null || item.price === "" ? 1 : item.price,
                  },
                ],
                supplierCode: "Amitec",
                package_deposit: 0,
                product: 1,
              },
              token ?? "",
              data.type
            );

            if (!newItem) {
              throw new Error(`Failed to create item: ${item.product_name}`);
            }
          }
        } catch (itemError) {
          console.error("Error processing item:", item.product_name, itemError);
          throw itemError;
        }
      }

      try {
        // Get current documents count for numbering
        const existingDocuments = await getOptimaDocumentsByType(
          303,
          token ?? "",
          data.type
        );

        // Safely handle the documents count
        const documentsCount =
          Array.isArray(existingDocuments) && existingDocuments.length > 0
            ? existingDocuments.length + 10
            : 1;

        // Prepare warehouse quantity change document
        const warehouseQuantityChangeDocumentData = {
          type: 303,
          elements: items.map((item) => ({
            code: item.product_sku.toUpperCase(),
            quantity:
              item.product_category === Category.ShapedForms ||
              item.product_category === Category.Sheets
                ? parseFloat(item.helper_quantity)
                : parseFloat(item.wz_quantity), // Ensure quantity is a number
            purchaseAmount: 1000,
            currentQuantity: 1000,
          })),
          description: "tworzenie dokumentu wz",
          status: 0,
          sourceWarehouseId: 1,
          documentIssueDate: data.issue_date,
          number: documentsCount + 1,
          paymentMethod: "przelew",
          currency: "PLN",
          calculatedOn: 1,
          targetWarehouseId: 1,
        };

        console.log(
          "Sending document data:",
          JSON.stringify(warehouseQuantityChangeDocumentData, null, 2)
        );

        // Post quantity change document
        const quantityResponse = await postOptimaDocument(
          warehouseQuantityChangeDocumentData,
          token ?? "",
          data.type
        );

        if (!quantityResponse) {
          throw new Error(`Failed to post PW`);
        }
      } catch (error) {
        console.error("Error processing PW:", error);
        console.error("Error details:", error.message);
        throw error;
      }

      // let nextNumber = 1;
      // try {
      //   const currentMonth = new Date(data.issue_date).getMonth(); // 0-11
      //   const documentsResponse = await getOptimaDocumentsByType(
      //     306,
      //     token ?? "",
      //     data.type
      //   );

      //   if (documentsResponse) {
      //     // Handle both array and single object responses
      //     const documents = Array.isArray(documentsResponse)
      //       ? documentsResponse
      //       : [documentsResponse];

      //     // Filter documents for current month only
      //     const currentMonthDocuments = documents.filter((doc) => {
      //       const docMonth = new Date(doc.documentIssueDate).getMonth();
      //       console.log(docMonth, currentMonth);
      //       return docMonth === currentMonth;
      //     });
      //     console.log(currentMonthDocuments);

      //     if (currentMonthDocuments.length > 0) {
      //       // Find max number from current month's documents
      //       const maxNumber = currentMonthDocuments.reduce((max, doc) => {
      //         return doc.number > max ? doc.number : max;
      //       }, 0);
      //       console.log(`Max number for current month: ${maxNumber}`);

      //       nextNumber = maxNumber + 1;
      //     } else {
      //       // If no documents in current month, start from 1
      //       nextNumber = 1;
      //     }
      //   }
      // } catch (docCountError) {
      //   console.log(`Starting numbering from 1 for new month`);
      //   nextNumber = 1;
      // }

      const res = await fetch(
        `/api/wz/count?type=${data.type}&date=${data.issue_date}`
      );
      const { count } = await res.json();

      console.log(count);

      const symbol = data.type === "WZS" ? "WZ_S" : "WZ_N";

      // Step 3: Create final document
      const optimaDoc = {
        type: 306,
        foreignNumber: foreign_id,
        calculatedOn: 1,
        paymentMethod: "przelew",
        currency: "PLN",
        symbol: symbol,
        elements: items.map((item) => ({
          code: item.product_sku.toUpperCase(),
          quantity:
            item.product_category === Category.ShapedForms ||
            item.product_category === Category.Sheets
              ? parseFloat(item.helper_quantity)
              : parseFloat(item.wz_quantity),
          unit:
            item.product_category === Category.ShapedForms ||
            item.product_category === Category.Sheets
              ? "szt"
              : "m3",
          unitNetPrice: parseFloat(item.wz_netto_cost),
          unitGrossPrice: parseFloat(item.wz_brutto_cost),
          totalNetValue:
            (item.product_category === Category.ShapedForms ||
            item.product_category === Category.Sheets
              ? parseFloat(item.helper_quantity)
              : parseFloat(item.wz_quantity)) * parseFloat(item.wz_netto_cost),
          totalGrossValue:
            (item.product_category === Category.ShapedForms ||
            item.product_category === Category.Sheets
              ? parseFloat(item.helper_quantity)
              : parseFloat(item.wz_quantity)) * parseFloat(item.wz_brutto_cost),
          setCustomValue: true,
        })),
        payer: {
          code: customerData.symbol.toUpperCase().slice(0, 20),
          name1: name1,
          name2: name2,
          name3: name3,
          country: customerData.country,
          city: customerData.city,
          street: customerData.street,
          houseNumber: customerData.building,
          flatNumber: customerData.premises,
          postCode: customerData.postal_code,
          vatNumber: customerData.nip,
          countrycode: "PL",
        },
        recipient: {
          code: customerData.symbol.toUpperCase().slice(0, 20),
          name1: name1,
          name2: name2,
          name3: name3,
          country: customerData.country,
          city: customerData.city,
          street: customerData.street,
          houseNumber: customerData.building,
          flatNumber: customerData.premises,
          postCode: customerData.postal_code,
          vatNumber: customerData.nip,
          countrycode: "PL",
        },
        description: "",
        status: 1,
        sourceWarehouseId: 1,
        documentReleaseDate: new Date(
          new Date(data.out_date).setHours(
            new Date(data.out_date).getHours() + 2
          )
        ).toISOString(),
        documentIssueDate: data.issue_date,
        series: "zaza",
        number: count,
      };

      const documentResponse = await postOptimaDocument(
        optimaDoc,
        token ?? "",
        data.type
      );

      if (!documentResponse) {
        throw new Error("Failed to create final Optima document");
      }

      return {
        success: true,
        documentId: documentResponse.id,
      };
    } catch (error) {
      console.error("Error in createOptimaDocument:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const onSubmit = async (values: z.infer<typeof WzSchema>) => {
    setIsLoading(true);

    const data = JSON.parse(JSON.stringify(values));

    const formLineItems = form.getValues("line_items");

    const processedLineItems = formLineItems
      .filter((item) => item.included_in_wz)
      .map((item) => {
        const originalQuantity = parseFloat(item.quantity);
        const wzQuantity = parseFloat(item.wz_quantity);
        const remainingQuantity = originalQuantity - wzQuantity;

        return {
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product.sku,
          product_category: item.product.category,
          order_id: order.id,
          wz_quantity: item.wz_quantity,
          wz_netto_cost: item.netto_cost,
          wz_brutto_cost: item.brutto_cost,
          remaining_quantity: remainingQuantity.toString(),
          wz_unit: item.wz_unit || item.quant_unit,
          help_quant_unit: item.help_quant_unit,
          helper_quantity: item.helper_quantity,
          vat: item.vat_percentage,
          price: item.product.price,
        };
      });

    console.log("processed", processedLineItems);

    const wzLineItems = processedLineItems.filter(
      (item) => item.included_in_wz === true
    );

    const wzData = {
      ...data,
      line_items: processedLineItems,
    };

    const updatedOrder = {
      ...order,
      line_items: processedLineItems,
    };

    // For WZS and WZN, create Optima document first
    if (values.type !== "WZU") {
      const optimaResult = await createOptimaDocument(
        processedLineItems,
        values,
        order?.id,
        order?.customer
      );

      if (!optimaResult.success) {
        toast({
          title: "Błąd!",
          description: "Nie udało się utworzyć dokumentu w systemie Optima",
          variant: ToastVariants.error,
        });
        setIsLoading(false);
        return;
      }
    }

    startTransition(() => {
      createWz(wzData)
        .then((response) => {
          if (response.success) {
            toast({
              title: "Sukces!",
              description: "Utworzono dokument WZ",
              variant: ToastVariants.success,
            });
            setOpen(false);
            resetForm();
          } else {
            toast({
              title: "Wystąpił błąd!",
              description: "Nie udało się utworzyć dokumentu WZ",
              variant: ToastVariants.error,
            });
          }
        })
        .finally(() => setIsLoading(false));
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      className="relative overflow-auto"
    >
      <DialogTrigger asChild>
        <Button className="w-full font-normal" variant="zazaGrey">
          {"Wystaw dokument WZ"}
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[85%] h-[80vh] flex flex-col overflow-auto">
        <DialogHeader className="flex-shrink-0">
          <div className="flex flex-col justify-center">
            <div className="flex gap-4 items-center text-black">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/6940c2d742c79e36db9201da6abbfd61adfd7423d7f2812f27c9da290dda59cf?"
                className="shrink-0 self-stretch my-auto aspect-square w-[25px]"
              />
              <div className="self-stretch text-3xl font-bold">
                {"Wystaw dokument WZ do zamówienia nr " + order?.id}
              </div>
            </div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-grow"
          >
            <div className="flex-grow overflow-y-auto">
              <div className="space-y-6">
                <div className="text-xl">Szczegóły dokumentu</div>
                <div className="flex flex-row mt-5">
                  <div className="grid w-full mr-5 items-center gap-1.5">
                    <Label>Status *</Label>
                    <FormField
                      control={form.control}
                      name="status"
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
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Typ WZ*</Label>
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={order?.wz_type}
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Data wystawienia *</Label>
                    <FormField
                      control={form.control}
                      name="issue_date"
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
                                    new Date(field.value).toLocaleDateString(
                                      "pl-PL"
                                    )
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
                    <Label>Data wydania *</Label>
                    <FormField
                      control={form.control}
                      name="out_date"
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
                                    new Date(field.value).toLocaleDateString(
                                      "pl-PL"
                                    )
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
                </div>
                <div className="flex flex-row mt-5">
                  <div className="grid w-full mr-5 items-center gap-1.5">
                    <Label>Kierowca</Label>
                    <FormField
                      control={form.control}
                      name="driver"
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
                    <Label>Samochód</Label>
                    <FormField
                      control={form.control}
                      name="car"
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
                    <Label>Osoba odpowiedzialna za załadunek</Label>
                    <FormField
                      control={form.control}
                      name="cargo_person"
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
                  <div className="grid w-full items-center gap-1.5">
                    <Label>Podstawowa</Label>
                    <FormField
                      control={form.control}
                      name="unit_type"
                      render={({ field }) => (
                        <FormItem className="flex flex-row">
                          <Switch
                            checked={field.value === "main"}
                            onCheckedChange={(checked) => {
                              if (checked) field.onChange("main");
                            }}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid w-full  items-center gap-1.5">
                    <Label>Pomocnicza</Label>
                    <FormField
                      control={form.control}
                      name="unit_type"
                      render={({ field }) => (
                        <FormItem className="flex flex-row">
                          <Switch
                            checked={field.value === "helper"}
                            onCheckedChange={(checked) => {
                              if (checked) field.onChange("helper");
                            }}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid w-full  items-center gap-1.5">
                    <Label>Obie</Label>
                    <FormField
                      control={form.control}
                      name="unit_type"
                      render={({ field }) => (
                        <FormItem className="flex flex-row">
                          <Switch
                            checked={field.value === "both"}
                            onCheckedChange={(checked) => {
                              if (checked) field.onChange("both");
                            }}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex flex-row mt-5">
                  <div className="grid w-full items-center gap-1.5">
                    <FormField
                      control={form.control}
                      name="pallets"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormControl>
                            <PalletManagement
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid w-full mr-5 items-center gap-1.5">
                  <Label>Informacje dodatkowe</Label>
                  <FormField
                    control={form.control}
                    name="additional_info"
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
            </div>
            <WzLineItemsComponent lineItems={order?.lineItems} />

            <DialogFooter className="mt-auto pt-4">
              <WzCheckPdf wzData={wzData} index={0} />
              <Button
                type="submit"
                variant="zaza"
                className="w-[186px] h-7 px-3 py-2 bg-white rounded-lg shadow justify-center items-center gap-2.5 inline-flex"
                size="sm"
                disabled={isLoading}
              >
                Utwórz
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <Spinner isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
};
