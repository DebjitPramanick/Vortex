import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@components/atoms/button";
import type { NewApplication } from "@app-types/application";
import {
  APPLICATION_STATUSES,
  CURRENCIES,
} from "@utils/fetchJobDetailsFromUrl";
import "./index.css";

const schema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  location: z.string().min(1, "Location is required"),
  job_url: z.string().url("Enter a valid job URL"),
  applied_at: z.string().min(1, "Applied date is required"),
  status: z.enum(APPLICATION_STATUSES),
  salary_amount: z
    .string()
    .refine(
      (value) => value.trim() === "" || Number(value) > 0,
      "Enter a valid salary",
    ),
  salary_currency: z.enum(CURRENCIES),
});

export type ManualApplicationFormProps = {
  initialValues?: Partial<NewApplication>;
  submitting?: boolean;
  submitError?: string | null;
  onSubmit: (values: NewApplication) => Promise<void> | void;
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ManualApplicationForm({
  initialValues,
  submitting = false,
  submitError,
  onSubmit,
}: ManualApplicationFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      company: initialValues?.company ?? "",
      role: initialValues?.role ?? "",
      location: initialValues?.location ?? "",
      job_url: initialValues?.job_url ?? "",
      applied_at: initialValues?.applied_at?.slice(0, 10) ?? today(),
      status: initialValues?.status ?? "saved",
      salary_amount:
        initialValues?.salary?.amount != null
          ? String(initialValues.salary.amount)
          : "",
      salary_currency: initialValues?.salary?.currency ?? "USD",
    },
  });

  return (
    <form
      id="manual-application-form"
      className="vx-app-form"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit({
          company: values.company,
          role: values.role,
          location: values.location,
          job_url: values.job_url,
          applied_at: values.applied_at,
          status: values.status,
          salary:
            values.salary_amount.trim() === ""
              ? null
              : {
                  amount: Number(values.salary_amount),
                  currency: values.salary_currency,
                },
          job_description: initialValues?.job_description ?? null,
        });
      })}
      noValidate
    >
      {submitError ? <p className="vx-app-banner">{submitError}</p> : null}

      <label className="vx-app-field">
        <span className="vx-app-label">Company</span>
        <input className="vx-input" {...form.register("company")} />
        {form.formState.errors.company ? (
          <p className="vx-app-error">
            {form.formState.errors.company.message}
          </p>
        ) : null}
      </label>

      <label className="vx-app-field">
        <span className="vx-app-label">Role</span>
        <input className="vx-input" {...form.register("role")} />
        {form.formState.errors.role ? (
          <p className="vx-app-error">{form.formState.errors.role.message}</p>
        ) : null}
      </label>

      <label className="vx-app-field">
        <span className="vx-app-label">Location</span>
        <input className="vx-input" {...form.register("location")} />
        {form.formState.errors.location ? (
          <p className="vx-app-error">
            {form.formState.errors.location.message}
          </p>
        ) : null}
      </label>

      <label className="vx-app-field">
        <span className="vx-app-label">Status</span>
        <select className="vx-input" {...form.register("status")}>
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        {form.formState.errors.status ? (
          <p className="vx-app-error">{form.formState.errors.status.message}</p>
        ) : null}
      </label>

      <label className="vx-app-field">
        <span className="vx-app-label">Salary amount (optional)</span>
        <input
          className="vx-input"
          type="number"
          min={1}
          step={1}
          {...form.register("salary_amount")}
        />
        {form.formState.errors.salary_amount ? (
          <p className="vx-app-error">
            {form.formState.errors.salary_amount.message}
          </p>
        ) : null}
      </label>

      <label className="vx-app-field">
        <span className="vx-app-label">Currency</span>
        <select className="vx-input" {...form.register("salary_currency")}>
          {CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        {form.formState.errors.salary_currency ? (
          <p className="vx-app-error">
            {form.formState.errors.salary_currency.message}
          </p>
        ) : null}
      </label>

      <label className="vx-app-field vx-app-form-span">
        <span className="vx-app-label">Job URL</span>
        <input className="vx-input" type="url" {...form.register("job_url")} />
        {form.formState.errors.job_url ? (
          <p className="vx-app-error">
            {form.formState.errors.job_url.message}
          </p>
        ) : null}
      </label>

      <label className="vx-app-field vx-app-form-span">
        <span className="vx-app-label">Applied date</span>
        <input
          className="vx-input"
          type="date"
          {...form.register("applied_at")}
        />
        {form.formState.errors.applied_at ? (
          <p className="vx-app-error">
            {form.formState.errors.applied_at.message}
          </p>
        ) : null}
      </label>

      <Button
        type="submit"
        variant="primary"
        loading={submitting}
        className="vx-app-form-span"
      >
        Create application
      </Button>
    </form>
  );
}
