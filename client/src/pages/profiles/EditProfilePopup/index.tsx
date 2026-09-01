import type { Profile } from "@app-types/profile";
import { useEffect, useState, type FormEvent } from "react";
import { useProfileStore } from "@store/useProfileStore";
import { Modal } from "@components/molecules/modal";
import { Button } from "@components/atoms/button";

export type EditProfilePopupProps = {
  profile: Profile | null;
  open: boolean;
  onClose: () => void;
  onUpdated?: (profile: Profile) => void;
};

const FORM_ID = "vx-edit-profile-form";

export function EditProfilePopup({
  profile,
  open,
  onClose,
  onUpdated,
}: EditProfilePopupProps) {
  const { update } = useProfileStore();

  const [name, setName] = useState(profile?.name ?? "");
  const [notes, setNotes] = useState(profile?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) return;
    setName("");
    setNotes("");
    setSubmitting(false);
    setSubmitError(null);
  }, [open]);

  useEffect(() => {
    if (!profile) return;
    setName(profile?.name ?? "");
    setNotes(profile?.notes ?? "");
  }, [profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!profile) return;
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setSubmitError("Name is required.");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const updated = await update(profile.id, {
        name: trimmedName,
        notes: notes.trim() ? notes : null,
      });
      onClose();
      onUpdated?.(updated);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not update profile.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profile"
      description="Edit the profile name and notes."
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            form={FORM_ID}
            loading={submitting}
          >
            Save
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className="vx-profile-form" onSubmit={handleSubmit}>
        {submitError ? (
          <p className="vx-profile-banner">{submitError}</p>
        ) : null}
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
