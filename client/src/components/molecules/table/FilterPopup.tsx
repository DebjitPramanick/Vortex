import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@components/atoms/button";
import "./table.css";

export type FilterPopupProps = {
  open: boolean;
  columnId: string;
  title: string;
  options: string[];
  selected: string[];
  anchorRef: RefObject<HTMLElement | null>;
  onToggle: (value: string) => void;
  onClear: () => void;
  onClose: () => void;
};

export function FilterPopup({
  open,
  columnId,
  title,
  options,
  selected,
  anchorRef,
  onToggle,
  onClear,
  onClose,
}: FilterPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const anchor = anchorRef.current?.getBoundingClientRect();
      if (!anchor) return;

      const width = 220;
      const pad = 8;
      let left = anchor.left;
      if (left + width > window.innerWidth - pad) {
        left = Math.max(pad, anchor.right - width);
      }

      let top = anchor.bottom + 4;
      const estimatedHeight = Math.min(280, 72 + options.length * 32);
      if (top + estimatedHeight > window.innerHeight - pad) {
        top = Math.max(pad, anchor.top - 4 - estimatedHeight);
      }

      setCoords({ top, left });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorRef, open, options.length]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (popupRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anchorRef, onClose, open]);

  if (!open) return null;

  return createPortal(
    <div
      ref={popupRef}
      className="vx-table-filter-popup"
      role="dialog"
      aria-label={title}
      style={{ top: coords.top, left: coords.left }}
    >
      <div className="vx-table-filter-popup-header">
        <p className="vx-table-filter-popup-title">{title}</p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={selected.length === 0}
          onClick={onClear}
        >
          Clear
        </Button>
      </div>
      <div className="vx-table-filter-popup-list">
        {options.length === 0 ? (
          <p className="vx-table-filter-empty">No values</p>
        ) : (
          options.map((option, index) => {
            const checked = selected.includes(option);
            const id = `vx-filter-${columnId}-${index}`;
            return (
              <label key={option} className="vx-table-filter-option" htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(option)}
                />
                <span>{option}</span>
              </label>
            );
          })
        )}
      </div>
    </div>,
    document.body,
  );
}
