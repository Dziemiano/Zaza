"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpDown } from "lucide-react";
import { fetchLogs } from "@/data/logs";

interface Log {
  id: string;
  user_id: string;
  user: {};
  entity: string;
  entity_id: string;
  eventType: string;
  changedData?: string;
  createdAt: Date;
}

interface LogTableProps {
  entity?: string;
  entity_id?: string;
}

export default function LogTable({ entity, entity_id }: LogTableProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const fetchedLogs = await fetchLogs(entity, entity_id);
        setLogs(fetchedLogs.logs);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [entity, entity_id]);

  const columns = useMemo<ColumnDef<Log>[]>(
    () => [
      {
        accessorKey: "user.firstname",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Uzytkownik
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      ...(!entity_id
        ? [
            {
              accessorKey: "entity",
              header: ({ column }) => {
                return (
                  <Button
                    variant="ghost"
                    onClick={() =>
                      column.toggleSorting(column.getIsSorted() === "asc")
                    }
                  >
                    Entity
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                );
              },
            },
            {
              accessorKey: "entity_name",
              header: "Nazwa/Numer",
            },
          ]
        : []),
      {
        accessorKey: "eventType",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Wydarzenie
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      {
        accessorKey: "changedData",
        header: "Zmiany",
        cell: ({ row }) =>
          row.original.changedData ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Zobacz zmiany
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Zmiany</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[300px] mt-4">
                  <pre className="text-sm">
                    {JSON.stringify(
                      JSON.parse(row.original.changedData),
                      null,
                      2
                    )}
                  </pre>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          ) : null,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Data zmian
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleString("pl-PL"),
      },
    ],
    [entity_id]
  );

  const table = useReactTable({
    data: logs,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  const names: { [key: string]: string } = {
    user: "Użytkownik",
    eventType: "Wydarzenie",
    changedData: "Dane zmienione",
    createdAt: "Data zmian",
    entity: "Element",
    entity_id: "Nazwa/Numer",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-row space-y-2">
        {table.getAllColumns().map((column) => {
          const columnFilterValue = column.getFilterValue();
          if (column.id === "changedData") return null;
          return (
            <div
              key={column.id}
              className="flex flex-col items-center space-x-2 m-2"
            >
              <label
                htmlFor={`filter-${column.id}`}
                className="w-24 text-right"
              >
                {names[column.id]}
              </label>
              <Input
                id={`filter-${column.id}`}
                type="text"
                value={(columnFilterValue ?? "") as string}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="max-w-sm"
              />
            </div>
          );
        })}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-white">
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
    </div>
  );
}
