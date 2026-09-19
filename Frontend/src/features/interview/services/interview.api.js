import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export const generateInterviewReport = async ({
  jobDescription,
  resumeFile,
  selfDescription
}) => {

  const formData = new FormData();

  formData.append("jobDescription", jobDescription);
  formData.append("selfDescription", selfDescription);
  formData.append("resume", resumeFile);


  try {

    const response = await api.post(
      "/api/interview",
      formData
    );

    console.log("INTERVIEW API RESPONSE:", response.data);

    return response.data;

  } catch (error) {

    console.error("========== INTERVIEW API ERROR ==========");
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);
    console.error("Message:", error.message);
    console.error("========================================");

    throw error;
  }
};

export const getInterviewReportById = async (interviewID) => {
  const response = await api.get(
    `/api/interview/reports/${interviewID}`
  );

  return response.data;
};

export const getAllInterviewReports = async () => {
  const response = await api.get(
    `/api/interview/reports`
  );

  return response.data;
};

export const generateResumePdf = async (interviewId) => {
  const response = await fetch(
    `http://localhost:3000/api/interview/resume/pdf/${interviewId}`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to generate resume PDF");
  }

  return await response.blob();
};