"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/buttons/Button";

import { useEffect, useState } from "react";
import clsx from "clsx";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  getRowClassName?: (row: TData) => string;
  getCellClassName?: (row: TData, columnId: string) => string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  getRowClassName,
  getCellClassName,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    manualPagination: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;

  const nextPage = table.nextPage;
  const prevPage = table.previousPage;
  const getTotalPrevPage = table.getCanPreviousPage;
  const getTotalNextPage = table.getCanNextPage;

  const getPageRange = () => {
    const totalPages = pageCount;
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(currentPage - half, 0);
    const end = Math.min(start + maxVisible, totalPages);

    if (end - start < maxVisible) {
      start = Math.max(end - maxVisible, 0);
    }

    return Array.from({ length: end - start }, (_, i) => start + i);
  };

  useEffect(() => {
    let throttle = false;
    const delay = 150;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (throttle) return;
      throttle = true;
      setTimeout(() => (throttle = false), delay);

      if (event.key === "ArrowLeft" && getTotalPrevPage()) {
        prevPage();
      } else if (event.key === "ArrowRight" && getTotalNextPage()) {
        nextPage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [nextPage, prevPage, getTotalPrevPage, getTotalNextPage]);

  return (
    <>
      <div>
        <Table className="table-fixed w-full">
          <TableHeader className="bg-white hover:bg-grisulado-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={clsx(
                        "py-4 text-azul-marino-800 font-bold",
                        header.column.columnDef.id === "acciones" &&
                          "sticky right-0 bg-white z-10"
                      )}
                      style={{ width: `${header.getSize()}px` }}>
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
              table.getRowModel().rows.map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={clsx(getRowClassName?.(row.original))}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell
                          key={cell.id}
                          className={clsx(
                            getCellClassName?.(row.original, cell.column.id)
                          )}>
                          <span className={clsx("line-clamp-2")}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </span>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-2xl">
                  No se han encontrado resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <section aria-label="Paginación de la tabla">
          <div className="flex items-center justify-between md:px-6 my-4">
            <div className="flex items-center space-x-2">
              <p
                className={`text-sm font-medium ${
                  pageCount <= 0 ? "text-gray-300" : ""
                }`}>
                Filas por página
              </p>
              <Select
                disabled={pageCount <= 0}
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}>
                <SelectTrigger className="w-[70px] py-1">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="bottom">
                  {[5, 10, 15, 20].map((pageSize) => (
                    <SelectItem
                      key={`${pageSize}-paginas`}
                      value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className={`${
                pageCount <= 0 ? "text-slate-300" : ""
              } flex items-center md:justify-center text-xs 2xl:text-sm font-medium`}>
              Pagina{" "}
              {pageCount > 0 ? table.getState().pagination.pageIndex + 1 : 0} de{" "}
              {table.getPageCount()}
            </div>
          </div>
          <div className="flex items-center justify-center space-x-2 py-4">
            <Button
              color="secondary"
              variant="outline"
              className="text-sm md:text-base"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}>
              {"<<"}
            </Button>
            <Button
              aria-label="Página anterior"
              color="secondary"
              variant="outline"
              className="text-sm md:text-base"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}>
              Anterior
            </Button>
            {getPageRange().map((pageIndex) => (
              <Button
                key={pageIndex}
                className="hidden md:inline-block"
                variant={pageIndex === currentPage ? "solid" : "outline"}
                color={"secondary"}
                onClick={() => table.setPageIndex(pageIndex)}>
                {pageIndex + 1}
              </Button>
            ))}
            <Button
              aria-label="Página siguiente"
              color="secondary"
              variant="outline"
              className="text-sm md:text-base"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>
              Siguiente
            </Button>
            <Button
              color="secondary"
              variant="outline"
              className="text-sm md:text-base"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}>
              {">>"}
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
