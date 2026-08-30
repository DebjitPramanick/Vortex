import { useState } from "react";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/atoms/card";
import { Button } from "@components/atoms/button";
import type { JobApplication } from "@app-types/application";
import { fetchJobDetailsFromUrl } from "@utils/fetchJobDetailsFromUrl.helper";
import EditIcon from "@icons/edit.svg";
import FetchIcon from "@icons/fetch.svg";

export type JobDescriptionCardProps = {
  application: JobApplication;
  onUpdate: (
    id: string,
    changes: { job_description: string | null },
  ) => Promise<unknown>;
};

export function JobDescriptionCard({
  application,
  onUpdate,
}: JobDescriptionCardProps) {
  const [refetchingJd, setRefetchingJd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingJd, setEditingJd] = useState(false);
  const [jdDraft, setJdDraft] = useState("");
  const [savingJd, setSavingJd] = useState(false);

  function handleStartEditJd() {
    setError(null);
    setJdDraft(application.job_description ?? "");
    setEditingJd(true);
  }

  function handleCancelEditJd() {
    setEditingJd(false);
    setJdDraft(application.job_description ?? "");
  }

  async function handleSaveJobDescription() {
    setError(null);
    setSavingJd(true);
    try {
      const jobDescription = jdDraft.trim() ? jdDraft : null;
      await onUpdate(application.id, { job_description: jobDescription });
      setEditingJd(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not save the job description.",
      );
    } finally {
      setSavingJd(false);
    }
  }

  async function handleRefetchJobDescription() {
    if (!application.job_url) {
      setError("Add a job URL before refetching the description.");
      return;
    }

    setError(null);
    setRefetchingJd(true);
    try {
      const jobDetails = await fetchJobDetailsFromUrl(application.job_url);
      await onUpdate(application.id, {
        job_description: jobDetails.job_description,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not refetch the job description.",
      );
    } finally {
      setRefetchingJd(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Job Description</CardTitle>
          <CardDescription>Job description and requirements</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {editingJd ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                disabled={savingJd}
                onClick={handleCancelEditJd}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                loading={savingJd}
                onClick={() => void handleSaveJobDescription()}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="secondary"
                icon={<EditIcon />}
                onClick={handleStartEditJd}
              >
                Edit JD
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon={<FetchIcon />}
                loading={refetchingJd}
                disabled={!application.job_url}
                onClick={() => void handleRefetchJobDescription()}
              >
                Refetch JD
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {error ? (
          <p className="mb-3 text-[13px] text-vortex-error">{error}</p>
        ) : null}
        {editingJd ? (
          <textarea
            className="vx-input !h-auto min-h-64 font-[inherit] text-[13px] leading-5"
            value={jdDraft}
            onChange={(event) => setJdDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                handleCancelEditJd();
              }
            }}
            placeholder="Paste the job description from the listing…"
            autoFocus
            disabled={savingJd}
            rows={16}
            spellCheck={false}
          />
        ) : application.job_description?.trim() ? (
          <p className="whitespace-pre-wrap text-[13px] text-vortex-fg">
            {application.job_description}
          </p>
        ) : (
          <p className="text-[13px] text-vortex-secondary">
            No job description yet. Edit to paste one, or refetch from the
            listing URL.
          </p>
        )}
      </CardBody>
    </Card>
  );
}
