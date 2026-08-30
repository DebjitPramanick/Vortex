# Select

Custom listbox used in place of native `<select>`. It lives with the other design-system molecules at `client/src/components/molecules/select/`.

## Why a custom Select

Native `<select>` cannot match Vortex styling (indigo focus ring, Geist type, checkmarks) and is clipped inside overflow-hidden surfaces such as the application modal. Existing dropdowns (`SplitButton`, table filter popup) already portaled menus to `document.body`; Select follows that pattern.

## How it was built

1. **Audit existing selects.** Every native `<select>` used `className="vx-input"` (36px). Usages were the application form (job type, status, source, currency) and the resume-score profile picker. `StatusSelect` is a split button, not a select, so it was left alone.

2. **Decide on `size`.** Button and Chip already expose `sm | md | lg`. Form fields must match `vx-input` (36px → `md`). Compact rows next to `sm` buttons need 28px. A header-scale control needs 40px (`lg`, same as the split-button height). Default is `md`.

3. **Follow the combobox / listbox pattern.** The trigger stays focused while open. The menu is a `role="listbox"` with `role="option"`. Highlighted option is exposed via `aria-activedescendant` so screen readers and keyboard users share one focus target.

4. **Reuse existing molecules.** Menu chrome, check icon, and portal positioning match `SplitButton`. Trigger chrome matches `vx-input` (border, hover, indigo focus ring).

5. **Wire consumers.** Forms use `react-hook-form` `Controller` because Select is controlled (`value` + `onChange`), not a native input `register` can bind. Optional `name` renders a hidden input for plain HTML forms.

## Files

| File | Role |
|------|------|
| `Select.tsx` | Controlled combobox, keyboard, typeahead, portal |
| `select.css` | Trigger sizes, menu, option states |
| `index.ts` | Public exports |

## Props

```ts
type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectSize = "sm" | "md" | "lg";

type SelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string; // default "Select…"
  disabled?: boolean;
  size?: SelectSize; // default "md"
  name?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};
```

### Size map

| Size | Trigger height | Typical use |
|------|----------------|-------------|
| `sm` | 1.75rem (28px) | Compact cards, next to `Button size="sm"` |
| `md` | 36px | Forms (matches `vx-input`) |
| `lg` | 2.5rem (40px) | Prominent headers |

`md` uses 16px type so iOS does not zoom on focus, same as `vx-input`.

## Features

### Interaction

- Click the trigger to open or close.
- Click an option to commit and close; focus returns to the trigger.
- Click outside the trigger or menu to close without changing the value.
- Hovering an enabled option moves the highlight (keyboard and pointer stay in sync).
- Selected option shows a check icon and indigo soft background.

### Keyboard

Focus stays on the trigger. Keys:

| Key | Closed | Open |
|-----|--------|------|
| `Enter` / `Space` | Open | Commit highlighted option |
| `ArrowDown` | Open, highlight current or first enabled | Next enabled option (wraps) |
| `ArrowUp` | Open, highlight last enabled | Previous enabled option (wraps) |
| `Home` | Open at first enabled | Jump to first enabled |
| `End` | Open at last enabled | Jump to last enabled |
| `Escape` | — | Close, keep previous value |
| `Tab` | Leave the field | Close, then move focus |
| Printable character | Typeahead: commit matching option | Typeahead: highlight matching option |

Typeahead is case-insensitive prefix match on `label`, resets after 500ms, and skips disabled options. Consecutive keys search from the current highlight.

Disabled options are skipped by arrows and cannot be clicked.

### Positioning

The menu is rendered with `createPortal(..., document.body)` at `z-index: 70` so it is not clipped by modal `overflow: hidden` (modal backdrop is `z-index: 50`). Width matches the trigger. It opens below by default and flips above if it would overflow the viewport. Scroll/resize recalculate coordinates. The highlighted option is scrolled into view with `scrollIntoView({ block: "nearest" })`.

### Accessibility

- `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`
- `aria-activedescendant` while open
- Options: `aria-selected`, `aria-disabled`
- Chevron is `aria-hidden`
- `aria-label` / `aria-labelledby` on the trigger; wrapping a `<label>` also works

### Visual

- Placeholder text uses muted color when the current `value` is not in `options`.
- Long labels ellipsize.
- Open chevron rotates 180°.
- Empty `options` shows “No options”.

## Usage

```tsx
import { Select } from "@components/molecules/select";

<Select
  value={status}
  onChange={setStatus}
  options={[
    { value: "saved", label: "Saved" },
    { value: "applied", label: "Applied" },
  ]}
/>
```

With react-hook-form:

```tsx
<Controller
  name="status"
  control={form.control}
  render={({ field }) => (
    <Select
      value={field.value}
      onChange={field.onChange}
      options={statusOptions}
    />
  )}
/>
```

Nullable fields map empty string to `null` in `onChange` (see job type and source on `ManualApplicationForm`).

## Where it is used

- `ManualApplicationForm`: job type, status, source, currency (`md`, default)
- `ScoreProfileCard`: profile picker (`md`)
