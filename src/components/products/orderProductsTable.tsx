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

import { Switch } from "../ui/switch";
import { formatNumber } from "@/lib/utils";

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

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const columns: ColumnDef<unknown, any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
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
    accessorKey: "product_id",
    header: "Nazwa pozycji",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("product_id")}</div>
    ),
  },

  {
    accessorKey: "quantity",
    id: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ilość
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("quantity")}</div>
    ),
  },
  {
    accessorKey: "is_help_quantity",
    header: "Przeliczenie objętości",
    cell: ({ row }) => <Switch checked={row.getValue("is_help_quantity")} />,
  },
  {
    accessorKey: "volume",
    header: "Objętość",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("volume")}</div>
    ),
  },
  {
    accessorKey: "brutto_cost",
    header: "Cena Brutto",
    cell: ({ row }) => (
      <div className="capitalize">
        {formatNumber(row.getValue("brutto_cost"), true)}
      </div>
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
              Skopiuj nazwę pozycji
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Zobacz szczegóły produktu</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

type OrdersTableProps = {
  orders: Order[];
};
export function OrderProductsTable({ orders }: OrdersTableProps) {
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
  const [order, setOrder] = useState({});

  const ordersTable = orders;

  const table = useReactTable({
    data: orders,
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

  return (
    <div className="max-h-[500px] overflow-scroll no-scrollbar mt-4">
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
                        setOrder(row.original);
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
