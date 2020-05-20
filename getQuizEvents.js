const canvasAPI = require('node-canvas-api')
const R = require('ramda')

function findQuestionName (questionId, quizQuestions) {
  return quizQuestions.find(q => q.id === questionId)
    ? quizQuestions.find(q => q.id === questionId).question_name
    : ''
}

function handleEvents (events, quizQuestions) {
  const quizSubmissionEvents = R.flatten(events.map(x => x.quiz_submission_events))
  return quizSubmissionEvents.map(event => {
    if (event.event_data) {
      if (Array.isArray(event.event_data)) {
        if (typeof event.event_data[0] === 'string') {
          event.question_name = findQuestionName(Number(event.event_data[0]), quizQuestions)
        } else {
          event.question_name = event.event_data
            .map(e => findQuestionName(Number(e.quiz_question_id), quizQuestions))
            .join('; ')
        }
      }
    }
    return event
  })
}

async function getQuizEvents (courseId, quizId) {
  const quizSubmissions = await canvasAPI.getQuizSubmissions(courseId, quizId, 'include=user')

  const submissions = R.flatten(quizSubmissions.map(x => x.quiz_submissions))
  const users = R.flatten(quizSubmissions.map(x => x.users))

  const submissionsWithEvents = await Promise.all(
    submissions
      .map(async submission => {
        const submissionId = submission.id
        const submissionAttempt = submission.attempt
        const user = users.find(user => user.id === submission.user_id)
        const quizQuestions = await canvasAPI.getQuizQuestions(courseId, quizId, `quiz_submission_id=${submissionId}`, `quiz_submission_attempt=${submissionAttempt}`)
        return canvasAPI.getQuizSubmissionEvents(courseId, quizId, submissionId, 'per_page=100')
          .then(events => ({
            submissionId: submissionId,
            events: handleEvents(events, quizQuestions),
            canvasUserId: submission.user_id,
            studentName: user.name,
            studentNumber: user.sis_user_id,
            quizAttempt: submissionAttempt
          }))
      })
  )

  return submissionsWithEvents
}

module.exports = getQuizEvents
