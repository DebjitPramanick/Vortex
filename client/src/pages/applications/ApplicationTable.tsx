import { format, parseISO } from "date-fns";
import { Chip } from "../../components/molecules/chip";
import type { ChipVariant } from "../../components/molecules/chip";
import type { JobApplication, Salary } from "../../types/application.ts";
import "./applicationTable.css";

export type ApplicationTableProps = {
  applications: JobApplication[];
  onRowClick?: (application: JobApplication) => void;
};

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

export function ApplicationTable({
  applications,
  onRowClick,
}: ApplicationTableProps) {
  if (applications.length === 0) {
    return (
      <p className="vx-app-table-empty">No applications match this view.</p>
    );
  }

  return (
    <div className="vx-app-table-wrap">
      <table className="vx-app-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Company</th>
            <th>Role</th>
            <th>Status</th>
            <th>Location</th>
            <th>Salary</th>
            <th>Applied</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onRowClick?.(row);
                }
              }}
              tabIndex={0}
            >
              <td className="vx-meta text-vortex-secondary">{row.id.slice(0, 8)}</td>
              <td className="font-medium">{row.company}</td>
              <td className="text-vortex-secondary">{row.role}</td>
              <td>
                <Chip variant={row.status as ChipVariant}>
                  {STATUS_LABEL[row.status]}
                </Chip>
              </td>
              <td className="text-vortex-secondary">{row.location}</td>
              <td className="vx-meta">{formatSalary(row.salary)}</td>
              <td className="vx-meta">{formatDate(row.applied_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
