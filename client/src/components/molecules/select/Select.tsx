import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import ChevronDownIcon from "@icons/chevron-down.svg";
import CheckIcon from "@icons/check.svg";
import { cx } from "../../cx.ts";
import "./select.css";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectSize = "sm" | "md" | "lg";

export type SelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: SelectSize;
  name?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

const TYPEAHEAD_MS = 500;

function firstEnabledIndex(options: SelectOption[]): number {
  return options.findIndex((option) => !option.disabled);
}

function lastEnabledIndex(options: SelectOption[]): number {
  for (let index = options.length - 1; index >= 0; index -= 1) {
    if (!options[index]?.disabled) return index;
  }
  return -1;
}

function moveEnabled(
  options: SelectOption[],
  from: number,
  direction: 1 | -1,
): number {
  if (options.length === 0) return -1;
  let index = from;
  for (let step = 0; step < options.length; step += 1) {
    index = (index + direction + options.length) % options.length;
    if (!options[index]?.disabled) return index;
  }
  return from;
}

function matchTypeahead(
  options: SelectOption[],
  query: string,
  startAfter: number,
): number {
  const needle = query.toLowerCase();
  if (!needle) return -1;

  const searchFrom = startAfter + 1;
  const order = options
    .map((_, index) => index)
    .slice(searchFrom)
    .concat(options.map((_, index) => index).slice(0, searchFrom));

  return (
    order.find((index) => {
      const option = options[index];
      return (
        option &&
        !option.disabled &&
        option.label.toLowerCase().startsWith(needle)
      );
    }) ?? -1
  );
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
  size = "md",
  name,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: SelectProps) {
  const listboxId = useId();
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const typeaheadRef = useRef({ query: "", timer: 0 });
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  function close() {
    setOpen(false);
  }

  function openMenu(index = selectedIndex >= 0 ? selectedIndex : firstEnabledIndex(options)) {
    if (disabled) return;
    setHighlightedIndex(index);
    setOpen(true);
  }

  function selectIndex(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    close();
    wrapRef.current?.querySelector("button")?.focus();
  }

  function consumeTypeahead(key: string) {
    const nextQuery = typeaheadRef.current.query + key;
    typeaheadRef.current.query = nextQuery;
    window.clearTimeout(typeaheadRef.current.timer);
    typeaheadRef.current.timer = window.setTimeout(() => {
      typeaheadRef.current.query = "";
    }, TYPEAHEAD_MS);

    const startAfter = open
      ? highlightedIndex
      : selectedIndex >= 0
        ? selectedIndex
        : -1;
    const match = matchTypeahead(options, nextQuery, startAfter);
    if (match < 0) return;

    if (open) {
      setHighlightedIndex(match);
      return;
    }
    onChange(options[match]!.value);
  }

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const anchor = wrapRef.current?.getBoundingClientRect();
      if (!anchor) return;

      const width = anchor.width;
      const pad = 8;
      let left = anchor.left;
      if (left + width > window.innerWidth - pad) {
        left = Math.max(pad, window.innerWidth - pad - width);
      }

      const menuHeight = menuRef.current?.offsetHeight ?? Math.min(256, 12 + options.length * 36);
      let top = anchor.bottom + 4;
      if (top + menuHeight > window.innerHeight - pad) {
        top = Math.max(pad, anchor.top - 4 - menuHeight);
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
  }, [open, options.length]);

  useLayoutEffect(() => {
    if (!open) return;
    optionRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    return () => window.clearTimeout(typeaheadRef.current.timer);
  }, []);

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      consumeTypeahead(event.key);
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) {
          openMenu();
          break;
        }
        setHighlightedIndex((current) =>
          moveEnabled(options, current < 0 ? -1 : current, 1),
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) {
          openMenu(lastEnabledIndex(options));
          break;
        }
        setHighlightedIndex((current) =>
          moveEnabled(options, current < 0 ? options.length : current, -1),
        );
        break;
      case "Home":
        event.preventDefault();
        if (!open) openMenu(firstEnabledIndex(options));
        else setHighlightedIndex(firstEnabledIndex(options));
        break;
      case "End":
        event.preventDefault();
        if (!open) openMenu(lastEnabledIndex(options));
        else setHighlightedIndex(lastEnabledIndex(options));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (!open) {
          openMenu();
          break;
        }
        if (highlightedIndex >= 0) selectIndex(highlightedIndex);
        break;
      case "Escape":
        if (!open) break;
        event.preventDefault();
        close();
        break;
      case "Tab":
        if (open) close();
        break;
      default:
        break;
    }
  }

  const displayLabel = selected?.label;
  const showPlaceholder = !displayLabel;

  return (
    <div
      ref={wrapRef}
      className={cx("vx-select", `vx-select-${size}`, className)}
    >
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        type="button"
        id={triggerId}
        className="vx-select-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && highlightedIndex >= 0
            ? `${listboxId}-opt-${highlightedIndex}`
            : undefined
        }
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        <span
          className={cx(
            "vx-select-value",
            showPlaceholder && "vx-select-placeholder",
          )}
        >
          {showPlaceholder ? placeholder : displayLabel}
        </span>
        <ChevronDownIcon className="vx-select-chevron" aria-hidden="true" />
      </button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={listboxId}
              className="vx-select-menu"
              role="listbox"
              aria-labelledby={triggerId}
              style={{
                top: coords.top,
                left: coords.left,
                minWidth: coords.width,
                width: coords.width,
              }}
            >
              {options.length === 0 ? (
                <div className="vx-select-empty">No options</div>
              ) : (
                options.map((option, index) => {
                  const selectedOption = option.value === value;
                  const highlighted = index === highlightedIndex;
                  return (
                    <div
                      key={`${option.value}-${index}`}
                      ref={(node) => {
                        optionRefs.current[index] = node;
                      }}
                      id={`${listboxId}-opt-${index}`}
                      role="option"
                      aria-selected={selectedOption}
                      aria-disabled={option.disabled || undefined}
                      className={cx(
                        "vx-select-option",
                        selectedOption && "is-selected",
                        highlighted && "is-highlighted",
                        option.disabled && "is-disabled",
                      )}
                      onMouseEnter={() => {
                        if (!option.disabled) setHighlightedIndex(index);
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        if (!option.disabled) selectIndex(index);
                      }}
                    >
                      <span>{option.label}</span>
                      {selectedOption ? (
                        <CheckIcon className="vx-select-check" aria-hidden="true" />
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
