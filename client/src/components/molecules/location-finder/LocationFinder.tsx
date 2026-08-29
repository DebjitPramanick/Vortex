import { useId, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import type { Location } from "@app-types/application";
import { formatLocation, searchLocations } from "@utils/location.helper";
import "./location-finder.css";

export type LocationFinderProps = {
  value: Location | null;
  onChange: (location: Location | null) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function LocationFinder({
  value,
  onChange,
  disabled = false,
  placeholder = "Search for a city",
}: LocationFinderProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchToken = useRef(0);
  const [query, setQuery] = useState(value ? formatLocation(value) : "");
  const [results, setResults] = useState<Location[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  function clearPendingSearch() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    searchToken.current += 1;
  }

  function selectLocation(location: Location) {
    clearPendingSearch();
    onChange(location);
    setQuery(formatLocation(location));
    setResults([]);
    setOpen(false);
    setLoading(false);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    if (value) onChange(null);

    clearPendingSearch();

    if (nextQuery.trim().length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const token = ++searchToken.current;
    timeoutRef.current = setTimeout(() => {
      void searchLocations(nextQuery)
        .then((locations) => {
          if (token !== searchToken.current) return;
          setResults(locations);
          setActiveIndex(0);
          setOpen(locations.length > 0);
          setLoading(false);
        })
        .catch(() => {
          if (token !== searchToken.current) return;
          setResults([]);
          setOpen(false);
          setLoading(false);
        });
    }, 300);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) {
      if (event.key === "Enter") event.preventDefault();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const location = results[activeIndex];
      if (location) selectLocation(location);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  const showList = open && results.length > 0;

  return (
    <div
      className="vx-location-finder"
      ref={rootRef}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <input
        className="vx-input"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={
          showList ? `${listId}-${activeIndex}` : undefined
        }
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        disabled={disabled}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
      />
      {showList ? (
        <ul id={listId} className="vx-location-results" role="listbox">
          {results.map((location, index) => (
            <li
              key={`${location.name}-${location.country}-${location.lat}-${location.lng}`}
            >
              <button
                id={`${listId}-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={
                  index === activeIndex
                    ? "vx-location-option vx-location-option-active"
                    : "vx-location-option"
                }
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectLocation(location)}
              >
                {formatLocation(location)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {loading && query.trim().length >= 2 && !showList ? (
        <p className="vx-location-status">Searching…</p>
      ) : null}
      {!loading &&
      query.trim().length >= 2 &&
      !value &&
      !showList &&
      results.length === 0 ? (
        <p className="vx-location-status">No matching locations</p>
      ) : null}
    </div>
  );
}
