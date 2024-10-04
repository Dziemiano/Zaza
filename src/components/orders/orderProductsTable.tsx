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
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
  wz_type: "WZN" | "WZU" | "WZS";
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
  lineItems: any[];
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
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
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
    accessorKey: "ordinal_number",
    id: "ordinal_number",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Lp.
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("ordinal_number")}</div>,
  },
  {
    accessorKey: "product_name",
    header: "Nazwa pozycji",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("product_name")}</div>
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
      <div className="lowercase">
        {row.getValue("quantity")} {row.original.quant_unit}
      </div>
    ),
  },
  {
    accessorKey: "is_help_quantity",
    header: "Przeliczenie objętości",
    cell: ({ row }) => <Switch checked={row.getValue("is_help_quantity")} />,
  },
  {
    accessorKey: "helper_quantity",
    header: "Ilość pomocnicza",
    cell: ({ row }) => (
      <div className="capitalize">
        {formatNumber(row.getValue("helper_quantity"))} {row.original.help_quant_unit}
      </div>
    ),
  },
  {
    accessorKey: "netto_cost",
    header: "Cena Netto",
    cell: ({ row }) => {
      return (
        <div className="capitalize">
          {formatNumber(row.getValue("netto_cost"), true)}
        </div>
      );
    },
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
  {
    id: "wartosc_netto",
    header: "Wartość Netto",
    cell: ({ row }) => {
      const quantity = parseFloat(row.getValue("quantity"));
      const nettoCost = parseFloat(row.getValue("netto_cost"));
      const wartoscNetto = quantity * nettoCost;
      return (
        <div className="text-right">{formatNumber(wartoscNetto, true)}</div>
      );
    },
  },
  {
    id: "wartosc_brutto",
    header: "Wartość Brutto",
    cell: ({ row }) => {
      const quantity = parseFloat(row.getValue("quantity"));
      const bruttoCost = parseFloat(row.getValue("brutto_cost"));
      const wartoscBrutto = quantity * bruttoCost;
      return (
        <div className="text-right">{formatNumber(wartoscBrutto, true)}</div>
      );
    },
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
  const [sorting, setSorting] = useState<SortingState>([
    { id: "ordinal_number", desc: false },
  ]);
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
    data: orders ?? [],
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

  const {
    totalQuantity,
    totalCenaNetto,
    totalCenaBrutto,
    totalWartoscNetto,
    totalWartoscBrutto,
  } = useMemo(() => {
    return table.getRowModel().rows.reduce(
      (totals, row) => {
        const quantity = parseFloat(row.getValue("quantity") || "0");
        const cenaNetto = parseFloat(row.getValue("netto_cost") || "0");
        const cenaBrutto = parseFloat(row.getValue("brutto_cost") || "0");
        const wartoscNetto = quantity * cenaNetto;
        const wartoscBrutto = quantity * cenaBrutto;
        return {
          totalQuantity: totals.totalQuantity + quantity,
          totalCenaNetto: totals.totalCenaNetto + cenaNetto,
          totalCenaBrutto: totals.totalCenaBrutto + cenaBrutto,
          totalWartoscNetto: totals.totalWartoscNetto + wartoscNetto,
          totalWartoscBrutto: totals.totalWartoscBrutto + wartoscBrutto,
        };
      },
      {
        totalQuantity: 0,
        totalCenaNetto: 0,
        totalCenaBrutto: 0,
        totalWartoscNetto: 0,
        totalWartoscBrutto: 0,
      }
    );
  }, [table.getRowModel().rows]);

  return (
    <div className="relative">
      <div className="max-h-[500px] overflow-y-auto">
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
                  className={`${i % 2 === 0 ? "bg-white" : "bg-[#F2F2F2;]"}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
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
      <div className="sticky bottom-0 bg-white border-t border-gray-200">
        <Table>
          <TableFooter>
            <TableRow>
              <TableCell className="font-medium">Suma</TableCell>
              <TableCell></TableCell> {/* Lp. */}
              <TableCell></TableCell> {/* Nazwa pozycji */}
              <TableCell className="text-right">
                {totalQuantity.toFixed(2)} m3
              </TableCell>{" "}
              {/* Ilość */}
              <TableCell></TableCell> {/* Przeliczenie objętości */}
              <TableCell></TableCell> {/* Ilość pomocnicza */}
              <TableCell className="text-right"></TableCell> {/* Cena Netto */}
              <TableCell className="text-right"></TableCell> {/* Cena Brutto */}
              <TableCell className="text-right">
                Netto {formatNumber(totalWartoscNetto, true)}
              </TableCell>{" "}
              {/* Wartość Netto */}
              <TableCell className="text-right">
                Brutto {formatNumber(totalWartoscBrutto, true)}
              </TableCell>{" "}
              {/* Wartość Brutto */}
              <TableCell></TableCell> {/* Actions */}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
