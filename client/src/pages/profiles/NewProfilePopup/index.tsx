import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@components/atoms/button";
import { Modal } from "@components/molecules/modal";
import { useProfileStore } from "@store/useProfileStore";
import type { Profile } from "@app-types/profile";
import "./index.css";

export type NewProfilePopupProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (profile: Profile) => void;
};

const FORM_ID = "vx-new-profile-form";

export function NewProfilePopup({
  open,
  onClose,
  onCreated,
}: NewProfilePopupProps) {
  const create = useProfileStore((state) => state.create);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) return;
    setName("");
    setNotes("");
    setResume(null);
    setSubmitting(false);
    setSubmitError(null);
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setSubmitError("Name is required.");
      return;
    }
    if (!resume) {
      setSubmitError("Upload a resume PDF.");
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    try {
      const created = await create({
        name: trimmedName,
        notes: notes.trim() ? notes : null,
        resume,
      });
      onClose();
      onCreated?.(created);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not create profile.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New profile"
      description="Name this profile and attach a resume PDF."
      size="md"
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
            type="submit"
            variant="primary"
            form={FORM_ID}
            loading={submitting}
          >
            Create
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className="vx-profile-form" onSubmit={handleSubmit}>
        {submitError ? <p className="vx-profile-banner">{submitError}</p> : null}

        <label className="vx-profile-field">
          <span className="vx-profile-label">Name</span>
          <input
            className="vx-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Frontend 2026"
            autoFocus
          />
        </label>

        <label className="vx-profile-field">
          <span className="vx-profile-label">Resume PDF</span>
          <input
            className="vx-input vx-profile-file"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => setResume(event.target.files?.[0] ?? null)}
          />
          <span className="vx-profile-hint">
            {resume ? resume.name : "PDF up to 10 MB"}
          </span>
        </label>

        <label className="vx-profile-field">
          <span className="vx-profile-label">Notes</span>
          <textarea
            className="vx-input"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional — target roles, version notes"
          />
        </label>
      </form>
    </Modal>
  );
}
