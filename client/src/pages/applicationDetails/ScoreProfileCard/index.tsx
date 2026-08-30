import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/atoms/card";
import { Button } from "@components/atoms/button";
import { useProfileStore } from "@store/useProfileStore";
import { useResumeScoreStore } from "@store/useResumeScoreStore";
import type { JobApplication } from "@app-types/application";
import type { ResumeScore } from "@app-types/resumeScore";
import ResumeScorer from "../../../services/ai/resume-scorer";
import TrophyIcon from "@icons/trophy.svg";

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
  const { profiles, fetchAll } = useProfileStore();
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
      const result = await new ResumeScorer(selectedProfile, application).score();
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
        caught instanceof Error ? caught.message : "Could not score this profile.",
      );
    } finally {
      setScoring(false);
    }
  }

  return (
    <Card className="lg:col-span-1">
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
            <select
              className="vx-input"
              value={profileId}
              disabled={scoring}
              onChange={(event) => setProfileId(event.target.value)}
            >
              <option value="">Select a profile</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
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

          <Button
            size="sm"
            variant="primary"
            icon={<TrophyIcon />}
            loading={scoring}
            disabled={!canScore}
            onClick={() => void handleScore()}
          >
            Score profile
          </Button>

          {error ? (
            <p className="text-[13px] text-vortex-error">{error}</p>
          ) : null}

          {application.resume_score != null ? (
            <div className="border-t border-vortex-border pt-3">
              <p className="text-[12px] font-medium text-vortex-secondary">
                Overall score
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-vortex-fg">
                {application.resume_score}
                <span className="ml-1 text-[13px] font-normal text-vortex-muted">
                  / 100
                </span>
              </p>
              {latestScore?.summary ? (
                <p className="mt-2 text-[13px] leading-5 text-vortex-fg">
                  {latestScore.summary}
                </p>
              ) : null}
              {latestScore?.model ? (
                <p className="vx-meta mt-2">{latestScore.model}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
