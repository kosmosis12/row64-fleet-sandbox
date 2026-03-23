import { useState, useRef, useMemo } from "react";
import { flexRender } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useFleetTable } from "../hooks/useFleetTable";
import { statusColor } from "../data/fleet";

export default function FleetTableTab({ fleet }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const scrollRef = useRef(null);
  const table = useFleetTable(fleet, sorting, setSorting, globalFilter);
  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 34,
    overscan: 10,
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#fff",
        borderRadius: 4,
        border: "2px dashed #0078D4",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          height: 36,
          background: "#f8f9fc",
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          gap: 8,
          borderBottom: "1px solid #e8eaef",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            background: "#0078D4",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: 3,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.06em",
          }}
        >
          FLEET TABLE
        </div>
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Filter trucks, drivers, routes..."
          style={{
            padding: "4px 10px",
            fontSize: 11,
            border: "1px solid #ddd",
            borderRadius: 4,
            width: 240,
            background: "#fff",
          }}
        />
        <div
          style={{
            fontSize: 9,
            color: "#888",
            fontFamily: "monospace",
            marginLeft: "auto",
          }}
        >
          {rows.length} rows · click headers to sort · TanStack Table + Virtual
        </div>
      </div>
      {/* Virtualized Table */}
      <div ref={scrollRef} style={{ flex: 1, overflow: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            tableLayout: "fixed",
          }}
        >
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    style={{
                      width: h.getSize(),
                      background: "#f0f2f8",
                      border: "1px solid #e0e0e8",
                      padding: "6px 8px",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#555",
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      cursor: "pointer",
                      userSelect: "none",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{ asc: " ▲", desc: " ▼" }[h.column.getIsSorted()] ?? ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {virtualizer.getVirtualItems().length > 0 && (
              <tr>
                <td
                  style={{
                    height: virtualizer.getVirtualItems()[0]?.start ?? 0,
                    padding: 0,
                    border: "none",
                  }}
                  colSpan={table.getAllColumns().length}
                />
              </tr>
            )}
            {virtualizer.getVirtualItems().map((vRow) => {
              const row = rows[vRow.index];
              return (
                <tr
                  key={row.id}
                  style={{
                    background:
                      row.original.hasIncident
                        ? "#fef2f2"
                        : vRow.index % 2 === 0
                        ? "#fff"
                        : "#fafbfc",
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        border: "1px solid #e8eaef",
                        padding: "5px 8px",
                        fontSize: 11,
                        fontFamily:
                          cell.column.id === "id" ||
                          cell.column.id === "displaySpeed" ||
                          cell.column.id === "fuel" ||
                          cell.column.id === "hosRemaining" ||
                          cell.column.id === "milesNextService"
                            ? "'JetBrains Mono',Consolas,monospace"
                            : "'Segoe UI',sans-serif",
                        color:
                          cell.column.id === "status"
                            ? statusColor(row.original.status)
                            : "#333",
                        fontWeight:
                          cell.column.id === "status" ||
                          cell.column.id === "id"
                            ? 700
                            : 400,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            {virtualizer.getVirtualItems().length > 0 && (
              <tr>
                <td
                  style={{
                    height:
                      virtualizer.getTotalSize() -
                      (virtualizer.getVirtualItems().at(-1)?.end ?? 0),
                    padding: 0,
                    border: "none",
                  }}
                  colSpan={table.getAllColumns().length}
                />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
