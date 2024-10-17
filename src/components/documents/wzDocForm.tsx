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
import { he } from "date-fns/locale";
import { useToast } from "@/hooks/useToast";
import { ToastVariants } from "../ui/toast";

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
      line_items: order?.lineItems?.map((item) => ({
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

  const onSubmit = (values: z.infer<typeof WzSchema>) => {
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
          order_id: order.id,
          wz_quantity: item.wz_quantity,
          remaining_quantity: remainingQuantity.toString(),
          wz_unit: item.wz_unit || item.quant_unit,
          help_quant_unit: item.help_quant_unit,
          helper_quantity: item.helper_quantity,
        };
      });

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full font-normal" variant="zazaGrey">
          {"Wystaw dokument WZ"}
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[70%] h-[70vh] flex flex-col overflow-auto">
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
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Rodzaj palety</Label>
                    <FormField
                      control={form.control}
                      name="pallet_type"
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
                                <SelectItem value="Jednorazowa">
                                  Jednorazowa
                                </SelectItem>
                                <SelectItem value="EURO 1200x800">
                                  EURO 1200x800
                                </SelectItem>
                                <SelectItem value="LEMAR 1200x800">
                                  LEMAR 1200x800
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid w-full mr-5 items-center gap-1.5">
                    <Label>Ilość palet</Label>
                    <FormField
                      control={form.control}
                      name="pallet_count"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormControl>
                            <Input
                              className="w-full"
                              disabled={isPending}
                              type="number"
                              {...field}
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
      </DialogContent>
      <Spinner isLoading={isLoading} />
    </Dialog>
  );
};
