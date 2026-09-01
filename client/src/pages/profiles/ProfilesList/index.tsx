import type { Profile } from "@app-types";
import { format, parseISO } from "date-fns";
import { useProfileStore } from "@store/useProfileStore";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { ResumeParser } from "@services";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
} from "@components/atoms/card";
import { Button } from "@components/atoms/button";
import { Chip } from "@components/molecules/chip";
import { ExternalLinkIcon, TextSearchIcon } from "@icons";
import "./index.css";
import Skeleton from "@components/molecules/skeleton";

export type ProfilesListProps = {
  profiles: Profile[];
  loading?: boolean;
  onOpenResume?: (profile: Profile) => void;
};

function formatDate(value: string): string {
  try {
    return format(parseISO(value), "d MMM yyyy");
  } catch {
    return value;
  }
}

function matchesQuery(profile: Profile, query: string): boolean {
  if (!query) return true;
  const haystack =
    `${profile.name} ${profile.resume_file_name} ${profile.notes ?? ""} ${profile.id}`.toLowerCase();
  return haystack.includes(query);
}

const ProfilesList = ({
  profiles,
  loading,
  onOpenResume,
}: ProfilesListProps) => {
  const { getResumeUrl, update } = useProfileStore();
  const [query, setQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [fetchingResumeUrl, setFetchingResumeUrl] = useState(false);
  const [resumeIframeHeight, setResumeIframeHeight] = useState<string>("");

  const profileViewerHeaderRef = useRef<HTMLDivElement>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const activeProfile = useMemo(
    () => selectedProfile ?? profiles[0] ?? null,
    [selectedProfile, profiles],
  );

  const visible = useMemo(
    () => profiles.filter((profile) => matchesQuery(profile, normalizedQuery)),
    [profiles, normalizedQuery],
  );

  const handleParseResume = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>, profile: Profile) => {
      event.stopPropagation();
      event.preventDefault();
      try {
        const resumeUrl = await getResumeUrl(profile.resume_path);
        const result = await fetch(resumeUrl);
        const blob = await result.blob();
        const resumeFile = new File([blob], profile.resume_file_name);
        const parser = new ResumeParser(resumeFile);
        const resumeText = await parser.parse();
        await update(profile.id, {
          resume_text: resumeText,
        });
      } catch (error) {
        console.error(error);
      }
    },
    [getResumeUrl, update],
  );

  const fetchResume = useCallback(
    async (profile: Profile) => {
      setFetchingResumeUrl(true);
      try {
        const resumeUrl = await getResumeUrl(profile.resume_path);
        setResumeUrl(resumeUrl);
      } catch (error) {
        console.error(error);
      } finally {
        setFetchingResumeUrl(false);
      }
    },
    [getResumeUrl],
  );

  const handleOpenResume = useCallback(() => {
    if (activeProfile) {
      onOpenResume?.(activeProfile);
    }
  }, [activeProfile, onOpenResume]);

  const handleSelectProfile = useCallback(
    (profile: Profile) => {
      setSelectedProfile(profile);
      fetchResume(profile);
    },
    [fetchResume],
  );

  useEffect(() => {
    if (activeProfile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchResume(activeProfile);
    }
  }, [activeProfile]);

  useEffect(() => {
    if (profileViewerHeaderRef.current) {
      const iframeHeight = `calc(100% - ${profileViewerHeaderRef.current.clientHeight}px)`;
      setResumeIframeHeight(iframeHeight);
    }
  }, [profileViewerHeaderRef]);

  return (
    <div className="vx-profile-grid-shell">
      <label className="vx-profile-search">
        <span className="sr-only">Search profiles</span>
        <input
          className="vx-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search profiles"
        />
      </label>

      {loading ? (
        <p className="vx-profile-grid-status">Loading profiles…</p>
      ) : visible.length === 0 ? (
        <p className="vx-profile-grid-status">
          {profiles.length === 0
            ? "No profiles yet. Create one and upload a resume PDF."
            : "No profiles match this search."}
        </p>
      ) : (
        <div className="vx-profile-container">
          <div className="vx-profiles-list">
            {visible.map((profile) => (
              <Card
                key={profile.id}
                className="vx-profile-card"
                role="button"
                tabIndex={0}
                onClick={() => handleSelectProfile(profile)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleSelectProfile(profile);
                  }
                }}
              >
                <CardHeader>
                  <div>
                    <CardTitle>{profile.name}</CardTitle>
                    <CardDescription>
                      Created {formatDate(profile.created_at)}
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={(e) => handleParseResume(e, profile)}
                  >
                    <TextSearchIcon />
                  </Button>
                </CardHeader>
                <CardBody>
                  <p className="vx-profile-card-notes">
                    {profile.notes?.trim() ? profile.notes : "No notes"}
                  </p>
                </CardBody>
                <CardFooter>
                  <Chip size="sm" variant="applied">
                    {profile.resume_file_name}
                  </Chip>
                  <Chip size="sm" variant="offer">
                    {profile.resume_text ? "Parsed" : "Not parsed"}
                  </Chip>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="vx-profile-viewer">
            <div
              className="vx-profile-viewer-header"
              ref={profileViewerHeaderRef}
            >
              <h2 className="text-lg font-bold">{activeProfile?.name}</h2>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleOpenResume}
              >
                <ExternalLinkIcon />
              </Button>
            </div>
            {fetchingResumeUrl ? (
              <Skeleton height="100%" />
            ) : resumeUrl ? (
              <iframe
                src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                title="Profile Viewer"
                allow="clipboard-read; clipboard-write"
                className="vx-profile-viewer-iframe"
                style={{ height: resumeIframeHeight }}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilesList;
