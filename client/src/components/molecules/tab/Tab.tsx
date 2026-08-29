import {
  createContext,
  useContext,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../cx.ts";
import "./tab.css";

export type TabSize = "sm" | "md" | "lg";
export type TabVariant = "soft" | "underline";

type TabsContextValue = {
  value: string;
  onChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tab must be used within Tabs");
  }
  return context;
}

export type TabsProps = {
  value: string;
  onChange: (value: string) => void;
  size?: TabSize;
  variant?: TabVariant;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function Tabs({
  value,
  onChange,
  size = "md",
  variant = "soft",
  className,
  children,
  ...props
}: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div
        role="tablist"
        className={cx("vx-tabs", `vx-tabs-${size}`, `vx-tabs-${variant}`, className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export type TabProps = {
  value: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value">;

export function Tab({
  value,
  className,
  children,
  disabled,
  ...props
}: TabProps) {
  const tabs = useTabsContext();
  const selected = tabs.value === value;

  return (
    <button
      type="button"
      role="tab"
      id={`vx-tab-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      className={cx("vx-tab", className)}
      onClick={() => tabs.onChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}
