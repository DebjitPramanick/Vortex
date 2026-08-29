import type { ReactNode } from "react";
import { Button } from "@components/atoms/button";
import { Modal, type ModalSize } from "@components/molecules/modal";

export type EditPopupProps = {
  open: boolean;
  title: string;
  description?: string;
  size?: ModalSize;
  submitting?: boolean;
  saveLabel?: string;
  saveFormId?: string;
  onClose: () => void;
  onSave?: () => void;
  children: ReactNode;
};

export function EditPopup({
  open,
  title,
  description,
  size = "md",
  submitting = false,
  saveLabel = "Save",
  saveFormId,
  onClose,
  onSave,
  children,
}: EditPopupProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type={saveFormId ? "submit" : "button"}
            variant="primary"
            form={saveFormId}
            loading={submitting}
            onClick={saveFormId ? undefined : onSave}
          >
            {saveLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
