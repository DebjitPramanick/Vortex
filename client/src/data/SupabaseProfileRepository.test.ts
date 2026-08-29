import { describe, expect, it } from "vitest";
import { safeResumeFileName } from "./SupabaseProfileRepository.ts";

describe("safeResumeFileName", () => {
  it("keeps a simple pdf name", () => {
    expect(safeResumeFileName("Resume.pdf")).toBe("Resume.pdf");
  });

  it("adds a pdf extension when missing", () => {
    expect(safeResumeFileName("frontend-resume")).toBe("frontend-resume.pdf");
  });

  it("strips unsafe characters", () => {
    expect(safeResumeFileName("Debjit Resume (v2).pdf")).toBe(
      "Debjit_Resume_v2_.pdf",
    );
  });
});
