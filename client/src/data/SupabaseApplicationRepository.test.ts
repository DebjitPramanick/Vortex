import { describe, expect, it } from "vitest";
import { SupabaseApplicationRepository } from "./SupabaseApplicationRepository.ts";
import type { JobApplication, NewApplication, StatusHistoryEntry } from "../types/application.ts";
import type { Database } from "../types/database.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

type AppRow = JobApplication;
type HistoryRow = StatusHistoryEntry;

const sampleLocation = {
  name: "Remote",
  country: "",
  countryCode: "",
  lat: 0,
  lng: 0,
};

const sampleInput: NewApplication = {
  company: "Linear",
  role: "Product Engineer",
  location: sampleLocation,
  job_url: "https://linear.app/careers",
  applied_at: "2026-08-29",
  source: "linkedin",
  salary: { amount: 180000, currency: "USD" },
};

function createMockClient() {
  const apps = new Map<string, AppRow>();
  const history: HistoryRow[] = [];
  let ids = 0;

  const auth = {
    getUser: async () => ({
      data: { user: { id: "user-1" } },
      error: null,
    }),
  };

  const from = (table: string) => {
    if (table === "job_applications") {
      return createApplicationsBuilder(apps, () => {
        ids += 1;
        return `app-${ids}`;
      });
    }
    if (table === "status_history") {
      return createHistoryBuilder(history, () => {
        ids += 1;
        return `hist-${ids}`;
      });
    }
    throw new Error(`Unknown table ${table}`);
  };

  return {
    client: { from, auth } as unknown as SupabaseClient<Database>,
    apps,
    history,
  };
}

function createApplicationsBuilder(
  apps: Map<string, AppRow>,
  nextId: () => string,
) {
  let filters: { id?: string } = {};
  let payload: Partial<AppRow> | null = null;
  let action: "select" | "insert" | "update" | "delete" = "select";

  const builder = {
    select() {
      return builder;
    },
    insert(row: Partial<AppRow>) {
      action = "insert";
      payload = row;
      return builder;
    },
    update(row: Partial<AppRow>) {
      action = "update";
      payload = row;
      return builder;
    },
    delete() {
      action = "delete";
      return builder;
    },
    eq(column: string, value: string) {
      if (column === "id") filters = { id: value };
      return builder;
    },
    order() {
      return builder;
    },
    maybeSingle() {
      return execute("maybe");
    },
    single() {
      return execute("single");
    },
    then(
      resolve: (value: unknown) => unknown,
      reject?: (reason: unknown) => unknown,
    ) {
      return execute("many").then(resolve, reject);
    },
  };

  async function execute(mode: "many" | "single" | "maybe") {
    if (action === "insert" && payload) {
      const now = "2026-08-29T00:00:00.000Z";
      const row: AppRow = {
        id: nextId(),
        user_id: payload.user_id ?? "user-1",
        company: payload.company ?? "",
        role: payload.role ?? "",
        salary: payload.salary ?? null,
        status: payload.status ?? "saved",
        source: payload.source ?? null,
        location: payload.location ?? sampleLocation,
        job_url: payload.job_url ?? "",
        job_description: payload.job_description ?? null,
        job_type: payload.job_type ?? null,
        notes: payload.notes ?? null,
        profile_id: payload.profile_id ?? null,
        resume_score_id: payload.resume_score_id ?? null,
        resume_score: payload.resume_score ?? null,
        applied_at: payload.applied_at ?? now,
        created_at: now,
        updated_at: now,
      };
      apps.set(row.id, row);
      return { data: mode === "many" ? [row] : row, error: null };
    }

    if (action === "update" && payload && filters.id) {
      const current = apps.get(filters.id);
      if (!current) {
        return { data: null, error: { message: "Not found" } };
      }
      const updated = { ...current, ...payload, updated_at: "2026-08-29T01:00:00.000Z" };
      apps.set(filters.id, updated);
      return { data: mode === "many" ? [updated] : updated, error: null };
    }

    if (action === "delete" && filters.id) {
      apps.delete(filters.id);
      return { data: null, error: null };
    }

    const rows = [...apps.values()].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
    if (filters.id) {
      const row = apps.get(filters.id) ?? null;
      if (mode === "maybe") return { data: row, error: null };
      return { data: row, error: row ? null : { message: "Not found" } };
    }
    return { data: rows, error: null };
  }

  return builder;
}

function createHistoryBuilder(history: HistoryRow[], nextId: () => string) {
  let applicationId: string | undefined;
  let payload: Partial<HistoryRow> | null = null;
  let action: "select" | "insert" = "select";

  const builder = {
    select() {
      return builder;
    },
    insert(row: Partial<HistoryRow>) {
      action = "insert";
      payload = row;
      return builder;
    },
    eq(column: string, value: string) {
      if (column === "application_id") applicationId = value;
      return builder;
    },
    order() {
      return builder;
    },
    then(
      resolve: (value: unknown) => unknown,
      reject?: (reason: unknown) => unknown,
    ) {
      return execute().then(resolve, reject);
    },
  };

  async function execute() {
    if (action === "insert" && payload) {
      const row: HistoryRow = {
        id: nextId(),
        application_id: payload.application_id ?? "",
        from_status: payload.from_status ?? null,
        to_status: payload.to_status ?? "saved",
        changed_at: "2026-08-29T01:00:00.000Z",
      };
      history.push(row);
      return { data: row, error: null };
    }

    const rows = history.filter((entry) =>
      applicationId ? entry.application_id === applicationId : true,
    );
    return { data: rows, error: null };
  }

  return builder;
}

describe("SupabaseApplicationRepository", () => {
  it("creates and lists applications for the signed-in user", async () => {
    const { client } = createMockClient();
    const repo = new SupabaseApplicationRepository(client);

    const created = await repo.create(sampleInput);

    expect(created.company).toBe("Linear");
    expect(created.status).toBe("saved");
    expect(created.user_id).toBe("user-1");
    expect(created.location).toEqual(sampleLocation);
    expect(created.job_url).toBe("https://linear.app/careers");
    expect(created.source).toBe("linkedin");
    expect(created.salary).toEqual({ amount: 180000, currency: "USD" });

    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe(created.id);
  });

  it("returns null when getById does not match", async () => {
    const { client } = createMockClient();
    const repo = new SupabaseApplicationRepository(client);

    await expect(repo.getById("missing")).resolves.toBeNull();
  });

  it("writes status_history when status changes", async () => {
    const { client, history } = createMockClient();
    const repo = new SupabaseApplicationRepository(client);
    const created = await repo.create({
      ...sampleInput,
      company: "Vercel",
      role: "Frontend Engineer",
      status: "saved",
    });

    const updated = await repo.update(created.id, { status: "applied" });

    expect(updated.status).toBe("applied");
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({
      application_id: created.id,
      from_status: "saved",
      to_status: "applied",
    });

    const entries = await repo.getStatusHistory(created.id);
    expect(entries).toHaveLength(1);
  });

  it("persists profile and resume score fields", async () => {
    const { client } = createMockClient();
    const repo = new SupabaseApplicationRepository(client);
    const created = await repo.create(sampleInput);

    const updated = await repo.update(created.id, {
      profile_id: "profile-1",
      resume_score_id: "score-1",
      resume_score: 82,
    });

    expect(updated.profile_id).toBe("profile-1");
    expect(updated.resume_score_id).toBe("score-1");
    expect(updated.resume_score).toBe(82);
  });

  it("deletes an application", async () => {
    const { client } = createMockClient();
    const repo = new SupabaseApplicationRepository(client);
    const created = await repo.create({
      ...sampleInput,
      company: "Notion",
      role: "Full Stack Engineer",
    });

    await repo.remove(created.id);

    await expect(repo.getById(created.id)).resolves.toBeNull();
    await expect(repo.getAll()).resolves.toEqual([]);
  });
});
