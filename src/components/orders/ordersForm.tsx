"use client";
import { Button } from "../ui/button";

import { cn, parseNumbersForSubmit } from "@/lib/utils";

import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";

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
  FormTabError,
} from "../ui/form";

import { Textarea } from "../ui/textarea";

import * as z from "zod";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { OrderSchema } from "@/schemas";

import { useEffect, useState, useTransition, memo } from "react";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";
import { Spinner } from "../ui/spinner";

import { createOrder } from "@/actions/orders";
import { updateOrder } from "@/actions/orders";

import { CommentSection } from "../reusable/commentsFormElement";
import SelectFormElement from "../reusable/selectFormElement";
import { checkNIP } from "@/actions/checkNIP";
import Link from "next/link";
import { Status as StatusType } from "@/types/orders.types";

import { ProductForm } from "../products/productsForm";
import { FixedSizeList as List } from "react-window";
import { CustomerForm } from "../customers/customerForm";
import ProductSelectionForm from "./productSelectionForm";
import { useToast } from "@/hooks/useToast";
import { ToastVariants } from "../ui/toast";

export type OrderFormProps = {
  customers: any[];
  user: { id: string | undefined; role: string };
  editMode?: boolean;
  order?: z.infer<typeof OrderSchema> & { id?: string };
  products: [];
  salesmen?: any[];
  copyMode?: boolean;
};

const orderErrorNames = {
  customer: ["customer_id", "line_items", "nip"],
  order: [
    "status",
    "foreign_id",
    "wz_type",
    "payment_deadline",
    "proforma_payment_date",
    "production_date",
    "transport_cost",
    "delivery_date",
    "delivery_place_id",
    "delivery_city",
    "delivery_street",
    "delivery_building",
    "delivery_premises",
    "delivery_zipcode",
  ],
  email: ["email_content"],
  documents: ["file"],
  comments: ["comments"],
};

const valuesToParseForSubmit = [
  "line_items.quantity",
  "line_items.helper_quantity",
  "line_items.netto_cost",
  "line_items.brutto_cost",
  "line_items.vat_percentage",
];

export const OrderForm = ({
  customers,
  user,
  editMode,
  order,
  products: initialProducts,
  salesmen,
  copyMode,
}: OrderFormProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nipOpen, setNipOpen] = useState(false);
  const [nipStatus, setNipStatus] = useState<string | undefined>("");
  const [tempProducts, setTempProducts] = useState([]);

  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [product_id, setProduct_id] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(undefined);

  const { toast } = useToast();

  const customerList = customers.map((customer) => {
    return {
      label: customer.symbol,
      nip: customer.nip,
      value: customer.id,
    };
  });

  const [filteredCustomers, setFilteredCustomers] = useState(customerList);

  const [defaultValues, setDefaultValues] = useState({});

  useEffect(() => {
    let initialValues = {};
    if (copyMode) {
      initialValues = {
        ...order,
        id: undefined,
        customer_id: order?.customer_id,
        created_by: user?.id,
        personal_collect: false,
        is_paid: false,
        is_proforma: false,
        transport_cost: 0,
        foreign_id: "",
        status: undefined,
        wz_type: undefined,
        warehouse_to_transport: undefined,
        delivery_date: undefined,
        payment_deadline: undefined,
        deliver_time: undefined,
        delivery_building: undefined,
        delivery_premises: undefined,
        delivery_city: undefined,
        delivery_street: undefined,
        delivery_zipcode: undefined,
        delivery_contact: undefined,
        production_date: undefined,
        line_items: order?.line_items?.map((li) => ({
          ...li,
          order_id: undefined,
        })),
      };
    } else if (editMode) {
      initialValues = { ...order, id: order?.id };
    } else if (user.role === "SALESMAN") {
      initialValues = {
        created_by: user?.id,
        personal_collect: false,
        is_paid: false,
        is_proforma: false,
        line_items: [],
        transport_cost: 0,
        status: "Oczekuje na zatwierdzenie przez BOK",
      };
    } else {
      initialValues = {
        created_by: user?.id,
        personal_collect: false,
        is_paid: false,
        is_proforma: false,
        line_items: [],
        transport_cost: 0,
      };
    }
    setDefaultValues(initialValues);
  }, [copyMode, editMode, order, user]);

  const form = useForm<z.infer<typeof OrderSchema>>({
    resolver: zodResolver(OrderSchema),
    reValidateMode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (Object.keys(defaultValues).length > 0) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  // FOR TESTING
  // useEffect(() =>
  //   console.log(
  //     "ORDER",
  //     order,
  //     "FORM",
  //     form,
  //     "EDIT",
  //     editMode,
  //     "COPY",
  //     copyMode
  //   )
  // );

  const isPersonalCollect = form.watch("personal_collect");

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = customerList.filter((customer) => {
      const labelMatch = customer.label
        .toLowerCase()
        .includes(value.toLowerCase());
      const nipMatch = customer.nip.includes(value);
      return labelMatch || nipMatch;
    });
    setFilteredCustomers(filtered);
  };

  const VirtualizedCustomerList = memo(function VirtualizedCustomerList({
    data,
    height,
    itemSize,
    width,
  }) {
    return (
      <List
        height={height}
        itemCount={data.length}
        itemSize={itemSize}
        width={width}
      >
        {({ index, style }) => (
          <CommandItem
            value={searchTerm}
            key={data[index].id}
            onSelect={() => {
              form.setValue("customer_id", data[index].value);
              form.setValue("nip", data[index].nip); // Add this line to set NIP
              setSelectedCustomer(data[index]);
              setIsCustomerDropdownOpen(false);
            }}
            style={style}
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                data[index].id === form.getValues("customer_id")
                  ? "opacity-100"
                  : "opacity-0"
              )}
            />
            {data[index].label + " - NIP : " + data[index].nip}
          </CommandItem>
        )}
      </List>
    );
  });

  const generateTempId = () =>
    `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleProductCreated = (newProduct) => {
    const productWithTempId = { ...newProduct, id: product_id };
    setTempProducts((prevTempProducts) => [
      ...prevTempProducts,
      productWithTempId,
    ]);
    setProduct_id(generateTempId());
  };

  const allProducts = [...initialProducts, ...tempProducts];

  useEffect(() => {
    setProduct_id(generateTempId());
  }, []);

  const resetForm = () => {
    form.reset({
      created_by: user?.id,
      personal_collect: false,
      is_paid: false,
      is_proforma: false,
      line_items: [],
    });
    setSelectedCustomer(undefined);
    setDate(new Date());
  };

  useEffect(() => {
    resetForm();
  }, []);

  const onSubmit = (values: z.infer<typeof OrderSchema> & { id?: string }) => {
    setIsLoading(true);

    //TODO rethink file upload
    let formData = new FormData();
    if (values.file) {
      formData.append("file", values.file);
    }

    const data = parseNumbersForSubmit(
      valuesToParseForSubmit,
      JSON.parse(JSON.stringify(values))
    );

    startTransition(() => {
      if (editMode) {
        updateOrder(data, formData)
          .then(() => {
            toast({
              title: "Sukces!",
              description: "Zamówienie zostało zaktualizowane",
              variant: ToastVariants.success,
            });
            setTempProducts([]);
            setOpen(false);
            setIsConfirmDialogOpen(false);
            resetForm();
          })
          .catch((error) => {
            toast({
              title: "Wystąpił błąd!",
              description: error.message,
              variant: ToastVariants.error,
            });
          })
          .finally(() => setIsLoading(false));
      } else if (copyMode) {
        createOrder(data, formData)
          .then(() => {
            toast({
              title: "Sukces!",
              description: "Nowe zamówienie zostało utworzone",
              variant: ToastVariants.success,
            });
            setTempProducts([]);
            setOpen(false);
            setIsConfirmDialogOpen(false);
            resetForm();
          })
          .catch((error) => {
            toast({
              title: "Wystąpił błąd!",
              description: error.message,
              variant: ToastVariants.error,
            });
          })
          .finally(() => setIsLoading(false));
      } else {
        createOrder(data, formData)
          .then(() => {
            toast({
              title: "Sukces!",
              description: "Nowe zamówienie zostało utworzone",
              variant: ToastVariants.success,
            });
            setTempProducts([]);
            setOpen(false);
            setIsConfirmDialogOpen(false);
            resetForm();
          })
          .catch((error) => {
            toast({
              title: "Wystąpił błąd!",
              description: error.message,
              variant: ToastVariants.error,
            });
          })
          .finally(() => setIsLoading(false));
      }
    });
  };

  type Status = {
    label: StatusType;
    value: string;
  };

  const statuses: Status[] = [
    { label: StatusType.Submitted, value: "submitted" },
    {
      label: StatusType.Awaiting_approval_by_bok,
      value: "awaiting_approval_by_bok",
    },
    { label: StatusType.Approved_by_bok, value: "approved_by_bok" },
    { label: StatusType.Awaiting_payment, value: "awaiting_payment" },
    { label: StatusType.Payment_approved, value: "payment_approved" },
    { label: StatusType.In_production, value: "in_production" },
    { label: StatusType.In_assembly, value: "in_assembly" },
    { label: StatusType.Ready_for_shipping, value: "ready_for_shipping" },
    { label: StatusType.Shipped, value: "shipped" },
    { label: StatusType.Delivered, value: "delivered" },
    { label: StatusType.Canceled, value: "canceled" },
    { label: StatusType.Returned, value: "returned" },
    { label: StatusType.Closed, value: "closed" },
    { label: StatusType.Awaiting_pickup, value: "awaiting_pickup" },
    { label: StatusType.Rejected_by_bok, value: "rejected_by_bok" },
    { label: StatusType.Under_verification, value: "under_verification" },
    {
      label: StatusType.Awaiting_raw_materials_availability,
      value: "awaiting_raw_materials_availability",
    },
  ];

  // Update NIP when customer is selected from dropdown
  const handleCustomerSelect = (customerId: string) => {
    const selectedCustomer = customerList.find(
      (customer) => customer.value === customerId
    );
    if (selectedCustomer) {
      form.setValue("customer_id", customerId);
      form.setValue("nip", selectedCustomer.nip);
      setSelectedCustomer(selectedCustomer);
      setIsCustomerDropdownOpen(false);
    }
  };

  const fetchVatStatus = async () => {
    const nip = form.getValues("nip");
    try {
      const data = await checkNIP(nip);
      setNipOpen(true);
      setNipStatus(data.subject.statusVat);

      // Find customer with matching NIP
      const matchingCustomer = customerList.find(
        (customer) => customer.nip === nip
      );
      if (matchingCustomer) {
        form.setValue("customer_id", matchingCustomer.value);
        setSelectedCustomer(matchingCustomer);
        setIsCustomerDropdownOpen(false);
      }
    } catch (err) {
      toast({
        title: "Error checking NIP",
        description: err?.message,
        variant: ToastVariants.error,
      });
      console.error("Error checking NIP:", err);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            setSelectedCustomer(undefined);
            setIsConfirmDialogOpen(true);
          } else {
            setOpen(true);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button className="w-25 h-10 font-normal" variant="zazaGrey">
            {editMode
              ? "Edytuj zamówienie"
              : copyMode
              ? "Kopiuj zamówienie"
              : "Utwórz nowe zamówienie"}
          </Button>
        </DialogTrigger>
        <DialogContent className="min-w-[95vw] h-[95vh] flex flex-col content-start overflow-y-auto">
          <DialogHeader className="flex justify-between bg-white rounded-2xl shadow-sm max-md:flex-wrap max-md:pr-5 max-h-[30%]">
            <div className="flex flex-col justify-center">
              <div className="flex gap-2 items-center text-black">
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/6940c2d742c79e36db9201da6abbfd61adfd7423d7f2812f27c9da290dda59cf?"
                  className="shrink-0 self-stretch my-auto aspect-square w-[20px]"
                />
                <div className="self-stretch text-xl md:text-2xl lg:text-3xl font-bold">
                  {editMode
                    ? "Edytuj zamówienie"
                    : copyMode
                    ? "Kopiuj zamówienie"
                    : "Nowe zamówienie"}
                </div>
                <div className="flex gap-1 self-stretch my-auto text-xs">
                  <div className="shrink-0 my-auto w-2 bg-amber-300 rounded-full h-[9px]" />
                  <div>Status </div>
                </div>
              </div>
              <div className="flex gap-1 mt-2 text-xs text-neutral-400">
                <div>
                  <Link href="/">Pulpit</Link>
                </div>
                <div>/</div>
                <div>
                  <Link href="/orders" onClick={() => setOpen(false)}>
                    Zamówienia
                  </Link>
                </div>
                <div>/</div>
                <div>
                  {editMode
                    ? `Edytuj zamówienie ${order?.id}`
                    : copyMode
                    ? "Kopiuj zamówienie"
                    : "Nowe zamówienie"}
                </div>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 flex flex-col w-full h-full justify-between"
            >
              <div className="flex flex-col content-between h-[700px] flex-grow overflow-y-auto">
                <Tabs defaultValue="account" className="w-full">
                  <TabsList>
                    <TabsTrigger value="customer">
                      Dane Klienta
                      <FormTabError fields={orderErrorNames.customer} />
                    </TabsTrigger>
                    {/* <TabsTrigger value="products">Produkty</TabsTrigger> */}
                    <TabsTrigger value="order">
                      Szczegóły zamówienia
                      <FormTabError fields={orderErrorNames.order} />
                    </TabsTrigger>
                    <TabsTrigger value="email">
                      Korespondencja z klientem
                      <FormTabError fields={orderErrorNames.email} />
                    </TabsTrigger>
                    <TabsTrigger value="documents">
                      Dokumenty
                      <FormTabError fields={orderErrorNames.documents} />
                    </TabsTrigger>
                    <TabsTrigger value="comments">
                      Uwagi
                      <FormTabError fields={orderErrorNames.comments} />
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="customer" className="w-full v-5">
                    <div className="flex flex-row mt-6 mb-10">
                      <div className="flex flex-col mr-10">
                        <div className="text-black text-[28px] font-medium">
                          NIP
                        </div>
                        <FormField
                          control={form.control}
                          name="nip"
                          render={({ field }) => (
                            <FormItem className="flex flex-col mb-10">
                              <FormControl>
                                <Input
                                  defaultValue={order?.customer?.nip}
                                  className="w-full"
                                  disabled={isPending}
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    // Clear customer selection if NIP is manually changed
                                    if (
                                      !customerList.some(
                                        (customer) =>
                                          customer.nip === e.target.value
                                      )
                                    ) {
                                      form.setValue("customer_id", undefined);
                                      setSelectedCustomer(undefined);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-row">
                          <Button
                            onClick={(e) => {
                              e.preventDefault(), fetchVatStatus();
                            }}
                            variant={"zazaGrey"}
                            className="w-max font-normal mr-4"
                          >
                            Sprawdź NIP i wybierz klienta
                          </Button>
                          <Button
                            disabled={true}
                            variant={"zazaGrey"}
                            className="w-max font-normal"
                          >
                            Historia NIP
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col w-5/12">
                        <div className="text-black text-[28px] font-medium">
                          Klient *
                        </div>
                        <FormField
                          control={form.control}
                          name="customer_id"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <Popover
                                open={isCustomerDropdownOpen}
                                onOpenChange={(open) => {
                                  setIsCustomerDropdownOpen(open);
                                  if (!open) {
                                    setFilteredCustomers(customerList);
                                    setSearchTerm("");
                                  }
                                }}
                              >
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
                                      {selectedCustomer
                                        ? selectedCustomer.label
                                        : field.value
                                        ? customerList.find(
                                            (customer) =>
                                              customer.value === field.value
                                          )?.label
                                        : "Wybierz klienta"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[50px]">
                                  <Command>
                                    <CommandInput
                                      placeholder="Znajdź klienta"
                                      onValueChange={handleSearch}
                                    />
                                    <CommandList className="overflow-scroll">
                                      <CommandEmpty>
                                        Nie znaleziono klientów
                                      </CommandEmpty>
                                      <CommandGroup>
                                        <VirtualizedCustomerList
                                          data={filteredCustomers}
                                          height={250}
                                          itemSize={30}
                                          width={"full"}
                                          onSelect={handleCustomerSelect}
                                        />
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
                          <CustomerForm
                            addByNip={true}
                            nip={form.getValues("nip")}
                            userId={user?.id}
                            salesmen={salesmen}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col mt-6">
                      <div className="flex flex-row w-96">
                        <div className="text-black text-[28px] font-medium mr-4">
                          Produkty
                        </div>
                        <ProductForm
                          oneTime={true}
                          onProductCreated={handleProductCreated}
                          id={product_id}
                        />
                      </div>
                      <ProductSelectionForm
                        name="line_items"
                        products={allProducts}
                        lineItems={order?.lineItems}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="order" className="p-5">
                    <div className="flex flex-row  mt-10 mb-5">
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Numer obcy*</Label>
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
                      {user?.role === "SALESMAN" ? (
                        <div className="grid w-full mr-5 items-center gap-1.5">
                          <Label>Status*</Label>
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormControl>
                                  <Input
                                    className="w-full"
                                    disabled={true}
                                    value="Oczekuje na zatwierdzenie przez BOK"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      ) : (
                        <SelectFormElement
                          name="status"
                          form={form}
                          label="Status*"
                          items={statuses}
                        />
                      )}
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row">
                      <div className="grid w-full items-center gap-1.5">
                        <Label>Zapłacono</Label>
                        <FormField
                          control={form.control}
                          name="is_paid"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
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
                            <FormItem className="flex flex-col">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full  items-center gap-1.5">
                        <Label>Odbiór osobisty</Label>
                        <FormField
                          control={form.control}
                          name="personal_collect"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <Switch
                                checked={field.value}
                                onCheckedChange={(value) => {
                                  field.onChange(value);
                                  if (!value) {
                                    form.setValue("change_warehouse", false);
                                  }
                                }}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full  items-center gap-1.5">
                        <Label>Zmiana magazynu odbioru</Label>
                        <FormField
                          control={form.control}
                          name="change_warehouse"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!isPersonalCollect}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Wybierz magazyn odbioru</Label>
                        <FormField
                          control={form.control}
                          name="warehouse_to_transport"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <Select
                                disabled={
                                  !form.watch("change_warehouse") ||
                                  !isPersonalCollect
                                }
                                onValueChange={(value) => {
                                  if (!isPersonalCollect) {
                                    field.onChange("");
                                  } else {
                                    field.onChange(value);
                                  }
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Wybierz" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="Galewice">
                                      Galewice
                                    </SelectItem>
                                    <SelectItem value="Sternalice">
                                      Sternalice
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row mt-5">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Data dostawy*</Label>
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
                                        new Date(
                                          field.value
                                        ).toLocaleDateString()
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
                        <Label>Data płatnosci*</Label>
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
                                        new Date(
                                          field.value
                                        ).toLocaleDateString()
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
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Data produkcji</Label>
                        <FormField
                          control={form.control}
                          name="production_date"
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
                                        new Date(
                                          field.value
                                        ).toLocaleDateString()
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
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPending}
                                  defaultValue={0}
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
                                        new Date(
                                          field.value
                                        ).toLocaleDateString()
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
                    <div className="text-xl mt-5">Dane do dostawy</div>
                    <div className="flex flex-row mt-5">
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Ulica</Label>
                        <FormField
                          control={form.control}
                          name="delivery_street"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPersonalCollect || isPending}
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
                          name="delivery_building"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPersonalCollect || isPending}
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
                          name="delivery_premises"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPersonalCollect || isPending}
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
                        <Label>Kod pocztowy</Label>
                        <FormField
                          control={form.control}
                          name="delivery_zipcode"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPersonalCollect || isPending}
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
                          name="delivery_city"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPersonalCollect || isPending}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid w-full mr-5 items-center gap-1.5">
                        <Label>Kontakt do dostawy</Label>
                        <FormField
                          control={form.control}
                          name="delivery_contact"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <Input
                                  className="w-full"
                                  disabled={isPersonalCollect || isPending}
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

                  <TabsContent value="email" className="p-5">
                    <div>
                      <h1>Korespondencja z klientem</h1>
                      <div className="grid w-full items-center gap-1.5">
                        <Label>Treść korespondencji</Label>
                        <FormField
                          control={form.control}
                          name="email_content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Wpisz treść emaila"
                                  className="min-h-[300px] min-w-[500px] w-full"
                                ></Textarea>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="p-5">
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

                  <TabsContent value="comments" className="p-5">
                    <div className="flex flex-row mt-10">
                      <CommentSection name="comments" />
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter className="max-h-fit mt-auto">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="zaza"
                    className="w-[186px] h-7 px-3 py-2 bg-white rounded-lg shadow justify-center items-center gap-2.5 inline-flex mt-2 "
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
      <Dialog open={nipOpen} onOpenChange={setNipOpen}>
        <DialogContent>
          <div>
            {nipStatus === "Czynny"
              ? "Klient jest czynnym płatnikiem VAT"
              : "Klient nie jest czynnym płatnikiem VAT"}
          </div>
          <DialogFooter>
            <Button onClick={() => setNipOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Spinner isLoading={isLoading} spinnerSize="lg" />
    </>
  );
};
