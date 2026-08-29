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
import { Chip } from "@components/molecules/chip";
import type { ChipVariant } from "@components/molecules/chip";
import { Detail } from "./Detail";
import { EditApplicationPopup } from "./EditApplicationPopup";
import { useApplicationStore } from "@store/useApplicationStore";
import type { JobApplication, Salary } from "@app-types/application";
import { formatLocation } from "@utils/location.helper";
import EditIcon from "@icons/edit.svg";

const STATUS_LABEL: Record<JobApplication["status"], string> = {
  saved: "Saved",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

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

export function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const { selected, statusHistory, loading, error, fetchById, fetchStatusHistory } =
    useApplicationStore();
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    void fetchById(id).catch(() => undefined);
    void fetchStatusHistory(id).catch(() => undefined);
  }, [id, fetchById, fetchStatusHistory]);

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
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="vx-page-title">{selected.company}</h1>
            <p className="mt-1 text-[13px] text-vortex-secondary">
              {selected.role}
            </p>
          </div>
          <Chip variant={selected.status as ChipVariant}>
            {STATUS_LABEL[selected.status]}
          </Chip>
        </div>
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
                label="Location"
                value={formatLocation(selected.location)}
              />
              <Detail
                label="Job type"
                value={
                  selected.job_type ? titleCase(selected.job_type) : "—"
                }
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
      </div>

      <EditApplicationPopup
        open={editOpen}
        application={selected}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
