import { useState } from "react";
import { Button } from "@components/atoms/button";
import { fetchJobDetailsFromUrl, type FetchedJobDetails } from "@utils";
import "./index.css";

export type FetchJobFromUrlProps = {
  onFetched: (details: FetchedJobDetails) => void;
};

export function FetchJobFromUrl({ onFetched }: FetchJobFromUrlProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setError(null);
    setLoading(true);
    try {
      const details = await fetchJobDetailsFromUrl(url);
      onFetched(details);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not fetch job details from this URL.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vx-fetch-form">
      <label className="vx-fetch-label" htmlFor="job-listing-url">
        Job listing URL
      </label>
      <div className="vx-fetch-row">
        <input
          id="job-listing-url"
          className="vx-input"
          type="url"
          placeholder="https://"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleFetch();
            }
          }}
        />
        <Button
          type="button"
          variant="primary"
          loading={loading}
          disabled={!url.trim()}
          onClick={() => void handleFetch()}
        >
          Fetch
        </Button>
      </div>
      {error ? <p className="vx-fetch-error">{error}</p> : null}
    </div>
  );
}
