import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/atoms/card";
import { Button } from "@components/atoms/button";
import { Select } from "@components/molecules/select";
import { useProfileStore } from "@store/useProfileStore";
import { useResumeScoreStore } from "@store/useResumeScoreStore";
import type { JobApplication } from "@app-types/application";
import type { ResumeScore } from "@app-types/resumeScore";
import { ResumeScorer } from "@services";
import { ExternalLinkIcon, FireIcon, TrophyIcon } from "@icons";
import "./index.css";

type ScoreProfileCardProps = {
  application: JobApplication;
  onUpdate: (
    id: string,
    changes: Partial<
      Pick<JobApplication, "profile_id" | "resume_score_id" | "resume_score">
    >,
  ) => Promise<unknown>;
};

export function ScoreProfileCard({
  application,
  onUpdate,
}: ScoreProfileCardProps) {
  const { profiles, fetchAll, getResumeUrl } = useProfileStore();
  const { create, fetchById } = useResumeScoreStore();
  const [profileId, setProfileId] = useState(application.profile_id ?? "");
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestScore, setLatestScore] = useState<ResumeScore | null>(null);

  useEffect(() => {
    void fetchAll().catch(() => undefined);
  }, [fetchAll]);

  useEffect(() => {
    setProfileId(application.profile_id ?? "");
  }, [application.id, application.profile_id]);

  useEffect(() => {
    const scoreId = application.resume_score_id;
    if (!scoreId) {
      setLatestScore(null);
      return;
    }

    void fetchById(scoreId)
      .then((row) => setLatestScore(row))
      .catch(() => setLatestScore(null));
  }, [application.resume_score_id, fetchById]);

  const selectedProfile = profiles.find((profile) => profile.id === profileId);
  const canScore = Boolean(
    profileId &&
    selectedProfile?.resume_text?.trim() &&
    application.job_description?.trim(),
  );

  async function handleScore() {
    if (!selectedProfile) {
      setError("Select a profile to score.");
      return;
    }

    setError(null);
    setScoring(true);
    try {
      const result = await new ResumeScorer(
        selectedProfile,
        application,
      ).score();
      const saved = await create({
        application_id: application.id,
        score: result.score,
        matched_skills: result.matched_skills,
        missing_skills: result.missing_skills,
        summary: result.summary,
        model: result.model,
      });

      await onUpdate(application.id, {
        profile_id: selectedProfile.id,
        resume_score_id: saved.id,
        resume_score: saved.score,
      });
      setLatestScore(saved);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not score this profile.",
      );
    } finally {
      setScoring(false);
    }
  }

  async function handleOpenResume() {
    if (!selectedProfile?.resume_path) return;

    setError(null);
    try {
      const url = await getResumeUrl(selectedProfile.resume_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not open resume.",
      );
    }
  }

  const renderScoreIcon = () => {
    if (!application.resume_score) return null;
    if (application.resume_score >= 90) {
      return <FireIcon className="h-4 w-4 text-vortex-success" />;
    } else if (application.resume_score >= 85) {
      return <FireIcon className="h-4 w-4 text-vortex-warning" />;
    } else {
      return <FireIcon className="h-4 w-4 text-vortex-error" />;
    }
  };

  const scoreChipVariant = useMemo(() => {
    if (!application.resume_score) return "error";
    if (application.resume_score >= 90) return "success";
    if (application.resume_score >= 85) return "warning";
    return "error";
  }, [application.resume_score]);

  return (
    <Card variant="accent">
      <CardHeader>
        <div>
          <CardTitle>Resume score</CardTitle>
          <CardDescription>Match a profile to this listing</CardDescription>
        </div>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-vortex-secondary">
              Profile
            </span>
            <Select
              value={profileId}
              disabled={scoring}
              placeholder="Select a profile"
              options={[
                { value: "", label: "Select a profile" },
                ...profiles.map((profile) => ({
                  value: profile.id,
                  label: profile.name,
                })),
              ]}
              onChange={setProfileId}
            />
          </label>

          {profiles.length === 0 ? (
            <p className="text-[13px] text-vortex-secondary">
              No profiles yet.{" "}
              <Link
                to="/profiles"
                className="text-vortex-primary no-underline hover:underline"
              >
                Create one
              </Link>{" "}
              to score against this job.
            </p>
          ) : null}

          {selectedProfile && !selectedProfile.resume_text?.trim() ? (
            <p className="text-[13px] text-vortex-secondary">
              This profile has no parsed resume text. Parse it on the Profiles
              page first.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            {selectedProfile ? (
              <Button
                variant="secondary"
                className="flex-1"
                icon={<ExternalLinkIcon />}
                onClick={() => void handleOpenResume()}
              >
                View Profile
              </Button>
            ) : null}
            <Button
              variant="primary"
              className="flex-1"
              icon={<TrophyIcon />}
              loading={scoring}
              disabled={!canScore}
              onClick={() => void handleScore()}
            >
              Score profile
            </Button>
          </div>

          {error ? (
            <p className="text-[13px] text-vortex-error">{error}</p>
          ) : null}

          {application.resume_score != null ? (
            <div className="border-t border-vortex-border pt-3">
              <div className={`vx-score-chip ${scoreChipVariant}`}>
                {renderScoreIcon()}
                <p className="text-2xl font-semibold tabular-nums">
                  {application.resume_score}
                  <span className="ml-1 text-[13px] font-normal">/ 100</span>
                </p>
              </div>
              {latestScore?.summary ? (
                <p className="mt-2 text-[13px] leading-5 text-vortex-fg">
                  {latestScore.summary}
                </p>
              ) : null}
              {/* {latestScore?.model ? (
                <p className="vx-meta mt-2">{latestScore.model}</p>
              ) : null} */}
            </div>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
