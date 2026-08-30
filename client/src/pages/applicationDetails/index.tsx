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
import { JobDescriptionCard } from "./JobDescriptionCard";
import { ScoreProfileCard } from "./ScoreProfileCard";
import { StatusSelect } from "./StatusSelect";
import { useApplicationStore } from "@store/useApplicationStore";
import type { ApplicationStatus, Salary } from "@app-types/application";
import { formatLocation } from "@utils/location.helper";
import EditIcon from "@icons/edit.svg";
import ExternalLinkIcon from "@icons/external-link.svg";

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

function MetaDot() {
  return (
    <span className="mx-1.5 text-vortex-muted" aria-hidden="true">
      ·
    </span>
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
            <p className="mt-1 flex flex-wrap items-center text-[13px] text-vortex-secondary">
              {selected.role}
              <MetaDot />
              {formatLocation(selected.location)}
              {selected.job_type ? (
                <>
                  <MetaDot />
                  {titleCase(selected.job_type)}
                </>
              ) : null}
              {selected.job_url ? (
                <>
                  <MetaDot />
                  <a
                    href={selected.job_url}
                    className="inline-flex items-center text-vortex-secondary no-underline hover:text-vortex-primary"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open job listing"
                  >
                    <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </>
              ) : null}
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

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card>
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
                  label="Applied on"
                  value={formatDate(selected.applied_at)}
                  mono
                />
                <Detail
                  label="Notes"
                  className="sm:col-span-2"
                  value={selected.notes?.trim() ? selected.notes : "—"}
                />
              </dl>
            </CardBody>
          </Card>
          <JobDescriptionCard
            key={selected.id}
            application={selected}
            onUpdate={update}
          />
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-104">
          <ScoreProfileCard
            key={`${selected.id}-score`}
            application={selected}
            onUpdate={update}
          />

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
        </div>
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
