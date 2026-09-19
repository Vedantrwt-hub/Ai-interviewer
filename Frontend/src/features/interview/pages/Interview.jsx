import { useMemo, useState, useEffect } from "react";
import "../style/interview.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useParams } from "react-router";
import { generateResumePdf } from "../services/interview.api.js";

const tabs = {
  technicalQuestions: "Technical questions",
  behavioralQuestions: "Behavioral questions",
  roadmap: "Road Map",
};

function Interview() {
  const [activeTab, setActiveTab] = useState("technicalQuestions");

  const { report,loading,getReportById,getResumePdf } = useInterview();
  const { interviewId } = useParams();

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId);
    }
  }, [interviewId, getReportById]);

  const activeItems = useMemo(() => {
    if (!report) {
      return [];
    }

    switch (activeTab) {
      case "technicalQuestions":
        return report.technicalQuestions || [];

      case "behavioralQuestions":
        return report.behavioralQuestions || [];

      case "roadmap":
        return report.preparationPlan || [];

      default:
        return [];
    }
  }, [activeTab, report]);

  if (loading) {
    return (
      <main className="interview-page">
        <div className="loading-screen">
          <h2>Loading interview report...</h2>
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="interview-page">
        <div className="loading-screen">
          <h2>Interview report not found.</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="interview-page">
      <div className="interview-layout">

      <aside
  className="interview-layout__nav"
  aria-label="Interview sections"
>
  <div className="sections-title">
    SECTIONS
  </div>

  <div className="nav-sections">
    {Object.entries(tabs).map(([key, label]) => (
      <button
        key={key}
        type="button"
        className={`nav-item ${
          activeTab === key ? "nav-item--active" : ""
        }`}
        onClick={() => setActiveTab(key)}
      >
        {label}
      </button>
    ))}
  </div>

<button
  type="button"
  onClick={() => getResumePdf(interviewId)}
  className="button danger-button"
>
  <svg
    height={"0.95rem"}
    style={{ marginRight: "0.8rem" }}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 11.7942 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956Z" />
  </svg>

  Download Resume
</button>
</aside>
        <section className="interview-layout__content">

          {activeTab === "roadmap" ? (
            <div className="roadmap-panel">

              <div className="panel-header">
                <span className="panel-badge">
                  Preparation plan
                </span>

                <span className="panel-score">
                  {report.matchScore}% match
                </span>
              </div>

              <div className="roadmap-list">
                {report.preparationPlan?.map((item, index) => (
                  <article
                    key={item.day ?? index}
                    className="roadmap-card"
                  >
                    <div className="roadmap-card__day">
                      Day {item.day}
                    </div>

                    <h3>{item.focus}</h3>

                    <p>{item.tasks}</p>
                  </article>
                ))}
              </div>

            </div>
          ) : (
            <div className="question-panel">

              <div className="panel-header">
                <span className="panel-badge">
                  AI review
                </span>

                <span className="panel-score">
                  {report.matchScore}% match
                </span>
              </div>

           <div className="question-list">
        {activeItems.length > 0 ? (
          activeItems.map((item, index) => (
            <article
              key={`${item.question ?? item.focus}-${index}`}
              className="question-card"
            >
              <h3>
                {item.question ?? item.focus}
              </h3>

              {item.intention && (
                <p className="question-intention">
                  {item.intention}
                </p>
              )}

              {(item.answer || item.tasks) && (
                <p className="question-answer">
                  {item.answer ?? item.tasks}
                </p>
              )}
            </article>
          ))
            ) : (
              <div className="empty-state">
                <h3>No questions available</h3>
                <p>
                  No questions were returned for this section.
                </p>
              </div>
            )}
          </div>

            </div>
          )}

        </section>

        <aside className="interview-layout__aside">
          <h2>Skill Gaps</h2>

          <div className="skill-gaps">
           {(report.skillGaps || report.skilGap || []).map(
            ({ skill, severity }) => (
                <span
                key={skill}
                className={`skill-pill skill-pill--${severity}`}
              >
                {skill}
              </span>
            )
          )}
          </div>
        </aside>

      </div>
    </main>
  );
}

export default Interview;