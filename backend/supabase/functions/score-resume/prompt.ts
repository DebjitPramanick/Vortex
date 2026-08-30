// supabase/functions/score-resume/prompt.ts
export function buildPrompt(
  jobDescription: string,
  resumeText: string,
): string {
  return `You are an ATS-style resume evaluator. Compare the resume against the job description.
  Return ONLY valid JSON with this exact shape:
  {"score": number 0-100, "matched_skills": string[], "missing_skills": string[], "summary": string}
  
  Score based on skills, experience relevance, and keyword alignment.
  List specific JD requirements that ARE present in the resume, and specific ones that are MISSING.
  Give a 2-3 sentence summary of fit.
  
  JOB DESCRIPTION:
  ${jobDescription}
  
  RESUME:
  ${resumeText}`;
}
