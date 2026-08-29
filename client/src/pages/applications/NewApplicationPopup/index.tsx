import { useState } from "react";
import { Button } from "@components/atoms/button";
import { Modal } from "@components/molecules/modal";
import { useApplicationStore } from "@store/useApplicationStore";
import type { JobApplication, NewApplication } from "@app-types/application";
import { FetchJobFromUrl } from "../FetchJobFromUrl";
import type { FetchedJobDetails } from "@utils/fetchJobDetailsFromUrl";
import { ManualApplicationForm } from "../ManualApplicationForm";
import "./index.css";

export type CreateMethod = "manual" | "url";

type Step = "choose" | "manual" | "url";

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
  const [method, setMethod] = useState<CreateMethod | null>(null);
  const [step, setStep] = useState<Step>("choose");
  const [prefill, setPrefill] = useState<Partial<NewApplication> | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reset = () => {
    setMethod(null);
    setStep("choose");
    setPrefill(undefined);
    setSubmitting(false);
    setSubmitError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFetched = (details: FetchedJobDetails) => {
    setPrefill({
      company: details.company,
      role: details.role,
      location: details.location,
      job_url: details.job_url,
      job_description: details.job_description,
    });
    setStep("manual");
  };

  const handleCreate = async (values: NewApplication) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const created = await create(values);
      reset();
      onClose();
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

  const title =
    step === "choose"
      ? "New application"
      : step === "url"
        ? "Fetch details from URL"
        : "Create application";

  const description =
    step === "choose"
      ? "How do you want to add this role?"
      : step === "url"
        ? "Paste a listing URL. We’ll try to read the job details."
        : "Salary is optional. Everything else is required.";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
      size="lg"
      footer={
        step === "choose" ? (
          <>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!method}
              onClick={() => {
                if (!method) return;
                setStep(method);
              }}
            >
              Continue
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSubmitError(null);
              setPrefill(undefined);
              setStep("choose");
            }}
          >
            Back
          </Button>
        )
      }
    >
      {step === "choose" ? (
        <div
          className="vx-create-options"
          role="group"
          aria-label="Create method"
        >
          <button
            type="button"
            className="vx-create-option"
            aria-pressed={method === "manual"}
            onClick={() => setMethod("manual")}
          >
            <span className="vx-create-option-title">Create manually</span>
            <p className="vx-create-option-copy">
              Enter company, role, salary, and status yourself.
            </p>
          </button>
          <button
            type="button"
            className="vx-create-option"
            aria-pressed={method === "url"}
            onClick={() => setMethod("url")}
          >
            <span className="vx-create-option-title">
              Fetch details from URL
            </span>
            <p className="vx-create-option-copy">
              Paste a job listing link and prefill the application.
            </p>
          </button>
        </div>
      ) : null}

      {step === "url" ? <FetchJobFromUrl onFetched={handleFetched} /> : null}

      {step === "manual" ? (
        <ManualApplicationForm
          key={prefill?.job_url ?? "blank"}
          initialValues={prefill}
          submitting={submitting}
          submitError={submitError}
          onSubmit={handleCreate}
        />
      ) : null}
    </Modal>
  );
}
