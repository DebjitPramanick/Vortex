import { useState } from "react";
import { EditPopup } from "@components/molecules/edit-popup";
import { useApplicationStore } from "@store/useApplicationStore";
import type { JobApplication, NewApplication } from "@app-types/application";
import { ManualApplicationForm } from "../../applications/ManualApplicationForm";

const FORM_ID = "edit-application-form";

export type EditApplicationPopupProps = {
  open: boolean;
  application: JobApplication;
  onClose: () => void;
};

export function EditApplicationPopup({
  open,
  application,
  onClose,
}: EditApplicationPopupProps) {
  const update = useApplicationStore((state) => state.update);
  const fetchStatusHistory = useApplicationStore(
    (state) => state.fetchStatusHistory,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleClose() {
    setSubmitError(null);
    onClose();
  }

  async function handleSubmit(values: NewApplication) {
    setSubmitError(null);
    setSubmitting(true);
    try {
      await update(application.id, {
        company: values.company,
        role: values.role,
        location: values.location,
        job_url: values.job_url,
        applied_at: values.applied_at,
        status: values.status,
        salary: values.salary ?? null,
        job_type: values.job_type ?? null,
        source: values.source ?? null,
        notes: values.notes ?? null,
      });
      await fetchStatusHistory(application.id);
      handleClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Could not update application.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <EditPopup
      open={open}
      title="Edit details"
      description="Update role metadata and notes."
      size="lg"
      submitting={submitting}
      saveFormId={FORM_ID}
      onClose={handleClose}
    >
      {open ? (
        <ManualApplicationForm
          key={application.updated_at}
          formId={FORM_ID}
          hideSubmit
          initialValues={application}
          submitting={submitting}
          submitError={submitError}
          onSubmit={handleSubmit}
        />
      ) : null}
    </EditPopup>
  );
}
