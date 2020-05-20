const canvasAPI = require('node-canvas-api')
const R = require('ramda')

async function getQuizEvents (courseId, quizId) {
  const quizSubmissions = await canvasAPI.getQuizSubmissions(courseId, quizId, ['include=user'])

  const submissions = R.flatten(quizSubmissions.map(x => x.quiz_submissions))
  const users = R.flatten(quizSubmissions.map(x => x.users))

  const submissionsWithEvents = await Promise.all(
    submissions
      .map(submission => {
        const user = users.find(user => user.id === submission.user_id)
        return canvasAPI.getQuizSubmissionEvents(courseId, quizId, submission.id, ['per_page=100'])
          .then(events => ({
            submissionId: submission.id,
            events: R.flatten(events.map(x => x.quiz_submission_events)),
            canvasUserId: submission.user_id,
            studentName: user.name,
            studentNumber: user.sis_user_id
          }))
      })
  )

  return submissionsWithEvents
}

module.exports = getQuizEvents
