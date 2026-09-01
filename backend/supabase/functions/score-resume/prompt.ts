// supabase/functions/score-resume/prompt.ts
export function buildPrompt(
  jobDescription: string,
  resumeText: string,
): string {
  return `You are an ATS-style resume evaluator. Compare the resume against the job description.
  Return ONLY valid JSON with this exact shape:
  {"score": number 0-100, "matched_skills": string[], "missing_skills": string[], "summary": string}

  Score based on this specific JD, not the resume alone.

  - Distinguish REQUIRED vs PREFERRED skills/qualifications; prioritize required ones when scoring.
  - Do NOT penalize missing skills that are clearly irrelevant to this role.
  - In "missing_skills", include only genuinely missing qualifications; if the resume appears to have the qualification but communicates it poorly, do not treat it as missing.
  - Prioritize accomplishments, measurable outcomes, and business/technical impact over responsibility lists.
  - Evaluate whether the resume demonstrates the ownership, scope, decision-making, and seniority expected by the JD.
  - Consider both ATS compatibility (relevant terminology, clear structure) and human recruiter readability.
  - Prefer evidence that clearly answers: What did they do? How did they do it? What changed because of it?
  - Do not invent experience or give credit based solely on unrelated/weak keyword matches.
  - List specific JD requirements that ARE present in the resume, and specific ones that are MISSING.
  - Give a 2-3 sentence summary of fit.
  
  JOB DESCRIPTION:
  ${jobDescription}
  
  RESUME:
  ${resumeText}`;
}
