import type { ApplicationStatus } from "@app-types/application";
import { APPLICATION_STATUSES } from "@utils/fetchJobDetailsFromUrl.helper";
import { SplitButton } from "@components/molecules/split-button";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const STATUS_ITEMS = APPLICATION_STATUSES.map((status) => ({
  id: status,
  label: STATUS_LABEL[status],
}));

export type StatusSelectProps = {
  value: ApplicationStatus;
  disabled?: boolean;
  onChange: (status: ApplicationStatus) => void;
};

export function StatusSelect({ value, disabled, onChange }: StatusSelectProps) {
  return (
    <SplitButton
      label={STATUS_LABEL[value]}
      items={STATUS_ITEMS}
      selectedId={value}
      disabled={disabled}
      ariaLabel="Application status"
      onSelect={(id) => onChange(id as ApplicationStatus)}
    />
  );
}
