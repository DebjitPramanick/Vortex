import { useCallback, useRef, useLayoutEffect, useState } from "react";
import type { TableColumn } from "./Table";

function useStickyOffsets<T>(columns: TableColumn<T>[]) {
  const thRefs = useRef(new Map());
  const [columnOffsets, setColumnOffsets] = useState<Record<string, number>>(
    {},
  );

  const setThRef = useCallback(
    (columnId: string) => (el: HTMLTableCellElement) => {
      if (el) thRefs.current.set(columnId, el);
      else thRefs.current.delete(columnId);
    },
    [],
  );

  useLayoutEffect(() => {
    let cumulative = 0;
    const next: Record<string, number> = {};

    for (const column of columns) {
      if (!column.sticky) continue;
      const el = thRefs.current.get(column.id);
      if (!el) continue;

      console.log(el);
      el.style.setProperty("left", `${cumulative}px`);
      // This is for td elements to align with the th element
      next[column.id] = cumulative;

      // This is for the next column
      cumulative += el.offsetWidth;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColumnOffsets(next);
  }, [columns]);

  return { setThRef, columnOffsets };
}

export default useStickyOffsets;
