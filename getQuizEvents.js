import dotenv from 'dotenv'
import { getQuizQuestions } from 'node-canvas-api'
import R from 'ramda'

dotenv.config()

const { CANVAS_API_DOMAIN, CANVAS_API_TOKEN } = process.env

const parseNextLink = header => {
  if (!header) return null
  const links = header.split(',').map(link => link.trim())
  const next = links.find(link => link.includes('rel="next"'))
  if (!next) return null
  const match = next.match(/<([^>]+)>/)
  return match ? match[1] : null
}

const fetchAll = async (url, result = []) => {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${CANVAS_API_TOKEN}` }
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Canvas request failed (${response.status} ${response.statusText}): ${body}`)
  }

  const data = await response.json()
  const merged = Array.isArray(data) ? [...result, ...data] : [...result, data]
  const next = parseNextLink(response.headers.get('link'))
  return next ? fetchAll(next, merged) : merged
}

const getQuizSubmissions = (courseId, quizId) =>
  fetchAll(`${CANVAS_API_DOMAIN}/courses/${courseId}/quizzes/${quizId}/submissions?include[]=user`)

const getQuizSubmissionEvents = (courseId, quizId, submissionId) =>
  fetchAll(`${CANVAS_API_DOMAIN}/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}/events?per_page=100`)

function findQuestionName (questionId, quizQuestions) {
  return quizQuestions.find(q => q.id === questionId)
    ? quizQuestions.find(q => q.id === questionId).question_name
    : ''
}

function handleEvents (events, quizQuestions) {
  const quizSubmissionEvents = R.flatten(
    events.map(eventPage => {
      if (Array.isArray(eventPage?.quiz_submission_events)) return eventPage.quiz_submission_events
      if (eventPage?.event_type) return [eventPage]
      return []
    })
  )

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
      } else if (event.event_type === 'question_flagged') {
        event.question_name = findQuestionName(Number(event.event_data.questionId), quizQuestions)
      }
    }
    return event
  })
}

const getQuizEvents = async (courseId, quizId) => {
  if (!CANVAS_API_DOMAIN || !CANVAS_API_TOKEN) {
    throw new Error('Missing CANVAS_API_DOMAIN or CANVAS_API_TOKEN in environment')
  }

  const quizSubmissions = await getQuizSubmissions(courseId, quizId)

  const submissions = R.flatten(quizSubmissions.map(x => x?.quiz_submissions ?? [])).filter(x => x.attempt)
  const users = R.flatten(quizSubmissions.map(x => x?.users ?? []))

  const submissionsWithEvents = await Promise.all(
    submissions
      .map(async submission => {
        const submissionId = submission.id
        const submissionAttempt = submission.attempt
        const user = users.find(user => user.id === submission.user_id)
        const quizQuestions = await getQuizQuestions(courseId, quizId, `quiz_submission_id=${submissionId}`, `quiz_submission_attempt=${submissionAttempt}`)
        return getQuizSubmissionEvents(courseId, quizId, submissionId)
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

export default getQuizEvents
