import type { ApplicationStatus } from "@app-types/application";
import { APPLICATION_STATUSES } from "@utils/fetchJobDetailsFromUrl.helper";
import ChevronDownIcon from "@icons/chevron-down.svg";
import "./statusSelect.css";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export type StatusSelectProps = {
  value: ApplicationStatus;
  disabled?: boolean;
  onChange: (status: ApplicationStatus) => void;
};

export function StatusSelect({ value, disabled, onChange }: StatusSelectProps) {
  return (
    <label className="vx-status-select-wrap" htmlFor="status-select">
      <span className="sr-only">Application status</span>
      <select
        className="vx-status-select"
        id="status-select"
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const next = event.target.value as ApplicationStatus;
          if (next === value) return;
          onChange(next);
        }}
      >
        {APPLICATION_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABEL[status]}
          </option>
        ))}
      </select>
      <ChevronDownIcon aria-hidden="true" />
    </label>
  );
}
