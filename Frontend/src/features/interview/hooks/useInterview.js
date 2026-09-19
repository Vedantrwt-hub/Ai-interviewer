import { useCallback, useEffect, useState } from "react";
import {generateInterviewReport , getAllInterviewReports ,getInterviewReportById , generateResumePdf} from "../services/interview.api"
export function useInterview() {
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // Get all previous interview reports
  // ==========================================
  const getReports = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/interview/reports",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Server returned ${response.status}: ${text}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch interview reports"
        );
      }

      console.log("All reports response:", data);

      // Support different backend response formats
      const reportsData =
        data?.reports ||
        data?.interviewReports ||
        data?.interviewReport ||
        data ||
        [];

      setReports(
        Array.isArray(reportsData)
          ? reportsData
          : []
      );

    } catch (error) {
      console.error(
        "Error fetching interview reports:",
        error
      );

      setReports([]);
    }
  }, []);

  // ==========================================
  // Fetch reports when Home page loads
  // ==========================================
  useEffect(() => {
    getReports();
  }, [getReports]);

  // ==========================================
  // Generate new interview report
  // ==========================================
  const generateReport = useCallback(
    async (jobDescription, selfDescription, resumeFile) => {
      try {
        setLoading(true);

        const formData = new FormData();

        formData.append(
          "jobDescription",
          jobDescription
        );

        formData.append(
          "selfDescription",
          selfDescription
        );

        formData.append(
          "resume",
          resumeFile
        );

        const response = await fetch(
          "http://localhost:3000/api/interview",
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        const text = await response.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            `Server returned ${response.status}: ${text}`
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
            "Failed to generate interview report"
          );
        }

        console.log(
          "Generated report:",
          data
        );

        // Add newly generated report to reports
        const newReport =
          data?.interviewReport;

        if (newReport) {
          setReport(newReport);

          setReports((prevReports) => [
            newReport,
            ...prevReports,
          ]);
        }

        return data;

      } catch (error) {
        console.error(
          "Generate report error:",
          error
        );

        throw error;

      } finally {
        setLoading(false);
      }
    },
    []
  );
     const getResumePdf = async (interviewId) => {
      setLoading(true);

      try {
        console.log("Interview ID:", interviewId);

        const response = await generateResumePdf(interviewId);

        const url = window.URL.createObjectURL(
          new Blob([response], {
            type: "application/pdf",
          })
        );

        const link = document.createElement("a");

        link.href = url;
        link.download = `resume_${interviewId}.pdf`;

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);

      } catch (err) {
        console.error("Resume PDF error:", err);
      } finally {
        setLoading(false);
      }
    };

  // ==========================================
  // Get single interview report by ID
  // ==========================================
  const getReportById = useCallback(
    async (interviewId) => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:3000/api/interview/reports/${interviewId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const text = await response.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            `Server returned ${response.status}: ${text}`
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
            "Failed to fetch interview report"
          );
        }

        console.log(
          "Report response:",
          data
        );

        const interviewReport =
          data?.interviewReport || data;

        setReport(interviewReport);

        return interviewReport;

      } catch (error) {
        console.error(
          "Error fetching interview report:",
          error
        );

        setReport(null);

        throw error;

      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    report,
    reports,
    loading,
    generateReport,
    getReportById,
    getReports,
    getResumePdf
  };
}