import { useCallback, useEffect, useState } from "react";
import { Button } from "@components/atoms/button";
import { useProfileStore } from "@store/useProfileStore";
import { NewProfilePopup } from "./NewProfilePopup";
import { ProfileGrid } from "./ProfileGrid";

function Profiles() {
  const { profiles, loading, error, fetchAll, getResumeUrl } =
    useProfileStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  const closeCreate = useCallback(() => setCreateOpen(false), []);

  useEffect(() => {
    void fetchAll().catch(() => undefined);
  }, [fetchAll]);

  async function handleOpenResume(resumePath: string) {
    setOpenError(null);
    try {
      const url = await getResumeUrl(resumePath);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (caught) {
      setOpenError(
        caught instanceof Error ? caught.message : "Could not open resume.",
      );
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-shrink-0 flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="vx-page-title">Profiles</h1>
          <p className="mt-1 text-[13px] text-vortex-secondary">
            Keep named resume versions ready to send.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={() => setCreateOpen(true)}
        >
          New profile
        </Button>
      </div>

      {error ? <p className="text-[13px] text-vortex-error">{error}</p> : null}
      {openError ? (
        <p className="text-[13px] text-vortex-error">{openError}</p>
      ) : null}

      <ProfileGrid
        profiles={profiles}
        loading={loading}
        onOpenResume={(row) => void handleOpenResume(row.resume_path)}
      />

      <NewProfilePopup open={createOpen} onClose={closeCreate} />
    </div>
  );
}

export default Profiles;
