import { useCallback, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/atoms/card";
import { Button } from "@components/atoms/button";
import type { Profile } from "@app-types/profile";
import "./index.css";
import { TextSearchIcon } from "@icons";
import { ResumeParser } from "@services";
import { useProfileStore } from "@store/useProfileStore";
import { Chip } from "@components/molecules/chip";

export type ProfileGridProps = {
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

export function ProfileGrid({
  profiles,
  loading,
  onOpenResume,
}: ProfileGridProps) {
  const { getResumeUrl, update } = useProfileStore();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

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
        <div className="vx-profile-grid">
          {visible.map((profile) => (
            <Card
              key={profile.id}
              className="vx-profile-card"
              role="button"
              tabIndex={0}
              onClick={() => onOpenResume?.(profile)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenResume?.(profile);
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
      )}
    </div>
  );
}
