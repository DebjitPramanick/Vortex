import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import ChevronDownIcon from "@icons/chevron-down.svg";
import CheckIcon from "@icons/check.svg";
import { cx } from "../../cx.ts";
import "./split-button.css";

export type SplitButtonItem = {
  id: string;
  label: string;
};

export type SplitButtonProps = {
  label: ReactNode;
  items: SplitButtonItem[];
  selectedId?: string;
  disabled?: boolean;
  ariaLabel?: string;
  onSelect: (id: string) => void;
  onMainClick?: () => void;
};

export function SplitButton({
  label,
  items,
  selectedId,
  disabled,
  ariaLabel,
  onSelect,
  onMainClick,
}: SplitButtonProps) {
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  function close() {
    setOpen(false);
  }

  function toggleMenu() {
    if (disabled) return;
    setOpen((current) => !current);
  }

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const anchor = wrapRef.current?.getBoundingClientRect();
      if (!anchor) return;

      const width = Math.max(anchor.width, 11.5 * 16);
      const pad = 8;
      let left = anchor.right - width;
      if (left < pad) left = pad;
      if (left + width > window.innerWidth - pad) {
        left = Math.max(pad, window.innerWidth - pad - width);
      }

      let top = anchor.bottom + 4;
      const estimatedHeight = Math.min(280, 12 + items.length * 36);
      if (top + estimatedHeight > window.innerHeight - pad) {
        top = Math.max(pad, anchor.top - 4 - estimatedHeight);
      }

      setCoords({ top, left, width });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [items.length, open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      close();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={cx("vx-split-btn", disabled && "is-disabled")}>
      <button
        type="button"
        className="vx-split-btn-main"
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={() => {
          if (onMainClick) {
            onMainClick();
            return;
          }
          toggleMenu();
        }}
      >
        {label}
      </button>
      <span className="vx-split-btn-divider" aria-hidden="true" />
      <button
        type="button"
        className="vx-split-btn-trigger"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label="Open menu"
        onClick={toggleMenu}
      >
        <ChevronDownIcon aria-hidden="true" />
      </button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              className="vx-split-btn-menu"
              role="menu"
              style={{
                top: coords.top,
                left: coords.left,
                minWidth: coords.width,
              }}
            >
              {items.map((item) => {
                const selected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    className={cx(
                      "vx-split-btn-item",
                      selected && "is-selected",
                    )}
                    onClick={() => {
                      close();
                      if (item.id !== selectedId) onSelect(item.id);
                    }}
                  >
                    <span>{item.label}</span>
                    {selected ? (
                      <span className="vx-split-btn-check">
                        <CheckIcon aria-hidden="true" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
