import { format, parseISO } from "date-fns";
import { Chip } from "@components/molecules/chip";
import type { ChipVariant } from "@components/molecules/chip";
import { Table, type TableColumn } from "@components/molecules/table";
import type { JobApplication, Salary } from "../../../types/application.ts";

export type ApplicationTableProps = {
  applications: JobApplication[];
  loading?: boolean;
  onRowClick?: (application: JobApplication) => void;
};

const PAGE_SIZE = 10;

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
    getSortValue: (row) => row.location,
    getFilterValue: (row) => row.location,
    render: (row) => (
      <span className="text-vortex-secondary">{row.location}</span>
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
    id: "applied",
    header: "Applied",
    getSortValue: (row) => Date.parse(row.applied_at) || row.applied_at,
    getFilterValue: (row) => formatDate(row.applied_at),
    render: (row) => (
      <span className="vx-meta">{formatDate(row.applied_at)}</span>
    ),
  },
];

export function ApplicationTable({
  applications,
  loading,
  onRowClick,
}: ApplicationTableProps) {
  return (
    <Table
      rows={applications}
      columns={COLUMNS}
      getRowId={(row) => row.id}
      searchPlaceholder="Search company, role, or ID"
      getSearchValue={(row) =>
        `${row.company} ${row.role} ${row.location} ${row.id}`
      }
      pageSize={PAGE_SIZE}
      loading={loading}
      emptyMessage="No applications match this view."
      onRowClick={onRowClick}
    />
  );
}
