const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// ============================================================
// ZOD SCHEMA
// ============================================================

const interviewReportSchema = z.object({
  title: z.string(),

  matchScore: z.number().min(0).max(100),

  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),

  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    })
  ),

  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.string(),
    })
  ),
});

// ============================================================
// GEMINI RESPONSE SCHEMA
// ============================================================

const responseSchema = {
  type: "object",

  properties: {
    title: {
      type: "string",
    },

    matchScore: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },

    technicalQuestions: {
      type: "array",
      items: {
        type: "object",

        properties: {
          question: {
            type: "string",
          },

          intention: {
            type: "string",
          },

          answer: {
            type: "string",
          },
        },

        required: [
          "question",
          "intention",
          "answer",
        ],
      },
    },

    behavioralQuestions: {
      type: "array",
      items: {
        type: "object",

        properties: {
          question: {
            type: "string",
          },

          intention: {
            type: "string",
          },

          answer: {
            type: "string",
          },
        },

        required: [
          "question",
          "intention",
          "answer",
        ],
      },
    },

    skillGaps: {
      type: "array",

      items: {
        type: "object",

        properties: {
          skill: {
            type: "string",
          },

          severity: {
            type: "string",
            enum: [
              "low",
              "medium",
              "high",
            ],
          },
        },

        required: [
          "skill",
          "severity",
        ],
      },
    },

    preparationPlan: {
      type: "array",

      items: {
        type: "object",

        properties: {
          day: {
            type: "number",
          },

          focus: {
            type: "string",
          },

          tasks: {
            type: "string",
          },
        },

        required: [
          "day",
          "focus",
          "tasks",
        ],
      },
    },
  },

  required: [
    "title",
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
  ],
};

// ============================================================
// RETRY FUNCTION
// ============================================================

async function generateWithRetry(request, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(
        `Gemini request attempt ${attempt + 1}/${maxRetries}`
      );

      const response =
        await ai.models.generateContent(request);

      return response;

    } catch (error) {
      lastError = error;

      const status =
        error?.status ||
        error?.code ||
        error?.error?.code;

      console.error(
        `Gemini request failed with status: ${status}`
      );

      // Retry only temporary errors
      if (status !== 503 && status !== 429) {
        throw error;
      }

      if (attempt === maxRetries - 1) {
        break;
      }

      // 2 sec -> 4 sec -> 8 sec
      const delay =
        2000 * Math.pow(2, attempt);

      console.log(
        `Gemini temporarily unavailable.`
      );

      console.log(
        `Waiting ${delay / 1000} seconds before retry...`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }
  }

  throw lastError;
}

// ============================================================
// INTERVIEW REPORT
// ============================================================

async function generateInterviewReport({
  resume,
  jobDescription,
  selfDescription,
}) {
  console.log(
    "========== AI INPUT =========="
  );

  console.log(
    "Resume length:",
    resume?.length
  );

  console.log(
    "Job description length:",
    jobDescription?.length
  );

  console.log(
    "Self description length:",
    selfDescription?.length
  );

  console.log(
    "=============================="
  );

  const prompt = `
You are an expert technical interviewer and career assessment system.

Analyze the candidate's resume, job description, and self description.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

SELF DESCRIPTION:
${selfDescription}

Generate a detailed interview preparation report.

IMPORTANT RULES:

1. title
Create a short descriptive title.

2. matchScore
Calculate the candidate's approximate match with the job description.
Return a number between 0 and 100.

3. technicalQuestions

Generate 8 technical interview questions.

Each object must contain:

question:
The interview question.

intention:
What the interviewer is trying to evaluate.

answer:
A strong sample answer that this candidate could give.

Questions must be relevant to:
- the candidate's resume
- the job description
- the candidate's skills
- the candidate's experience

4. behavioralQuestions

Generate 5 behavioral interview questions.

Each object must contain:

question
intention
answer

Answers should be realistic and professional.

5. skillGaps

Identify important skills from the job description that are missing
or comparatively weak in the candidate's profile.

Each object must contain:

skill
severity

severity can ONLY be:

low
medium
high

6. preparationPlan

Create a 7-day interview preparation plan.

Each object must contain:

day
focus
tasks

tasks must be a string.

7. Return ONLY JSON.

Do not return markdown.

Do not return code fences.

Do not add explanations outside the JSON.
`;

  try {
    console.log(
      "========== GENERATING AI REPORT =========="
    );

    // --------------------------------------------------------
    // FIRST MODEL
    // --------------------------------------------------------

    let response;

    try {
      response = await generateWithRetry({
        model: "gemini-3-flash-preview",

        contents: prompt,

        config: {
          responseMimeType: "application/json",

          responseSchema: responseSchema,
        },
      });

    } catch (primaryError) {

      console.error(
        "Primary Gemini model failed."
      );

      console.error(
        primaryError?.message || primaryError
      );

      // ------------------------------------------------------
      // FALLBACK MODEL
      // ------------------------------------------------------

      console.log(
        "Trying fallback Gemini model..."
      );

      response = await generateWithRetry({
        model: "gemini-3.6-flash",

        contents: prompt,

        config: {
          responseMimeType: "application/json",

          responseSchema: responseSchema,
        },
      });
    }

    // --------------------------------------------------------
    // CHECK RESPONSE
    // --------------------------------------------------------

    console.log(
      "========== RAW AI RESPONSE =========="
    );

    console.log(response?.text);

    console.log(
      "====================================="
    );

    if (!response?.text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    // --------------------------------------------------------
    // PARSE JSON
    // --------------------------------------------------------

    let report;

    try {
      report = JSON.parse(response.text);
    } catch (jsonError) {

      console.error(
        "Failed to parse Gemini JSON:"
      );

      console.error(response.text);

      throw new Error(
        "Gemini returned invalid JSON."
      );
    }

    // --------------------------------------------------------
    // ZOD VALIDATION
    // --------------------------------------------------------

    const validatedReport =
      interviewReportSchema.parse(report);

    console.log(
      "========== VALIDATED REPORT =========="
    );

    console.log(
      JSON.stringify(
        validatedReport,
        null,
        2
      )
    );

    console.log(
      "======================================"
    );

    return validatedReport;

  } catch (error) {

    console.error(
      "Error generating interview report:"
    );

    console.error(error);

    throw error;
  }
}

async function generatePdfFromHtml({htmlContent}) { 

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();
  return pdfBuffer;
}

async function generateResumePdf({resume,jobDescription,selfDescription}) { 
  const resumePdfSchema = z.object({
    html: z.string().describe("HTML content of the resume which will be converted to PDF using puppeteer.")
  });

  const prompt = `generate resume for candidate with the following details:
      Resume: ${resume}
      Job Description: ${jobDescription}
      Self Description: ${selfDescription}
      
      the resume should be json onject with single key "html" and value as html content of the resume which will be converted to PDF using puppeteer.
      the content should be ATS friendly , i.e. it should be easily parsable by ATS system with losing inportant information.`;
      
  
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: zodToJsonSchema(resumePdfSchema), 
        }
      });

      const jsonContent = JSON.parse(response.text);
      const pdfBuffer = await generatePdfFromHtml({ htmlContent: jsonContent.html });
      return pdfBuffer;
    }
module.exports = {generateInterviewReport , generateResumePdf};