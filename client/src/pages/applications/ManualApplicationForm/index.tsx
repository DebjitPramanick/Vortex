import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@components/atoms/button";
import { LocationFinder } from "@components/molecules/location-finder";
import { Select } from "@components/molecules/select";
import type { Location, NewApplication, JobSource } from "@app-types";
import { formatLocation } from "@utils";
import "./index.css";
import {
  APPLICATION_STATUSES,
  CURRENCIES,
  JOB_TYPES,
  JOB_SOURCES,
  JOB_SOURCE_LABELS,
} from "@constants";

const schema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  location: z
    .object({
      name: z.string().min(1),
      country: z.string(),
      countryCode: z.string(),
      lat: z.number(),
      lng: z.number(),
    })
    .nullable()
    .refine((value) => value !== null, {
      message: "Select a location from the list",
    }),
  job_url: z.string().refine((value) => {
    const trimmed = value.trim();
    if (trimmed === "") return true;
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }, "Enter a valid job URL"),
  applied_at: z.string().min(1, "Applied date is required"),
  status: z.enum(APPLICATION_STATUSES),
  salary_amount: z
    .string()
    .refine(
      (value) => value.trim() === "" || Number(value) > 0,
      "Enter a valid salary",
    ),
  salary_currency: z.enum(CURRENCIES),
  job_type: z.enum(JOB_TYPES).nullable(),
  source: z.enum(JOB_SOURCES).nullable(),
  notes: z.string(),
});

export type ManualApplicationFormProps = {
  formId?: string;
  hideSubmit?: boolean;
  submitLabel?: string;
  initialValues?: Partial<NewApplication>;
  submitting?: boolean;
  submitError?: string | null;
  onSubmit: (values: NewApplication) => Promise<void> | void;
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function selectedLocation(
  location: NewApplication["location"] | undefined,
): Location | null {
  if (!location) return null;
  return formatLocation(location) === "—" ? null : location;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ManualApplicationForm({
  formId = "manual-application-form",
  hideSubmit = false,
  submitLabel = "Create application",
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
      location: selectedLocation(initialValues?.location),
      job_url: initialValues?.job_url ?? "",
      applied_at: initialValues?.applied_at?.slice(0, 10) ?? today(),
      status: initialValues?.status ?? "saved",
      salary_amount:
        initialValues?.salary?.amount != null
          ? String(initialValues.salary.amount)
          : "",
      salary_currency: initialValues?.salary?.currency ?? "USD",
      job_type: initialValues?.job_type ?? null,
      source: initialValues?.source ?? null,
      notes: initialValues?.notes ?? "",
    },
  });

  return (
    <form
      id={formId}
      className="vx-app-form"
      onSubmit={form.handleSubmit(async (values) => {
        if (!values.location) return;
        await onSubmit({
          company: values.company,
          role: values.role,
          location: values.location,
          job_url: values.job_url.trim(),
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
          job_type: values.job_type,
          source: values.source,
          notes: values.notes.trim() === "" ? null : values.notes,
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
        <Controller
          name="location"
          control={form.control}
          render={({ field, fieldState }) => (
            <>
              <LocationFinder
                value={field.value}
                disabled={submitting}
                onChange={field.onChange}
              />
              {fieldState.error ? (
                <p className="vx-app-error">{fieldState.error.message}</p>
              ) : null}
            </>
          )}
        />
      </label>

      <label className="vx-app-field">
        <span className="vx-app-label">Job type</span>
        <Controller
          name="job_type"
          control={form.control}
          render={({ field }) => (
            <Select
              disabled={submitting}
              value={field.value ?? ""}
              placeholder="Not set"
              options={[
                { value: "", label: "Not set" },
                ...JOB_TYPES.map((jobType) => ({
                  value: jobType,
                  label: titleCase(jobType),
                })),
              ]}
              onChange={(value) =>
                field.onChange(
                  value === "" ? null : (value as (typeof JOB_TYPES)[number]),
                )
              }
            />
          )}
        />
        {form.formState.errors.job_type ? (
          <p className="vx-app-error">
            {form.formState.errors.job_type.message}
          </p>
        ) : null}
      </label>

      <label className="vx-app-field">
        <span className="vx-app-label">Status</span>
        <Controller
          name="status"
          control={form.control}
          render={({ field }) => (
            <Select
              disabled={submitting}
              value={field.value}
              options={APPLICATION_STATUSES.map((status) => ({
                value: status,
                label: titleCase(status),
              }))}
              onChange={field.onChange}
            />
          )}
        />
        {form.formState.errors.status ? (
          <p className="vx-app-error">{form.formState.errors.status.message}</p>
        ) : null}
      </label>

      <label className="vx-app-field">
        <span className="vx-app-label">Source</span>
        <Controller
          name="source"
          control={form.control}
          render={({ field }) => (
            <Select
              disabled={submitting}
              value={field.value ?? ""}
              placeholder="Not set"
              options={[
                { value: "", label: "Not set" },
                ...JOB_SOURCES.map((source) => ({
                  value: source,
                  label: JOB_SOURCE_LABELS[source],
                })),
              ]}
              onChange={(value) =>
                field.onChange(value === "" ? null : (value as JobSource))
              }
            />
          )}
        />
        {form.formState.errors.source ? (
          <p className="vx-app-error">{form.formState.errors.source.message}</p>
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
        <Controller
          name="salary_currency"
          control={form.control}
          render={({ field }) => (
            <Select
              disabled={submitting}
              value={field.value}
              options={CURRENCIES.map((currency) => ({
                value: currency,
                label: currency,
              }))}
              onChange={field.onChange}
            />
          )}
        />
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

      <label className="vx-app-field vx-app-form-span">
        <span className="vx-app-label">Notes</span>
        <textarea className="vx-input" rows={4} {...form.register("notes")} />
        {form.formState.errors.notes ? (
          <p className="vx-app-error">{form.formState.errors.notes.message}</p>
        ) : null}
      </label>

      {hideSubmit ? null : (
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          className="vx-app-form-span"
        >
          {submitLabel}
        </Button>
      )}
    </form>
  );
}
