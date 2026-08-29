import {
  useEffect,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cx } from "../../cx.ts";
import "./modal.css";

export type ModalSize = "sm" | "md" | "lg";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: ModalSize;
  children?: ReactNode;
  footer?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "title">;

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
  className,
  ...props
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return createPortal(
    <div className="vx-modal-backdrop" onClick={handleBackdrop}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vx-modal-title"
        aria-describedby={description ? "vx-modal-description" : undefined}
        className={cx("vx-modal", `vx-modal-${size}`, className)}
        {...props}
      >
        <div className="vx-modal-header">
          <div>
            <h2 id="vx-modal-title" className="vx-modal-title">
              {title}
            </h2>
            {description ? (
              <p id="vx-modal-description" className="vx-modal-description">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="vx-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {children ? <div className="vx-modal-body">{children}</div> : null}
        {footer ? <div className="vx-modal-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
