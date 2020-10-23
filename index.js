const getQuizEvents = require('./getQuizEvents')
const writeToCSV = require('./writeToCSV')

const courseId = /* add course id here */
const quizId = /* add quiz id here */

getQuizEvents(courseId, quizId)
  .then(data => writeToCSV(data, `quiz-logs-courseid=${courseId}&quizid=${quizId}.csv`))
