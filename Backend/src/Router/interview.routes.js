const express = require('express')
const authMiddleware = require('../Middlewares/auth.middleware')
const interviewController = require('../controllers/interview.controller')
const upload = require('../middlewares/file.middleware')

const interviewRouter = express.Router()

/**
 * @route GET /api/interview
 * @description generate new interview reports on the basis of user self description , resume pdf and job description.
 * @access private
 */

interviewRouter.post('/', authMiddleware.authUser,upload.single('resume'),interviewController.generateInterviewReportController)

/**
 * @route GET /api/interview/reports/:interviewID
 * @description get interview report by interviewID
 * @access private
 */

interviewRouter.get('/reports/:interviewID',authMiddleware.authUser,
  interviewController.getInterviewReportByIdController) 

/**
 * @route GET /api/interview/reports
 * @description get all interview reports of logged-in user
 * @access private
 */

interviewRouter.get('/reports', authMiddleware.authUser,interviewController.getAllInterviewReportsController)

/**
 * @route POST/api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description , resume and job description
 *@access private
*/

interviewRouter.post("/resume/pdf/:interviewReportID",authMiddleware.authUser,interviewController.generateResumePdfController)


module.exports = interviewRouter

