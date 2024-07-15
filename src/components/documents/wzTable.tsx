"use client";
import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  ExpandedState,
  getExpandedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { WzCheckPdf } from "./wznCheckPdf";

type LineItem = {
  id: string;
  product_name: string;
  quantity: string;
  unit_price: string;
};

type Order = {
  id: string;
  lineItems: LineItem[];
  customer: {};
};

type Wz = {
  id: string;
  doc_number: string | null;
  type: string;
  unit_type: string | null;
  status: string;
  created_by: string | null;
  created_at: Date;
  out_date: Date;
  order_id: string;
  driver: string | null;
  car: string | null;
  cargo_person: string | null;
  additional_info: string | null;
  User: {};
  Order: Order;
};

const LineItemsTable: React.FC<{ lineItems: LineItem[] }> = ({ lineItems }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nazwa produktu</TableHead>
          <TableHead>Ilość</TableHead>
          <TableHead>Ilość pomocnicza</TableHead>
          <TableHead>Cena netto</TableHead>
          <TableHead>Watość netto</TableHead>
          <TableHead>Cena brutto</TableHead>
          <TableHead>Wartość brutto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lineItems.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.product_name}</TableCell>
            <TableCell>
              {parseFloat(item.quantity).toFixed(4)} {item.quant_unit}
            </TableCell>
            <TableCell>
              {isNaN(parseFloat(item.helper_quantity))
                ? "NaN"
                : parseFloat(item.helper_quantity).toFixed(4)}
              {item.help_quant_unit}
            </TableCell>
            <TableCell>{parseFloat(item.netto_cost).toFixed(2)}</TableCell>
            <TableCell>
              {(item.quantity * parseFloat(item.netto_cost)).toFixed(2)}
            </TableCell>
            <TableCell>{item.brutto_cost}</TableCell>
            <TableCell>{item.quantity * item.brutto_cost}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const columns: ColumnDef<Wz>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => row.toggleExpanded()}
          style={{ cursor: "pointer" }}
        >
          {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
        </Button>
      );
    },
  },
  {
    accessorKey: "doc_number",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nr dokumentu
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("doc_number")}</div>,
  },
  {
    accessorKey: "type",
    header: "Typ",
    cell: ({ row }) => <div>{row.getValue("type")}</div>,
  },
  {
    accessorKey: "order.user_id",
    header: "Utworzone przez",
    cell: ({ row }) => (
      <div>
        {row.original.User.firstname} {row.original.User.lastname}
      </div>
    ),
    filterFn: (row, id, value) => {
      return (
        row.original.User.firstname?.toLowerCase() +
        " " +
        row.original.User.lastname?.toLowerCase()
      ).includes((value as string).toLowerCase());
    },
  },
  {
    accessorKey: "order_id",
    header: "Nr zamówienia",
    cell: ({ row }) => <div>{row.getValue("order_id")}</div>,
  },
  {
    accessorKey: "order.customer_id",
    header: "Klient",
    cell: ({ row }) => <div>{row.original.Order.customer.symbol}</div>,
    filterFn: (row, id, value) => {
      return row.original.Order.customer.symbol
        .toLowerCase()
        .includes((value as string).toLowerCase());
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <div>{row.getValue("status")}</div>,
  },
  {
    accessorKey: "out_date",
    header: "Data wydania",
    cell: ({ row }) => (
      <div>{(row.getValue("out_date") as Date).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "driver",
    header: "Kierowca",
    cell: ({ row }) => <div>{row.getValue("driver")}</div>,
  },
  {
    accessorKey: "car",
    header: "Samochód",
    cell: ({ row }) => <div>{row.getValue("car")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const wz = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <WzCheckPdf wzData={wz.Order} index={0} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

type WzTableProps = {
  wzs: Wz[];
};
export function WzTable({ wzs }: WzTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const table = useReactTable({
    data: wzs,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
    },
  });

  const names: { [key: string]: string } = {
    doc_number: "Nr dokumentu",
    type: "Typ",
    order_user_id: "Utworzone przez",
    order_id: "Nr zamówienia",
    order_customer_id: "Klient",
    status: "Status",
    out_date: "Data wydania",
    driver: "Kierowca",
    car: "Samochód",
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
              .filter((column) => column.id !== "expander")
              .map((column) => {
                return (
                  <div
                    key={column.id}
                    className="flex items-center space-x-2 mr-2 p-2 rounded-xl"
                  >
                    <Label>{names[column.id]}</Label>
                    <Switch
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
              .filter((column) => column.id !== "expander")
              .map((column) => {
                return (
                  <div key={column.id} className="flex flex-col">
                    <Label
                      htmlFor={`${column.id}-filter`}
                      className="text-sm mb-1"
                    >
                      {names[column.id]}
                    </Label>
                    <Input
                      id={`${column.id}-filter`}
                      value={(column.getFilterValue() as string) ?? ""}
                      onChange={(event) =>
                        column.setFilterValue(event.target.value)
                      }
                      className="max-w-sm"
                    />
                  </div>
                );
              })}
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={columns.length}>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-2">
                            Pozycje
                          </h3>
                          <LineItemsTable
                            lineItems={row.original.Order.lineItems}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
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
  );
}

export default WzTable;
