import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@components/atoms/button";
import { Card, CardBody, CardHeader, CardTitle } from "@components/atoms/card";
import { useApplicationStore } from "@store/useApplicationStore";
import { ApplicationTable } from "./ApplicationTable";
import { NewApplicationPopup } from "./NewApplicationPopup";

export function Applications() {
  const navigate = useNavigate();
  const { applications, loading, error, fetchAll } = useApplicationStore();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const closeCreate = useCallback(() => setCreateOpen(false), []);

  useEffect(() => {
    void fetchAll().catch(() => undefined);
  }, [fetchAll]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((row) =>
      `${row.company} ${row.role} ${row.location} ${row.id}`
        .toLowerCase()
        .includes(q),
    );
  }, [applications, query]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="vx-page-title">Applications</h1>
          <p className="mt-1 text-[13px] text-vortex-secondary">
            Track every role from saved to offer.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={() => setCreateOpen(true)}
        >
          New application
        </Button>
      </div>

      <label className="block max-w-80">
        <span className="sr-only">Search applications</span>
        <input
          className="vx-input"
          placeholder="Search company, role, or ID"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <Card size="sm">
        <CardHeader className="mb-0 border-b border-vortex-border px-4 py-3">
          <CardTitle>Pipeline</CardTitle>
          <span className="vx-meta">
            {loading ? "Loading…" : `${filtered.length} rows`}
          </span>
        </CardHeader>
        <CardBody className="p-0">
          {error ? (
            <p className="px-4 py-6 text-[13px] text-vortex-error">{error}</p>
          ) : (
            <ApplicationTable
              applications={filtered}
              onRowClick={(row) => navigate(`/applications/${row.id}`)}
            />
          )}
        </CardBody>
      </Card>

      <NewApplicationPopup
        open={createOpen}
        onClose={closeCreate}
        onCreated={(created) => navigate(`/applications/${created.id}`)}
      />
    </div>
  );
}
