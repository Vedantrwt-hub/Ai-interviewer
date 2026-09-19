import React,{useState,useRef} from "react";
import "../style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useNavigate } from "react-router";

function Home() {
  
  const { generateReport, loading, reports: interviewReports } = useInterview();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const resumeInputRef = useRef();
  const reports = interviewReports || [];
  const navigate = useNavigate();
  const handleGenerateReport = async () => {
  console.log("Generate clicked");

  const resumeFile =
    resumeInputRef.current?.files?.[0];

  if (!resumeFile) {
    alert("Please upload your resume PDF");
    return;
  }

  if (!jobDescription.trim()) {
    alert("Please enter the job description");
    return;
  }

  if (!selfDescription.trim()) {
    alert("Please enter your self-description");
    return;
  }

  try {
    const data = await generateReport(
      jobDescription,
      selfDescription,
      resumeFile
    );

    console.log("FINAL DATA:", data);

    const interviewId = data?.interviewReport?._id;

    if (!interviewId) {
      console.error(
        "Interview ID missing from response:",
        data
      );

      alert("Interview report was generated but ID was not returned.");
      return;
    }

    navigate(`/interview/${interviewId}`);

  } catch (error) {

    console.error(
      "Generate failed:",
      error.response?.data || error
    );

    alert(
      error.response?.data?.message ||
      "Failed to generate interview report"
    );
  }
};
  if(loading) {
    return (
      <main className="loading-screen">
        <h1>Generating your interview strategy...</h1>
      </main>
    );
  }

  return (
    <main className="home">
      <section className="home__intro" aria-labelledby="page-title">
        <div className="home__brand-mark" aria-hidden="true">IA</div>
        <p className="home__eyebrow">INTERVIEW AI / NEW SESSION</p>
        <h1 id="page-title">
          Create Your Custom <span>Interview Plan</span>
        </h1>
        <p className="home__description">
          Let our AI analyze the job requirements and your unique profile to build a
          winning strategy.
        </p>
      </section>

      <form className="interview-form">
        <div className="form-panel form-panel--job">
          <div className="panel-heading">
            <div className="panel-title">
              <span className="panel-icon panel-icon--pink" aria-hidden="true">+</span>
              <label htmlFor="jobDescription">Target Job Description</label>
            </div>
            <span className="panel-status">REQUIRED</span>
          </div>
          <textarea
          onChange={(e) => setJobDescription(e.target.value)}
            name="jobDescription"
            id="jobDescription"
            placeholder={'Paste the full job description here...\ne.g. Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design.'}
          />
          <div className="field-meta">
            <span>Be specific for better results</span>
            <span>0 / 5000 chars</span>
          </div>
        </div>

        <div className="form-panel form-panel--profile">
          <div className="panel-heading">
            <div className="panel-title">
              <span className="panel-icon panel-icon--pink" aria-hidden="true">+</span>
              <span>Your Profile</span>
            </div>
            <span className="panel-status">STEP 01</span>
          </div>

          <div className="field-group">
            <label htmlFor="resume">Upload Resume <span>PDF required</span></label>
            <label className="upload-box" htmlFor="resume">
              <span className="upload-box__icon" aria-hidden="true">&#8593;</span>
              <strong>Click to upload or drag &amp; drop</strong>
              <small>PDF only (Max 5MB)</small>
              <input ref={resumeInputRef} type="file" name="resume" id="resume" accept=".pdf"/>
            </label>
          </div>

          <div className="form-divider"><span>OR</span></div>

          <div className="field-group">
            <label htmlFor="selfDescription">Quick Self-Description</label>
            <textarea
              onChange={(e) => setSelfDescription(e.target.value)}
              className="self-description"
              name="selfDescription"
              id="selfDescription"
              placeholder="Briefly describe your experience, key skills, and years of experience in your field. Keep it concise."
            />
          </div>

          <p className="privacy-note">
            <span aria-hidden="true">i</span>
            Using a resume and self-description together generates a more personalized plan.
          </p>
        </div>

        <button className="generate-btn" type="button" onClick={handleGenerateReport}>
          <span aria-hidden="true">&#10024;</span>
          Generate My Interview Strategy
          <span className="generate-btn__arrow" aria-hidden="true">&#8594;</span>
        </button>
      </form>

{reports?.length > 0 && (
  <section className="recent-reports">

    <div className="recent-reports__heading">
      <h2>My Recent Interview Plans</h2>
    </div>

    <div className="recent-reports__grid">

      {reports.map((report) => {
        const reportId = report._id || report.id;

        return (
          <article
            key={reportId}
            className="report-card"
            onClick={() =>
              navigate(`/interview/${reportId}`)
            }
          >
            <h3>
              {report.title || "Untitled Position"}
            </h3>

            <p className="report-card__date">
              Generated on{" "}
              {report.createdAt
                ? new Date(
                    report.createdAt
                  ).toLocaleDateString()
                : "Unknown date"}
            </p>

            <p className="report-card__score">
              Match Score: {report.matchScore ?? 0}%
            </p>
          </article>
        );
      })}

    </div>
  </section>
)}
      <footer className="home__footer">
        <span>AI-Powered Strategy Generator</span>
        <nav aria-label="Footer links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#help">Help Center</a>
        </nav>
      </footer>
    </main>
  );
}

export default Home;