import { useState, useRef, useCallback, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

const COLS = 26;
const INIT_ROWS = 200;

function colLabel(i) { return String.fromCharCode(65 + i); }

function generateData(rows, cols) {
  const data = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      if (r === 0) {
        // Header-ish first row with sample fleet data
        row.push(["Vehicle ID", "Driver", "Route", "Status", "Speed (mph)", "Fuel (%)", "Last Update", "Lat", "Lng", "ETA", "Miles Today", "Alerts", "Cargo", "Weight (lbs)", "Temp (°F)", "Tire PSI", "Oil Life %", "Next Service", "Region", "Dispatcher", "Priority", "Load Type", "Destination", "Origin", "Rating", "Notes"][c] || "");
      } else {
        row.push("");
      }
    }
    data.push(row);
  }
  return data;
}

export default function SpreadsheetTab({ onMarkDirty }) {
  const [data, setData] = useState(() => generateData(INIT_ROWS, COLS));
  const [editCell, setEditCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [selection, setSelection] = useState(null);
  const parentRef = useRef(null);
  const inputRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 15,
  });

  const handleCellClick = useCallback((r, c) => {
    setSelection({ r, c });
    setEditCell(null);
  }, []);

  const handleCellDoubleClick = useCallback((r, c) => {
    setEditCell({ r, c });
    setEditValue(data[r][c]);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [data]);

  const commitEdit = useCallback(() => {
    if (editCell) {
      setData((prev) => {
        const next = prev.map((row) => [...row]);
        next[editCell.r][editCell.c] = editValue;
        return next;
      });
      if (onMarkDirty) onMarkDirty();
    }
    setEditCell(null);
  }, [editCell, editValue, onMarkDirty]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      commitEdit();
      if (selection) setSelection({ r: Math.min(selection.r + 1, data.length - 1), c: selection.c });
    } else if (e.key === "Escape") {
      setEditCell(null);
    } else if (e.key === "Tab") {
      e.preventDefault();
      commitEdit();
      if (selection) setSelection({ r: selection.r, c: Math.min(selection.c + 1, COLS - 1) });
    }
  }, [commitEdit, selection, data.length]);

  const handleArrowNav = useCallback((e) => {
    if (editCell) return;
    if (!selection) return;
    const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const m = moves[e.key];
    if (m) {
      e.preventDefault();
      setSelection({
        r: Math.max(0, Math.min(data.length - 1, selection.r + m[0])),
        c: Math.max(0, Math.min(COLS - 1, selection.c + m[1])),
      });
    } else if (e.key === "Enter" && selection) {
      handleCellDoubleClick(selection.r, selection.c);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      if (selection) {
        setData((prev) => {
          const next = prev.map((row) => [...row]);
          next[selection.r][selection.c] = "";
          return next;
        });
        if (onMarkDirty) onMarkDirty();
      }
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && selection) {
      setEditCell(selection);
      setEditValue(e.key);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editCell, selection, data.length, handleCellDoubleClick, onMarkDirty]);

  const addRows = useCallback(() => {
    setData((prev) => [...prev, ...generateData(100, COLS).slice(1).map(() => Array(COLS).fill(""))]);
  }, []);

  const cellW = 100;

  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 4, border: "2px dashed #0078D4", display: "flex", flexDirection: "column", overflow: "hidden" }}
      tabIndex={0} onKeyDown={handleArrowNav}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderBottom: "1px solid #e8eaef", flexShrink: 0, background: "#fafbfd" }}>
        <span style={{ fontSize: 10, color: "#999", fontFamily: "monospace", minWidth: 50 }}>
          {selection ? `${colLabel(selection.c)}${selection.r + 1}` : "—"}
        </span>
        <div style={{ width: 1, height: 16, background: "#e0e0e8" }} />
        <input
          value={editCell ? editValue : (selection ? data[selection.r][selection.c] : "")}
          onChange={(e) => { if (editCell) setEditValue(e.target.value); }}
          style={{ flex: 1, border: "1px solid #ddd", borderRadius: 3, padding: "3px 8px", fontSize: 11, fontFamily: "monospace" }}
          placeholder="Select a cell to edit"
          readOnly={!editCell}
        />
        <button onClick={addRows} style={{ padding: "3px 10px", fontSize: 10, background: "#0078D4", color: "#fff", border: "none", borderRadius: 3, cursor: "pointer", fontWeight: 600 }}>+ 100 rows</button>
        <span style={{ fontSize: 10, color: "#aaa" }}>{data.length} rows × {COLS} cols</span>
      </div>
      {/* Column headers */}
      <div style={{ display: "flex", borderBottom: "2px solid #e0e0e8", flexShrink: 0, background: "#f5f6fa" }}>
        <div style={{ width: 50, minWidth: 50, padding: "4px 0", textAlign: "center", fontSize: 10, color: "#999", borderRight: "1px solid #e8eaef" }}>#</div>
        {Array.from({ length: COLS }, (_, i) => (
          <div key={i} style={{ width: cellW, minWidth: cellW, padding: "4px 0", textAlign: "center", fontSize: 10, fontWeight: 700, color: "#666", borderRight: "1px solid #e8eaef", letterSpacing: "0.04em" }}>
            {colLabel(i)}
          </div>
        ))}
      </div>
      {/* Virtualized grid */}
      <div ref={parentRef} style={{ flex: 1, overflow: "auto" }}>
        <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
          {rowVirtualizer.getVirtualItems().map((vRow) => {
            const r = vRow.index;
            return (
              <div key={r} style={{ position: "absolute", top: vRow.start, left: 0, height: 28, display: "flex", borderBottom: "1px solid #f0f0f5", width: 50 + COLS * cellW }}>
                <div style={{ width: 50, minWidth: 50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#bbb", background: "#fafbfd", borderRight: "1px solid #e8eaef", userSelect: "none" }}>{r + 1}</div>
                {Array.from({ length: COLS }, (_, c) => {
                  const isEdit = editCell?.r === r && editCell?.c === c;
                  const isSel = selection?.r === r && selection?.c === c;
                  return (
                    <div key={c}
                      onClick={() => handleCellClick(r, c)}
                      onDoubleClick={() => handleCellDoubleClick(r, c)}
                      style={{
                        width: cellW, minWidth: cellW, display: "flex", alignItems: "center",
                        padding: "0 6px", fontSize: 11, borderRight: "1px solid #f0f0f5",
                        background: isEdit ? "#fff8e1" : isSel ? "#e8f0fe" : r === 0 ? "#f5f6fa" : "transparent",
                        outline: isSel ? "2px solid #0078D4" : "none", outlineOffset: -1,
                        cursor: "cell", overflow: "hidden", whiteSpace: "nowrap",
                        fontWeight: r === 0 ? 700 : 400, color: r === 0 ? "#333" : "#555",
                      }}>
                      {isEdit ? (
                        <input ref={inputRef} value={editValue} onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit} onKeyDown={handleKeyDown}
                          style={{ width: "100%", border: "none", outline: "none", fontSize: 11, fontFamily: "inherit", background: "transparent", padding: 0 }} />
                      ) : (
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{data[r][c]}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
