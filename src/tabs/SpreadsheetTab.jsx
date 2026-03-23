import { useState, useCallback, useRef, useMemo } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

const TOTAL_ROWS = 500;
const COLS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
const colHelper = createColumnHelper();

export default function SpreadsheetTab() {
  const [data, setData] = useState(() =>
    Array.from({ length: TOTAL_ROWS }, (_, i) => {
      const row = { _rowNum: i + 1 };
      COLS.forEach((c) => (row[c] = ""));
      return row;
    })
  );
  const [activeCell, setActiveCell] = useState(null);
  const scrollRef = useRef(null);

  const updateCell = useCallback((rowIdx, colId, value) => {
    setData((prev) => {
      const next = [...prev];
      next[rowIdx] = { ...next[rowIdx], [colId]: value };
      return next;
    });
  }, []);

  const columns = useMemo(
    () => [
      colHelper.display({
        id: "_rowNum",
        header: "",
        size: 44,
        cell: (info) => (
          <div
            style={{
              fontSize: 10,
              color: "#888",
              textAlign: "center",
              fontWeight: 500,
              background: info.row.index % 2 === 0 ? "#fafbfc" : "#f0f2f8",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {info.row.index + 1}
          </div>
        ),
      }),
      ...COLS.map((c) =>
        colHelper.accessor(c, {
          header: c,
          size: 100,
          cell: (info) => {
            const key = `${info.row.index}-${c}`;
            const isActive = activeCell === key;
            return (
              <input
                value={info.getValue() || ""}
                onChange={(e) =>
                  updateCell(info.row.index, c, e.target.value)
                }
                onFocus={() => setActiveCell(key)}
                onBlur={() => setActiveCell(null)}
                style={{
                  width: "100%",
                  height: 28,
                  border: "none",
                  outline: isActive ? "2px solid #0078D4" : "none",
                  outlineOffset: -2,
                  padding: "2px 6px",
                  fontSize: 11,
                  fontFamily: "'Segoe UI',sans-serif",
                  background: isActive
                    ? "#e8f0fe"
                    : info.row.index % 2 === 0
                    ? "#fafbfc"
                    : "#fff",
                  boxSizing: "border-box",
                }}
              />
            );
          },
        })
      ),
    ],
    [activeCell, updateCell]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 30,
    overscan: 15,
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
          gap: 4,
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
            marginRight: 8,
          }}
        >
          SPREADSHEET
        </div>
        <div
          style={{
            fontSize: 9,
            color: "#888",
            fontFamily: "monospace",
            marginLeft: "auto",
          }}
        >
          {TOTAL_ROWS} rows × {COLS.length} cols · TanStack Virtual
        </div>
      </div>
      {/* Virtualized Grid */}
      <div ref={scrollRef} style={{ flex: 1, overflow: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr>
              {table.getHeaderGroups().map((hg) =>
                hg.headers.map((h) => (
                  <th
                    key={h.id}
                    style={{
                      width: h.getSize(),
                      background: "#f0f2f8",
                      border: "1px solid #e0e0e8",
                      padding: "4px",
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#555",
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                    }}
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {/* Spacer before visible rows */}
            {virtualizer.getVirtualItems().length > 0 && (
              <tr>
                <td
                  style={{
                    height: virtualizer.getVirtualItems()[0]?.start ?? 0,
                    padding: 0,
                    border: "none",
                  }}
                  colSpan={columns.length}
                />
              </tr>
            )}
            {virtualizer.getVirtualItems().map((vRow) => {
              const row = rows[vRow.index];
              return (
                <tr key={row.id} data-index={vRow.index}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        border: "1px solid #e0e0e8",
                        padding: 0,
                        width: cell.column.getSize(),
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
            {/* Spacer after visible rows */}
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
                  colSpan={columns.length}
                />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Bottom tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 8px",
          borderTop: "1px solid #e8eaef",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            background: "#f0f2f8",
            border: "1px solid #dde",
            borderRadius: 3,
            padding: "3px 8px",
            fontSize: 10,
            color: "#666",
          }}
        >
          Dash1
        </div>
        <div
          style={{
            background: "#d0e4f8",
            border: "1px solid #aac8e8",
            borderRadius: 3,
            padding: "3px 8px",
            fontSize: 10,
            color: "#0078D4",
            fontWeight: 600,
          }}
        >
          Sheet2
        </div>
        <div
          style={{
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f0f2f8",
            border: "1px solid #dde",
            borderRadius: 3,
            cursor: "pointer",
            color: "#0078D4",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          +
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 10, color: "#aaa" }}>Ready</div>
      </div>
    </div>
  );
}
