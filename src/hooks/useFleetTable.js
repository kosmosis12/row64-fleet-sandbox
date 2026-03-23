import { useMemo } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { statusColor } from "../data/fleet";

const col = createColumnHelper();

export function useFleetTable(data, sorting, setSorting, globalFilter) {
  const columns = useMemo(
    () => [
      col.accessor("id", {
        header: "Truck ID",
        size: 90,
        cell: (info) => info.getValue(),
      }),
      col.accessor("driver", {
        header: "Driver",
        size: 130,
      }),
      col.accessor("route", {
        header: "Route",
        size: 110,
      }),
      col.accessor("status", {
        header: "Status",
        size: 90,
        cell: (info) => {
          const v = info.getValue();
          return `${v === "Delayed" ? "⚠ " : ""}${v}`;
        },
      }),
      col.accessor("displaySpeed", {
        header: "Speed",
        size: 70,
        cell: (info) => `${info.getValue().toFixed(0)} mph`,
      }),
      col.accessor("fuel", {
        header: "Fuel",
        size: 60,
        cell: (info) => `${info.getValue().toFixed(0)}%`,
      }),
      col.accessor("cargo", {
        header: "Cargo",
        size: 100,
      }),
      col.accessor("hosRemaining", {
        header: "HOS",
        size: 60,
        cell: (info) => `${info.getValue()}h`,
      }),
      col.accessor("milesNextService", {
        header: "Next Svc",
        size: 75,
        cell: (info) => `${info.getValue()} mi`,
      }),
      col.accessor("hasIncident", {
        header: "Alert",
        size: 50,
        cell: (info) => (info.getValue() ? "🔴" : "✓"),
      }),
    ],
    []
  );

  return useReactTable({
    data: data ?? [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
}
