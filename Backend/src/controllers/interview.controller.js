const pdfparse = require("pdf-parse");
const {generateInterviewReport , generateResumePdf} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function generateInterviewReportController(req, res) {
  try {
    console.log("========== INTERVIEW REQUEST ==========");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : null);
    console.log("USER:", req.user);
    console.log("=======================================");

    // 1. Check resume
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume PDF file is required"
      });
    }

    // 2. Get form data
    const {
      selfDescription,
      jobDescription
    } = req.body;

    // 3. Validate text
    if (!selfDescription?.trim() || !jobDescription?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Self description and job description are required"
      });
    }

    // 4. Parse PDF
    const pdf = await new pdfparse.PDFParse(
      Uint8Array.from(req.file.buffer)
    );

    const resumeContent = await pdf.getText();

    console.log("Resume text length:", resumeContent.text?.length);

    // 5. Generate AI report
    const interviewReportByAi =
      await generateInterviewReport({
        resume: resumeContent.text,
        jobDescription,
        selfDescription
      });

    console.log("AI REPORT:", interviewReportByAi);

    // 6. Save to MongoDB
    const interviewReport =
      await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...interviewReportByAi
      });

    // 7. Send response
    return res.status(201).json({
      success: true,
      message: "Interview report generated successfully.",
      interviewReport
    });

  } catch (error) {
    console.error("Generate Interview Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate interview report",
      error: error.message
    });
  }
}

async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewID } = req.params;

    const interviewReport =
      await interviewReportModel.findOne({
        _id: interviewID,
        user: req.user.id
      });

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found"
      });
    }

    return res.status(200).json({
      interviewReport
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch interview report",
      error: error.message
    });
  }
}

async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports =
      await interviewReportModel
        .find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select(
          "-resume -jobDescription -selfDescription -_v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
        );

    return res.status(200).json({
      message: "Interview reports fetched successfully",
      interviewReports
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch interview reports",
      error: error.message
    });
  }
}

async function generateResumePdfController(req, res) {
  try {
    const { interviewReportID } = req.params;

    console.log("Interview Report ID:", interviewReportID);
    console.log("User ID:", req.user.id);

    // Find interview report belonging to logged-in user
    const interviewReport = await interviewReportModel.findOne({ _id: interviewReportID, user: req.user.id});

    if (!interviewReport) {
      return res.status(404).json({
        success: false,
        message: "Interview report not found."
      });
    }

    // Get required data
    const { resume, jobDescription, selfDescription } = interviewReport;

    // Generate PDF
    const pdfBuffer = await generateResumePdf({ resume, selfDescription, jobDescription});

    // Send PDF
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="resume_${interviewReportID}.pdf"`
    });

    return res.send(pdfBuffer);

  } catch (error) {
    console.error("Generate Resume PDF Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate resume PDF",
      error: error.message
    });
  }
}

module.exports = { generateInterviewReportController, getInterviewReportByIdController,      getAllInterviewReportsController,                   generateResumePdfController};