import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@components/atoms/button";
import { useApplicationStore } from "@store/useApplicationStore";
import { ApplicationTable } from "./ApplicationTable";
import { NewApplicationPopup } from "./NewApplicationPopup";

export function Applications() {
  const navigate = useNavigate();
  const { applications, loading, error, fetchAll } = useApplicationStore();
  const [createOpen, setCreateOpen] = useState(false);

  const closeCreate = useCallback(() => setCreateOpen(false), []);

  useEffect(() => {
    void fetchAll().catch(() => undefined);
  }, [fetchAll]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-shrink-0 flex-wrap items-end justify-between gap-3">
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

      {error ? (
        <p className="text-[13px] text-vortex-error">{error}</p>
      ) : null}

      <ApplicationTable
        applications={applications}
        loading={loading}
        onRowClick={(row) => navigate(`/applications/${row.id}`)}
      />

      <NewApplicationPopup
        open={createOpen}
        onClose={closeCreate}
        onCreated={(created) => navigate(`/applications/${created.id}`)}
      />
    </div>
  );
}
