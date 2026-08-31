import { format, parseISO } from "date-fns";
import { Chip } from "@components/molecules/chip";
import type { ChipVariant } from "@components/molecules/chip";
import {
  Table,
  type TableColumn,
  type TableViewState,
} from "@components/molecules/table";
import type { JobApplication, JobType, Salary } from "@app-types";
import { formatLocation } from "@utils";
import { Button } from "@components/atoms/button";
import { CopyIcon, ExternalLinkIcon } from "@icons";
import { FireIcon, MoonIcon, SadIcon } from "@icons";
import { useRef, useState, useEffect } from "react";

export type ApplicationTableProps = {
  applications: JobApplication[];
  loading?: boolean;
  onRowClick?: (application: JobApplication) => void;
  view?: TableViewState;
  onViewChange?: (view: TableViewState) => void;
};

const PAGE_SIZE = 15;

const STATUS_LABEL: Record<JobApplication["status"], string> = {
  saved: "Saved",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const JOB_TYPE_LABEL: Record<JobType, string> = {
  remote: "Remote",
  onsite: "On-site",
  hybrid: "Hybrid",
};

function formatSalary(salary: Salary | null): string {
  if (!salary) return "—";
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

function handleCopyJobUrl(
  e: React.MouseEvent<HTMLButtonElement>,
  row: JobApplication,
) {
  e.preventDefault();
  e.stopPropagation();
  navigator.clipboard.writeText(row.job_url);
}

function handleOpenJobListing(
  e: React.MouseEvent<HTMLButtonElement>,
  row: JobApplication,
) {
  e.preventDefault();
  e.stopPropagation();
  window.open(row.job_url, "_blank");
}

const COLUMNS: TableColumn<JobApplication>[] = [
  {
    id: "company",
    header: "Company",
    filterable: false,
    sortable: false,
    render: (row) => <span className="font-medium">{row.company}</span>,
  },
  {
    id: "role",
    header: "Role",
    filterable: false,
    sortable: false,
    render: (row) => <span className="text-vortex-secondary">{row.role}</span>,
  },
  {
    id: "status",
    header: "Status",
    sortable: false,
    getFilterValue: (row) => STATUS_LABEL[row.status],
    render: (row) => (
      <Chip variant={row.status as ChipVariant}>
        {STATUS_LABEL[row.status]}
      </Chip>
    ),
  },
  {
    id: "location",
    header: "Location",
    getSortValue: (row) => formatLocation(row.location),
    getFilterValue: (row) => formatLocation(row.location),
    render: (row) => (
      <span className="text-vortex-secondary">
        {formatLocation(row.location)}
      </span>
    ),
  },
  {
    id: "job_type",
    header: "Type",
    getSortValue: (row) => row.job_type ?? "",
    getFilterValue: (row) =>
      row.job_type ? JOB_TYPE_LABEL[row.job_type] : "—",
    render: (row) => (
      <span className="text-vortex-secondary">
        {row.job_type ? JOB_TYPE_LABEL[row.job_type] : "—"}
      </span>
    ),
  },
  {
    id: "salary",
    header: "Salary",
    getSortValue: (row) => row.salary?.amount ?? null,
    getFilterValue: (row) => formatSalary(row.salary),
    render: (row) => (
      <span className="vx-meta">{formatSalary(row.salary)}</span>
    ),
  },
  {
    id: "appliedOn",
    header: "Applied On",
    getSortValue: (row) => Date.parse(row.applied_at) || row.applied_at,
    getFilterValue: (row) => formatDate(row.applied_at),
    render: (row) => (
      <span className="vx-meta">{formatDate(row.applied_at)}</span>
    ),
  },
  {
    id: "resumeScore",
    header: "Resume Score",
    filterable: false,
    getSortValue: (row) => row.resume_score ?? 0,
    render: (row) => {
      let color = "text-vortex-secondary";
      let icon = null;
      let variant: ChipVariant = "saved";
      if (row.resume_score) {
        if (row.resume_score >= 90) {
          color = "text-vortex-success";
          icon = <FireIcon className="w-4 h-4" />;
          variant = "offer";
        } else if (row.resume_score >= 85 && row.resume_score < 90) {
          color = "text-vortex-warning";
          icon = <MoonIcon className="w-4 h-4" />;
          variant = "interview";
        } else if (row.resume_score < 85) {
          color = "text-vortex-error";
          icon = <SadIcon className="w-4 h-4" />;
          variant = "rejected";
        }
      }
      return (
        <Chip
          variant={variant}
          className={`vx-meta ${color} flex items-center gap-2`}
        >
          {icon} {row.resume_score ?? "—"}
        </Chip>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    filterable: false,
    sortable: false,
    render: (row) => (
      <span className="vx-meta">
        <Button variant="ghost" onClick={(e) => handleCopyJobUrl(e, row)}>
          <CopyIcon className="text-vortex-primary" />
        </Button>
        <Button
          variant="ghost"
          onClick={(e) => handleOpenJobListing(e, row)}
          aria-label="Open job listing"
        >
          <ExternalLinkIcon className="text-vortex-primary" aria-hidden />
        </Button>
      </span>
    ),
  },
];

export function ApplicationTable({
  applications,
  loading,
  onRowClick,
  view,
  onViewChange,
}: ApplicationTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE);

  useEffect(() => {
    if (!tableRef.current) return;

    const updatePageSize = () => {
      if (tableRef.current) {
        setPageSize(
          Math.floor(tableRef.current.clientHeight / 50) || PAGE_SIZE,
        );
      }
    };

    updatePageSize();

    const observer = new ResizeObserver(updatePageSize);
    observer.observe(tableRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <Table
      ref={tableRef as React.RefObject<HTMLDivElement>}
      rows={applications}
      columns={COLUMNS}
      getRowId={(row) => row.id}
      searchPlaceholder="Search company, role, or ID"
      getSearchValue={(row) =>
        `${row.company} ${row.role} ${formatLocation(row.location)} ${row.id}`
      }
      pageSize={pageSize}
      loading={loading}
      emptyMessage="No applications match this view."
      onRowClick={onRowClick}
      view={view}
      onViewChange={onViewChange}
    />
  );
}
