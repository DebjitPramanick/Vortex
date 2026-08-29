import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/atoms/card";
import { Button } from "@components/atoms/button";
import { Detail } from "./Detail";
import { EditApplicationPopup } from "./EditApplicationPopup";
import { StatusSelect } from "./StatusSelect";
import { useApplicationStore } from "@store/useApplicationStore";
import type {
  ApplicationStatus,
  JobApplication,
  Salary,
} from "@app-types/application";
import { formatLocation } from "@utils/location.helper";
import { fetchJobDetailsFromUrl } from "@utils/fetchJobDetailsFromUrl.helper";
import EditIcon from "@icons/edit.svg";
import FetchIcon from "@icons/fetch.svg";

function formatSalary(salary: Salary | null): string {
  if (!salary) return "Not set";
  if (salary.currency === "OTHER") {
    return `${salary.amount.toLocaleString()} OTHER`;
  }
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: salary.currency,
    maximumFractionDigits: 0,
  }).format(salary.amount);
}

function formatDate(value: string): string {
  try {
    return format(parseISO(value), "d MMM yyyy");
  } catch {
    return value;
  }
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function JobDescriptionCard({
  application,
  onUpdate,
}: {
  application: JobApplication;
  onUpdate: (
    id: string,
    changes: { job_description: string | null },
  ) => Promise<unknown>;
}) {
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
    <Card className="lg:col-span-3">
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

function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const {
    selected,
    statusHistory,
    loading,
    error,
    fetchById,
    fetchStatusHistory,
    update,
  } = useApplicationStore();
  const [editOpen, setEditOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void fetchById(id).catch(() => undefined);
    void fetchStatusHistory(id).catch(() => undefined);
  }, [id, fetchById, fetchStatusHistory]);

  async function handleStatusChange(status: ApplicationStatus) {
    if (!selected || status === selected.status) return;

    setStatusError(null);
    setUpdatingStatus(true);
    try {
      await update(selected.id, { status });
      await fetchStatusHistory(selected.id);
    } catch (caught) {
      setStatusError(
        caught instanceof Error
          ? caught.message
          : "Could not update the application status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (!id) {
    return (
      <p className="text-[13px] text-vortex-secondary">
        Missing application id.
      </p>
    );
  }

  if (loading && !selected) {
    return (
      <p className="text-[13px] text-vortex-secondary">Loading application…</p>
    );
  }

  if (error && !selected) {
    return <p className="text-[13px] text-vortex-error">{error}</p>;
  }

  if (!selected) {
    return (
      <div>
        <p className="text-[13px] text-vortex-secondary">
          Application not found.
        </p>
        <Link
          to="/applications"
          className="mt-3 inline-block text-[13px] text-vortex-primary"
        >
          Back to applications
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto">
      <div>
        <Link
          to="/applications"
          className="text-[13px] text-vortex-secondary no-underline hover:text-vortex-primary"
        >
          ← Applications
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="vx-page-title">{selected.company}</h1>
            <p className="mt-1 text-[13px] text-vortex-secondary">
              {selected.role}
              <span className="mx-1.5 text-vortex-muted" aria-hidden="true">
                ·
              </span>
              {formatLocation(selected.location)}
            </p>
          </div>
          <StatusSelect
            value={selected.status}
            disabled={updatingStatus}
            onChange={(status) => void handleStatusChange(status)}
          />
        </div>
        {statusError ? (
          <p className="mt-2 text-[13px] text-vortex-error">{statusError}</p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Details</CardTitle>
              <CardDescription>Role metadata and notes</CardDescription>
            </div>
            <Button
              size="sm"
              variant="secondary"
              icon={<EditIcon />}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
          </CardHeader>
          <CardBody>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="Application ID" value={selected.id} mono />
              <Detail
                label="Job type"
                value={selected.job_type ? titleCase(selected.job_type) : "—"}
              />
              <Detail
                label="Source"
                value={selected.source ? titleCase(selected.source) : "—"}
              />
              <Detail
                label="Salary"
                value={formatSalary(selected.salary)}
                mono
              />
              <Detail
                label="Applied"
                value={formatDate(selected.applied_at)}
                mono
              />
              <Detail
                label="Job URL"
                value={
                  selected.job_url ? (
                    <a
                      href={selected.job_url}
                      className="text-vortex-primary no-underline hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open listing
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <Detail
                label="Notes"
                className="sm:col-span-2"
                value={selected.notes?.trim() ? selected.notes : "—"}
              />
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Status history</CardTitle>
              <CardDescription>Pipeline changes</CardDescription>
            </div>
          </CardHeader>
          <CardBody>
            {statusHistory.length === 0 ? (
              <p className="text-[13px] text-vortex-secondary">
                No status changes yet.
              </p>
            ) : (
              <ol className="space-y-3">
                {statusHistory.map((entry) => (
                  <li key={entry.id} className="text-[13px]">
                    <p className="font-medium text-vortex-fg">
                      {entry.from_status ?? "—"} → {entry.to_status}
                    </p>
                    <p className="vx-meta mt-0.5">
                      {formatDate(entry.changed_at)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>

        <JobDescriptionCard
          key={selected.id}
          application={selected}
          onUpdate={update}
        />
      </div>

      <EditApplicationPopup
        open={editOpen}
        application={selected}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}

export default ApplicationDetails;
