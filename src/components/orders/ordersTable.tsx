"use client";

import * as React from "react";

import { useState, useMemo } from "react";
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

import { OrderView } from "./orderView";
import { MultiSelectDropdown } from "../ui/multiselect";
import { Status } from "@/types/orders.types";

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
  wz: any[];
};

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

const booleanToYesNo = (value: boolean): string => {
  return value ? "Tak" : "Nie";
};

const formatDate = (dateString: string | null): string => {
  return dateString ? new Date(dateString).toLocaleDateString("pl-PL") : "-";
};

const sumQuantity = (lineItems: []): number => {
  return Number(
    lineItems
      .reduce((prev, current) => prev + Number(current.quantity), 0)
      .toFixed(4)
  );
};

const columnsFilterSelects: {
  [key: string]: { name: string; value: string }[];
} = {
  wz: [
    { name: "Tak", value: "Tak" },
    { name: "Nie", value: "Nie" },
  ],
  status: Object.values(Status).map((item) => {
    return {
      name: item,
      value: item,
    };
  }),
};

export const columns: ColumnDef<unknown, any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex flex-row">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
        <span className="font-small ml-1  min-w-5">
          {table.getSelectedRowModel().rows.length
            ? "(" + table.getSelectedRowModel().rows.length + ")"
            : ""}
        </span>
      </div>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    id: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Numer zamówienia
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
  },

  {
    accessorKey: "customer",
    id: "customer",
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
      <div className="normal-case">
        {(row.getValue("customer") as { name: string }).name}
      </div>
    ),
    filterFn: (row, id, value) => {
      return (row.getValue(id) as { name: string }).name
        .toLowerCase()
        .includes((value as string).toLowerCase());
    },
  },
  {
    accessorKey: "nip",
    header: "NIP",
    cell: ({ row }) => (
      <div>{(row.getValue("customer") as { nip: string }).nip}</div>
    ),
    filterFn: (row, id, value) => {
      return (row.getValue("customer") as { nip: string }).nip
        .toLowerCase()
        .includes((value as string).toLowerCase());
    },
  },
  {
    accessorKey: "foreign_id",
    header: "Numer obcy",
    cell: ({ row }) => <div>{row.getValue("foreign_id")}</div>,
  },
  {
    accessorKey: "salesman",
    header: "Handlowiec",
    cell: ({ row }) => (
      <div>{(row.getValue("customer") as { salesman: string }).salesman}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <div>{row.getValue("status")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id) as string);
    },
  },
  {
    accessorKey: "created_at",
    header: "Data utworzenia",
    cell: ({ row }) => <div>{formatDate(row.getValue("created_at"))}</div>,
  },
  {
    accessorKey: "is_proforma",
    header: "Proforma",
    cell: ({ row }) => (
      <div className="capitalize">
        {booleanToYesNo(row.getValue("is_proforma"))}
      </div>
    ),
    filterFn: (row, id, value) => {
      const isProforma = row.getValue(id) as boolean;
      const filterValue = value.toLowerCase();
      if (filterValue === "tak") return isProforma;
      if (filterValue === "nie") return !isProforma;
      return true;
    },
  },
  {
    accessorKey: "is_paid",
    header: "Zapłacono",
    cell: ({ row }) => (
      <div className="capitalize">
        {booleanToYesNo(row.getValue("is_paid"))}
      </div>
    ),
  },
  {
    accessorKey: "proforma_payment_date",
    header: "Data płatności proformy",
    cell: ({ row }) => (
      <div>{formatDate(row.getValue("proforma_payment_date"))}</div>
    ),
  },
  {
    accessorKey: "payment_deadline",
    header: "Termin płatności",
    cell: ({ row }) => (
      <div>{formatDate(row.getValue("payment_deadline"))}</div>
    ),
  },
  {
    accessorKey: "personal_collect",
    header: "Odbiór osobisty",
    cell: ({ row }) => (
      <div className="capitalize">
        {booleanToYesNo(row.getValue("personal_collect"))}
      </div>
    ),
  },
  {
    accessorKey: "delivery_date",
    header: "Data dostawy",
    cell: ({ row }) => <div>{formatDate(row.getValue("delivery_date"))}</div>,
  },
  {
    accessorKey: "production_date",
    header: "Data produkcji",
    cell: ({ row }) => <div>{formatDate(row.getValue("production_date"))}</div>,
  },
  {
    accessorKey: "wz_type",
    header: "Typ WZ",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("wz_type")}</div>
    ),
  },
  {
    accessorKey: "wz",
    header: "Wystawiono WZ",
    cell: ({ row }) => (
      <div className="capitalize">
        {(row.getValue("wz") as [])?.length > 0 ? "Tak" : "Nie"}
      </div>
    ),
    filterFn: (row, id, value) => {
      const wzArr = row.getValue(id) as [];
      if (value.length === 1) {
        if (value[0] === "Tak") return wzArr.length > 0;
        if (value[0] === "Nie") return wzArr.length <= 0;
      }
      return true;
    },
  },
  {
    accessorKey: "lineItems",
    header: "Ilość m3",
    cell: ({ row }) => <div>{sumQuantity(row.getValue("lineItems"))}</div>,
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
      const order: any = row.original;

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
              onClick={() => navigator.clipboard.writeText(order.id)}
            >
              Skopiuj nr zamówienia
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Zobacz szczegóły klienta</DropdownMenuItem>
            <DropdownMenuItem>Zobacz szczgóły zamówienia</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

type OrdersTableProps = {
  customers: any[];
  orders: Order[];
  products: any[];
};
export function OrdersTable({ customers, orders, products }: OrdersTableProps) {
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
  const [selectedOrder, setSelectedOrder] = useState<any>({});

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      if (a.status === "Oczekuje na zatwierdzenie przez BOK") return -1;
      if (b.status === "Oczekuje na zatwierdzenie przez BOK") return 1;
      return 0;
    });
  }, [orders]);

  const table = useReactTable({
    data: sortedOrders,
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
    id: "Numer zamówienia",
    status: "Status",
    foreign_id: "Numer obcy",
    is_proforma: "Proforma",
    is_paid: "Zapłacone",
    created_by: "Utwórzono przez",
    delivery_date: "Data dostawy",
    payment_deadline: "Data płatnosci",
    personal_collect: "Odbiór osobisty",
    proforma_payment_date: "Data płatnosci proforma",
    production_date: "Data produkcji",
    created_at: "Data utworzenia",
    total: "Suma",
    payment_date: "Data płatnosci",
    payment_type: "Typ płatnosci",
    payment_status: "Status płatnosci",
    payment_method: "Metoda płatnosci",
    wz_type: "Typ WZ",
    wz: "Wystawiono WZ",
    salesman: "Handlowiec",
    nip: "NIP",
    customer: "Klient",
    lineItems: "Ilość m3",
  };

  const tableRowsCount = table.getRowModel().rows.length;

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Collapsible className="w-full">
          <div className="w-full flex flex-row flex-wrap rounded-lg shadow shadow-black/30 p-2">
            <CollapsibleTrigger className="flex flex-row">
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
          <CollapsibleContent className="w-full flex flex-wrap p-4 justify-between">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <div key={column.id} className="flex flex-col mb-4 mr-4">
                    <Label
                      key={column.id}
                      htmlFor="id-filter"
                      className="text-sm mb-1"
                    >
                      {names[column.id]}
                    </Label>
                    {columnsFilterSelects[column.id] ? (
                      <MultiSelectDropdown
                        options={columnsFilterSelects[column.id]}
                        values={column.getFilterValue() as []}
                        onChange={(value) => {
                          let updatedValues = [
                            ...((column?.getFilterValue() as string[]) || []),
                          ];
                          if (updatedValues.includes(value)) {
                            updatedValues = updatedValues.filter(
                              (v) => v !== value
                            );
                          } else {
                            updatedValues.push(value);
                          }
                          column.setFilterValue(updatedValues);
                        }}
                      />
                    ) : (
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
                    )}
                  </div>
                );
              })}
          </CollapsibleContent>
        </Collapsible>
      </div>
      <span className="font-small ml-1">
        {tableRowsCount}{" "}
        {tableRowsCount === 1
          ? "wynik"
          : tableRowsCount <= 4
          ? "wyniki"
          : "wyników"}
      </span>
      <div className="max-h-[550px] overflow-auto">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-auto border rounded-lg max-h-[500px]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
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
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, i) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={`
                      ${i % 2 === 0 ? "bg-white" : "bg-[#F2F2F2]"}
                      ${
                        row.original.status ===
                        "Oczekuje na zatwierdzenie przez BOK"
                          ? "bg-red-200"
                          : ""
                      }
                    `}
                    >
                      {row.getVisibleCells().map((cell) => {
                        if (
                          cell.column.id === "select" ||
                          cell.column.id === "actions"
                        ) {
                          return (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        } else {
                          return (
                            <TableCell
                              key={cell.id}
                              className="cursor-pointer hover:bg-gray-100"
                              onClick={() => openOrderDetails(row.original)}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        }
                      })}
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
        </div>
      </div>
      <OrderView
        products={products}
        customers={customers}
        order={selectedOrder}
        isOpen={open}
        setIsOpen={setOpen}
      />
    </div>
  );
}
