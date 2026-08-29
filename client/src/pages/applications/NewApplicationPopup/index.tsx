import { useState } from "react";
import { Button } from "@components/atoms/button";
import { Modal } from "@components/molecules/modal";
import { useApplicationStore } from "@store/useApplicationStore";
import type { JobApplication, NewApplication } from "@app-types/application";
import { ManualApplicationForm } from "../ManualApplicationForm";

const FORM_ID = "manual-application-form";

export type NewApplicationPopupProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (application: JobApplication) => void;
};

export function NewApplicationPopup({
  open,
  onClose,
  onCreated,
}: NewApplicationPopupProps) {
  const create = useApplicationStore((state) => state.create);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleClose = () => {
    setSubmitting(false);
    setSubmitError(null);
    onClose();
  };

  const handleCreate = async (values: NewApplication) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const created = await create(values);
      handleClose();
      onCreated?.(created);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Could not create application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New application"
      description="Salary is optional. Everything else is required."
      size="lg"
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            form={FORM_ID}
            loading={submitting}
          >
            Create application
          </Button>
        </>
      }
    >
      <ManualApplicationForm
        formId={FORM_ID}
        hideSubmit
        submitting={submitting}
        submitError={submitError}
        onSubmit={handleCreate}
      />
    </Modal>
  );
}
