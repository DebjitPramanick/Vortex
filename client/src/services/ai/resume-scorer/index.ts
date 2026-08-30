class ResumeScorer {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.apiUrl = "https://api.resume-scorer.com";
  }
}
