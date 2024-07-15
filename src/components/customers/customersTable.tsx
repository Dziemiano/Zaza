"use client";

import * as React from "react";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

import { CustomerView } from "./customerView";

// TODO: drag and drop colums
// import {
//   DndContext,
//   KeyboardSensor,
//   MouseSensor,
//   TouchSensor,
//   closestCenter,
//   type DragEndEvent,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
// import {
//   arrayMove,
//   SortableContext,
//   horizontalListSortingStrategy,
// } from "@dnd-kit/sortable";

// // needed for row & cell level scope DnD setup
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

export type Order = {
  id: string;
  foreign_id: string;
  customer_id: string;
  status: string; // TODO: enum for statuses
  is_proforma: boolean;
  proforma_payment_date: Date;
  wz_type: "WZN" | "WZD" | "WZS";
  personal_collect: boolean;
  delivey_date: Date;
  production_date: Date;
  payment_deadline: Date;
  delivery_place_id: string;
  delivery_city: string;
  delivery_street: string;
  delivery_building: string;
  delivery_zipcode: string;
  delivery_contact_number: string;
  delivery_date: Date;
  deliver_time: Date;
  transport_cost: number;
  order_history: string;
  created_at: Date;
  created_by: string;
  is_paid: boolean;
  customer: {};
};

export type Customer = {
  id: String;
  nip: String;
  symbol: String;
  name: String;
  primary_email: String;
  documents_email: String;
  phone_number: String;
  street: String;
  building: String;
  city: String;
  postal_code: String;
  country: String;
  payment_type: "PREPAID" | "WIRE" | "CASH";
  customer_type: String;
  payment_punctuality: String;
  comments: String[];
  salesman_id: String;
  salesmen: {};
  branch: String[];
  credit_limit: String;
  max_discount: String;
  send_email_invoice: Boolean;
  invoice_street: String;
  invoice_building: String;
  invoice_city: String;
  invoice_postal_code: String;
  invoice_country: String;
  created_at: Date;
  created_by: String;
  created_by_id: String;
  Orders: Order[];
};

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

const PaymentType = {
  PREPAID: "Przedpłata",
  WIRE: "Przelew",
  CASH: "Gotówka",
};

const booleanToYesNo = (value: boolean): string => {
  return value ? "Tak" : "Nie";
};

export const columns: ColumnDef<unknown, any>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "symbol",
    id: "symbol",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Klient
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("symbol")}</div>
    ),
  },
  {
    accessorKey: "nip",
    header: "NIP",
    cell: ({ row }) => <div className="capitalize">{row.getValue("nip")}</div>,
  },

  {
    accessorKey: "primary_email",
    header: "Email",
    cell: ({ row }) => <div>{row.getValue("primary_email")}</div>,
  },
  {
    accessorKey: "phone_number",
    header: "Numer telefonu",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("phone_number")}</div>
    ),
  },

  {
    accessorKey: "payment_type",
    header: "Rodzaj płatnosci",
    cell: ({ row }) => (
      <div className="capitalize">
        {PaymentType[row.getValue("payment_type")]}
      </div>
    ),
  },
  {
    accessorKey: "credit_limit",
    header: "Limit kredytowy",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("credit_limit")}</div>
    ),
  },
  {
    accessorKey: "max_discount",
    header: "Maksymalny rabat",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("max_discount")}</div>
    ),
  },
  {
    accessorKey: "salesman",
    header: "Handlowiec",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("salesman")?.firstname}{" "}
        {row.getValue("salesman")?.lastname}
      </div>
    ),
  },
  {
    accessorKey: "send_email_invoice",
    header: "Dokumenty na email",
    cell: ({ row }) => (
      <div className="capitalize">
        {booleanToYesNo(row.getValue("send_email_invoice"))}
      </div>
    ),
  },
  {
    accessorKey: "street",
    header: "Adres",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("street")}</div>
    ),
  },
  // {
  //   accessorKey: "amount",
  //   header: () => <div className="text-right">Amount</div>,
  //   cell: ({ row }) => {
  //     const amount = parseFloat(row.getValue("amount"));

  //     // Format the amount as a dollar amount
  //     const formatted = new Intl.NumberFormat("en-US", {
  //       style: "currency",
  //       currency: "USD",
  //     }).format(amount);

  //     return <div className="text-right font-medium">{formatted}</div>;
  //   },
  // },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const customer: any = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(customer.id)}
            >
              Skopiuj nr klienta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Zobacz szczegóły klienta</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

type CustomersTableProps = {
  customers: Customer[];
  salesmen: any[];
};
export function CustomersTable({ customers, salesmen }: CustomersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [columnOrder, setColumnOrder] = useState<string[]>([
    "columnId1",
    "columnId2",
    "columnId3",
  ]); //optionally initialize the column order

  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState({});

  const table = useReactTable({
    data: customers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),

    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnOrderChange: setColumnOrder,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnOrder,
    },
  });
  const names: { [key: string]: string } = {
    symbol: "Symbol",
    nip: "NIP",
    primary_email: "Email",
    phone_number: "Numer telefonu",
    payment_type: "Rodzaj płatnosci",
    street: "Adres",
    payment_status: "Status płatnosci",
    wz_type: "Typ WZ",
    customer: "Klient",
    salesman: "Handlowiec",
    credit_limit: "Limit kredytowy",
    max_discount: "Maksymalny rabat",
    send_email_invoice: "Dokumenty na email",
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Collapsible className="w-full">
          <div className="w-full flex flex-row rounded-lg shadow shadow-black/30 p-2">
            <CollapsibleTrigger className="flex flex-row w-full">
              <div className="w-8 h-8 mt-1 mr-3">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 4.6C2 4.03995 2 3.75992 2.10899 3.54601C2.20487 3.35785 2.35785 3.20487 2.54601 3.10899C2.75992 3 3.03995 3 3.6 3H20.4C20.9601 3 21.2401 3 21.454 3.10899C21.6422 3.20487 21.7951 3.35785 21.891 3.54601C22 3.75992 22 4.03995 22 4.6V5.26939C22 5.53819 22 5.67259 21.9672 5.79756C21.938 5.90831 21.8901 6.01323 21.8255 6.10776C21.7526 6.21443 21.651 6.30245 21.4479 6.4785L15.0521 12.0215C14.849 12.1975 14.7474 12.2856 14.6745 12.3922C14.6099 12.4868 14.562 12.5917 14.5328 12.7024C14.5 12.8274 14.5 12.9618 14.5 13.2306V18.4584C14.5 18.6539 14.5 18.7517 14.4685 18.8363C14.4406 18.911 14.3953 18.9779 14.3363 19.0315C14.2695 19.0922 14.1787 19.1285 13.9971 19.2012L10.5971 20.5612C10.2296 20.7082 10.0458 20.7817 9.89827 20.751C9.76927 20.7242 9.65605 20.6476 9.58325 20.5377C9.5 20.4122 9.5 20.2142 9.5 19.8184V13.2306C9.5 12.9618 9.5 12.8274 9.46715 12.7024C9.43805 12.5917 9.39014 12.4868 9.32551 12.3922C9.25258 12.2856 9.15102 12.1975 8.94789 12.0215L2.55211 6.4785C2.34898 6.30245 2.24742 6.21443 2.17449 6.10776C2.10986 6.01323 2.06195 5.90831 2.03285 5.79756C2 5.67259 2 5.53819 2 5.26939V4.6Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-xl mt-2">Filtry</div>
              <ChevronDown className="h-8 w-8 mt-1 ml-3 mr-2" />
              <Separator orientation="vertical" />
            </CollapsibleTrigger>

            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <div
                    key={column.id}
                    className="flex items-center space-x-2 mr-2 p-2 rounded-xl"
                  >
                    <Label key={column.id}>{names[column.id]} </Label>
                    <Switch
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    />
                  </div>
                );
              })}
          </div>
          <CollapsibleContent className="w-full flex p-4 justify-between">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <div key={column.id} className="flex flex-col">
                    <Label
                      key={column.id}
                      htmlFor="id-filter"
                      className="text-sm mb-1"
                    >
                      {names[column.id]}
                    </Label>

                    <Input
                      key={column.id}
                      value={
                        (table
                          .getColumn(column.id)
                          ?.getFilterValue() as string) ?? ""
                      }
                      onChange={(event) =>
                        table
                          .getColumn(column.id)
                          ?.setFilterValue(event.target.value)
                      }
                      className="max-w-sm"
                    />
                  </div>
                );
              })}
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="max-h-[500px] overflow-scroll no-scrollbar">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="bg-[#CCC] text-black sticky top-0 z-10"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  // className="hover:bg-gray-200"
                  className={`${i % 2 === 0 ? "bg-white" : "bg-[#F2F2F2;]"}`}
                >
                  {row.getVisibleCells().map((cell) =>
                    cell.id === "select" ? (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ) : (
                      <TableCell
                        key={cell.id}
                        onClick={() => {
                          setCustomer(row.original);
                          setOpen(true);
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <CustomerView
        customer={customer}
        salesmen={salesmen}
        isOpen={open}
        setIsOpen={setOpen}
      />
    </div>
  );
}
